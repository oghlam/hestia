export type RingEventType = 'motion' | 'doorbell' | 'device_status' | 'snapshot'

export type RingEvent = {
  eventId: string
  deviceId: string
  eventType: RingEventType
  occurredAt: string
  roomId: string
  snapshotUrl?: string
  metadata?: Record<string, string>
}

export type IdentityResult = {
  identity: 'known_target' | 'unknown' | 'not_detected'
  residentId?: string
  name?: string
  confidence?: number
  faceCount: number
  source: 'ring_snapshot'
}

export type SceneCode = 'S1_NORMAL' | 'S2_WATCH' | 'S3_HELP' | 'S4_CRITICAL'

export type SceneEvent = {
  sceneId: string
  eventId: string
  scene: SceneCode
  confidence: number
  residentId?: string
  roomId: string
  signals: string[]
  identity?: IdentityResult
  contextText?: string
  createdAt: string
}

export type AlertState = 'DETECTED' | 'VALIDATION_PENDING' | 'RESOLVED' | 'CARE_IN_PROGRESS' | 'ESCALATED' | 'HANDLED'
export type ValidatorAction = 'OK' | 'COMING' | 'SIREN' | 'I_HAVE_ARRIVED'

export type Alert = {
  alertId: string
  sceneId: string
  eventId: string
  state: AlertState
  scene: 'S3_HELP' | 'S4_CRITICAL'
  confidence: number
  roomId: string
  residentId?: string
  createdAt: string
  updatedAt: string
  actorId?: string
  etaMinutes?: number
}

export type FaceAngle = 'front' | 'left' | 'right'

export type FaceTemplate = {
  templateId: string
  angle: FaceAngle
  registeredAt: string
  previewUrl?: string
  fileName?: string
  qualityScore: number
  embedding?: number[]
}

export type EmergencyContact = {
  id: string
  name: string
  relation: string
  phone: string
  isPrimary?: boolean
}

export type DoctorContact = {
  name: string
  clinic: string
  phone: string
  specialty?: string
}

export type CareTeamMemberRole =
  | 'primary_caregiver'
  | 'family_member'
  | 'professional_nurse'
  | 'physician'
  | 'neighbor_emergency'

export type NotificationChannel = 'push_sms' | 'whatsapp' | 'phone_call' | 'push_only'

export type CareTeamMember = {
  id: string
  name: string
  role: CareTeamMemberRole
  relation: string
  phone: string
  email?: string
  channel: NotificationChannel
  slaMinutes: number
  isPrimaryValidator: boolean
  avatarUrl?: string
  assignedResidentId?: string
  shiftSchedule?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type Resident = {
  id: string
  name: string
  age: number
  gender?: 'female' | 'male' | 'other'
  primaryTarget: boolean
  healthConditions: string[]
  mobilityStatus?: string
  notes?: string
  emergencyContacts: EmergencyContact[]
  doctorContact?: DoctorContact
  faceTemplates: FaceTemplate[]
  createdAt: string
  updatedAt: string
}

export type RuleCategory =
  | 'fall_detection'
  | 'inactivity_guard'
  | 'night_wandering'
  | 'visitor_doorbell'
  | 'hardware_health'
  | 'custom'

export type EscalationPolicy = 'notify_primary' | 'notify_all' | 'trigger_siren' | 'call_emergency'

export type AutomationRule = {
  id: string
  name: string
  description: string
  category: RuleCategory
  enabled: boolean
  targetScene: SceneCode
  confidenceThreshold: number
  triggerZone: 'all' | string
  timeWindow: {
    allDay: boolean
    startHour: number
    endHour: number
  }
  slaTimeoutMinutes: number
  escalationPolicy: EscalationPolicy
  reassurancePush: boolean
  isPreset: boolean
  createdAt: string
  updatedAt: string
}

export type RingDeviceType = 'Indoor Cam' | 'Stick Up Cam' | 'Video Doorbell' | 'Floodlight Cam'

export type Room = {
  id: string
  name: string
  floor?: string
  deviceId?: string
  deviceName?: string
  deviceType?: RingDeviceType
  signalDbm?: string
  mapCoordinates?: { x: number; y: number }
  createdAt: string
  updatedAt: string
}

export type HomeMapConfig = {
  mapUrl?: string
  presetName?: string
  updatedAt: string
}

export type RoomId = 'living_room' | 'bedroom' | 'corridor' | 'entry' | string

export type RoomState = {
  roomId: string
  name: string
  status: SceneCode
  activePerson?: string
  lastActivityTime: string
  deviceStatus: 'normal' | 'active' | 'warning' | 'offline'
  roomData?: Room
}

export type AuditLogEntry = {
  logId: string
  timestamp: string
  action: ValidatorAction | 'SYSTEM_ALERT_CREATED' | 'SYSTEM_SCENE_CLASSIFIED'
  actorId: string
  targetId: string
  previousState?: string
  newState: string
  notes?: string
}

export type AccessLogEntry = {
  accessId: string
  timestamp: string
  roomId: string
  identityType: 'known_target' | 'unknown' | 'not_detected'
  name?: string
  confidence?: number
  actionTaken: 'log_only' | 'care_monitoring' | 'visitor_observed'
}

export type DevicePipelineMode = 'local_camera' | 'ring_simulator' | 'ring_hardware'
export type DbMode = 'local_memory' | 'cloud_dynamodb'

export type SystemSettings = {
  // Device Pipeline
  pipelineMode: DevicePipelineMode
  localCameraEnabled: boolean
  selectedCameraDeviceId?: string
  autoStreamIntervalSec: number
  activeStreamRoomId: string
  ringPartnerId: string
  ringWebhookPath: string
  ringHmacSigningKey: string
  awsRegion: string
  bedrockModelId: string

  // Home & Address Profile
  homeName: string
  homeId: string
  streetAddress: string
  city: string
  stateProvince: string
  postalCode: string
  country: string
  coordinates: {
    lat: number
    lon: number
  }
  emergencyAccessNotes: string

  // Database Profile
  dbMode: DbMode
  cloudDbEndpoint: string
  cloudDbRegion: string
  cloudDbTableName: string
  cloudDbAuthToken: string
  cloudDbMfaRequired: boolean
  cloudDbMfaCode?: string
  cloudDbConnected: boolean

  // Maintenance & System Health
  appVersion: string
  lastUpdateCheck: string
  updateAvailable: boolean
  autoRotateLogs: boolean
  maxLogSizeMb: number
  logRetentionDays: number
  lastLogRotation?: string
  archivedLogsCount: number

  updatedAt: string
}

export type NotificationItem = {
  id: string
  recipient: 'caregiver' | 'family'
  type: 'alert' | 'update' | 'reassurance'
  title: string
  body: string
  sentAt: string
}
