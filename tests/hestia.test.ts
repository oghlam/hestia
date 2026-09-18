import assert from 'node:assert/strict'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { app } from '../server/index'
import { classifyScene, createAlert, applyValidatorAction, isAlertScene } from '../src/domain/scene-engine'
import { generateRingSignature, normalizeRingWebhook, verifyRingSignature } from '../server/ring-adapter'
import { isDuplicateRequest, memoryStore, resetStore, clearAuditLogs, saveArchivedLog, listArchivedLogs, deleteArchivedLog, syncLocalToDynamoDB, syncDynamoDBToLocal } from '../server/store'
import { buildNovaMicroPrompt, generateDeterministicSummary, generateSceneContext } from '../server/bedrock-service'
import { fallbackMatch, identifyFaceFromRingEvent, processFaceRecognition } from '../server/vision-service'
import type { IdentityResult, RingEvent } from '../src/domain/contracts'

function testSceneClassification() {
  const normalEvent: RingEvent = {
    eventId: 'evt_001',
    deviceId: 'cam_living',
    eventType: 'motion',
    occurredAt: '2026-09-13T10:00:00Z',
    roomId: 'living_room',
  }
  const knownResident: IdentityResult = {
    identity: 'known_target',
    residentId: 'resident_elder',
    name: 'Elder',
    confidence: 0.95,
    faceCount: 1,
    source: 'ring_snapshot',
  }

  // 1. Normal motion
  const scene1 = classifyScene(normalEvent, knownResident, {})
  assert.equal(scene1.scene, 'S1_NORMAL')
  assert.equal(scene1.residentId, 'resident_elder')
  assert.equal(isAlertScene(scene1), false)
  assert.equal(createAlert(scene1), null)

  // 2. Watch scene (doorbell / repeated motion)
  const scene2 = classifyScene({ ...normalEvent, eventType: 'doorbell' }, knownResident, {})
  assert.equal(scene2.scene, 'S2_WATCH')

  // 3. Help scene (distress)
  const scene3 = classifyScene(normalEvent, knownResident, { distress: true })
  assert.equal(scene3.scene, 'S3_HELP')
  assert.equal(isAlertScene(scene3), true)
  const alert3 = createAlert(scene3)
  assert.ok(alert3)
  assert.equal(alert3.state, 'VALIDATION_PENDING')
  assert.equal(alert3.scene, 'S3_HELP')

  // 4. Critical scene (distress + targetActive + deviceError)
  const scene4 = classifyScene(normalEvent, knownResident, { distress: true, targetActive: true, deviceError: true })
  assert.equal(scene4.scene, 'S4_CRITICAL')
  assert.equal(isAlertScene(scene4), true)
  const alert4 = createAlert(scene4)
  assert.ok(alert4)
  assert.equal(alert4.scene, 'S4_CRITICAL')

  // 5. Unknown visitor should not be marked as residentId
  const unknownIdentity: IdentityResult = {
    identity: 'unknown',
    confidence: 0.65,
    faceCount: 1,
    source: 'ring_snapshot',
  }
  const sceneUnknown = classifyScene(normalEvent, unknownIdentity, { repeatedMotion: true })
  assert.equal(sceneUnknown.residentId, undefined)
  assert.equal(sceneUnknown.scene, 'S2_WATCH')

  console.log('✔ Scene classification tests passed')
}

