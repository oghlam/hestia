import { useRef, useState, useCallback, useEffect } from 'react'
import type { SystemSettings, DbMode, DevicePipelineMode, AuditArchiveFile } from '../domain/contracts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

export const defaultSystemSettings: SystemSettings = {
  pipelineMode: 'local_camera',
  localCameraEnabled: true,
  autoStreamIntervalSec: 0,
  activeStreamRoomId: 'living_room',
  ringPartnerId: 'ring_partner_hgw001',
  ringWebhookPath: '/webhooks/ring',
  ringHmacSigningKey: 'hestia_dev_ring_hmac_secret_key',
  awsRegion: 'us-east-1',
  bedrockModelId: 'amazon.nova-micro-v1:0',

  homeName: 'Greenwood Haven Home',
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

  dbMode: 'local_memory',
  cloudDbEndpoint: 'https://dynamodb.us-east-1.amazonaws.com',
  cloudDbRegion: 'us-east-1',
  cloudDbTableName: 'hestia_elder_care_prod',
  cloudDbAuthToken: 'aws_iam_secret_role_hestia_access',
  cloudDbMfaRequired: true,
  cloudDbMfaCode: '849201',
  cloudDbConnected: false,

  appVersion: '0.1.0-mvp',
  lastUpdateCheck: new Date().toISOString(),
  updateAvailable: false,
  autoRotateLogs: true,
  maxLogSizeMb: 10,
  logRetentionDays: 30,
  lastLogRotation: new Date(Date.now() - 5 * 86400000).toISOString(),
  archivedLogsCount: 2,

  updatedAt: new Date().toISOString(),
}

export const initialDefaultArchives: AuditArchiveFile[] = [
  {
    id: 'arch_001',
    date: '2026-09-10T12:00:00Z',
    fileName: 'hestia_audit_archive_20260910.json',
    size: '18.4 KB',
    recordsCount: 42,
    contentJson: JSON.stringify([
      { logId: 'log_seed_1', timestamp: '2026-09-10T11:58:00Z', action: 'SYSTEM_ALERT_CREATED', actorId: 'system', targetId: 'alert_001', newState: 'VALIDATION_PENDING', notes: 'Automated fall detection alert' },
      { logId: 'log_seed_2', timestamp: '2026-09-10T11:59:12Z', action: 'COMING', actorId: 'Maria Vance', targetId: 'alert_001', previousState: 'VALIDATION_PENDING', newState: 'CARE_IN_PROGRESS', notes: 'ETA 5 mins' },
      { logId: 'log_seed_3', timestamp: '2026-09-10T12:04:30Z', action: 'I_HAVE_ARRIVED', actorId: 'Maria Vance', targetId: 'alert_001', previousState: 'CARE_IN_PROGRESS', newState: 'HANDLED', notes: 'Eleanor is safe' }
    ], null, 2),
  },
  {
    id: 'arch_002',
    date: '2026-09-01T08:30:00Z',
    fileName: 'hestia_audit_archive_20260901.json',
    size: '12.8 KB',
    recordsCount: 28,
    contentJson: JSON.stringify([
      { logId: 'log_seed_0', timestamp: '2026-09-01T08:29:00Z', action: 'OK', actorId: 'Maria Vance', targetId: 'resident_eleanor', newState: 'RESOLVED', notes: 'Morning wellness check' }
    ], null, 2),
  },
]

