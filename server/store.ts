import type {
  AccessLogEntry,
  Alert,
  Asset,
  AssetType,
  AuditArchiveFile,
  AuditLogEntry,
  AutomationRule,
  CareTeamMember,
  FaceTemplate,
  HomeMapConfig,
  NotificationItem,
  Resident,
  RingEvent,
  Room,
  RoomState,
  SceneEvent,
  SystemSettings,
} from '../src/domain/contracts'

import {
  deleteEntityItem,
  ensureDynamoTable,
  getEntityItem,
  listEntityItems,
  putEntityItem,
} from './dynamo-service'

export interface HestiaRepository {
  saveEvent(event: RingEvent): Promise<void> | void
  saveScene(scene: SceneEvent): Promise<void> | void
  listScenes(): Promise<SceneEvent[]> | SceneEvent[]
  saveAlert(alert: Alert): Promise<void> | void
  getAlert(alertId: string): Promise<Alert | undefined> | Alert | undefined
  listAlerts(): Promise<Alert[]> | Alert[]
  listRooms(): Room[]
  getRoom(id: string): Room | undefined
  saveRoom(room: Room): void
  deleteRoom(id: string): boolean
  getHomeMap(): HomeMapConfig
  saveHomeMap(config: HomeMapConfig): void
  listResidents(): Resident[]
  getResident(id: string): Resident | undefined
  saveResident(resident: Resident): void
  deleteResident(id: string): boolean
  setPrimaryResident(id: string): boolean
  addFaceTemplate(residentId: string, template: FaceTemplate): boolean
  deleteFaceTemplate(residentId: string, templateId: string): boolean
  listCareTeam(): CareTeamMember[]
  getCareTeamMember(id: string): CareTeamMember | undefined
  saveCareTeamMember(member: CareTeamMember): void
  deleteCareTeamMember(id: string): boolean
  setPrimaryValidator(id: string): boolean
  listRules(): AutomationRule[]
  getRule(id: string): AutomationRule | undefined
  saveRule(rule: AutomationRule): void
  toggleRule(id: string, enabled: boolean): boolean
  deleteRule(id: string): boolean
  resetRules(): AutomationRule[]
  getSettings(): SystemSettings
  saveSettings(settings: Partial<SystemSettings>): SystemSettings
  saveAuditLog(entry: AuditLogEntry): Promise<void> | void
  listAuditLogs(): Promise<AuditLogEntry[]> | AuditLogEntry[]
  saveAccessLog(entry: AccessLogEntry): Promise<void> | void
  listAccessLogs(): Promise<AccessLogEntry[]> | AccessLogEntry[]
  saveNotification(notification: NotificationItem): Promise<void> | void
  listNotifications(): Promise<NotificationItem[]> | NotificationItem[]
  getRoomStates(): RoomState[]
  // Assets Management
  saveAsset(asset: Asset): void
  getAsset(assetId: string): Asset | undefined
  listAssets(): Asset[]
  listAssetsByType(type: AssetType): Asset[]
  listAssetsByResident(residentId: string): Asset[]
  listAssetsByTeamMember(memberId: string): Asset[]
  deleteAsset(assetId: string): boolean
  resetStore(): Promise<void> | void
}

const events = new Map<string, RingEvent>()
const scenes = new Map<string, SceneEvent>()
const alerts = new Map<string, Alert>()
const rooms = new Map<string, Room>()
const residents = new Map<string, Resident>()
const careTeam = new Map<string, CareTeamMember>()
const rules = new Map<string, AutomationRule>()
const assets = new Map<string, Asset>()
const auditLogs: AuditLogEntry[] = []
const accessLogs: AccessLogEntry[] = []
const notifications: NotificationItem[] = []
const processedRequests = new Set<string>()

let homeMapConfig: HomeMapConfig = {
  mapUrl: '',
  updatedAt: new Date().toISOString(),
}

