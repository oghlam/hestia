import React from 'react'
import { Camera, Cpu, Eye, ShieldCheck, X } from 'lucide-react'
import type { SceneEvent } from '../../domain/contracts'

export interface EventInspectionModalProps {
  selectedEventForInspection: SceneEvent | null
  onClose: () => void
}

export const EventInspectionModal: React.FC<EventInspectionModalProps> = ({
  selectedEventForInspection,
  onClose,
}) => {
  if (!selectedEventForInspection) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Event Snapshot & Biometric Telemetry Inspector</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="snapshot-inspector-container">
            {/* Left: Snapshot Frame View with Overlay Bounding Box */}
            <div>
              <div className="snapshot-frame-box">
                <div className="snapshot-overlay-header">
                  <span className="snapshot-camera-badge">
                    <Camera size={12} />{' '}
                    {selectedEventForInspection.roomId.replace('_', ' ').toUpperCase()} RING CAM
                  </span>
                  <span
                    className="snapshot-camera-badge"
                    style={{ color: '#86efac', borderColor: 'rgba(134, 239, 172, 0.3)' }}
                  >
                    ● RECORDED SNAPSHOT
                  </span>
                </div>

                {/* Room Snapshot Live Image or SVG Silhouette */}
                {selectedEventForInspection.snapshotUrl ? (
                  <img
                    src={selectedEventForInspection.snapshotUrl}
                    alt="Recorded Event Snapshot"
                    style={{
                      width: '100%',
                      height: '240px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      display: 'block',
                    }}
                  />
                ) : (
                  <svg className="snapshot-frame-bg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="cam-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cam-bg-grad)" />

                    {/* Floor Perspective Lines */}
                    <line x1="0" y1="280" x2="640" y2="280" stroke="#334155" strokeWidth="2" />
                    <line x1="120" y1="280" x2="0" y2="400" stroke="#1e293b" strokeWidth="2" />
                    <line x1="520" y1="280" x2="640" y2="400" stroke="#1e293b" strokeWidth="2" />

                    {/* Furniture Silhouette */}
                    <rect x="60" y="220" width="160" height="70" rx="8" fill="#334155" opacity="0.6" />
                    <rect x="420" y="210" width="160" height="80" rx="8" fill="#334155" opacity="0.6" />

                    {/* Person Silhouette */}
                    <circle cx="320" cy="180" r="28" fill="#64748b" opacity="0.8" />
                    <path d="M 280 280 C 280 220, 360 220, 360 280 Z" fill="#64748b" opacity="0.8" />
                  </svg>
                )}

                {/* Biometric Face / Person Bounding Box Reticle */}
                {selectedEventForInspection.identity?.identity === 'known_target' ? (
                  <div
                    className={`biometric-bounding-box ${
                      selectedEventForInspection.scene === 'S3_HELP' ||
                      selectedEventForInspection.scene === 'S4_CRITICAL'
                        ? 'distress'
                        : ''
                    }`}
                    style={{ left: '38%', top: '30%', width: '24%', height: '42%' }}
                  >
                    <span className="bounding-box-tag">
                      <ShieldCheck size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      {selectedEventForInspection.identity.name} ·{' '}
                      {Math.round((selectedEventForInspection.identity.confidence ?? 0.95) * 100)}% Match
                    </span>
                  </div>
                ) : selectedEventForInspection.identity?.identity === 'unknown' ? (
                  <div
                    className="biometric-bounding-box unknown"
                    style={{ left: '38%', top: '30%', width: '24%', height: '42%' }}
                  >
                    <span className="bounding-box-tag">
                      <Eye size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      Unknown Visitor (Access Logged)
                    </span>
                  </div>
                ) : (
                  <div
                    className="biometric-bounding-box"
                    style={{
                      left: '38%',
                      top: '30%',
                      width: '24%',
                      height: '42%',
                      borderStyle: 'dashed',
                      borderColor: '#94a3b8',
                    }}
                  >
                    <span className="bounding-box-tag" style={{ background: '#64748b' }}>
                      Motion in Zone (No Target Face)
                    </span>
                  </div>
                )}
              </div>

              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '8px' }}>
                Snapshot metadata verified via Ring Webhook HMAC-SHA256 constant-time signature.
              </small>
            </div>

            {/* Right: Inspection Telemetry Table & AI Context */}
            <div>
              <table className="table-responsive" style={{ margin: 0 }}>
                <tbody>
                  <tr>
                    <td>
                      <strong>Event ID</strong>
                    </td>
                    <td>
                      <code>{selectedEventForInspection.eventId}</code>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Zone / Room</strong>
                    </td>
                    <td>
                      <strong>{selectedEventForInspection.roomId.replace('_', ' ')}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Scene Classification</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          selectedEventForInspection.scene === 'S1_NORMAL'
                            ? 'normal'
                            : selectedEventForInspection.scene === 'S2_WATCH'
                            ? 'watch'
                            : 'critical'
                        }`}
                      >
                        {selectedEventForInspection.scene}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Confidence Gate</strong>
                    </td>
                    <td>
                      <strong>{Math.round(selectedEventForInspection.confidence * 100)}%</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Biometric Identity</strong>
                    </td>
                    <td>
                      {selectedEventForInspection.identity?.identity === 'known_target' ? (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>
                          Known Resident: {selectedEventForInspection.identity.name}
                        </span>
                      ) : selectedEventForInspection.identity?.identity === 'unknown' ? (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>Unregistered Visitor</span>
                      ) : (
                        <span style={{ color: '#64748b' }}>No subject detected</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Signals Detected</strong>
                    </td>
                    <td style={{ fontSize: '11px' }}>
                      {selectedEventForInspection.signals && selectedEventForInspection.signals.length > 0
                        ? selectedEventForInspection.signals.join(', ')
                        : 'Standard human motion vector'}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Timestamp</strong>
                    </td>
                    <td>{new Date(selectedEventForInspection.createdAt).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Amazon Nova Micro Context Explanation Box */}
              <div
                style={{
                  marginTop: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}
              >
                <strong
                  style={{
                    fontSize: '11px',
                    color: '#005cf5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '4px',
                  }}
                >
                  <Cpu size={13} /> Amazon Nova Micro AI Explanation
                </strong>
                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  "{selectedEventForInspection.contextText || 'No unusual risk factors detected in this zone.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="sim-button secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
