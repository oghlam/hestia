import React from 'react'
import {
  X,
  Wifi,
  Shield,
  Activity,
  User,
  Monitor,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap,
  Radio,
  Server,
  Cpu,
} from 'lucide-react'
import type {
  RingMasterDevice,
  Resident,
  Room,
  SceneEvent,
  Alert,
} from '../../domain/contracts'
import { sceneLabels } from '../../domain/mock-data'

export type DrawerEntity =
  | { type: 'device'; data: RingMasterDevice }
  | { type: 'node'; data: { id: string; label: string; nodeType: string; status: 'online' | 'warning' | 'critical' | 'offline'; latencyMs?: number; throughput?: string; details?: string } }
  | { type: 'resident'; data: Resident }
  | { type: 'room'; data: Room }
  | { type: 'event'; data: SceneEvent }
  | { type: 'alert'; data: Alert }

export interface ContextualDrawerProps {
  entity: DrawerEntity | null
  onClose: () => void
  onAction?: (actionName: string, entity: DrawerEntity) => void
}

export const ContextualDrawer: React.FC<ContextualDrawerProps> = ({
  entity,
  onClose,
  onAction,
}) => {
  if (!entity) return null

  const renderContent = () => {
    switch (entity.type) {
      case 'device': {
        const d = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box device">
                  <Monitor size={18} />
                </div>
                <div>
                  <h3>{d.vendor} {d.model}</h3>
                  <span className={`status-pill ${d.status}`}>
                    <span className="dot" /> {d.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose} title="Close drawer">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Summary Card */}
              <div className="drawer-section">
                <span className="section-label">Device Summary</span>
                <div className="drawer-grid-2">
                  <div className="drawer-info-tile">
                    <small>Series</small>
                    <strong>{d.series} Grade</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>MAC Address</small>
                    <code className="code-badge">{d.macAddress}</code>
                  </div>
                  <div className="drawer-info-tile">
                    <small>IP Address</small>
                    <strong>{d.ipAddress || '192.168.1.100'}</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>Firmware</small>
                    <strong>{d.firmwareVersion || 'v1.4.2-ring'}</strong>
                  </div>
                </div>
              </div>

              {/* Telemetry & Metrics */}
              <div className="drawer-section">
                <span className="section-label">Wireless & Health Telemetry</span>
                <div className="telemetry-box">
                  <div className="telemetry-row">
                    <div className="flex-row items-center gap-2">
                      <Wifi size={14} className="text-primary" />
                      <span>Wi-Fi Signal (RSSI)</span>
                    </div>
                    <strong className="text-emerald-700">{d.signalDbm || '-42 dBm (Excellent)'}</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: '85%' }} />
                  </div>

                  <div className="telemetry-row mt-3">
                    <div className="flex-row items-center gap-2">
                      <Zap size={14} className="text-amber-600" />
                      <span>Power / Battery Level</span>
                    </div>
                    <strong>100% (Hardwired / PoE)</strong>
                  </div>

                  <div className="telemetry-row mt-2">
                    <div className="flex-row items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      <span>Uptime</span>
                    </div>
                    <span>14 days, 6 hours</span>
                  </div>
                </div>
              </div>

              {/* Spatial Mapping */}
              <div className="drawer-section">
                <span className="section-label">Spatial Assignment</span>
                <div className="drawer-info-card">
                  <div>
                    <strong className="block text-14">{d.assignedRoomId ? d.assignedRoomId.replace('_', ' ').toUpperCase() : 'Unassigned'}</strong>
                    <small className="text-slate-500">Live Snapshot Feed & Motion Detection Active</small>
                  </div>
                </div>
              </div>

              {/* Fast Actions */}
              <div className="drawer-actions">
                <button
                  className="drawer-btn primary"
                  onClick={() => onAction && onAction('ping_device', entity)}
                >
                  <Activity size={14} /> Test Ping & Stream
                </button>
                <button
                  className="drawer-btn secondary"
                  onClick={() => onAction && onAction('reboot_device', entity)}
                >
                  <RefreshCw size={14} /> Soft Restart
                </button>
              </div>
            </div>
          </>
        )
      }

      case 'node': {
        const n = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box node">
                  <Server size={18} />
                </div>
                <div>
                  <h3>{n.label}</h3>
                  <span className={`status-pill ${n.status}`}>
                    <span className="dot" /> {n.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="section-label">Topology Node Info</span>
                <div className="drawer-grid-2">
                  <div className="drawer-info-tile">
                    <small>Node Tier</small>
                    <strong>{n.nodeType}</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>Latency</small>
                    <strong className="text-emerald-700">{n.latencyMs ? `${n.latencyMs} ms` : '< 12 ms'}</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>Throughput</small>
                    <strong>{n.throughput || '2.4 Mbps'}</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>Packet Loss</small>
                    <strong>0.00%</strong>
                  </div>
                </div>
              </div>

              {n.details && (
                <div className="drawer-section">
                  <span className="section-label">Node Description & Architecture</span>
                  <p className="drawer-text-muted">{n.details}</p>
                </div>
              )}

              <div className="drawer-section">
                <span className="section-label">Link Status</span>
                <div className="telemetry-box">
                  <div className="telemetry-row">
                    <span>Upstream Connection</span>
                    <span className="badge normal">CONNECTED</span>
                  </div>
                  <div className="telemetry-row mt-2">
                    <span>Downstream Routing</span>
                    <span className="badge normal">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }

      case 'resident': {
        const r = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box resident">
                  <User size={18} />
                </div>
                <div>
                  <h3>{r.name}</h3>
                  <span className="status-pill online">
                    <span className="dot" /> {r.age} Years · Resident Target
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="section-label">Health & Risk Profile</span>
                <div className="flex-row flex-wrap gap-2 mb-3">
                  {r.healthConditions.map((cond, idx) => (
                    <span key={idx} className="badge watch">
                      {cond}
                    </span>
                  ))}
                </div>
                <div className="drawer-info-tile">
                  <small>Mobility Status</small>
                  <strong>{r.mobilityStatus || 'Independent with cane assistance'}</strong>
                </div>
              </div>

              <div className="drawer-section">
                <span className="section-label">Face Recognition Studio</span>
                <div className="drawer-info-tile">
                  <small>Trained Face Angles</small>
                  <strong>{r.faceTemplates.length} Angles Registered (Front, Profile)</strong>
                </div>
                <small className="text-slate-500 mt-1 block">
                  Only verified resident embeddings trigger S1/S2 routine classification.
                </small>
              </div>

              <div className="drawer-section">
                <span className="section-label">Emergency Contacts</span>
                {r.emergencyContacts.map((c) => (
                  <div key={c.id} className="drawer-contact-row">
                    <div>
                      <strong>{c.name}</strong> ({c.relation})
                      <div className="text-slate-500 text-12">{c.phone}</div>
                    </div>
                    {c.isPrimary && <span className="badge info">Primary</span>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      }

      case 'alert': {
        const a = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box alert">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3>Alert #{a.alertId.slice(-6)}</h3>
                  <span className={`status-pill ${a.scene === 'S4_CRITICAL' ? 'critical' : 'help'}`}>
                    <span className="dot" /> {a.scene} · {a.state}
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="section-label">Scene & Room</span>
                <div className="drawer-grid-2">
                  <div className="drawer-info-tile">
                    <small>Room Location</small>
                    <strong>{a.roomId.replace('_', ' ').toUpperCase()}</strong>
                  </div>
                  <div className="drawer-info-tile">
                    <small>AI Confidence</small>
                    <strong>{Math.round(a.confidence * 100)}%</strong>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="section-label">State Machine Details</span>
                <div className="drawer-info-tile">
                  <small>Current State</small>
                  <strong className="text-amber-700">{a.state}</strong>
                </div>
                <div className="drawer-info-tile mt-2">
                  <small>Triggered At</small>
                  <span>{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="drawer-actions">
                <button
                  className="drawer-btn primary"
                  onClick={() => onAction && onAction('validate_coming', entity)}
                >
                  Dispatched (Coming)
                </button>
                <button
                  className="drawer-btn danger"
                  onClick={() => onAction && onAction('trigger_siren', entity)}
                >
                  <AlertOctagon size={14} /> Escalate Siren
                </button>
              </div>
            </div>
          </>
        )
      }

      case 'event': {
        const ev = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box event">
                  <FileText size={18} />
                </div>
                <div>
                  <h3>Event {ev.eventId.slice(-8)}</h3>
                  <span className="status-pill normal">
                    <span className="dot" /> {ev.scene}
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="section-label">Amazon Nova Micro Context</span>
                <p className="drawer-quote">{ev.contextText || 'No contextual summary available.'}</p>
              </div>

              <div className="drawer-section">
                <span className="section-label">Detected Signals</span>
                <div className="flex-row flex-wrap gap-2">
                  {ev.signals.map((sig, i) => (
                    <span key={i} className="badge info">{sig}</span>
                  ))}
                </div>
              </div>

              <div className="drawer-section">
                <span className="section-label">HMAC-SHA256 Integrity</span>
                <div className="telemetry-box">
                  <div className="flex-row items-center gap-2 text-emerald-700">
                    <CheckCircle2 size={16} />
                    <strong>Verified Ring Webhook Signature</strong>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      }

      case 'room': {
        const rm = entity.data
        return (
          <>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-icon-box room">
                  <Monitor size={18} />
                </div>
                <div>
                  <h3>{rm.name}</h3>
                  <span className="status-pill online">
                    <span className="dot" /> {rm.floor || 'Floor 1'}
                  </span>
                </div>
              </div>
              <button className="drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="section-label">Paired Ring Hardware</span>
                <div className="drawer-info-tile">
                  <small>Device Name</small>
                  <strong>{rm.deviceName || 'Ring Indoor Cam'}</strong>
                </div>
                <div className="drawer-info-tile mt-2">
                  <small>Device Type</small>
                  <strong>{rm.deviceType || 'Indoor Cam'}</strong>
                </div>
                <div className="drawer-info-tile mt-2">
                  <small>Wi-Fi Signal</small>
                  <strong className="text-emerald-700">{rm.signalDbm || 'Good · -52 dBm'}</strong>
                </div>
              </div>
            </div>
          </>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="contextual-drawer open">
      {renderContent()}
    </div>
  )
}