let systemSettings: SystemSettings = {
  // Device Pipeline
  pipelineMode: 'local_camera',
  localCameraEnabled: true,
  autoStreamIntervalSec: 0,
  activeStreamRoomId: 'living_room',
  ringPartnerId: 'ring_partner_hgw001',
  ringWebhookPath: '/webhooks/ring',
  ringHmacSigningKey: 'hestia_dev_ring_hmac_secret_key',
  awsRegion: 'us-east-1',
  bedrockModelId: 'amazon.nova-micro-v1:0',

  // Home & Address Profile
  homeName: 'Greenwood Home',
  homeId: 'HGW-001',
  streetAddress: '742 Evergreen Terrace',
  city: 'Springfield',
  stateProvince: 'OR',
  postalCode: '97477',
  country: 'United States',
  coordinates: {
    lat: 44.0462,
    lon: -123.022,
  },
  emergencyAccessNotes: 'Side entrance lockbox code: 4821. Master physical key with Maria Vance.',

  // Database Profile
  dbMode: 'local_memory',
  cloudDbEndpoint: 'https://dynamodb.us-east-1.amazonaws.com',
  cloudDbRegion: 'us-east-1',
  cloudDbTableName: 'hestia_elder_care_prod',
  cloudDbAuthToken: 'aws_iam_secret_role_hestia_access',
  cloudDbMfaRequired: true,
  cloudDbMfaCode: '849201',
  cloudDbConnected: false,

  // Maintenance & System Health
  appVersion: '0.1.0-mvp',
  lastUpdateCheck: '2026-09-14T08:00:00Z',
  updateAvailable: false,
  autoRotateLogs: true,
  maxLogSizeMb: 10,
  logRetentionDays: 30,
  lastLogRotation: '2026-09-10T00:00:00Z',
  archivedLogsCount: 2,

  updatedAt: new Date().toISOString(),
}

