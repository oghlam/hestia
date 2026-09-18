import type {
  AutomationRule,
  CareTeamMember,
  CareTeamMemberRole,
  FaceAngle,
  FaceTemplate,
  Resident,
  RingDeviceType,
  Room,
  RoomState,
  RuleCategory,
  SceneCode,
  SceneEvent,
} from './contracts'

export type TabKey =
  | 'overview'
  | 'residents'
  | 'rooms'
  | 'devices'
  | 'topology'
  | 'alerts'
  | 'events'
  | 'insights'
  | 'settings'
  | 'people'
  | 'care_team'
  | 'automation'
  | 'assets'
export type Scene = 'Normal' | 'Watch' | 'Help' | 'Critical'

export const sceneLabels: Record<SceneEvent['scene'], Scene> = {
  S1_NORMAL: 'Normal',
  S2_WATCH: 'Watch',
  S3_HELP: 'Help',
  S4_CRITICAL: 'Critical',
}

export const defaultRooms: Array<{ name: string; status: Scene; person: string; time: string; image: string; roomId: string }> = [
  { name: 'Living Room', status: 'Normal', person: 'Elder', time: '21:24', image: 'living', roomId: 'living_room' },
  { name: 'Bedroom', status: 'Normal', person: 'No person', time: '21:24', image: 'bedroom', roomId: 'bedroom' },
  { name: 'Corridor', status: 'Watch', person: 'No person', time: '21:24', image: 'corridor', roomId: 'corridor' },
  { name: 'Entry / Front Door', status: 'Normal', person: 'No person', time: '21:24', image: 'entry', roomId: 'entry' },
]

export const initialDefaultRooms: Room[] = [
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

export function generateFacePoseThumbnail(_angle: FaceAngle, _name: string): string {
  return '/avatar/default.png'
}

export const elderPortrait = '/avatar/default.png'

export const caregiverPortrait = '/avatar/default.png'

export const familyPortrait = '/avatar/default.png'

export const nursePortrait = '/avatar/default.png'

export const doctorPortrait = '/avatar/default.png'

export const defaultResidents: Resident[] = [
  {
    id: 'resident_elder',
    name: 'Elder',
    age: 78,
    gender: 'female',
    primaryTarget: true,
    healthConditions: ['Fall Risk', 'Hypertension', 'Mild Osteoarthritis'],
    mobilityStatus: 'Independent with walking cane',
    notes: 'Morning walks around 08:30. Bedtime scheduled at 21:30. Prefers warm lighting.',
    emergencyContacts: [
      { id: 'c_1', name: 'Caregiver', relation: 'Primary Caregiver', phone: '+1 (555) 234-5678', isPrimary: true },
      { id: 'c_2', name: 'Resident Family', relation: 'Family Member', phone: '+1 (555) 876-5432', isPrimary: false },
    ],
    doctorContact: {
      name: 'Care Doctor',
      clinic: 'St. Jude Geriatric Care',
      phone: '+1 (555) 345-9012',
      specialty: 'Geriatric Medicine',
    },
    faceTemplates: [
      { templateId: 'tmpl_el_front', angle: 'front', registeredAt: '2026-09-01T10:00:00Z', qualityScore: 0.98, previewUrl: elderPortrait, fileName: 'elder_front_a8f921.png' },
      { templateId: 'tmpl_el_left', angle: 'left', registeredAt: '2026-09-01T10:02:00Z', qualityScore: 0.94, previewUrl: generateFacePoseThumbnail('left', 'Elder'), fileName: 'elder_left_b3c791.png' },
      { templateId: 'tmpl_el_right', angle: 'right', registeredAt: '2026-09-01T10:04:00Z', qualityScore: 0.95, previewUrl: generateFacePoseThumbnail('right', 'Elder'), fileName: 'elder_right_c4d812.png' },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export function generateMemberAvatarThumbnail(_name: string, _role: any): string {
  return '/avatar/default.png';
}
export const defaultCareTeam: CareTeamMember[] = [
  {
    id: 'member_caregiver',
    name: 'Caregiver',
    role: 'primary_caregiver',
    relation: 'Primary Caregiver',
    phone: '+1 (555) 234-5678',
    email: 'caregiver@example.com',
    channel: 'push_sms',
    slaMinutes: 2,
    isPrimaryValidator: true,
    avatarUrl: generateMemberAvatarThumbnail('Caregiver', 'primary_caregiver'),
    shiftSchedule: '24/7 Primary Response',
    notes: 'Primary on-site responder. Holds spare physical key and emergency access.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_nurse',
    name: 'Nurse',
    role: 'professional_nurse',
    relation: 'Professional Nurse',
    phone: '+1 (555) 432-8765',
    email: 'nurse@example.com',
    channel: 'phone_call',
    slaMinutes: 3,
    isPrimaryValidator: false,
    avatarUrl: generateMemberAvatarThumbnail('Nurse', 'professional_nurse'),
    shiftSchedule: 'Weekdays 08:00 - 16:00',
    notes: 'Administers morning vitals and medication checks.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_family',
    name: 'Resident Family',
    role: 'family_member',
    relation: 'Family Member',
    phone: '+1 (555) 876-5432',
    email: 'family@example.com',
    channel: 'whatsapp',
    slaMinutes: 5,
    isPrimaryValidator: false,
    avatarUrl: generateMemberAvatarThumbnail('Resident Family', 'family_member'),
    shiftSchedule: 'Evening Backup Response',
    notes: 'Available for secondary escalation and weekend visits.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_doctor',
    name: 'Care Doctor',
    role: 'physician',
    relation: 'Attending Physician',
    phone: '+1 (555) 345-9012',
    email: 'doctor@example.com',
    channel: 'phone_call',
    slaMinutes: 10,
    isPrimaryValidator: false,
    avatarUrl: generateMemberAvatarThumbnail('Care Doctor', 'physician'),
    shiftSchedule: 'On-Call Medical Escalation',
    notes: 'Primary physician overseeing cardiovascular and fall-risk care plans.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export const defaultRules: AutomationRule[] = [
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

export const defaultDemoScenes: SceneEvent[] = [
  {
    sceneId: 'scene_living_001',
    eventId: 'evt_living_001',
    scene: 'S1_NORMAL',
    confidence: 0.96,
    residentId: 'resident_elder',
    roomId: 'living_room',
    signals: ['Human motion vector', 'Seated relaxing posture', 'Normal ambient lighting'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_elder',
      name: 'Elder',
      confidence: 0.96,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Elder is sitting comfortably on the sofa reading a book. Routine mobility and vitals appear calm and safe.',
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
    residentId: 'resident_elder',
    roomId: 'bedroom',
    signals: ['Floor-level posture', 'Sudden height transition', 'Vocal acoustic distress spike'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_elder',
      name: 'Elder',
      confidence: 0.95,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Elder experienced an unexpected fall near the bedside. Immediate caregiver assistance recommended.',
    createdAt: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
  },
  {
    sceneId: 'scene_corridor_004',
    eventId: 'evt_corridor_001',
    scene: 'S1_NORMAL',
    confidence: 0.91,
    residentId: 'resident_elder',
    roomId: 'corridor',
    signals: ['Upright cane-assisted walking', 'Hallway transit vector'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_elder',
      name: 'Elder',
      confidence: 0.93,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Elder walked through the central corridor with walking cane towards the kitchen. Normal pace.',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
]
