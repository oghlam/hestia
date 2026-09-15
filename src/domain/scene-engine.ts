import type { Alert, IdentityResult, RingEvent, SceneCode, SceneEvent, ValidatorAction } from './contracts'

export type SceneSignals = {
  distress?: boolean
  repeatedMotion?: boolean
  deviceError?: boolean
  targetActive?: boolean
}

export function isAlertScene(scene: SceneEvent): scene is SceneEvent & { scene: 'S3_HELP' | 'S4_CRITICAL' } {
  return scene.scene === 'S3_HELP' || scene.scene === 'S4_CRITICAL'
}

export function createAlert(scene: SceneEvent): Alert | null {
  if (!isAlertScene(scene)) return null
  const now = new Date().toISOString()
  return { alertId: `alert_${scene.eventId}`, sceneId: scene.sceneId, eventId: scene.eventId, state: 'VALIDATION_PENDING', scene: scene.scene, confidence: scene.confidence, roomId: scene.roomId, residentId: scene.residentId, createdAt: now, updatedAt: now }
}

export function applyValidatorAction(alert: Alert, action: ValidatorAction, actorId: string, etaMinutes?: number): Alert {
  const stateByAction: Record<ValidatorAction, Alert['state']> = { OK: 'RESOLVED', COMING: 'CARE_IN_PROGRESS', SIREN: 'ESCALATED', I_HAVE_ARRIVED: 'HANDLED' }
  if (action === 'I_HAVE_ARRIVED' && alert.state !== 'CARE_IN_PROGRESS') throw new Error('I_HAVE_ARRIVED requires CARE_IN_PROGRESS')
  if (action !== 'OK' && action !== 'COMING' && action !== 'SIREN' && alert.state === 'HANDLED') throw new Error('Alert is already handled')
  return { ...alert, state: stateByAction[action], actorId, etaMinutes: action === 'COMING' ? etaMinutes : alert.etaMinutes, updatedAt: new Date().toISOString() }
}

/** Deterministic first-pass rules. It enriches an event; it never makes the care decision. */
export function classifyScene(event: RingEvent, identity?: IdentityResult, signals: SceneSignals = {}): SceneEvent {
  const signalList = Object.entries(signals).filter(([, value]) => value).map(([key]) => key)
  let scene: SceneCode = 'S1_NORMAL'
  let confidence = 0.92

  if (signals.deviceError) { scene = 'S2_WATCH'; confidence = 0.96 }
  if (event.eventType === 'doorbell' || signals.repeatedMotion) { scene = 'S2_WATCH'; confidence = 0.84 }
  if (signals.distress) { scene = 'S3_HELP'; confidence = 0.87 }
  if (signals.distress && signals.targetActive && signals.deviceError) { scene = 'S4_CRITICAL'; confidence = 0.78 }

  const contextText = buildContext(scene, event, identity)
  return {
    sceneId: `scene_${event.eventId}`,
    eventId: event.eventId,
    scene,
    confidence,
    residentId: identity?.identity === 'known_target' ? identity.residentId : undefined,
    roomId: event.roomId,
    signals: signalList,
    identity,
    contextText,
    createdAt: new Date().toISOString(),
  }
}

function buildContext(scene: SceneCode, event: RingEvent, identity?: IdentityResult) {
  const subject = identity?.identity === 'known_target' ? identity.name ?? 'the resident' : 'an unknown person'
  const location = event.roomId.replaceAll('_', ' ')
  if (scene === 'S4_CRITICAL') return `Critical signal involving ${subject} in ${location}; immediate human validation is required.`
  if (scene === 'S3_HELP') return `Possible distress involving ${subject} in ${location}; caregiver validation is required.`
  if (scene === 'S2_WATCH') return `Activity observed in ${location}; continue watching for a meaningful change.`
  return `No unusual activity detected in ${location}.`
}