function seedDefaultRules() {
  rules.clear()
  const defaultPresets: AutomationRule[] = [
    {
      id: 'rule_fall_distress',
      name: 'Elder Fall & Distress Priority Guard',
      description: 'Detects sudden impact, ground-level posture, and distress vocal cues across all rooms.',
      category: 'fall_detection',
      enabled: true,
      targetScene: 'S3_HELP',
      confidenceThreshold: 0.75,
      triggerZone: 'all',
      timeWindow: { allDay: true, startHour: 0, endHour: 24 },
      slaTimeoutMinutes: 3,
      escalationPolicy: 'notify_primary',
      reassurancePush: true,
      isPreset: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'rule_night_wandering',
      name: 'Night Inactivity & Wandering Guard',
      description: 'Monitors hallways and exit zones for prolonged disorientation or immobility between 22:00 - 06:00.',
      category: 'night_wandering',
      enabled: true,
      targetScene: 'S3_HELP',
      confidenceThreshold: 0.8,
      triggerZone: 'corridor',
      timeWindow: { allDay: false, startHour: 22, endHour: 6 },
      slaTimeoutMinutes: 5,
      escalationPolicy: 'notify_primary',
      reassurancePush: true,
      isPreset: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'rule_visitor_filter',
      name: 'Unrecognized Visitor Doorbell Filter',
      description: 'Catalogs unknown visitors at front porch to Access Log without sounding false care alarms.',
      category: 'visitor_doorbell',
      enabled: true,
      targetScene: 'S2_WATCH',
      confidenceThreshold: 0.7,
      triggerZone: 'entry',
      timeWindow: { allDay: true, startHour: 0, endHour: 24 },
      slaTimeoutMinutes: 10,
      escalationPolicy: 'notify_primary',
      reassurancePush: false,
      isPreset: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'rule_hardware_safety',
      name: 'Camera Offline & Hardware Safety Guard',
      description: 'Escalates immediately to critical (S4) if a Ring device loses power or signal while resident is in zone.',
      category: 'hardware_health',
      enabled: true,
      targetScene: 'S4_CRITICAL',
      confidenceThreshold: 0.9,
      triggerZone: 'all',
      timeWindow: { allDay: true, startHour: 0, endHour: 24 },
      slaTimeoutMinutes: 2,
      escalationPolicy: 'trigger_siren',
      reassurancePush: true,
      isPreset: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'rule_morning_routine',
      name: 'Morning Routine & Wake-Up Check',
      description: 'Confirms resident active mobility in Bedroom or Living Room during morning wake window (07:00 - 09:30).',
      category: 'inactivity_guard',
      enabled: true,
      targetScene: 'S1_NORMAL',
      confidenceThreshold: 0.85,
      triggerZone: 'bedroom',
      timeWindow: { allDay: false, startHour: 7, endHour: 10 },
      slaTimeoutMinutes: 15,
      escalationPolicy: 'notify_primary',
      reassurancePush: true,
      isPreset: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ]

  for (const r of defaultPresets) {
    rules.set(r.id, r)
  }
}

function seedDefaultCareTeam() {
  careTeam.clear()
  const defaults: CareTeamMember[] = [
    {
      id: 'member_maria',
      name: 'Maria Vance',
      role: 'primary_caregiver',
      relation: 'Daughter / Primary Validator',
      phone: '+1 (555) 234-5678',
      email: 'maria.vance@example.com',
      channel: 'push_sms',
      slaMinutes: 2,
      isPrimaryValidator: true,
      shiftSchedule: '24/7 Primary Response',
      notes: 'Lives 4 minutes away. Holds spare physical key and emergency access.',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'member_sarah',
      name: 'Nurse Sarah Jenkins, RN',
      role: 'professional_nurse',
      relation: 'Registered Home Nurse (St. Jude)',
      phone: '+1 (555) 432-8765',
      email: 's.jenkins@stjudehealth.org',
      channel: 'phone_call',
      slaMinutes: 3,
      isPrimaryValidator: false,
      shiftSchedule: 'Weekdays 08:00 - 16:00',
      notes: 'Administers morning vitals and medication checks.',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'member_john',
      name: 'John Vance',
      role: 'family_member',
      relation: 'Son / Secondary Contact',
      phone: '+1 (555) 876-5432',
      email: 'john.vance@example.com',
      channel: 'whatsapp',
      slaMinutes: 5,
      isPrimaryValidator: false,
      shiftSchedule: 'Evening Backup Response',
      notes: 'Available for secondary escalation and weekend visits.',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'member_robert',
      name: 'Dr. Robert Chen, MD',
      role: 'physician',
      relation: 'Attending Geriatrician',
      phone: '+1 (555) 345-9012',
      email: 'dr.chen@stjudegeriatric.org',
      channel: 'phone_call',
      slaMinutes: 10,
      isPrimaryValidator: false,
      shiftSchedule: 'On-Call Medical Escalation',
      notes: 'Primary physician overseeing cardiovascular and fall-risk care plans.',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ]

  for (const m of defaults) {
    careTeam.set(m.id, m)
  }
}

function seedDefaultScenes() {
  scenes.clear()
  events.clear()
  const defaults: SceneEvent[] = [
    {
      sceneId: 'scene_living_001',
      eventId: 'evt_living_001',
      scene: 'S1_NORMAL',
      confidence: 0.96,
      residentId: 'resident_eleanor',
      roomId: 'living_room',
      signals: ['Human motion vector', 'Seated relaxing posture', 'Normal ambient lighting'],
      identity: {
        identity: 'known_target',
        residentId: 'resident_eleanor',
        name: 'Eleanor',
        confidence: 0.96,
        faceCount: 1,
        source: 'ring_snapshot',
      },
      contextText:
        'Eleanor is sitting comfortably on the sofa reading a book. Routine mobility and vitals appear calm and safe.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
      sceneId: 'scene_entry_002',
      eventId: 'evt_front_door_001',
      scene: 'S2_WATCH',
      confidence: 0.88,
      roomId: 'entry',
      signals: ['Doorbell chime', 'Front porch presence', 'Unrecognized facial biometrics'],
      identity: {
        identity: 'unknown',
        confidence: 0.72,
        faceCount: 1,
        source: 'ring_snapshot',
      },
      contextText: 'Visitor rang the front doorbell. Face cataloged in Access Log; no emergency action required.',
      createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    },
    {
      sceneId: 'scene_bedroom_003',
      eventId: 'evt_bedroom_001',
      scene: 'S3_HELP',
      confidence: 0.92,
      residentId: 'resident_eleanor',
      roomId: 'bedroom',
      signals: ['Floor-level posture', 'Sudden height transition', 'Vocal acoustic distress spike'],
      identity: {
        identity: 'known_target',
        residentId: 'resident_eleanor',
        name: 'Eleanor',
        confidence: 0.95,
        faceCount: 1,
        source: 'ring_snapshot',
      },
      contextText:
        'Eleanor experienced an unexpected fall near the bedside. Immediate caregiver assistance recommended.',
      createdAt: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
    },
    {
      sceneId: 'scene_corridor_004',
      eventId: 'evt_corridor_001',
      scene: 'S1_NORMAL',
      confidence: 0.91,
      residentId: 'resident_eleanor',
      roomId: 'corridor',
      signals: ['Upright cane-assisted walking', 'Hallway transit vector'],
      identity: {
        identity: 'known_target',
        residentId: 'resident_eleanor',
        name: 'Eleanor',
        confidence: 0.93,
        faceCount: 1,
        source: 'ring_snapshot',
      },
      contextText: 'Eleanor walked through the central corridor with walking cane towards the kitchen. Normal pace.',
      createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    },
  ]

  for (const s of defaults) {
    saveScene(s)
  }
}

function seedDefaultResidents() {
  residents.clear()
  const eleanor: Resident = {
    id: 'resident_eleanor',
    name: 'Eleanor',
    age: 78,
    gender: 'female',
    primaryTarget: true,
    healthConditions: ['Fall Risk', 'Hypertension', 'Mild Osteoarthritis'],
    mobilityStatus: 'Independent with walking cane',
    notes: 'Morning walks around 08:30. Bedtime scheduled at 21:30. Prefers warm lighting.',
    emergencyContacts: [
      { id: 'c_1', name: 'Maria Vance', relation: 'Daughter / Primary Caregiver', phone: '+1 (555) 234-5678', isPrimary: true },
      { id: 'c_2', name: 'John Vance', relation: 'Son', phone: '+1 (555) 876-5432', isPrimary: false },
    ],
    doctorContact: {
      name: 'Dr. Robert Chen, MD',
      clinic: 'St. Jude Geriatric Care',
      phone: '+1 (555) 345-9012',
      specialty: 'Geriatric Medicine',
    },
    faceTemplates: [
      { templateId: 'tmpl_el_front', angle: 'front', registeredAt: '2026-09-01T10:00:00Z', qualityScore: 0.98, fileName: 'eleanor_front_a8f921.png' },
      { templateId: 'tmpl_el_left', angle: 'left', registeredAt: '2026-09-01T10:02:00Z', qualityScore: 0.94, fileName: 'eleanor_left_b3c791.png' },
      { templateId: 'tmpl_el_right', angle: 'right', registeredAt: '2026-09-01T10:04:00Z', qualityScore: 0.95, fileName: 'eleanor_right_c4d812.png' },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  }
  residents.set(eleanor.id, eleanor)
}

function seedDefaultRooms() {
  rooms.clear()
  const defaults: Room[] = [
    {
      id: 'living_room',
      name: 'Living Room',
      floor: 'Floor 1',
      deviceId: 'cam_living',
      deviceName: 'Ring Living Room',
      deviceType: 'Indoor Cam',
      signalDbm: 'Excellent · -39 dBm',
      mapCoordinates: { x: 32, y: 35 },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      floor: 'Floor 1',
      deviceId: 'cam_bedroom',
      deviceName: 'Ring Bedroom',
      deviceType: 'Indoor Cam',
      signalDbm: 'Excellent · -42 dBm',
      mapCoordinates: { x: 72, y: 35 },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'corridor',
      name: 'Corridor',
      floor: 'Floor 1',
      deviceId: 'cam_corridor',
      deviceName: 'Ring Corridor',
      deviceType: 'Stick Up Cam',
      signalDbm: 'Good · -58 dBm',
      mapCoordinates: { x: 50, y: 68 },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'entry',
      name: 'Entry / Front Door',
      floor: 'Floor 1',
      deviceId: 'doorbell_entry',
      deviceName: 'Ring Front Door',
      deviceType: 'Video Doorbell',
      signalDbm: 'Good · -61 dBm',
      mapCoordinates: { x: 82, y: 80 },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ]

  for (const r of defaults) {
    rooms.set(r.id, r)
  }
}

// Initialize seed
seedDefaultRooms()
seedDefaultResidents()
seedDefaultCareTeam()
seedDefaultRules()
seedDefaultScenes()

export function isDuplicateRequest(requestId?: string): boolean {
  if (!requestId) return false
  if (processedRequests.has(requestId)) return true
  processedRequests.add(requestId)
  return false
}

export function saveEvent(event: RingEvent) {
  events.set(event.eventId, event)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('event', `EVENT#${event.eventId}`, 'METADATA', event).catch(() => {})
  }
}

export function saveScene(scene: SceneEvent) {
  scenes.set(scene.sceneId, scene)

  if (scene.identity) {
    const isTarget = scene.identity.identity === 'known_target'
    const isUnknown = scene.identity.identity === 'unknown'
    const entry: AccessLogEntry = {
      accessId: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: scene.createdAt,
      roomId: scene.roomId,
      identityType: scene.identity.identity,
      name: scene.identity.name,
      confidence: scene.identity.confidence,
      actionTaken: isTarget ? 'care_monitoring' : isUnknown ? 'visitor_observed' : 'log_only',
    }
    saveAccessLog(entry)
  }

  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('scene', `SCENE#${scene.sceneId}`, 'METADATA', scene).catch(() => {})
  }
}

export function listScenes() {
  return [...scenes.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function saveAlert(alert: Alert) {
  alerts.set(alert.alertId, alert)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('alert', `ALERT#${alert.alertId}`, 'METADATA', alert).catch(() => {})
  }
}

export function getAlert(alertId: string) {
  return alerts.get(alertId)
}

export function listAlerts() {
  return [...alerts.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function listRooms(): Room[] {
  return [...rooms.values()]
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id)
}

export function saveRoom(room: Room) {
  rooms.set(room.id, room)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('room', `ROOM#${room.id}`, 'METADATA', room).catch(() => {})
  }
}

export function deleteRoom(id: string): boolean {
  const deleted = rooms.delete(id)
  if (deleted && systemSettings.dbMode === 'cloud_dynamodb') {
    deleteEntityItem(`ROOM#${id}`, 'METADATA').catch(() => {})
  }
  return deleted
}

export function getHomeMap(): HomeMapConfig {
  return homeMapConfig
}

export function saveHomeMap(config: HomeMapConfig) {
  homeMapConfig = config
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('home_map', 'HOME#MAP', 'METADATA', config).catch(() => {})
  }
}

export function listResidents(): Resident[] {
  return [...residents.values()].sort((a, b) => (b.primaryTarget ? 1 : 0) - (a.primaryTarget ? 1 : 0))
}

export function getResident(id: string): Resident | undefined {
  return residents.get(id)
}

export function saveResident(resident: Resident) {
  if (resident.primaryTarget) {
    for (const [id, r] of residents.entries()) {
      if (id !== resident.id && r.primaryTarget) {
        const updatedTarget = { ...r, primaryTarget: false, updatedAt: new Date().toISOString() }
        residents.set(id, updatedTarget)
        if (systemSettings.dbMode === 'cloud_dynamodb') {
          putEntityItem('resident', `RESIDENT#${id}`, 'METADATA', updatedTarget).catch(() => {})
        }
      }
    }
  }
  residents.set(resident.id, resident)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('resident', `RESIDENT#${resident.id}`, 'METADATA', resident).catch(() => {})
  }
}

export function deleteResident(id: string): boolean {
  const deleted = residents.delete(id)
  if (deleted && systemSettings.dbMode === 'cloud_dynamodb') {
    deleteEntityItem(`RESIDENT#${id}`, 'METADATA').catch(() => {})
  }
  return deleted
}

export function setPrimaryResident(id: string): boolean {
  const target = residents.get(id)
  if (!target) return false
  for (const [resId, r] of residents.entries()) {
    const isTarget = resId === id
    const updated = {
      ...r,
      primaryTarget: isTarget,
      updatedAt: new Date().toISOString(),
    }
    residents.set(resId, updated)
    if (systemSettings.dbMode === 'cloud_dynamodb') {
      putEntityItem('resident', `RESIDENT#${resId}`, 'METADATA', updated).catch(() => {})
    }
  }
  return true
}

export function addFaceTemplate(residentId: string, template: FaceTemplate): boolean {
  const res = residents.get(residentId)
  if (!res) return false
  const filtered = res.faceTemplates.filter((t) => t.angle !== template.angle)
  filtered.push(template)
  const updatedResident = {
    ...res,
    faceTemplates: filtered,
    updatedAt: new Date().toISOString(),
  }
  residents.set(residentId, updatedResident)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('resident', `RESIDENT#${residentId}`, 'METADATA', updatedResident).catch(() => {})
  }
  return true
}