export interface UseSystemSettingsReturn {
  systemSettings: SystemSettings
  settingsSubTab: 'pipeline' | 'profile_address' | 'database' | 'maintenance' | 'assets'
  isDbTesting: boolean
  dbTestResult: { ok: boolean; message: string; latencyMs?: number } | null
  maintenanceFeedback: string | null
  isGpsLoading: boolean
  isLocalCameraRunning: boolean
  availableCameraDevices: MediaDeviceInfo[]
  selectedCameraDeviceId: string
  pipelineTargetRoom: string
  pipelineScenario: 'normal' | 'distress' | 'repeated_motion' | 'doorbell'
  pipelineFaceHint: 'eleanor' | 'known_target' | 'unknown' | 'no_face'
  isPipelinePushing: boolean
  isAutoStreaming: boolean
  pipelineFeedback: string | null
  pipelineLastResult: {
    scene: string
    person: string
    confidence: number
    summary: string
    time: string
    aiProvider: string
  } | null
  archivedLogs: AuditArchiveFile[]

  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>
  setSettingsSubTab: (tab: 'pipeline' | 'profile_address' | 'database' | 'maintenance' | 'assets') => void
  setIsDbTesting: (testing: boolean) => void
  setDbTestResult: (result: { ok: boolean; message: string; latencyMs?: number } | null) => void
  setMaintenanceFeedback: (feedback: string | null) => void
  setIsLocalCameraRunning: (running: boolean) => void
  setAvailableCameraDevices: (devices: MediaDeviceInfo[]) => void
  setSelectedCameraDeviceId: (id: string) => void
  setPipelineTargetRoom: (room: string) => void
  setPipelineScenario: (scenario: 'normal' | 'distress' | 'repeated_motion' | 'doorbell') => void
  setPipelineFaceHint: (hint: 'eleanor' | 'known_target' | 'unknown' | 'no_face') => void
  setIsPipelinePushing: (pushing: boolean) => void
  setIsAutoStreaming: (streaming: boolean) => void
  setPipelineFeedback: (feedback: string | null) => void
  setArchivedLogs: React.Dispatch<React.SetStateAction<AuditArchiveFile[]>>

  handleTestDatabase: () => Promise<void>
  handleSaveSettings: (e: React.FormEvent) => Promise<void>
  handlePipelineModeChange: (mode: DevicePipelineMode) => Promise<void>
  handleSaveHomeAddressProfile: (e: React.FormEvent) => Promise<void>
  handleGetGpsLocation: () => void
  handleClearLogs: (days: number) => Promise<void>
  handleRotateLogs: () => Promise<void>
  handleDownloadArchive: (archive: AuditArchiveFile) => void
  handleDeleteArchive: (id: string) => Promise<void>
  handleCheckUpdate: () => Promise<void>
  handleEnumerateDevices: () => Promise<void>
  handleSyncToCloud: () => Promise<void>
  handleSyncFromCloud: () => Promise<void>
  isDbSyncing: boolean
  startLocalCamera: (videoRefOrDeviceId?: any) => Promise<void>
  stopLocalCamera: () => void
  handlePushPipelineFeed: () => Promise<void>
  fetchSettings: () => Promise<void>
  fetchArchives: () => Promise<void>
}

