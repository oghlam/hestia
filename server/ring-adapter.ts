import crypto from 'crypto'
import type { RingEvent, RingEventType } from '../src/domain/contracts'

export interface RingWebhookPayload {
  meta?: {
    version?: string
    time?: string
    request_id?: string
    account_id?: string
  }
  data?: {
    id?: string
    type?: string
    attributes?: {
      source?: string
      source_type?: string
      subType?: string
      timestamp?: number
      [key: string]: unknown
    }
    relationships?: Record<string, unknown>
  }
}

const DEFAULT_DEVICE_ROOMS: Record<string, string> = {
  living_room_cam: 'living_room',
  bedroom_cam: 'bedroom',
  corridor_cam: 'corridor',
  front_door_bell: 'entry',
}

/**
 * Verify HMAC-SHA256 signature from Ring webhook `X-Signature: sha256=<hex>`.
 * Key is used as UTF-8 bytes. Uses constant-time comparison to prevent timing attacks.
 */
export function verifyRingSignature(
  rawBody: Buffer | string,
  receivedSignature?: string | null,
  signingKey = process.env.RING_HMAC_SIGNING_KEY
): boolean {
  if (!signingKey) return true // Dev/test bypass if signing key is not set
  if (!receivedSignature) return false

  const cleanSignature = receivedSignature.trim()
  const expectedPrefix = 'sha256='
  if (!cleanSignature.startsWith(expectedPrefix)) return false

  const expectedHex = crypto
    .createHmac('sha256', Buffer.from(signingKey, 'utf-8'))
    .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody)
    .digest('hex')

  const expectedSignature = `sha256=${expectedHex}`
  if (expectedSignature.length !== cleanSignature.length) return false

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(cleanSignature, 'utf-8')
  )
}

/**
 * Generates an HMAC signature formatted as `sha256=<hex>` for testing/webhook dispatch.
 */
export function generateRingSignature(rawBody: Buffer | string, signingKey: string): string {
  const hex = crypto
    .createHmac('sha256', Buffer.from(signingKey, 'utf-8'))
    .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf-8') : rawBody)
    .digest('hex')
  return `sha256=${hex}`
}

/**
 * Normalizes official Ring Appstore Webhook v1.1 payload into internal RingEvent.
 */
export function normalizeRingWebhook(payload: unknown, roomMap = DEFAULT_DEVICE_ROOMS): RingEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const body = payload as RingWebhookPayload

  if (body.data?.id && body.data?.type) {
    const deviceId = String(body.data.attributes?.source ?? body.data.id)
    const roomId = roomMap[deviceId] ?? (deviceId.includes('bedroom') ? 'bedroom' : deviceId.includes('corridor') ? 'corridor' : deviceId.includes('entry') || deviceId.includes('door') ? 'entry' : 'living_room')
    const typeStr = body.data.type
    let eventType: RingEventType = 'motion'

    if (typeStr === 'button_press') eventType = 'doorbell'
    else if (typeStr === 'device_online' || typeStr === 'device_offline' || typeStr.startsWith('tamper_')) eventType = 'device_status'
    else if (typeStr === 'motion_detected') eventType = 'motion'

    const occurredAt = body.meta?.time ?? (body.data.attributes?.timestamp ? new Date(body.data.attributes.timestamp).toISOString() : new Date().toISOString())

    return {
      eventId: body.data.id,
      deviceId,
      eventType,
      occurredAt,
      roomId,
      metadata: {
        ringEventType: typeStr,
        requestId: body.meta?.request_id ?? '',
        accountId: body.meta?.account_id ?? '',
        subType: String(body.data.attributes?.subType ?? ''),
        identity: typeof body.data.attributes?.identity === 'string' ? body.data.attributes.identity : undefined,
        knownResident: typeof body.data.attributes?.knownResident === 'string' ? body.data.attributes.knownResident : undefined,
      },
    }
  }

  // Fallback for direct RingEvent payloads
  const direct = payload as Record<string, unknown>
  if (typeof direct.eventId === 'string' && typeof direct.deviceId === 'string' && typeof direct.roomId === 'string' && typeof direct.eventType === 'string') {
    return {
      eventId: direct.eventId,
      deviceId: direct.deviceId,
      eventType: direct.eventType as RingEventType,
      occurredAt: typeof direct.occurredAt === 'string' ? direct.occurredAt : new Date().toISOString(),
      roomId: direct.roomId,
      snapshotUrl: typeof direct.snapshotUrl === 'string' ? direct.snapshotUrl : undefined,
      metadata: typeof direct.metadata === 'object' && direct.metadata !== null ? direct.metadata as Record<string, string> : undefined,
    }
  }

  return null
}