export function deleteFaceTemplate(residentId: string, templateId: string): boolean {
  const res = residents.get(residentId)
  if (!res) return false
  const filtered = res.faceTemplates.filter((t) => t.templateId !== templateId)
  const updatedResident = {
    ...res,
    faceTemplates: filtered,
    updatedAt: new Date().toISOString(),
  }
  residents.set(residentId, updatedResident)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('resident', `RESIDENT#${residentId}`, 'METADATA', updatedResident).catch(() => {})
  }
  return true
}

export function listCareTeam(): CareTeamMember[] {
  return [...careTeam.values()].sort((a, b) => (b.isPrimaryValidator ? 1 : 0) - (a.isPrimaryValidator ? 1 : 0))
}

export function getCareTeamMember(id: string): CareTeamMember | undefined {
  return careTeam.get(id)
}

export function saveCareTeamMember(member: CareTeamMember) {
  if (member.isPrimaryValidator) {
    for (const [id, m] of careTeam.entries()) {
      if (id !== member.id && m.isPrimaryValidator) {
        const updatedValidator = { ...m, isPrimaryValidator: false, updatedAt: new Date().toISOString() }
        careTeam.set(id, updatedValidator)
        if (systemSettings.dbMode === 'cloud_dynamodb') {
          putEntityItem('care_team', `CARETEAM#${id}`, 'METADATA', updatedValidator).catch(() => {})
        }
      }
    }
  }
  careTeam.set(member.id, member)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('care_team', `CARETEAM#${member.id}`, 'METADATA', member).catch(() => {})
  }
}