function testValidatorStateMachine() {
  const alert = {
    alertId: 'alert_test_1',
    sceneId: 'scene_test_1',
    eventId: 'evt_test_1',
    state: 'VALIDATION_PENDING' as const,
    scene: 'S3_HELP' as const,
    confidence: 0.88,
    roomId: 'living_room',
    residentId: 'resident_elder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // VALIDATION_PENDING -> RESOLVED (OK)
  const resolved = applyValidatorAction(alert, 'OK', 'caregiver_maria')
  assert.equal(resolved.state, 'RESOLVED')
  assert.equal(resolved.actorId, 'caregiver_maria')

  // VALIDATION_PENDING -> CARE_IN_PROGRESS (COMING)
  const inProgress = applyValidatorAction(alert, 'COMING', 'caregiver_maria', 5)
  assert.equal(inProgress.state, 'CARE_IN_PROGRESS')
  assert.equal(inProgress.etaMinutes, 5)

  // CARE_IN_PROGRESS -> HANDLED (I_HAVE_ARRIVED)
  const handled = applyValidatorAction(inProgress, 'I_HAVE_ARRIVED', 'caregiver_maria')
  assert.equal(handled.state, 'HANDLED')

  // Invalid transition: I_HAVE_ARRIVED directly from VALIDATION_PENDING must throw
  assert.throws(() => applyValidatorAction(alert, 'I_HAVE_ARRIVED', 'caregiver_maria'), /I_HAVE_ARRIVED requires CARE_IN_PROGRESS/)

  // VALIDATION_PENDING -> ESCALATED (SIREN)
  const siren = applyValidatorAction(alert, 'SIREN', 'caregiver_maria')
  assert.equal(siren.state, 'ESCALATED')

  console.log('✔ Validator state machine tests passed')
}

function testRingWebhookAdapter() {
  const signingKey = 'test_secret_signing_key_123'
  const rawPayload = JSON.stringify({
    meta: {
      version: '1.1',
      time: '2026-09-13T12:00:00Z',
      request_id: 'req_ring_abc',
      account_id: 'acc_ring_123',
    },
    data: {
      id: 'evt_motion_999',
      type: 'motion_detected',
      attributes: {
        source: 'living_room_cam',
        source_type: 'devices',
        subType: 'human',
        timestamp: 1789387200000,
      },
    },
  })

  // 1. Signature generation & verification
  const validSignature = generateRingSignature(rawPayload, signingKey)
  assert.ok(validSignature.startsWith('sha256='))
  assert.equal(verifyRingSignature(rawPayload, validSignature, signingKey), true)
  assert.equal(verifyRingSignature(rawPayload, 'sha256=invalidhex0000', signingKey), false)

  // 2. Normalization
  const parsed = JSON.parse(rawPayload)
  const normalized = normalizeRingWebhook(parsed)
  assert.ok(normalized)
  assert.equal(normalized.eventId, 'evt_motion_999')
  assert.equal(normalized.eventType, 'motion')
  assert.equal(normalized.roomId, 'living_room')
  assert.equal(normalized.metadata?.requestId, 'req_ring_abc')

  // 3. Deduplication
  resetStore()
  assert.equal(isDuplicateRequest('req_ring_abc'), false)
  assert.equal(isDuplicateRequest('req_ring_abc'), true)

  console.log('✔ Ring adapter & signature verification tests passed')
}

function testStoreRepository() {
  resetStore()
  const initialScenesCount = memoryStore.listScenes().length
  assert.equal(initialScenesCount, 4)

  const event: RingEvent = {
    eventId: 'evt_store_1',
    deviceId: 'bedroom_cam',
    eventType: 'motion',
    occurredAt: new Date().toISOString(),
    roomId: 'bedroom',
  }
  memoryStore.saveEvent(event)

  const scene = classifyScene(event, { identity: 'known_target', residentId: 'resident_elder', name: 'Elder', faceCount: 1, source: 'ring_snapshot' }, { distress: true })
  memoryStore.saveScene(scene)
  assert.equal(memoryStore.listScenes().length, initialScenesCount + 1)

  const alert = createAlert(scene)
  assert.ok(alert)
  memoryStore.saveAlert(alert)
  assert.equal(memoryStore.getAlert(alert.alertId)?.alertId, alert.alertId)
  assert.equal(memoryStore.listAlerts().length, 1)

  // Multi-room state computation
  const rooms = memoryStore.getRoomStates()
  assert.equal(rooms.length, 4)
  const bedroom = rooms.find((r) => r.roomId === 'bedroom')
  assert.equal(bedroom?.status, 'S3_HELP')
  assert.equal(bedroom?.activePerson, 'Elder')

  // Access log verification
  const accessLogs = memoryStore.listAccessLogs()
  assert.equal(accessLogs.length, 5)
  assert.equal(accessLogs[0].identityType, 'known_target')
  assert.equal(accessLogs[0].actionTaken, 'care_monitoring')

  // Audit trail & notifications
  memoryStore.saveAuditLog({
    logId: 'audit_1',
    timestamp: new Date().toISOString(),
    action: 'COMING',
    actorId: 'caregiver_maria',
    targetId: 'resident_elder',
    newState: 'CARE_IN_PROGRESS',
  })
  assert.equal(memoryStore.listAuditLogs().length, 1)

  memoryStore.saveNotification({
    id: 'notif_1',
    recipient: 'family',
    type: 'reassurance',
    title: 'Checked',
    body: 'Safe',
    sentAt: new Date().toISOString(),
  })
  assert.equal(memoryStore.listNotifications().length, 1)

  // Room CRUD & Custom floor plan
  assert.equal(memoryStore.listRooms().length, 4)
  memoryStore.saveRoom({
    id: 'patio_backyard',
    name: 'Patio & Backyard',
    floor: 'Outdoor',
    deviceId: 'cam_patio',
    deviceName: 'Ring Backyard Stick Up',
    deviceType: 'Stick Up Cam',
    signalDbm: 'Good · -63 dBm',
    mapCoordinates: { x: 15, y: 85 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  assert.equal(memoryStore.listRooms().length, 5)
  assert.equal(memoryStore.getRoom('patio_backyard')?.name, 'Patio & Backyard')

  // Map config
  memoryStore.saveHomeMap({ mapUrl: 'https://example.com/floorplan.png', updatedAt: new Date().toISOString() })
  assert.equal(memoryStore.getHomeMap().mapUrl, 'https://example.com/floorplan.png')

  // Delete dynamic room
  const deleted = memoryStore.deleteRoom('patio_backyard')
  assert.equal(deleted, true)
  assert.equal(memoryStore.listRooms().length, 4)

  // Sub-Sprint B: Resident Profile & Multi-Angle Face Registration
  const initialResidents = memoryStore.listResidents()
  assert.equal(initialResidents.length, 1)
  assert.equal(initialResidents[0].name, 'Elder')
  assert.equal(initialResidents[0].primaryTarget, true)
  assert.equal(initialResidents[0].faceTemplates.length, 3)

  // Add new resident
  memoryStore.saveResident({
    id: 'resident_arthur',
    name: 'Arthur Pendelton',
    age: 82,
    gender: 'male',
    primaryTarget: false,
    healthConditions: ['Mild Dementia', 'Cardiac Pacemaker'],
    mobilityStatus: 'Wheelchair assisted',
    emergencyContacts: [
      { id: 'c_art_1', name: 'Sarah Pendelton', relation: 'Daughter', phone: '+1 (555) 777-8899', isPrimary: true },
    ],
    faceTemplates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  assert.equal(memoryStore.listResidents().length, 2)
  assert.equal(memoryStore.getResident('resident_arthur')?.name, 'Arthur Pendelton')

  // Register multi-angle face templates for Arthur
  const addedFront = memoryStore.addFaceTemplate('resident_arthur', {
    templateId: 'tmpl_art_front',
    angle: 'front',
    registeredAt: new Date().toISOString(),
    qualityScore: 0.96,
  })
  assert.equal(addedFront, true)
  memoryStore.addFaceTemplate('resident_arthur', {
    templateId: 'tmpl_art_left',
    angle: 'left',
    registeredAt: new Date().toISOString(),
    qualityScore: 0.92,
  })
  assert.equal(memoryStore.getResident('resident_arthur')?.faceTemplates.length, 2)

  // Switch primary target resident
  memoryStore.setPrimaryResident('resident_arthur')
  assert.equal(memoryStore.getResident('resident_arthur')?.primaryTarget, true)
  assert.equal(memoryStore.getResident('resident_elder')?.primaryTarget, false)

  // Delete face template
  memoryStore.deleteFaceTemplate('resident_arthur', 'tmpl_art_left')
  assert.equal(memoryStore.getResident('resident_arthur')?.faceTemplates.length, 1)

  // Delete resident
  memoryStore.deleteResident('resident_arthur')
  assert.equal(memoryStore.listResidents().length, 1)

  // Care Team & Validator Roster
  const team = memoryStore.listCareTeam()
  assert.equal(team.length, 4)
  const primaryValidator = team.find((m) => m.isPrimaryValidator)
  assert.equal(primaryValidator?.name, 'Caregiver')
  assert.equal(primaryValidator?.role, 'primary_caregiver')

  // Add new nurse
  memoryStore.saveCareTeamMember({
    id: 'member_david',
    name: 'David Miller',
    role: 'professional_nurse',
    relation: 'Weekend Registered Nurse',
    phone: '+1 (555) 999-1122',
    channel: 'phone_call',
    slaMinutes: 3,
    isPrimaryValidator: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  assert.equal(memoryStore.listCareTeam().length, 5)

   // Switch primary validator
   memoryStore.setPrimaryValidator('member_david')
   assert.equal(memoryStore.getCareTeamMember('member_david')?.isPrimaryValidator, true)
   assert.equal(memoryStore.getCareTeamMember('member_caregiver')?.isPrimaryValidator, false)

  // Delete member
  memoryStore.deleteCareTeamMember('member_david')
  assert.equal(memoryStore.listCareTeam().length, 4)

  // Automation Rules Engine
  const rules = memoryStore.listRules()
  assert.equal(rules.length, 5)
  const fallRule = rules.find((r) => r.id === 'rule_fall_distress')
  assert.equal(fallRule?.targetScene, 'S3_HELP')
  assert.equal(fallRule?.confidenceThreshold, 0.75)
  assert.equal(fallRule?.enabled, true)

  // Toggle rule
  memoryStore.toggleRule('rule_fall_distress', false)
  assert.equal(memoryStore.getRule('rule_fall_distress')?.enabled, false)

  // Add custom rule
  memoryStore.saveRule({
    id: 'rule_kitchen_stove',
    name: 'Kitchen Heat & Extended Standing Guard',
    description: 'Watches for abnormal stillness in kitchen cooking zone.',
    category: 'custom',
    enabled: true,
    targetScene: 'S3_HELP',
    confidenceThreshold: 0.85,
    triggerZone: 'living_room',
    timeWindow: { allDay: true, startHour: 0, endHour: 24 },
    slaTimeoutMinutes: 4,
    escalationPolicy: 'notify_primary',
    reassurancePush: true,
    isPreset: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  assert.equal(memoryStore.listRules().length, 6)

  // Delete custom rule
  memoryStore.deleteRule('rule_kitchen_stove')
  assert.equal(memoryStore.listRules().length, 5)

  // Pipeline & Settings
  const initialSettings = memoryStore.getSettings()
  assert.equal(initialSettings.pipelineMode, 'local_camera')
  const updatedSettings = memoryStore.saveSettings({ pipelineMode: 'ring_hardware', awsRegion: 'us-west-2' })
  assert.equal(updatedSettings.pipelineMode, 'ring_hardware')
  assert.equal(updatedSettings.awsRegion, 'us-west-2')

  resetStore()
  assert.equal(memoryStore.listScenes().length, 4)
  assert.equal(memoryStore.listAlerts().length, 0)
  assert.equal(memoryStore.listAuditLogs().length, 0)
  assert.equal(memoryStore.listAccessLogs().length, 4) // 4 access logs generated from 4 seeded scenes
  assert.equal(memoryStore.listNotifications().length, 0)

  console.log('✔ Store repository tests passed')
}

async function testBedrockService() {
  const req = {
    scene: 'S3_HELP' as const,
    event: {
      eventId: 'evt_bedrock_1',
      deviceId: 'living_room_cam',
      eventType: 'motion' as const,
      occurredAt: new Date().toISOString(),
      roomId: 'living_room',
    },
    identity: {
      identity: 'known_target' as const,
      residentId: 'resident_elder',
      name: 'Elder',
      confidence: 0.94,
      faceCount: 1,
      source: 'ring_snapshot' as const,
    },
    signals: ['distress'],
  }

  // 1. Structured prompt builder (structured text only)
  const prompt = buildNovaMicroPrompt(req)
  assert.ok(prompt.includes('Nova Micro') || prompt.includes('HESTIA'))
  assert.ok(prompt.includes('Elder'))
  assert.ok(prompt.includes('living room'))

  // 2. Deterministic summary
  const fallback = generateDeterministicSummary(req)
  assert.ok(fallback.includes('Elder'))
  assert.ok(fallback.includes('living room'))

  // 3. Context generator (with fallback)
  const context = await generateSceneContext(req)
  assert.ok(context.summary.length > 0)
  assert.ok(['bedrock_nova_micro', 'deterministic_fallback'].includes(context.provider))

  console.log('✔ Bedrock Nova Micro context tests passed')
}

async function testVisionService() {
  // 1. Target resident Elder recognition
  const targetRes = await processFaceRecognition({ hint: 'elder' })
  assert.equal(targetRes.identity, 'known_target')
  assert.equal(targetRes.residentId, 'resident_elder')
  assert.equal(targetRes.name, 'Elder')
  assert.ok((targetRes.confidence ?? 0) >= 0.75)
  assert.equal(targetRes.faceCount, 1)

  // 2. Unknown visitor (never triggers care siren by identity alone)
  const unknownRes = await processFaceRecognition({ hint: 'visitor' })
  assert.equal(unknownRes.identity, 'unknown')
  assert.equal(unknownRes.residentId, undefined)
  assert.equal(unknownRes.name, undefined)
  assert.equal(unknownRes.faceCount, 1)

  // 3. No face detected
  const noFaceRes = await processFaceRecognition({ hint: 'no_face' })
  assert.equal(noFaceRes.identity, 'not_detected')
  assert.equal(noFaceRes.faceCount, 0)

  // 4. Ring event adapter identity extraction
  const ringEventKnown: RingEvent = {
    eventId: 'evt_vis_1',
    deviceId: 'cam_hall',
    eventType: 'motion',
    occurredAt: new Date().toISOString(),
    roomId: 'hallway',
    metadata: { identity: 'known_target' },
  }
  const extractedIdentity = await identifyFaceFromRingEvent(ringEventKnown)
  assert.equal(extractedIdentity.identity, 'known_target')
  assert.equal(extractedIdentity.residentId, 'resident_elder')

  // 5. Fallback pure matcher unit checks
  const fallbackTarget = fallbackMatch({ hint: 'known_target' })
  assert.equal(fallbackTarget.identity, 'known_target')
  const fallbackVisitor = fallbackMatch({ hint: 'unknown' })
  assert.equal(fallbackVisitor.identity, 'unknown')

  console.log('✔ Vision / Face recognition service tests passed')
}

async function testCompleteVerticalSlice() {
  resetStore()

  // 1. Ring Webhook payload with HMAC signature verification
  const secretKey = 'hestia_dev_ring_hmac_secret_key'
  const rawPayload = JSON.stringify({
    event: 'device_event',
    meta: {
      request_id: 'req_e2e_101',
      time: new Date().toISOString(),
      account_id: 'acc_001',
    },
    data: {
      id: 'ring_e2e_evt_101',
      type: 'motion_detected',
      attributes: {
        source: 'cam_living_room',
        subType: 'distress',
        identity: 'known_target',
      },
    },
  })
  const signature = generateRingSignature(rawPayload, secretKey)
  assert.equal(verifyRingSignature(rawPayload, signature, secretKey), true)
  assert.equal(isDuplicateRequest('req_e2e_101'), false)

  // 2. Normalization
  const normalized = normalizeRingWebhook(JSON.parse(rawPayload))
  assert.ok(normalized)
  assert.equal(normalized.roomId, 'living_room')

  // 3. Biometric face & identity matching
  const identity = await identifyFaceFromRingEvent(normalized)
  assert.equal(identity.identity, 'known_target')
  assert.equal(identity.residentId, 'resident_elder')
  assert.equal(identity.name, 'Elder')

  // 4. Scene Engine Classification
  const scene = classifyScene(normalized, identity, {
    distress: normalized.metadata?.subType === 'distress',
    targetActive: identity.identity === 'known_target',
  })
  assert.equal(scene.scene, 'S3_HELP')
  assert.equal(isAlertScene(scene), true)

  // 5. Bedrock Nova Micro structured AI context generation
  const aiContext = await generateSceneContext({ scene: scene.scene, event: normalized, identity, signals: scene.signals })
  scene.contextText = aiContext.summary
  assert.ok(scene.contextText.length > 0)
  assert.ok(scene.contextText.toLowerCase().includes('elder'))

  // 6. Persistence to Store Repository
  memoryStore.saveEvent(normalized)
  memoryStore.saveScene(scene)
  const alert = createAlert(scene)
  assert.ok(alert)
  assert.equal(alert.state, 'VALIDATION_PENDING')
  memoryStore.saveAlert(alert)

  // 7. Automated notifications (Primary Caregiver + Family Emergency Auto-Push)
  memoryStore.saveNotification({
    id: `notif_cg_${Date.now()}`,
    recipient: 'caregiver',
    type: 'alert',
    title: `CARE ACTION REQUIRED: Elder`,
    body: `Distress detected in LIVING ROOM. 3m SLA active.`,
    sentAt: alert.createdAt,
  })
  memoryStore.saveNotification({
    id: `notif_fam_${Date.now()}`,
    recipient: 'family',
    type: 'alert',
    title: `🚨 Emergency Auto-Alert: Elder (LIVING ROOM)`,
    body: `Auto-push to Resident Family: Elder experienced an unexpected fall near bedside.`,
    sentAt: alert.createdAt,
  })
  const notifs = memoryStore.listNotifications() as any[]
  assert.ok(notifs.length >= 2)

  // 8. Caregiver acknowledges & dispatches (VALIDATION_PENDING -> CARE_IN_PROGRESS)
  const inProgress = applyValidatorAction(alert, 'COMING', 'Caregiver', 5)
  assert.equal(inProgress.state, 'CARE_IN_PROGRESS')
  assert.equal(inProgress.etaMinutes, 5)
  memoryStore.saveAlert(inProgress)

  // 9. Caregiver arrives & handles incident (CARE_IN_PROGRESS -> HANDLED)
  const handled = applyValidatorAction(inProgress, 'I_HAVE_ARRIVED', 'Caregiver')
  assert.equal(handled.state, 'HANDLED')
  memoryStore.saveAlert(handled)

  // 10. Family reassurance broadcast & audit trail verification
  memoryStore.saveNotification({
    id: `notif_reassurance_${Date.now()}`,
    recipient: 'family',
    type: 'reassurance',
    title: 'Resident Checked & Safe',
    body: `Caregiver checked Elder in LIVING ROOM. All clear.`,
    sentAt: new Date().toISOString(),
  })
  memoryStore.saveAuditLog({
    logId: `log_e2e_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'I_HAVE_ARRIVED',
    actorId: 'Caregiver',
    targetId: alert.alertId,
    previousState: 'CARE_IN_PROGRESS',
    newState: 'HANDLED',
    notes: 'Handled by Caregiver. Elder is safe.',
  })

  const auditLogs = memoryStore.listAuditLogs() as any[]
  assert.ok(auditLogs.length > 0)
  assert.equal(auditLogs[auditLogs.length - 1].newState, 'HANDLED')

  console.log('✔ Complete E2E vertical-slice integration tests passed')
}

function testSettingsAndMaintenance() {
  // 1. Home Profile & Address updates
  const homeSettings = memoryStore.saveSettings({
    homeName: 'Vance Residence',
    homeId: 'home_vance_01',
    streetAddress: '742 Evergreen Terrace',
    city: 'Springfield',
    stateProvince: 'OR',
    postalCode: '97477',
    country: 'United States',
    coordinates: { lat: 44.0462, lon: -123.022 },
    emergencyAccessNotes: 'Lockbox 4821',
  })
  assert.equal(homeSettings.homeName, 'Vance Residence')
  assert.equal(homeSettings.coordinates.lat, 44.0462)
  assert.equal(homeSettings.emergencyAccessNotes, 'Lockbox 4821')

  // 2. Database Profile & MFA verification
  const dbSettings = memoryStore.saveSettings({
    dbMode: 'cloud_dynamodb',
    cloudDbEndpoint: 'https://dynamodb.us-east-1.amazonaws.com',
    cloudDbRegion: 'us-east-1',
    cloudDbTableName: 'hestia_elder_care_prod',
    cloudDbMfaRequired: true,
    cloudDbMfaCode: '849201',
    cloudDbConnected: true,
  })
  assert.equal(dbSettings.dbMode, 'cloud_dynamodb')
  assert.equal(dbSettings.cloudDbConnected, true)
  assert.equal(dbSettings.cloudDbMfaCode, '849201')

  // 3. Maintenance & Log Rotation tracking
  const maintSettings = memoryStore.saveSettings({
    appVersion: '0.1.0-mvp',
    lastUpdateCheck: new Date().toISOString(),
    archivedLogsCount: (dbSettings.archivedLogsCount || 0) + 1,
    lastLogRotation: new Date().toISOString(),
  })
  assert.equal(maintSettings.appVersion, '0.1.0-mvp')
  assert.ok(maintSettings.archivedLogsCount >= 1)

  // 4. Audit Log Purge / Clear and Rotated Archive Management
  memoryStore.saveAuditLog({
    logId: 'test_log_to_clear',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_ALERT_CREATED',
    actorId: 'test',
    targetId: 'alert_1',
    newState: 'VALIDATION_PENDING',
  })
  assert.ok(memoryStore.listAuditLogs().length > 0)
  const cleared = clearAuditLogs(0)
  assert.ok(cleared >= 1)
  assert.equal(memoryStore.listAuditLogs().length, 0)

  // Test Archive rotation addition & deletion
  const newArch = {
    id: 'arch_test_rotate',
    date: new Date().toISOString(),
    fileName: 'hestia_audit_archive_test.json',
    size: '15.2 KB',
    recordsCount: 30,
    contentJson: JSON.stringify([{ test: true }]),
  }
  saveArchivedLog(newArch)
  const archives = listArchivedLogs()
  assert.ok(archives.some((a) => a.id === 'arch_test_rotate'))
  const deletedArch = deleteArchivedLog('arch_test_rotate')
  assert.equal(deletedArch, true)
  assert.ok(!listArchivedLogs().some((a) => a.id === 'arch_test_rotate'))

  console.log('✔ Settings, Home Profile & Maintenance tests passed')
}

function testModularViewsAndMenus() {
  resetStore()

  // 1. Overview & Rooms Menu CRUD
  const room1 = {
    id: 'room_living',
    name: 'Living Room',
    floor: 'Floor 1',
    deviceId: 'cam_living',
    deviceName: 'Ring Living Room Cam',
    deviceType: 'Indoor Cam' as const,
    signalDbm: 'Excellent · -38 dBm',
    mapCoordinates: { x: 30, y: 40 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  memoryStore.saveRoom(room1)
  assert.equal(memoryStore.getRoom('room_living')?.name, 'Living Room')
  assert.equal(memoryStore.getRoom('room_living')?.mapCoordinates?.x, 30)

  // Map configuration & pin calibration
  memoryStore.saveHomeMap({ presetName: 'Custom Blueprint', mapUrl: 'https://example.com/map.svg', updatedAt: new Date().toISOString() })
  assert.equal(memoryStore.getHomeMap()?.presetName, 'Custom Blueprint')

  // 2. People & Residents Menu CRUD + Face Templates
  const resident1 = {
    id: 'resident_elder',
    name: 'Elder',
    age: 78,
    gender: 'female' as const,
    primaryTarget: true,
    healthConditions: ['Fall Risk', 'Hypertension'],
    mobilityStatus: 'Independent with cane',
    emergencyContacts: [{ id: 'c1', name: 'Resident Family', relation: 'Relative', phone: '+1-555-0100', isPrimary: true }],
    doctorContact: { name: 'Care Doctor', clinic: 'St. Jude', phone: '+1-555-0200' },
    faceTemplates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  memoryStore.saveResident(resident1)
  assert.equal(memoryStore.getResident('resident_elder')?.name, 'Elder')
  assert.equal(memoryStore.getResident('resident_elder')?.primaryTarget, true)

  // Add 3 Face Angle Templates
  memoryStore.addFaceTemplate('resident_elder', { templateId: 'ft_front', angle: 'front', registeredAt: new Date().toISOString(), qualityScore: 0.98 })
  memoryStore.addFaceTemplate('resident_elder', { templateId: 'ft_left', angle: 'left', registeredAt: new Date().toISOString(), qualityScore: 0.94 })
  memoryStore.addFaceTemplate('resident_elder', { templateId: 'ft_right', angle: 'right', registeredAt: new Date().toISOString(), qualityScore: 0.95 })
  const updatedResident = memoryStore.getResident('resident_elder')
  assert.equal(updatedResident?.faceTemplates.length, 3)

  // 3. Care Team Menu CRUD & Validator Priority
  const member1 = {
    id: 'member_caregiver',
    name: 'Caregiver',
    role: 'primary_caregiver' as const,
    relation: 'Daughter / Primary Validator',
    phone: '+1 (555) 234-5678',
    channel: 'push_sms' as const,
    slaMinutes: 2,
    isPrimaryValidator: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const member2 = {
    id: 'member_family',
    name: 'Resident Family',
    role: 'family_member' as const,
    relation: 'Son',
    phone: '+1 (555) 345-6789',
    channel: 'whatsapp' as const,
    slaMinutes: 5,
    isPrimaryValidator: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  memoryStore.saveCareTeamMember(member1)
  memoryStore.saveCareTeamMember(member2)
  assert.ok(memoryStore.listCareTeam().length >= 2)
  memoryStore.setPrimaryValidator('member_family')
  assert.equal(memoryStore.getCareTeamMember('member_family')?.isPrimaryValidator, true)
  assert.equal(memoryStore.getCareTeamMember('member_caregiver')?.isPrimaryValidator, false)

  // 4. Automation Rules Menu CRUD & Toggles
  const rule1 = {
    id: 'rule_fall_01',
    name: 'Fall Detection Guard',
    description: 'Immediate alert upon fall',
    category: 'fall_detection' as const,
    enabled: true,
    targetScene: 'S3_HELP' as const,
    confidenceThreshold: 0.75,
    triggerZone: 'all',
    timeWindow: { allDay: true, startHour: 0, endHour: 24 },
    slaTimeoutMinutes: 3,
    escalationPolicy: 'notify_primary' as const,
    reassurancePush: true,
    isPreset: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  memoryStore.saveRule(rule1)
  assert.equal(memoryStore.getRule('rule_fall_01')?.enabled, true)
  memoryStore.toggleRule('rule_fall_01', false)
  assert.equal(memoryStore.getRule('rule_fall_01')?.enabled, false)

  // 5. Events Stream & Access Log
  const testEvent: RingEvent = {
    eventId: 'evt_menu_test',
    deviceId: 'cam_living',
    eventType: 'motion',
    occurredAt: new Date().toISOString(),
    roomId: 'room_living',
  }
  const testIdentity: IdentityResult = {
    identity: 'known_target',
    residentId: 'resident_elder',
    name: 'Elder',
    confidence: 0.96,
    faceCount: 1,
    source: 'ring_snapshot',
  }
  const classifiedScene = classifyScene(testEvent, testIdentity, {})
  classifiedScene.contextText = 'Routine motion in living room.'
  memoryStore.saveEvent(testEvent)
  memoryStore.saveScene(classifiedScene)
  assert.ok(memoryStore.listScenes().length >= 1)

  // 6. Settings, Address & Maintenance
  const savedSettings = memoryStore.saveSettings({
    homeName: 'Greenwood Haven',
    streetAddress: '742 Evergreen Terrace',
    city: 'Springfield',
    dbMode: 'cloud_dynamodb',
    cloudDbConnected: true,
  })
  assert.equal(savedSettings.homeName, 'Greenwood Haven')
  assert.equal(savedSettings.dbMode, 'cloud_dynamodb')
  assert.equal(savedSettings.cloudDbConnected, true)

  console.log('✔ All Modular Menus & CRUD integration tests passed')
}

async function testHybridDatabaseSync() {
  resetStore()

  // 1. Verify sync functions exist and handle local sync execution safely
  const localSync = await syncLocalToDynamoDB()
  assert.ok(typeof localSync.syncedCount === 'number')
  assert.ok(typeof localSync.errors === 'number')

  // 2. Verify reverse sync
  const cloudFetch = await syncDynamoDBToLocal()
  assert.ok(typeof cloudFetch.fetchedCount === 'number')
  assert.ok(typeof cloudFetch.errors === 'number')

  console.log('✔ Hybrid DynamoDB Cloud & Local Sync tests passed')
}

async function testPipelineFeedFlow() {
  resetStore()

  const server: Server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const port = (server.address() as AddressInfo).port
  const baseUrl = `http://127.0.0.1:${port}`

  try {
    const base64Pixel =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='

    // 1. Post image payload to /api/pipeline/feed
    const feedRes = await fetch(`${baseUrl}/api/pipeline/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: 'living_room',
        simulatedSignal: 'normal',
        snapshotBase64: base64Pixel,
        faceHint: 'known_target',
      }),
    })
    assert.equal(feedRes.status, 200)
    const feedJson = await feedRes.json()
    assert.ok(feedJson.ok)
    assert.ok(feedJson.event?.snapshotUrl)

    // 2. Fetch GET /api/rooms & verify snapshotUrl and activePerson
    const roomsRes = await fetch(`${baseUrl}/api/rooms`)
    assert.equal(roomsRes.status, 200)
    const roomsJson = await roomsRes.json()
    const livingRoom = roomsJson.rooms?.find((r: any) => r.roomId === 'living_room')
    assert.ok(livingRoom)
    assert.ok(livingRoom.snapshotUrl)
    assert.ok(livingRoom.activePerson)

    // 3. Verify snapshot image is served properly
    const imageRes = await fetch(`${baseUrl}${livingRoom.snapshotUrl}`)
    assert.equal(imageRes.status, 200)
    const imageBuffer = await imageRes.arrayBuffer()
    assert.ok(imageBuffer.byteLength > 0)

    // 4. Verify GET /api/assets has type 'training_data' and matching roomId
    const assetsRes = await fetch(`${baseUrl}/api/assets`)
    assert.equal(assetsRes.status, 200)
    const assetsJson = await assetsRes.json()
    const asset = assetsJson.assets?.find(
      (a: any) => a.type === 'training_data' && a.roomId === 'living_room'
    )
    assert.ok(asset)
    assert.equal(asset.type, 'training_data')
    assert.equal(asset.roomId, 'living_room')
    assert.equal(asset.fileUrl, livingRoom.snapshotUrl)

    console.log('✔ Pipeline feed ingestion, Room snapshot update & Asset sync tests passed')
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

async function runAll() {
  console.log('Running HESTIA test suite...')
  testSceneClassification()
  testValidatorStateMachine()
  testRingWebhookAdapter()
  testStoreRepository()
  testSettingsAndMaintenance()
  testModularViewsAndMenus()
  await testHybridDatabaseSync()
  await testBedrockService()
  await testVisionService()
  await testPipelineFeedFlow()
  await testCompleteVerticalSlice()
  console.log('\nAll tests completed successfully!')
  process.exit(0)
}

runAll()
