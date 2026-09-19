import React, { useEffect, useState } from 'react'
import {
  BellRing,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  House,
  Menu,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import type { Alert, Resident, SceneEvent } from '../domain/contracts'

export interface ValidatorViewProps {
  apiBase?: string
}

export type HandledRecord = {
  alertId: string
  residentName: string
  roomName: string
  actorId: string
  handledAt: string
  scene: string
  action: string
}

export const ValidatorView: React.FC<ValidatorViewProps> = ({ apiBase }) => {
  const API_BASE =
    apiBase ??
    import.meta.env.VITE_API_BASE_URL ??
    (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '5173'
      ? 'http://127.0.0.1:8787'
      : '')

  const [alert, setAlert] = useState<Alert | null>(() => {
    try {
      const local = localStorage.getItem('hestia_active_alert')
      if (local) return JSON.parse(local)
    } catch {}
    return null
  })
  const [activeScene, setActiveScene] = useState<SceneEvent | null>(null)
  const [primaryResident, setPrimaryResident] = useState<Resident | null>(null)
  const [message, setMessage] = useState('')
  const [handledRecord, setHandledRecord] = useState<HandledRecord | null>(() => {
    try {
      const saved = localStorage.getItem('hestia_last_handled')
      if (saved) return JSON.parse(saved)
    } catch {}
    return null
  })
  const [now, setNow] = useState(() => Date.now())

  // Ticking 1s clock for real-time elapsed timer
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Real-time polling for alerts, scenes & resident profile
  useEffect(() => {
    const fetchAllData = () => {
      // 1. Alerts
      fetch(`${API_BASE}/api/alerts`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.alerts && data.alerts.length > 0) {
            const current = data.alerts[0] as Alert
            setAlert(current)
            setMessage('')
          } else {
            try {
              const local = localStorage.getItem('hestia_active_alert')
              if (local) {
                setAlert(JSON.parse(local))
                setMessage('')
                return
              }
            } catch {}
            setAlert(null)
          }
        })
        .catch(() => {
          try {
            const local = localStorage.getItem('hestia_active_alert')
            if (local) {
              setAlert(JSON.parse(local))
              setMessage('')
              return
            }
          } catch {}
          setAlert(null)
        })

      // 2. Scenes (for AI context note & timeline details)
      fetch(`${API_BASE}/api/scenes`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.scenes && data.scenes.length > 0) {
            const scenesList = data.scenes as SceneEvent[]
            if (alert?.sceneId) {
              const match = scenesList.find((s) => s.sceneId === alert.sceneId)
              if (match) setActiveScene(match)
              else setActiveScene(scenesList[0])
            } else {
              setActiveScene(scenesList[0])
            }
          }
        })
        .catch(() => {})

      // 3. Residents (for elder photo/avatar & health info)
      fetch(`${API_BASE}/api/residents`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.residents && data.residents.length > 0) {
            const target = data.residents.find((res: Resident) => res.primaryTarget) || data.residents[0]
            setPrimaryResident(target)
          }
        })
        .catch(() => {})
    }

    fetchAllData()
    const poller = setInterval(fetchAllData, 2500)
    return () => clearInterval(poller)
  }, [alert?.sceneId, API_BASE])

  // Helper for dynamic elapsed time ("just now" -> "30s" -> "2m" ... etc.)
  const formatElapsed = (isoString?: string) => {
    if (!isoString) return 'just now'
    const diffSec = Math.max(0, Math.floor((now - new Date(isoString).getTime()) / 1000))
    if (diffSec < 10) return 'just now'
    if (diffSec < 60) return `${diffSec}s`
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`
    return `${Math.floor(diffSec / 3600)}h`
  }

  // Helper for formatted trigger time (e.g. 23:00)
  const formatTriggerTime = (isoString?: string) => {
    if (!isoString) return '23:00'
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return '23:00'
    }
  }

  async function act(action: 'OK' | 'COMING' | 'SIREN' | 'I_HAVE_ARRIVED') {
    if (!alert) return
    const nextState =
      action === 'OK'
        ? 'RESOLVED'
        : action === 'COMING'
        ? 'CARE_IN_PROGRESS'
        : action === 'SIREN'
        ? 'ESCALATED'
        : 'HANDLED'
    const nowIso = new Date().toISOString()
    const updatedAlert: Alert = {
      ...alert,
      state: nextState,
      actorId: 'Caregiver',
      etaMinutes: action === 'COMING' ? 5 : undefined,
      updatedAt: nowIso,
    }

    if (action === 'OK' || action === 'I_HAVE_ARRIVED') {
      const record: HandledRecord = {
        alertId: alert.alertId,
        residentName: primaryResident?.name || 'Elder',
        roomName: (alert.roomId || 'living_room').replace('_', ' ').toUpperCase(),
        actorId: 'Caregiver (Daughter / Caregiver)',
        handledAt: formatTriggerTime(nowIso),
        scene: alert.scene === 'S4_CRITICAL' ? 'S4 · CRITICAL' : 'S3 · HELP',
        action: action === 'OK' ? 'OK (Clear)' : 'I’ve Arrived',
      }
      setHandledRecord(record)
      try {
        localStorage.setItem('hestia_last_handled', JSON.stringify(record))
        localStorage.removeItem('hestia_active_alert')
      } catch {}
      setAlert(null)
      setMessage(`Alert handled and marked ${nextState}. Family notified.`)
    } else {
      try {
        localStorage.setItem('hestia_active_alert', JSON.stringify(updatedAlert))
      } catch {}
      setAlert(updatedAlert)
      setMessage(`Status updated: ${nextState.replaceAll('_', ' ')}`)
    }

    try {
      const response = await fetch(`${API_BASE}/api/alerts/${alert.alertId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, actorId: 'Caregiver', etaMinutes: action === 'COMING' ? 5 : undefined }),
      })
      if (response.ok) {
        const data = await response.json()
        if (action !== 'OK' && action !== 'I_HAVE_ARRIVED') {
          setAlert(data.alert)
        }
      }
    } catch {
      // state & localStorage updated
    }
  }

  // Quick simulator for testing right from mobile view
  const simulateTestAlert = async () => {
    try {
      setHandledRecord(null)
      try {
        localStorage.removeItem('hestia_last_handled')
      } catch {}
      const res = await fetch(`${API_BASE}/demo/events`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.alert) {
          setAlert(data.alert)
          if (data.scene) setActiveScene(data.scene)
          try {
            localStorage.setItem('hestia_active_alert', JSON.stringify(data.alert))
          } catch {}
        }
      }
    } catch {}
  }

  const inProgress = alert?.state === 'CARE_IN_PROGRESS'
  const elderName = primaryResident?.name || 'Elder'
  const elderRoomName = (alert?.roomId || 'living_room').replace('_', ' ').toUpperCase()
  const triggerTime = formatTriggerTime(alert?.createdAt || activeScene?.createdAt)
  const elapsed = formatElapsed(alert?.createdAt || activeScene?.createdAt)
  const aiNote =
    activeScene?.contextText ||
    'Elder experienced an unexpected fall near the bedside. Immediate caregiver assistance recommended.'
  const elderAvatarUrl =
    primaryResident?.faceTemplates?.[0]?.previewUrl ||
    (primaryResident as unknown as { avatarUrl?: string })?.avatarUrl

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState<'menu' | 'live_updates'>('menu')

  // Standalone PWA view renders without App shell, so apply saved theme here.
  // Without this, html has no data-theme and dark logo rules never fire.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hestia-theme')
      document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light')
    } catch {}
  }, [])

  return (
    <main className="validator-page">
      <header className="validator-header">
        <button onClick={() => window.history.back()} title="Back to Dashboard">
          <ChevronLeft size={22} />
        </button>
        <div className="validator-header-logo">
          <img src="/logo/hestia_logo_full.png" alt="HESTIA" className="logo-full" />
          <img src="/logo/hestia_splash_transparent.png?v=5" alt="HESTIA" className="topbar-h-icon" style={{ height: '30px', width: '30px' }} />
        </div>
        <button
          onClick={() => {
            setDrawerOpen(true)
            setDrawerTab('menu')
          }}
          title="Options & Live Updates"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Sliding Right Sidebar Drawer for Options & Live Updates */}
      <div className={`validator-drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`validator-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="validator-drawer-header">
          {drawerTab === 'live_updates' ? (
            <>
              <h2>
                <span className="live-dot" /> Live Updates
              </h2>
              <button onClick={() => setDrawerTab('menu')} title="Back to Menu">
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <>
              <h2>Validator Menu</h2>
              <button onClick={() => setDrawerOpen(false)} title="Close">
                <X size={20} />
              </button>
            </>
          )}
        </div>

        <div className="validator-drawer-body">
          {drawerTab === 'menu' ? (
            <div>
              <button className="validator-menu-item" onClick={() => setDrawerTab('live_updates')}>
                <Radio size={18} style={{ color: '#2563eb' }} />
                <span>Live Updates</span>
                <span className="validator-menu-badge">LIVE</span>
                <ChevronRight size={16} style={{ color: '#94a3b8' }} />
              </button>

              <button
                className="validator-menu-item"
                onClick={() => {
                  simulateTestAlert()
                  setDrawerOpen(false)
                }}
              >
                <Sparkles size={18} style={{ color: '#d97706' }} />
                <span>Simulate Distress Alert</span>
              </button>

              <button className="validator-menu-item" onClick={() => (window.location.href = '/')}>
                <House size={18} style={{ color: '#475569' }} />
                <span>Open Command Center</span>
              </button>

              <div
                style={{
                  marginTop: '24px',
                  padding: '14px',
                  background: 'var(--bg-subtle)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Emergency Contact Circle
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                  Caregiver (Daughter)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  +1 (555) 234-5678 · Primary Caregiver
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                  Resident Family (Son)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+1 (555) 876-5432 · Backup Contact</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="validator-timeline">
                <div className="validator-timeline-item">
                  <span className="validator-timeline-time">{triggerTime}</span>
                  <span className="validator-timeline-dot alert" />
                  <span className="validator-timeline-text">
                    <strong>Motion & Distress:</strong> Ring camera detected sudden impact in {elderRoomName}.
                  </span>
                </div>
                <div className="validator-timeline-item">
                  <span className="validator-timeline-time">{triggerTime}</span>
                  <span className="validator-timeline-dot" />
                  <span className="validator-timeline-text">
                    <strong>Nova Micro AI:</strong> Scene classified as{' '}
                    {alert?.scene === 'S4_CRITICAL' ? 'S4 Critical' : 'S3 Help'} (
                    {Math.round((alert?.confidence || 0.96) * 100)}% match).
                  </span>
                </div>
                <div className="validator-timeline-item">
                  <span className="validator-timeline-time">{triggerTime}</span>
                  <span className="validator-timeline-dot alert" />
                  <span className="validator-timeline-text">
                    <strong>Auto-Push Family:</strong> Emergency alert broadcasted to Caregiver & Resident Family (WhatsApp &
                    Push).
                  </span>
                </div>
                {inProgress && (
                  <div className="validator-timeline-item">
                    <span className="validator-timeline-time">{triggerTime}</span>
                    <span className="validator-timeline-dot warning" />
                    <span className="validator-timeline-text">
                      <strong>Caregiver Dispatched:</strong> Caregiver acknowledged COMING (ETA: 5m).
                    </span>
                  </div>
                )}
                {inProgress && (
                  <div className="validator-timeline-item">
                    <span className="validator-timeline-time">{triggerTime}</span>
                    <span className="validator-timeline-dot success" />
                    <span className="validator-timeline-text">
                      <strong>Family Push:</strong> Reassurance update sent to family members.
                    </span>
                  </div>
                )}
                {handledRecord && (
                  <div className="validator-timeline-item">
                    <span className="validator-timeline-time">{handledRecord.handledAt}</span>
                    <span className="validator-timeline-dot success" />
                    <span className="validator-timeline-text">
                      <strong>Alert Handled:</strong> Caregiver verified {handledRecord.residentName} is safe in{' '}
                      {handledRecord.roomName}.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="validator-content">
        {!alert ? (
          handledRecord ? (
            /* Dedicated Alert Handled State */
            <div className="validator-handled-card">
              <div className="validator-handled-badge">
                <CheckCircle2 size={15} /> ALERT HANDLED · ALL CLEAR
              </div>
              <div style={{ margin: '14px 0', display: 'grid', placeItems: 'center' }}>
                <ShieldCheck size={56} style={{ color: '#16a34a', display: 'block' }} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Resident Safe & Verified
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{handledRecord.residentName}</strong> was checked in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{handledRecord.roomName}</strong>. Care team response
                completed by <strong style={{ color: 'var(--text-primary)' }}>{handledRecord.actorId}</strong> at{' '}
                {handledRecord.handledAt}.
              </p>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '18px',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    color: '#16a34a',
                    marginBottom: '4px',
                  }}
                >
                  <Check size={14} /> Family Reassurance Sent
                </div>
                <div>Push & WhatsApp reassurance delivered to family circle.</div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="sim-button"
                  style={{ flex: 1, padding: '12px', justifyContent: 'center', fontSize: '13px' }}
                  onClick={() => (window.location.href = '/')}
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  className="sim-button secondary"
                  style={{ padding: '12px', fontSize: '13px' }}
                  onClick={simulateTestAlert}
                >
                  <RefreshCw size={14} /> Test Again
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="validator-empty">
              <ShieldCheck size={52} />
              <h1>No Active Alert</h1>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                {message || 'All residents are safe. Monitoring Living Room, Bedroom, Corridor, and Entry.'}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxWidth: '280px',
                  margin: '0 auto',
                }}
              >
                <button
                  className="sim-button"
                  style={{ justifyContent: 'center', padding: '12px 18px', fontSize: '13px' }}
                  onClick={simulateTestAlert}
                >
                  <Sparkles size={15} /> Simulate Distress Alert (Test)
                </button>
                <button
                  type="button"
                  className="sim-button secondary"
                  style={{ justifyContent: 'center', padding: '10px 18px', fontSize: '13px' }}
                  onClick={() => (window.location.href = '/')}
                >
                  Open Command Center
                </button>
              </div>
            </div>
          )
        ) : (
          /* Active Alert Fast Action Screen */
          <>
            {/* Header Tag with Dynamic Elapsed Timer */}
            <div className={`validator-alert-tag ${alert.scene === 'S4_CRITICAL' ? 'critical' : ''}`}>
              <BellRing size={16} /> {alert.scene === 'S4_CRITICAL' ? 'CRITICAL ALERT' : 'HELP'}
              <small>{elapsed}</small>
            </div>

            {/* Title & Location */}
            <h1 className="validator-title">{inProgress ? 'Care in Progress' : 'Possible distress detected'}</h1>
            <p className="validator-subtitle">
              {elderName} · {elderRoomName}
            </p>

            {/* Note from AI */}
            <div className="validator-ai-box">
              <div className="validator-ai-header">
                <Sparkles size={12} /> AI
              </div>
              <p>{aiNote}</p>
            </div>

            {/* Camera Snapshot Box with Biometric Bounding Box */}
            <div className="validator-camera-box">
              <div className="validator-camera-overlay">
                <span className="validator-camera-pill">
                  <Camera size={11} /> {elderRoomName} CAM
                </span>
                <span
                  className="validator-camera-pill"
                  style={{ color: '#86efac', borderColor: 'rgba(134, 239, 172, 0.3)' }}
                >
                  ● RECORDED
                </span>
              </div>

              {/* Room Snapshot or Live Camera Feed / Snapshot */}
              {activeScene?.snapshotUrl ? (
                <img
                  src={activeScene.snapshotUrl}
                  alt={elderRoomName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <svg
                  style={{ width: '100%', height: '100%' }}
                  viewBox="0 0 640 400"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <linearGradient id="val-cam-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#val-cam-bg)" />
                  <line x1="0" y1="280" x2="640" y2="280" stroke="#334155" strokeWidth="2" />
                  <line x1="120" y1="280" x2="0" y2="400" stroke="#1e293b" strokeWidth="2" />
                  <line x1="520" y1="280" x2="640" y2="400" stroke="#1e293b" strokeWidth="2" />
                  <rect x="80" y="220" width="160" height="70" rx="8" fill="#334155" opacity="0.6" />
                  <rect x="400" y="210" width="160" height="80" rx="8" fill="#334155" opacity="0.6" />
                  <circle cx="320" cy="180" r="28" fill="#64748b" opacity="0.85" />
                  <path d="M 280 280 C 280 220, 360 220, 360 280 Z" fill="#64748b" opacity="0.85" />
                </svg>
              )}

              {/* Biometric Bounding Box Overlay */}
              <div
                className="biometric-bounding-box distress"
                style={{ left: '38%', top: '28%', width: '24%', height: '44%' }}
              >
                <span className="bounding-box-tag">
                  <ShieldCheck size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {elderName} · {Math.round(alert.confidence * 100)}% Match
                </span>
              </div>
            </div>

            {/* Elder Resident Details & Avatar Bar */}
            <div className="validator-person-bar">
              <div className="validator-person-avatar">
                {elderAvatarUrl ? (
                  <img
                    src={elderAvatarUrl}
                    alt={elderName}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  elderName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="validator-person-details">
                <strong>{elderName}</strong>
                <small>Primary Care Target · Fall Risk Guard</small>
              </div>
              <span className={`validator-scene-badge ${alert.scene === 'S4_CRITICAL' ? 'critical' : 'help'}`}>
                {alert.scene === 'S4_CRITICAL' ? 'S4 · Critical' : 'S3 · Help'}
              </span>
            </div>

            {/* Trigger Time & Confidence Bar */}
            <div className="validator-meta">
              <span>
                <Clock3 size={14} /> Triggered at {triggerTime}
              </span>
              <strong>
                <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#16a34a' }} />{' '}
                {Math.round(alert.confidence * 100)}% confidence
              </strong>
            </div>

            {/* Fast Action Buttons - Lite & Large Icons on Top, Action Label Below */}
            {inProgress ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="validator-primary" onClick={() => act('I_HAVE_ARRIVED')}>
                  <span>
                    <CheckCircle2 size={20} /> I’VE ARRIVED
                  </span>
                  <small>Complete Hand-Off & Notify Family</small>
                </button>
                <button
                  type="button"
                  className="sim-button secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  onClick={() => act('OK')}
                >
                  Cancel / False Alarm
                </button>
              </div>
            ) : (
              <div className="validator-actions">
                <button className="ok" onClick={() => act('OK')} title="Confirm resident is safe">
                  <Check size={28} strokeWidth={2.4} />
                  <small>OK</small>
                </button>
                <button className="coming" onClick={() => act('COMING')} title="Caregiver en route (5m ETA)">
                  <Car size={28} strokeWidth={2} />
                  <small>COMING</small>
                </button>
                <button className="siren" onClick={() => act('SIREN')} title="Trigger emergency alarm">
                  <BellRing size={28} strokeWidth={2} />
                  <small>SIREN</small>
                </button>
              </div>
            )}

            <p className="validator-message">
              {inProgress
                ? 'Caregiver is en route to ' + elderRoomName + ' (ETA: 5m). Family notified.'
                : message || 'Choose an action to immediately notify the family and care team.'}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