export function deleteCareTeamMember(id: string): boolean {
  const deleted = careTeam.delete(id)
  if (deleted && systemSettings.dbMode === 'cloud_dynamodb') {
    deleteEntityItem(`CARETEAM#${id}`, 'METADATA').catch(() => {})
  }
  return deleted
}

export function setPrimaryValidator(id: string): boolean {
  const target = careTeam.get(id)
  if (!target) return false
  for (const [memberId, m] of careTeam.entries()) {
    const isPrimary = memberId === id
    const updated = {
      ...m,
      isPrimaryValidator: isPrimary,
      updatedAt: new Date().toISOString(),
    }
    careTeam.set(memberId, updated)
    if (systemSettings.dbMode === 'cloud_dynamodb') {
      putEntityItem('care_team', `CARETEAM#${memberId}`, 'METADATA', updated).catch(() => {})
    }
  }
  return true
}

export function listRules(): AutomationRule[] {
  return [...rules.values()]
}

export function getRule(id: string): AutomationRule | undefined {
  return rules.get(id)
}

export function saveRule(rule: AutomationRule) {
  rules.set(rule.id, rule)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('rule', `RULE#${rule.id}`, 'METADATA', rule).catch(() => {})
  }
}

export function toggleRule(id: string, enabled: boolean): boolean {
  const rule = rules.get(id)
  if (!rule) return false
  const updated = { ...rule, enabled, updatedAt: new Date().toISOString() }
  rules.set(id, updated)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('rule', `RULE#${id}`, 'METADATA', updated).catch(() => {})
  }
  return true
}