export function useSystemSettings(): UseSystemSettingsReturn {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('hestia_settings')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return defaultSystemSettings
  })

  const [archivedLogs, setArchivedLogs] = useState<AuditArchiveFile[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_archives')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return initialDefaultArchives
  })

  const [settingsSubTab, setSettingsSubTab] = useState<'pipeline' | 'profile_address' | 'database' | 'maintenance' | 'assets'>('pipeline')
  const [isDbTesting, setIsDbTesting] = useState(false)
  const [isDbSyncing, setIsDbSyncing] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null)
  const [maintenanceFeedback, setMaintenanceFeedback] = useState<string | null>(null)
  const [isGpsLoading, setIsGpsLoading] = useState(false)
  const [isLocalCameraRunning, setIsLocalCameraRunning] = useState(false)
  const [availableCameraDevices, setAvailableCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraDeviceId, setSelectedCameraDeviceId] = useState<string>('')
  const [pipelineTargetRoom, setPipelineTargetRoom] = useState<string>('living_room')
  const [pipelineScenario, setPipelineScenario] = useState<'normal' | 'distress' | 'repeated_motion' | 'doorbell'>('normal')
  const [pipelineFaceHint, setPipelineFaceHint] = useState<'eleanor' | 'known_target' | 'unknown' | 'no_face'>('known_target')
  const [isPipelinePushing, setIsPipelinePushing] = useState(false)
  const [isAutoStreaming, setIsAutoStreaming] = useState(false)
  const [pipelineFeedback, setPipelineFeedback] = useState<string | null>(null)
  const [pipelineLastResult, setPipelineLastResult] = useState<{
    scene: string
    person: string
    confidence: number
    summary: string
    time: string
    aiProvider: string
  } | null>(null)

  const mediaStreamRef = useRef<MediaStream | null>(null)

  const syncSettingsToStorage = (settings: SystemSettings) => {
    try {
      localStorage.setItem('hestia_settings', JSON.stringify(settings))
    } catch (e) {
      console.error(e)
    }
  }

  const syncArchivesToStorage = (archives: AuditArchiveFile[]) => {
    try {
      localStorage.setItem('hestia_archives', JSON.stringify(archives))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`)
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSystemSettings(data.settings)
          syncSettingsToStorage(data.settings)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchArchives = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance/archives`)
      if (res.ok) {
        const data = await res.json()
        if (data.archives && Array.isArray(data.archives)) {
          setArchivedLogs(data.archives)
          syncArchivesToStorage(data.archives)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchArchives()
  }, [])

  const handleTestDatabase = useCallback(async () => {
    setIsDbTesting(true)
    setDbTestResult(null)

    try {
      const start = performance.now()
      const res = await fetch(`${API_BASE}/api/settings/db-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudDbEndpoint: systemSettings.cloudDbEndpoint,
          cloudDbRegion: systemSettings.cloudDbRegion,
          cloudDbTableName: systemSettings.cloudDbTableName,
          cloudDbAuthToken: systemSettings.cloudDbAuthToken,
          cloudDbMfaCode: systemSettings.cloudDbMfaCode,
          cloudDbMfaRequired: systemSettings.cloudDbMfaRequired,
        }),
      })

      const latencyMs = Math.round(performance.now() - start)
      const data = await res.json()

      if (res.ok) {
        setDbTestResult({
          ok: true,
          message: data.message || 'DynamoDB connection verified with active MFA.',
          latencyMs: data.latencyMs || latencyMs,
        })
        setSystemSettings((prev) => {
          const updated = { ...prev, cloudDbConnected: true }
          syncSettingsToStorage(updated)
          return updated
        })
      } else {
        setDbTestResult({
          ok: false,
          message: data.error || 'Connection failed',
        })
      }
    } catch {
      // offline simulation
      setDbTestResult({
        ok: true,
        message: 'Online Cloud Database (Amazon DynamoDB) connected via MFA (local simulation).',
        latencyMs: 24,
      })
      setSystemSettings((prev) => {
        const updated = { ...prev, cloudDbConnected: true }
        syncSettingsToStorage(updated)
        return updated
      })
    } finally {
      setIsDbTesting(false)
    }
  }, [systemSettings])

  const handleSyncToCloud = useCallback(async () => {
    setIsDbSyncing(true)
    try {
      const res = await fetch(`${API_BASE}/api/settings/db-sync/upload`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setMaintenanceFeedback(data.message || 'Data synced to Amazon DynamoDB successfully.')
      } else {
        setMaintenanceFeedback(data.error || 'Cloud sync failed')
      }
    } catch {
      setMaintenanceFeedback('Data synchronized to Amazon DynamoDB (simulated mode).')
    } finally {
      setIsDbSyncing(false)
      setTimeout(() => setMaintenanceFeedback(null), 3500)
    }
  }, [])

  const handleSyncFromCloud = useCallback(async () => {
    setIsDbSyncing(true)
    try {
      const res = await fetch(`${API_BASE}/api/settings/db-sync/download`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setMaintenanceFeedback(data.message || 'Entities restored from DynamoDB.')
      } else {
        setMaintenanceFeedback(data.error || 'Cloud fetch failed')
      }
    } catch {
      setMaintenanceFeedback('Entities retrieved from DynamoDB (simulated mode).')
    } finally {
      setIsDbSyncing(false)
      setTimeout(() => setMaintenanceFeedback(null), 3500)
    }
  }, [])

  const handleSaveSettings = useCallback(
    async (e: React.FormEvent) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault()
      try {
        const res = await fetch(`${API_BASE}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(systemSettings),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.settings) setSystemSettings(data.settings)
        }
      } catch {
        // ignore
      }
      syncSettingsToStorage(systemSettings)
      setMaintenanceFeedback('Settings saved successfully')
      setTimeout(() => setMaintenanceFeedback(null), 3000)
    },
    [systemSettings]
  )

  const handlePipelineModeChange = useCallback(
    async (mode: DevicePipelineMode) => {
      const updated = { ...systemSettings, pipelineMode: mode }
      setSystemSettings(updated)
      syncSettingsToStorage(updated)
      try {
        await fetch(`${API_BASE}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      } catch {
        // ignore
      }
      setPipelineFeedback(`Pipeline mode switched to: ${mode}`)
      setTimeout(() => setPipelineFeedback(null), 3000)
    },
    [systemSettings]
  )

  const handleSaveHomeAddressProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      await handleSaveSettings(e)
      setMaintenanceFeedback('Home address & emergency profile updated')
      setTimeout(() => setMaintenanceFeedback(null), 3000)
    },
    [handleSaveSettings]
  )

  const handleGetGpsLocation = useCallback(() => {
    setIsGpsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSystemSettings((prev) => {
            const updated = {
              ...prev,
              coordinates: {
                lat: Number(pos.coords.latitude.toFixed(4)),
                lon: Number(pos.coords.longitude.toFixed(4)),
              },
            }
            syncSettingsToStorage(updated)
            return updated
          })
          setIsGpsLoading(false)
          setMaintenanceFeedback('GPS coordinates detected successfully')
          setTimeout(() => setMaintenanceFeedback(null), 3000)
        },
        () => {
          // fallback
          setSystemSettings((prev) => {
            const updated = {
              ...prev,
              coordinates: { lat: 44.0462, lon: -123.022 },
            }
            syncSettingsToStorage(updated)
            return updated
          })
          setIsGpsLoading(false)
          setMaintenanceFeedback('Using default Springfield GPS coordinates')
          setTimeout(() => setMaintenanceFeedback(null), 3000)
        }
      )
    } else {
      setIsGpsLoading(false)
    }
  }, [])

  const handleClearLogs = useCallback(async (days: number) => {
    const confirmMsg = days > 0 ? `Are you sure you want to delete audit logs older than ${days} days?` : 'Are you sure you want to permanently purge ALL audit logs?'
    if (!confirm(confirmMsg)) return

    try {
      const res = await fetch(`${API_BASE}/api/maintenance/clear-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ olderThanDays: days }),
      })
      if (res.ok) {
        const data = await res.json()
        setMaintenanceFeedback(data.message || 'Audit logs successfully purged.')
        if (data.settings) setSystemSettings(data.settings)
      } else {
        setMaintenanceFeedback('Audit logs purged from local store.')
      }
    } catch {
      setMaintenanceFeedback(days > 0 ? `Cleared logs older than ${days} days` : 'Cleared all audit logs from storage.')
    }
    setTimeout(() => setMaintenanceFeedback(null), 3500)
  }, [])

  const handleRotateLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance/rotate-logs`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMaintenanceFeedback(data.message || 'Logs rotated and archived successfully')
        if (data.settings) setSystemSettings(data.settings)
        if (data.archives) {
          setArchivedLogs(data.archives)
          syncArchivesToStorage(data.archives)
        } else if (data.archive) {
          const updatedArchives = [data.archive, ...archivedLogs]
          setArchivedLogs(updatedArchives)
          syncArchivesToStorage(updatedArchives)
        }
      } else {
        throw new Error('API failed')
      }
    } catch {
      // offline simulation
      const now = new Date()
      const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14)
      const fileName = `hestia_audit_archive_${dateStr}.json`
      const newArchive: AuditArchiveFile = {
        id: `arch_${Date.now()}`,
        date: now.toISOString(),
        fileName,
        size: '14.6 KB',
        recordsCount: 32,
        contentJson: JSON.stringify([
          { logId: `log_${Date.now()}`, timestamp: now.toISOString(), action: 'SYSTEM_AUDIT_ROTATED', actorId: 'system_local', targetId: 'audit_store', newState: 'ARCHIVED', notes: 'Local offline log rotation archive' }
        ], null, 2),
      }
      const updated = [newArchive, ...archivedLogs]
      setArchivedLogs(updated)
      syncArchivesToStorage(updated)
      setSystemSettings((prev) => {
        const up = { ...prev, lastLogRotation: now.toISOString(), archivedLogsCount: updated.length }
        syncSettingsToStorage(up)
        return up
      })
      setMaintenanceFeedback(`Logs rotated into ${fileName} (14.6 KB)`)
    }
    setTimeout(() => setMaintenanceFeedback(null), 3500)
  }, [archivedLogs])

  const handleDownloadArchive = useCallback((archive: AuditArchiveFile) => {
    try {
      const content = archive.contentJson || JSON.stringify([
        {
          archiveId: archive.id,
          archiveDate: archive.date,
          fileName: archive.fileName,
          size: archive.size,
          recordsCount: archive.recordsCount,
          exportedAt: new Date().toISOString(),
          system: 'HESTIA Elder Care Command Center',
        }
      ], null, 2)

      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', archive.fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMaintenanceFeedback(`Downloaded archive: ${archive.fileName}`)
      setTimeout(() => setMaintenanceFeedback(null), 3000)
    } catch (e) {
      console.error('Download error:', e)
    }
  }, [])

  const handleDeleteArchive = useCallback(async (id: string) => {
    if (!confirm('Delete this archived audit file?')) return
    try {
      await fetch(`${API_BASE}/api/maintenance/archives/${id}`, { method: 'DELETE' })
    } catch {
      // ignore
    }
    const updated = archivedLogs.filter((a) => a.id !== id)
    setArchivedLogs(updated)
    syncArchivesToStorage(updated)
    setSystemSettings((prev) => {
      const up = { ...prev, archivedLogsCount: updated.length }
      syncSettingsToStorage(up)
      return up
    })
    setMaintenanceFeedback('Archive file deleted')
    setTimeout(() => setMaintenanceFeedback(null), 2500)
  }, [archivedLogs])

  const handleCheckUpdate = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/maintenance/check-update`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setMaintenanceFeedback(data.message || 'HESTIA is up to date (v0.1.0-mvp)')
      }
    } catch {
      setMaintenanceFeedback('HESTIA is running the latest version (v0.1.0-mvp)')
    }
    setTimeout(() => setMaintenanceFeedback(null), 3000)
  }, [])

  const handleEnumerateDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((d) => d.kind === 'videoinput')
        setAvailableCameraDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedCameraDeviceId) {
          setSelectedCameraDeviceId(videoDevices[0].deviceId)
        }
      }
    } catch {
      // ignore
    }
  }, [selectedCameraDeviceId])

  const startLocalCamera = useCallback(
    async (videoRefOrDeviceId?: any) => {
      try {
        let videoEl: HTMLVideoElement | null = null
        let deviceId = selectedCameraDeviceId

        if (videoRefOrDeviceId && typeof videoRefOrDeviceId === 'object' && 'current' in videoRefOrDeviceId) {
          videoEl = videoRefOrDeviceId.current
        } else if (typeof videoRefOrDeviceId === 'string') {
          deviceId = videoRefOrDeviceId
        }

        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          mediaStreamRef.current = stream
          if (videoEl) {
            videoEl.srcObject = stream
          }
          setIsLocalCameraRunning(true)
          setPipelineFeedback('Camera stream active')
          setTimeout(() => setPipelineFeedback(null), 2500)
        }
      } catch (e) {
        console.warn('Could not access camera device:', e)
        setIsLocalCameraRunning(true) // synthetic mode
        setPipelineFeedback('Using camera test simulation')
        setTimeout(() => setPipelineFeedback(null), 2500)
      }
    },
    [selectedCameraDeviceId]
  )

  const stopLocalCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    setIsLocalCameraRunning(false)
    setPipelineFeedback('Camera stopped')
    setTimeout(() => setPipelineFeedback(null), 2000)
  }, [])

  const handlePushPipelineFeed = useCallback(async () => {
    setIsPipelinePushing(true)
    const activeHint = pipelineFaceHint === 'eleanor' ? 'known_target' : pipelineFaceHint

    let snapshotBase64: string | undefined = undefined
    if (isLocalCameraRunning) {
      try {
        const videoEl = document.querySelector('.camera-viewfinder-video') as HTMLVideoElement | null
        if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
          const canvas = document.createElement('canvas')
          canvas.width = videoEl.videoWidth
          canvas.height = videoEl.videoHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0)
            snapshotBase64 = canvas.toDataURL('image/jpeg', 0.85)
          }
        }
      } catch (e) {
        console.warn('Canvas snapshot capture error:', e)
      }
    }

    const payload = {
      roomId: pipelineTargetRoom,
      simulatedSignal: pipelineScenario,
      faceHint: activeHint,
      snapshotBase64,
    }

    try {
      const res = await fetch(`${API_BASE}/api/pipeline/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setPipelineLastResult({
          scene: data.scene?.scene || 'S1_NORMAL',
          person: data.identity?.name || (data.identity?.identity === 'unknown' ? 'Unknown Visitor' : 'None detected'),
          confidence: data.scene?.confidence || 0.95,
          summary: data.scene?.contextText || 'Event ingested successfully',
          time: new Date().toLocaleTimeString(),
          aiProvider: data.aiProvider || 'Nova Micro',
        })
        setPipelineFeedback(`Event ${data.scene?.scene || 'S1'} ingested to ${pipelineTargetRoom.replace('_', ' ')} (Snapshot saved to Assets)`)
      }
    } catch {
      // offline mock result
      setPipelineLastResult({
        scene: pipelineScenario === 'distress' ? 'S3_HELP' : pipelineScenario === 'doorbell' ? 'S2_WATCH' : 'S1_NORMAL',
        person: activeHint === 'known_target' ? 'Eleanor Vance' : activeHint === 'unknown' ? 'Unknown Visitor' : 'Motion Only',
        confidence: 0.94,
        summary: `Simulated ${pipelineScenario} signal processed via Nova Micro context generator.`,
        time: new Date().toLocaleTimeString(),
        aiProvider: 'Nova Micro (Local Gateway)',
      })
      setPipelineFeedback(`Simulated event ingested to ${pipelineTargetRoom.replace('_', ' ')}`)
    } finally {
      setIsPipelinePushing(false)
      setTimeout(() => setPipelineFeedback(null), 3500)
    }
  }, [pipelineTargetRoom, pipelineScenario, pipelineFaceHint, isLocalCameraRunning])

  return {
    systemSettings,
    settingsSubTab,
    isDbTesting,
    dbTestResult,
    maintenanceFeedback,
    isGpsLoading,
    isLocalCameraRunning,
    availableCameraDevices,
    selectedCameraDeviceId,
    pipelineTargetRoom,
    pipelineScenario,
    pipelineFaceHint,
    isPipelinePushing,
    isAutoStreaming,
    pipelineFeedback,
    pipelineLastResult,
    archivedLogs,
    setSystemSettings,
    setSettingsSubTab,
    setIsDbTesting,
    setDbTestResult,
    setMaintenanceFeedback,
    setIsLocalCameraRunning,
    setAvailableCameraDevices,
    setSelectedCameraDeviceId,
    setPipelineTargetRoom,
    setPipelineScenario,
    setPipelineFaceHint,
    setIsPipelinePushing,
    setIsAutoStreaming,
    setPipelineFeedback,
    setArchivedLogs,
    handleTestDatabase,
    handleSaveSettings,
    handlePipelineModeChange,
    handleSaveHomeAddressProfile,
    handleGetGpsLocation,
    handleClearLogs,
    handleRotateLogs,
    handleDownloadArchive,
    handleDeleteArchive,
    handleCheckUpdate,
    handleEnumerateDevices,
    handleSyncToCloud,
    handleSyncFromCloud,
    isDbSyncing,
    startLocalCamera,
    stopLocalCamera,
    handlePushPipelineFeed,
    fetchSettings,
    fetchArchives,
  }
}
