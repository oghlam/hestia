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

export type TabKey = 'overview' | 'rooms' | 'people' | 'events' | 'care_team' | 'automation' | 'settings'
export type Scene = 'Normal' | 'Watch' | 'Help' | 'Critical'

export const sceneLabels: Record<SceneEvent['scene'], Scene> = {
  S1_NORMAL: 'Normal',
  S2_WATCH: 'Watch',
  S3_HELP: 'Help',
  S4_CRITICAL: 'Critical',
}

export const defaultRooms: Array<{ name: string; status: Scene; person: string; time: string; image: string; roomId: string }> = [
  { name: 'Living Room', status: 'Normal', person: 'Eleanor', time: '21:24', image: 'living', roomId: 'living_room' },
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

export function generateFacePoseThumbnail(angle: FaceAngle, _name: string): string {
  const angleLabel = angle === 'front' ? '0° Frontal' : angle === 'left' ? '45° Left Profile' : '45° Right Profile'
  const rot = angle === 'left' ? -22 : angle === 'right' ? 22 : 0
  const eyeX1 = angle === 'left' ? 34 : angle === 'right' ? 44 : 39
  const eyeX2 = angle === 'left' ? 56 : angle === 'right' ? 66 : 61
  const noseX = angle === 'left' ? 43 : angle === 'right' ? 57 : 50

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="14" fill="#0f172a"/>
    <circle cx="50" cy="46" r="40" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2"/>
    <g transform="rotate(${rot} 50 46)">
      <ellipse cx="50" cy="46" rx="20" ry="26" fill="#f8fafc"/>
      <circle cx="${eyeX1}" cy="40" r="3" fill="#0f172a"/>
      <circle cx="${eyeX2}" cy="40" r="3" fill="#0f172a"/>
      <path d="M ${noseX} 44 L ${noseX} 52 L ${noseX + (angle === 'left' ? -3 : angle === 'right' ? 3 : 0)} 53" fill="none" stroke="#475569" stroke-width="2"/>
      <path d="M 43 59 Q 50 63 57 59" fill="none" stroke="#64748b" stroke-width="2"/>
    </g>
    <rect x="10" y="76" width="80" height="18" rx="5" fill="#0284c7"/>
    <text x="50" y="88" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${angleLabel}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const elderPortrait = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="el-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="el-hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#el-bg)"/>
  <circle cx="60" cy="50" r="34" fill="url(#el-hair)"/>
  <ellipse cx="60" cy="40" rx="36" ry="24" fill="url(#el-hair)"/>
  <ellipse cx="60" cy="58" rx="22" ry="25" fill="#fed7aa"/>
  <rect x="41" y="52" width="15" height="11" rx="3" fill="none" stroke="#475569" stroke-width="2"/>
  <rect x="64" y="52" width="15" height="11" rx="3" fill="none" stroke="#475569" stroke-width="2"/>
  <line x1="56" y1="57" x2="64" y2="57" stroke="#475569" stroke-width="2"/>
  <circle cx="48.5" cy="57.5" r="2.5" fill="#1e293b"/>
  <circle cx="71.5" cy="57.5" r="2.5" fill="#1e293b"/>
  <path d="M 60 59 L 60 64 L 62 65" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 52 71 Q 60 76 68 71" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
  <path d="M 26 120 C 26 86, 94 86, 94 120 Z" fill="#334155"/>
  <path d="M 46 90 L 60 104 L 74 90" fill="#fed7aa"/>
</svg>
`)}`

export const caregiverPortrait = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="ma-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="ma-hair" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#ma-bg)"/>
  <circle cx="60" cy="52" r="32" fill="url(#ma-hair)"/>
  <path d="M 32 50 C 32 30, 88 30, 88 50 C 88 80, 80 92, 80 92 L 40 92 C 40 92, 32 80, 32 50 Z" fill="url(#ma-hair)"/>
  <ellipse cx="60" cy="56" rx="21" ry="24" fill="#ffedd5"/>
  <path d="M 38 46 Q 60 38 82 46 Q 74 36 60 36 Q 46 36 38 46 Z" fill="url(#ma-hair)"/>
  <ellipse cx="50" cy="54" rx="3" ry="3.5" fill="#1e293b"/>
  <ellipse cx="70" cy="54" rx="3" ry="3.5" fill="#1e293b"/>
  <circle cx="51" cy="53" r="1" fill="#ffffff"/>
  <circle cx="71" cy="53" r="1" fill="#ffffff"/>
  <path d="M 44 48 Q 50 46 56 48" fill="none" stroke="#451a03" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 64 48 Q 70 46 76 48" fill="none" stroke="#451a03" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M 60 56 L 60 62 L 62 63" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M 52 68 Q 60 74 68 68" fill="none" stroke="#be123c" stroke-width="2" stroke-linecap="round"/>
  <path d="M 28 120 C 28 88, 92 88, 92 120 Z" fill="#0284c7"/>
  <path d="M 48 90 L 60 102 L 72 90" fill="#ffedd5"/>
</svg>
`)}`

export const familyPortrait = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="jo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#jo-bg)"/>
  <ellipse cx="60" cy="56" rx="22" ry="26" fill="#fed7aa"/>
  <path d="M 38 44 C 42 26, 78 26, 82 44 C 82 44, 60 36, 38 44 Z" fill="#1e293b"/>
  <circle cx="50" cy="54" r="3" fill="#1e293b"/>
  <circle cx="70" cy="54" r="3" fill="#1e293b"/>
  <path d="M 54 68 Q 60 73 66 68" fill="none" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>
  <path d="M 26 120 C 26 88, 94 88, 94 120 Z" fill="#334155"/>
</svg>
`)}`

export const nursePortrait = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="sa-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#sa-bg)"/>
  <circle cx="60" cy="50" r="30" fill="#ca8a04"/>
  <ellipse cx="60" cy="56" rx="20" ry="24" fill="#ffedd5"/>
  <circle cx="50" cy="54" r="2.5" fill="#1e293b"/>
  <circle cx="70" cy="54" r="2.5" fill="#1e293b"/>
  <path d="M 53 68 Q 60 73 67 68" fill="none" stroke="#be123c" stroke-width="2" stroke-linecap="round"/>
  <path d="M 28 120 C 28 88, 92 88, 92 120 Z" fill="#059669"/>
  <rect x="74" y="98" width="12" height="12" rx="3" fill="#ffffff"/>
  <path d="M 80 100 L 80 108 M 76 104 L 84 104" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
</svg>
`)}`

export const doctorPortrait = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="ro-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0e7ff"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="60" fill="url(#ro-bg)"/>
  <ellipse cx="60" cy="56" rx="22" ry="25" fill="#fed7aa"/>
  <path d="M 38 42 C 44 26, 76 26, 82 42 Z" fill="#334155"/>
  <rect x="42" y="51" width="14" height="10" rx="2" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <rect x="64" y="51" width="14" height="10" rx="2" fill="none" stroke="#1e293b" stroke-width="1.8"/>
  <line x1="56" y1="56" x2="64" y2="56" stroke="#1e293b" stroke-width="1.8"/>
  <circle cx="49" cy="56" r="2.5" fill="#1e293b"/>
  <circle cx="71" cy="56" r="2.5" fill="#1e293b"/>
  <path d="M 53 69 Q 60 74 67 69" fill="none" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>
  <path d="M 28 120 C 28 88, 92 88, 92 120 Z" fill="#0284c7"/>
</svg>
`)}`

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
      { templateId: 'tmpl_el_front', angle: 'front', registeredAt: '2026-09-01T10:00:00Z', qualityScore: 0.98, previewUrl: elderPortrait, fileName: 'elder_front_a8f921.png' },
      { templateId: 'tmpl_el_left', angle: 'left', registeredAt: '2026-09-01T10:02:00Z', qualityScore: 0.94, previewUrl: generateFacePoseThumbnail('left', 'Eleanor'), fileName: 'eleanor_left_b3c791.png' },
      { templateId: 'tmpl_el_right', angle: 'right', registeredAt: '2026-09-01T10:04:00Z', qualityScore: 0.95, previewUrl: generateFacePoseThumbnail('right', 'Eleanor'), fileName: 'eleanor_right_c4d812.png' },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export function generateMemberAvatarThumbnail(name: string, role: CareTeamMemberRole): string {
  const n = (name || '').toLowerCase()
  if (n.includes('caregiver') || n.includes('maria')) return caregiverPortrait
  if (n.includes('nurse') || n.includes('sarah') || n.includes('siti')) return nursePortrait
  if (n.includes('family') || n.includes('john')) return familyPortrait
  if (n.includes('doctor') || n.includes('robert') || n.includes('dr')) return doctorPortrait

  const initial = name ? name.charAt(0).toUpperCase() : 'M'
  const bgColor =
    role === 'professional_nurse'
      ? '#059669'
      : role === 'physician'
      ? '#0284c7'
      : role === 'primary_caregiver'
      ? '#4f46e5'
      : '#d97706'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="50" fill="${bgColor}"/>
    <circle cx="50" cy="38" r="17" fill="#ffffff" opacity="0.95"/>
    <path d="M 22 84 C 22 60, 78 60, 78 84 Z" fill="#ffffff" opacity="0.95"/>
    <text x="50" y="44" fill="${bgColor}" font-size="16" font-weight="bold" text-anchor="middle" font-family="sans-serif">${initial}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const defaultCareTeam: CareTeamMember[] = [
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
    avatarUrl: generateMemberAvatarThumbnail('Maria Vance', 'primary_caregiver'),
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
    avatarUrl: generateMemberAvatarThumbnail('Sarah Jenkins', 'professional_nurse'),
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
    avatarUrl: generateMemberAvatarThumbnail('John Vance', 'family_member'),
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
    avatarUrl: generateMemberAvatarThumbnail('Robert Chen', 'physician'),
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
    residentId: 'resident_eleanor',
    roomId: 'living_room',
    signals: ['Human motion vector', 'Seated relaxing posture', 'Normal ambient lighting'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_eleanor',
      name: 'Elder',
      confidence: 0.96,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Eleanor is sitting comfortably on the sofa reading a book. Routine mobility and vitals appear calm and safe.',
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
      name: 'Elder',
      confidence: 0.95,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Eleanor experienced an unexpected fall near the bedside. Immediate caregiver assistance recommended.',
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
      name: 'Elder',
      confidence: 0.93,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Eleanor walked through the central corridor with walking cane towards the kitchen. Normal pace.',
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
]