export function deleteRule(id: string): boolean {
  const deleted = rules.delete(id)
  if (deleted && systemSettings.dbMode === 'cloud_dynamodb') {
    deleteEntityItem(`RULE#${id}`, 'METADATA').catch(() => {})
  }
  return deleted
}

export function resetRules(): AutomationRule[] {
  seedDefaultRules()
  return listRules()
}

export function getSettings(): SystemSettings {
  return { ...systemSettings }
}

export function saveSettings(patch: Partial<SystemSettings>): SystemSettings {
  systemSettings = {
    ...systemSettings,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('settings', 'HOME#SETTINGS', 'METADATA', systemSettings).catch(() => {})
  }
  return { ...systemSettings }
}

const archivedLogFiles: AuditArchiveFile[] = [
  {
    id: 'arch_001',
    date: '2026-09-10T12:00:00Z',
    fileName: 'hestia_audit_archive_20260910.json',
    size: '18.4 KB',
    recordsCount: 42,
    contentJson: JSON.stringify(
      [
        {
          logId: 'log_seed_1',
          timestamp: '2026-09-10T11:58:00Z',
          action: 'SYSTEM_ALERT_CREATED',
          actorId: 'system',
          targetId: 'alert_001',
          newState: 'VALIDATION_PENDING',
          notes: 'Automated fall detection alert',
        },
        {
          logId: 'log_seed_2',
          timestamp: '2026-09-10T11:59:12Z',
          action: 'COMING',
          actorId: 'Maria Vance',
          targetId: 'alert_001',
          previousState: 'VALIDATION_PENDING',
          newState: 'CARE_IN_PROGRESS',
          notes: 'ETA 5 mins',
        },
        {
          logId: 'log_seed_3',
          timestamp: '2026-09-10T12:04:30Z',
          action: 'I_HAVE_ARRIVED',
          actorId: 'Maria Vance',
          targetId: 'alert_001',
          previousState: 'CARE_IN_PROGRESS',
          newState: 'HANDLED',
          notes: 'Eleanor is fine',
        },
      ],
      null,
      2
    ),
  },
  {
    id: 'arch_002',
    date: '2026-09-01T08:30:00Z',
    fileName: 'hestia_audit_archive_20260901.json',
    size: '12.8 KB',
    recordsCount: 28,
    contentJson: JSON.stringify(
      [
        {
          logId: 'log_seed_0',
          timestamp: '2026-09-01T08:29:00Z',
          action: 'OK',
          actorId: 'Maria Vance',
          targetId: 'resident_eleanor',
          newState: 'RESOLVED',
          notes: 'Morning wellness check',
        },
      ],
      null,
      2
    ),
  },
]

