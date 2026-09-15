import React from 'react'
import {
  Activity,
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  HeartPulse,
  Phone,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import type { AccessLogEntry, Resident } from '../domain/contracts'

export interface PeopleViewProps {
  peopleSubTab: 'profiles' | 'logs'
  setPeopleSubTab: (tab: 'profiles' | 'logs') => void
  openAddResident: () => void
  residents: Resident[]
  accessLogs: AccessLogEntry[]
  openFaceStudio: (res: Resident) => void
  handleSetPrimaryResident: (residentId: string) => Promise<void>
  openEditResident: (res: Resident) => void
  handleDeleteResident: (residentId: string) => Promise<void>
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  peopleSubTab,
  setPeopleSubTab,
  openAddResident,
  residents,
  accessLogs,
  openFaceStudio,
  handleSetPrimaryResident,
  openEditResident,
  handleDeleteResident,
}) => {
  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Resident Care Profiles & Face Registration</h1>
          <p>Manage elder health records, emergency contacts, and multi-angle Ring face templates</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sim-button" onClick={openAddResident}>
            <UserPlus size={14} /> Register Resident
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="view-subtabs">
        <button
          className={`subtab-btn ${peopleSubTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setPeopleSubTab('profiles')}
        >
          <Users size={14} /> Resident Care Profiles ({residents.length})
        </button>
        <button
          className={`subtab-btn ${peopleSubTab === 'logs' ? 'active' : ''}`}
          onClick={() => setPeopleSubTab('logs')}
        >
          <Eye size={14} /> Visitor Access Logs ({accessLogs.length})
        </button>
      </div>

      {peopleSubTab === 'profiles' ? (
        <>
          <div className="resident-cards-grid">
            {residents.map((res) => {
              const frontTmpl = res.faceTemplates.find((t) => t.angle === 'front')
              const leftTmpl = res.faceTemplates.find((t) => t.angle === 'left')
              const rightTmpl = res.faceTemplates.find((t) => t.angle === 'right')
              const isMale = res.gender === 'male'

              return (
                <div
                  key={res.id}
                  className={`resident-card ${res.primaryTarget ? 'is-primary' : ''}`}
                >
                  <div className="resident-card-header">
                    {res.primaryAvatarAssetId ? (
                      // Display real photo avatar if set
                      <img
                        src={res.primaryAvatarAssetId}
                        alt={res.name}
                        className="resident-avatar"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          // Fallback to face template if asset image fails
                          if (frontTmpl?.previewUrl) {
                            ;(e.target as HTMLImageElement).src = frontTmpl.previewUrl
                          }
                        }}
                      />
                    ) : frontTmpl?.previewUrl ? (
                      <img
                        src={frontTmpl.previewUrl}
                        alt={res.name}
                        className="resident-avatar"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={`resident-avatar ${isMale ? 'male' : ''}`}>
                        {res.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="resident-info">
                      <div className="resident-name-row">
                        <strong>{res.name}</strong>
                        {res.primaryTarget && (
                          <span className="primary-tag-badge">
                            <ShieldCheck size={11} /> Primary Target
                          </span>
                        )}
                      </div>
                      <small style={{ color: '#64748b', fontSize: '12px' }}>
                        Age {res.age} ·{' '}
                        {res.gender
                          ? res.gender.charAt(0).toUpperCase() + res.gender.slice(1)
                          : 'Resident'}{' '}
                        · ID: {res.id}
                      </small>
                    </div>
                  </div>

                  {/* Health Conditions */}
                  <div>
                    <small
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      HEALTH PROFILE & MOBILITY
                    </small>
                    <div className="health-tags-group">
                      {res.healthConditions.map((cond, idx) => (
                        <span key={idx} className="health-pill">
                          <HeartPulse size={11} /> {cond}
                        </span>
                      ))}
                      {res.mobilityStatus && (
                        <span className="health-pill mobility">
                          <Activity size={11} /> {res.mobilityStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Emergency Caregiver & Physician Contacts */}
                  <div className="resident-contacts-box">
                    {res.emergencyContacts[0] && (
                      <div className="resident-contact-item">
                        <div className="contact-title-row">
                          <span className="contact-icon human">
                            <UserCheck size={13} />
                          </span>
                          <div>
                            <strong>Caregiver: {res.emergencyContacts[0].name}</strong>
                            <small className="contact-role">
                              ({res.emergencyContacts[0].relation})
                            </small>
                          </div>
                        </div>
                        {res.emergencyContacts[0].phone && (
                          <div className="contact-phone-row">
                            <Phone size={12} />
                            <span>{res.emergencyContacts[0].phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {res.doctorContact && (
                      <div className="resident-contact-item">
                        <div className="contact-title-row">
                          <span className="contact-icon stethoscope">
                            <Stethoscope size={13} />
                          </span>
                          <div>
                            <strong>Physician: {res.doctorContact.name}</strong>
                            <small className="contact-role">({res.doctorContact.clinic})</small>
                          </div>
                        </div>
                        {res.doctorContact.phone && (
                          <div className="contact-phone-row">
                            <Phone size={12} />
                            <span>{res.doctorContact.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {res.notes && <div className="resident-notes-box">"{res.notes}"</div>}
                  </div>

                  {/* Multi-Angle Face Recognition Templates */}
                  <div className="resident-face-section">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <strong style={{ fontSize: '12px', color: '#1e293b' }}>
                        Multi-Angle Face Templates ({res.faceTemplates.length}/3)
                      </strong>
                      <button
                        type="button"
                        className="btn-icon-action primary"
                        style={{
                          width: 'auto',
                          height: 'auto',
                          padding: '3px 8px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          gap: '4px',
                        }}
                        onClick={() => openFaceStudio(res)}
                      >
                        <Camera size={12} /> Studio
                      </button>
                    </div>

                    <div className="face-angle-slots-row">
                      <div className={`face-angle-slot ${frontTmpl ? 'registered' : ''}`}>
                        {frontTmpl?.previewUrl ? (
                          <img
                            src={frontTmpl.previewUrl}
                            alt="Front Angle"
                            className="face-angle-thumb"
                          />
                        ) : (
                          <div className="face-angle-thumb-placeholder">
                            <Camera size={18} />
                          </div>
                        )}
                        <strong>Front (0°)</strong>
                        <span>
                          {frontTmpl
                            ? `${Math.round(frontTmpl.qualityScore * 100)}% Match`
                            : 'Unregistered'}
                        </span>
                      </div>

                      <div className={`face-angle-slot ${leftTmpl ? 'registered' : ''}`}>
                        {leftTmpl?.previewUrl ? (
                          <img
                            src={leftTmpl.previewUrl}
                            alt="Left Angle"
                            className="face-angle-thumb"
                          />
                        ) : (
                          <div className="face-angle-thumb-placeholder">
                            <Camera size={18} />
                          </div>
                        )}
                        <strong>Left (45°)</strong>
                        <span>
                          {leftTmpl
                            ? `${Math.round(leftTmpl.qualityScore * 100)}% Match`
                            : 'Unregistered'}
                        </span>
                      </div>

                      <div className={`face-angle-slot ${rightTmpl ? 'registered' : ''}`}>
                        {rightTmpl?.previewUrl ? (
                          <img
                            src={rightTmpl.previewUrl}
                            alt="Right Angle"
                            className="face-angle-thumb"
                          />
                        ) : (
                          <div className="face-angle-thumb-placeholder">
                            <Camera size={18} />
                          </div>
                        )}
                        <strong>Right (45°)</strong>
                        <span>
                          {rightTmpl
                            ? `${Math.round(rightTmpl.qualityScore * 100)}% Match`
                            : 'Unregistered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="resident-card-footer">
                    {!res.primaryTarget ? (
                      <button
                        type="button"
                        className="sim-button secondary"
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                        onClick={() => handleSetPrimaryResident(res.id)}
                      >
                        <CheckCircle2 size={12} /> Set as Primary Target
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#16a34a',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={14} /> Active Trigger Target
                      </span>
                    )}

                    <div className="resident-actions-group">
                      <button
                        type="button"
                        className="btn-icon-action"
                        title="Edit Resident Profile"
                        onClick={() => openEditResident(res)}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-action danger"
                        title="Delete Resident Profile"
                        onClick={() => handleDeleteResident(res.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <div className="view-grid-2" style={{ marginBottom: '24px' }}>
            <div className="card-box">
              <h3>Identity Boundary Policy</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                HESTIA adheres strictly to elder-care privacy boundaries:
              </p>
              <ul
                style={{
                  fontSize: '13px',
                  color: '#475569',
                  paddingLeft: '20px',
                  lineHeight: 1.7,
                }}
              >
                <li>
                  <strong>Target Care:</strong> Only registered resident (Eleanor) triggers care
                  routines and escalation paths.
                </li>
                <li>
                  <strong>Visitor Protection:</strong> Unknown visitors are cataloged in the
                  Access Log but <em>never</em> trigger sirens by identity alone.
                </li>
                <li>
                  <strong>Zero Cloud Face Leaks:</strong> Amazon Nova Micro receives structured text
                  summaries only. Face matching is processed locally.
                </li>
              </ul>
            </div>

            <div className="card-box">
              <h3>Face Match Verification Engine</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                Local vision model runs normalized 64-dimensional feature extraction with cosine
                similarity matching threshold (0.75).
              </p>
              <table className="table-responsive" style={{ marginTop: '10px' }}>
                <tbody>
                  <tr>
                    <td>
                      <strong>Cosine Threshold:</strong>
                    </td>
                    <td>
                      <span className="badge normal">≥ 75% for known_target</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Multi-Angle Support:</strong>
                    </td>
                    <td>Front (0°), Left (45°), Right (45°)</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Privacy Mode:</strong>
                    </td>
                    <td>Zero snapshot images stored in cloud text prompts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-box">
            <h3>Recent Identity & Access Logs</h3>
            <table className="table-responsive">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Room</th>
                  <th>Identity Type</th>
                  <th>Subject Name</th>
                  <th>Confidence</th>
                  <th>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.length > 0 ? (
                  accessLogs.slice(0, 10).map((log) => (
                    <tr key={log.accessId}>
                      <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td>{log.roomId.replace('_', ' ')}</td>
                      <td>
                        <span
                          className={`badge ${
                            log.identityType === 'known_target' ? 'normal' : 'watch'
                          }`}
                        >
                          {log.identityType}
                        </span>
                      </td>
                      <td>{log.name ?? 'Unknown visitor'}</td>
                      <td>{log.confidence ? `${Math.round(log.confidence * 100)}%` : 'N/A'}</td>
                      <td>{log.actionTaken}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                      No access logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
