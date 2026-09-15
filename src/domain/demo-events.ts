import type { RingEvent } from './contracts'

export const demoRingEvents: RingEvent[] = [
  { eventId: 'evt_living_001', deviceId: 'ring_living_room', eventType: 'motion', occurredAt: '2026-09-13T14:18:00.000Z', roomId: 'living_room', metadata: { source: 'demo' } },
  { eventId: 'evt_front_door_001', deviceId: 'ring_front_door', eventType: 'doorbell', occurredAt: '2026-09-13T13:47:00.000Z', roomId: 'entry', metadata: { source: 'demo' } },
  { eventId: 'evt_bedroom_001', deviceId: 'ring_bedroom', eventType: 'motion', occurredAt: '2026-09-13T13:22:00.000Z', roomId: 'bedroom', metadata: { source: 'demo' } },
]