export function clearAuditLogs(olderThanDays = 0): number {
  if (olderThanDays <= 0) {
    const count = auditLogs.length
    auditLogs.length = 0
    accessLogs.length = 0
    return count
  }
  const cutoff = Date.now() - olderThanDays * 86400 * 1000
  const initial = auditLogs.length
  const filtered = auditLogs.filter((log) => new Date(log.timestamp).getTime() >= cutoff)
  auditLogs.length = 0
  auditLogs.push(...filtered)
  return initial - filtered.length
}

export function listArchivedLogs(): AuditArchiveFile[] {
  return [...archivedLogFiles]
}

export function saveArchivedLog(archive: AuditArchiveFile) {
  archivedLogFiles.unshift(archive)
}

export function deleteArchivedLog(id: string): boolean {
  const index = archivedLogFiles.findIndex((a) => a.id === id)
  if (index >= 0) {
    archivedLogFiles.splice(index, 1)
    return true
  }
  return false
}

export function saveAuditLog(entry: AuditLogEntry) {
  auditLogs.unshift(entry)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('audit_log', `AUDIT#${entry.logId}`, 'METADATA', entry).catch(() => {})
  }
}

export function listAuditLogs() {
  return [...auditLogs]
}

export function saveAccessLog(entry: AccessLogEntry) {
  accessLogs.unshift(entry)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('access_log', `ACCESS#${entry.accessId}`, 'METADATA', entry).catch(() => {})
  }
}

export function listAccessLogs() {
  return [...accessLogs]
}

export function saveNotification(notification: NotificationItem) {
  notifications.unshift(notification)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('notification', `NOTIF#${notification.id}`, 'METADATA', notification).catch(() => {})
  }
}

export function listNotifications() {
  return [...notifications]
}

export function getRoomStates(): RoomState[] {
  const allScenes = listScenes()
  const allRooms = listRooms()

  return allRooms.map((room) => {
    const latestForRoom = allScenes.find((s) => s.roomId === room.id)
    const status = latestForRoom ? latestForRoom.scene : 'S1_NORMAL'
    const activePerson =
      latestForRoom?.identity?.identity === 'known_target'
        ? latestForRoom.identity.name
        : latestForRoom?.identity?.identity === 'unknown'
        ? 'Unknown Visitor'
        : 'No person'
    const lastActivityTime = latestForRoom
      ? new Date(latestForRoom.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '21:24'

    return {
      roomId: room.id,
      name: room.name,
      status,
      activePerson,
      lastActivityTime,
      deviceStatus: status === 'S4_CRITICAL' ? 'warning' : status === 'S3_HELP' ? 'active' : 'normal',
      roomData: room,
    }
  })
}

// Assets Management
export function saveAsset(asset: Asset) {
  assets.set(asset.assetId, asset)
  if (systemSettings.dbMode === 'cloud_dynamodb') {
    putEntityItem('asset', `ASSET#${asset.assetId}`, 'METADATA', asset).catch(() => {})
  }
}

export function getAsset(assetId: string): Asset | undefined {
  return assets.get(assetId)
}

export function listAssets(): Asset[] {
  return Array.from(assets.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function listAssetsByType(type: AssetType): Asset[] {
  return Array.from(assets.values())
    .filter((a) => a.type === type)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function listAssetsByResident(residentId: string): Asset[] {
  return Array.from(assets.values())
    .filter((a) => a.residentId === residentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function listAssetsByTeamMember(memberId: string): Asset[] {
  return Array.from(assets.values())
    .filter((a) => a.careTeamMemberId === memberId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function deleteAsset(assetId: string): boolean {
  const deleted = assets.delete(assetId)
  if (deleted && systemSettings.dbMode === 'cloud_dynamodb') {
    deleteEntityItem(`ASSET#${assetId}`, 'METADATA').catch(() => {})
  }
  return deleted
}

/**
 * Bidirectional Database Synchronization Engine
 */
export async function syncLocalToDynamoDB(): Promise<{ syncedCount: number; errors: number }> {
  let count = 0
  let errCount = 0

  // 1. Rooms
  for (const room of rooms.values()) {
    try {
      await putEntityItem('room', `ROOM#${room.id}`, 'METADATA', room)
      count++
    } catch {
      errCount++
    }
  }

  // 2. Residents
  for (const resident of residents.values()) {
    try {
      await putEntityItem('resident', `RESIDENT#${resident.id}`, 'METADATA', resident)
      count++
    } catch {
      errCount++
    }
  }

  // 3. Care Team
  for (const member of careTeam.values()) {
    try {
      await putEntityItem('care_team', `CARETEAM#${member.id}`, 'METADATA', member)
      count++
    } catch {
      errCount++
    }
  }

  // 4. Rules
  for (const rule of rules.values()) {
    try {
      await putEntityItem('rule', `RULE#${rule.id}`, 'METADATA', rule)
      count++
    } catch {
      errCount++
    }
  }

  // 5. Assets
  for (const asset of assets.values()) {
    try {
      await putEntityItem('asset', `ASSET#${asset.assetId}`, 'METADATA', asset)
      count++
    } catch {
      errCount++
    }
  }

  // 6. Settings & Map
  try {
    await putEntityItem('settings', 'HOME#SETTINGS', 'METADATA', systemSettings)
    await putEntityItem('home_map', 'HOME#MAP', 'METADATA', homeMapConfig)
    count += 2
  } catch {
    errCount += 2
  }

  return { syncedCount: count, errors: errCount }
}

export async function syncDynamoDBToLocal(): Promise<{ fetchedCount: number; errors: number }> {
  let count = 0
  let errCount = 0

  try {
    const cloudRooms = await listEntityItems<Room>('room')
    if (cloudRooms.length > 0) {
      rooms.clear()
      cloudRooms.forEach((r) => rooms.set(r.id, r))
      count += cloudRooms.length
    }

    const cloudResidents = await listEntityItems<Resident>('resident')
    if (cloudResidents.length > 0) {
      residents.clear()
      cloudResidents.forEach((r) => residents.set(r.id, r))
      count += cloudResidents.length
    }

    const cloudCareTeam = await listEntityItems<CareTeamMember>('care_team')
    if (cloudCareTeam.length > 0) {
      careTeam.clear()
      cloudCareTeam.forEach((m) => careTeam.set(m.id, m))
      count += cloudCareTeam.length
    }

    const cloudRules = await listEntityItems<AutomationRule>('rule')
    if (cloudRules.length > 0) {
      rules.clear()
      cloudRules.forEach((r) => rules.set(r.id, r))
      count += cloudRules.length
    }

    const cloudAssets = await listEntityItems<Asset>('asset')
    if (cloudAssets.length > 0) {
      assets.clear()
      cloudAssets.forEach((a) => assets.set(a.assetId, a))
      count += cloudAssets.length
    }

    const cloudMap = await getEntityItem<HomeMapConfig>('HOME#MAP', 'METADATA')
    if (cloudMap) {
      homeMapConfig = cloudMap
      count++
    }
  } catch {
    errCount++
  }

  return { fetchedCount: count, errors: errCount }
}

export function resetStore() {
  events.clear()
  scenes.clear()
  alerts.clear()
  assets.clear()
  auditLogs.length = 0
  accessLogs.length = 0
  notifications.length = 0
  processedRequests.clear()
  seedDefaultRooms()
  seedDefaultResidents()
  seedDefaultCareTeam()
  seedDefaultRules()
  seedDefaultScenes()
  homeMapConfig = {
    mapUrl: '',
    updatedAt: new Date().toISOString(),
  }
}

export const memoryStore: HestiaRepository = {
  saveEvent,
  saveScene,
  listScenes,
  saveAlert,
  getAlert,
  listAlerts,
  listRooms,
  getRoom,
  saveRoom,
  deleteRoom,
  getHomeMap,
  saveHomeMap,
  listResidents,
  getResident,
  saveResident,
  deleteResident,
  setPrimaryResident,
  addFaceTemplate,
  deleteFaceTemplate,
  listCareTeam,
  getCareTeamMember,
  saveCareTeamMember,
  deleteCareTeamMember,
  setPrimaryValidator,
  listRules,
  getRule,
  saveRule,
  toggleRule,
  deleteRule,
  resetRules,
  getSettings,
  saveSettings,
  saveAuditLog,
  listAuditLogs,
  saveAccessLog,
  listAccessLogs,
  saveNotification,
  listNotifications,
  getRoomStates,
  saveAsset,
  getAsset,
  listAssets,
  listAssetsByType,
  listAssetsByResident,
  listAssetsByTeamMember,
  deleteAsset,
  resetStore,
}
