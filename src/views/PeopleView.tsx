import React from 'react'
import {
  Activity,
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  HeartPulse,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
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
          <div className="resident-cards-grid horizontal-layout">
            {residents.map((res) => {
              const frontTmpl = res.faceTemplates.find((t) => t.angle === 'front')
              const leftTmpl = res.faceTemplates.find((t) => t.angle === 'left')
              const rightTmpl = res.faceTemplates.find((t) => t.angle === 'right')
              const isMale = res.gender === 'male'
              const templateCount = res.faceTemplates.length

              return (
                <div
                  key={res.id}
                  className={`resident-card horizontal-card ${res.primaryTarget ? 'is-primary' : ''}`}
                >
                  {/* Left Column: Profile Info, Health, Contacts & Actions */}
                  <div className="resident-card-main-col">
                    <div className="resident-card-header">
                      {res.primaryAvatarAssetId ? (
                        // Display real photo avatar if set
                        <img
                          src={res.primaryAvatarAssetId}
                          alt={res.name}
                          className="resident-avatar"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
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
                    <div className="resident-section-block">
                      <small className="resident-section-label">HEALTH PROFILE & MOBILITY</small>
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

                  {/* Right Column: Multi-Angle Face Biometric Studio Card */}
                  <div className="resident-card-face-col">
                    <div className="resident-face-section horizontal">
                      <div className="face-section-header">
                        <div className="face-section-title-group">
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>
                            Multi-Angle Face Templates ({templateCount}/3)
                          </strong>
                          <span
                            className={`face-status-pill ${templateCount === 3 ? 'complete' : 'incomplete'}`}
                          >
                            {templateCount === 3 ? '3/3 Calibrated' : `${templateCount}/3 Incomplete`}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-icon-action primary face-studio-trigger"
                          onClick={() => openFaceStudio(res)}
                          title="Launch Multi-Angle Face Studio"
                        >
                          <Camera size={13} /> Studio
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
                              <Camera size={16} />
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
                              <Camera size={16} />
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
                              <Camera size={16} />
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

                      <div className="face-biometric-banner">
                        <Sparkles size={13} className="text-primary" />
                        <span>Ring Face Recognition active for scene context verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <>
          {/* Real-Time Visitor Log Summary Card */}
          <div className="visitor-logs-header-card">
            <div className="visitor-logs-info-group">
              <div className="visitor-logs-icon-box">
                <Radio size={16} className="text-primary pulse-icon" />
              </div>
              <div>
                <div className="visitor-logs-title-row">
                  <strong>Real-Time Visitor Log</strong>
                  <span className="live-tag-pill">
                    <span className="live-dot" /> LIVE
                  </span>
                </div>
                <p className="visitor-logs-subtitle">
                  Showing {accessLogs.length} recent doorbell & camera scene recognitions
                </p>
              </div>
            </div>
            <div className="visitor-logs-meta-badge">
              <span className="meta-pulse-dot" />
              <span>Updated continuous</span>
            </div>
          </div>

          {/* Clean Visitor Logs Table */}
          <div className="card-box controller-table-box visitor-table-wrapper">
            <table className="controller-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>ROOM / LOCATION</th>
                  <th>VISUAL IDENTIFICATION</th>
                  <th>CONFIDENCE</th>
                  <th>CLASSIFICATION</th>
                  <th>ACTION TAKEN</th>
                </tr>
              </thead>
              <tbody>
                {accessLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                      No visitor access events recorded yet.
                    </td>
                  </tr>
                ) : (
                  accessLogs.map((log) => {
                    const isKnown = log.identityType === 'known_target'
                    const confPct = Math.round((log.confidence || 0) * 100)
                    const confLevel =
                      (log.confidence || 0) > 0.85
                        ? 'high'
                        : (log.confidence || 0) > 0.6
                          ? 'medium'
                          : 'low'

                    return (
                      <tr key={log.accessId} className="interactive-row">
                        <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td>
                          <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                            {log.roomId
                              ? log.roomId
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              : 'Front Door'}
                          </strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`visitor-avatar-initial ${isKnown ? 'known' : 'unknown'}`}>
                              {isKnown ? (log.name || 'R').charAt(0) : '?'}
                            </div>
                            <div>
                              <strong
                                style={{
                                  fontSize: '13px',
                                  color: isKnown ? '#15803d' : '#1e293b',
                                }}
                              >
                                {log.name || 'Unrecognized Visitor'}
                              </strong>
                              <small
                                style={{
                                  display: 'block',
                                  fontSize: '10.5px',
                                  color: '#64748b',
                                }}
                              >
                                {isKnown
                                  ? 'Registered Resident Face Template'
                                  : 'Guest / Delivery / Unknown Person'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`confidence-pill ${confLevel}`}>{confPct}%</span>
                        </td>
                        <td>
                          <span className={`access-pill ${log.identityType}`}>
                            {log.identityType === 'known_target'
                              ? 'Target Elder'
                              : log.identityType === 'unknown'
                                ? 'Unknown Visitor'
                                : 'Not Detected'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`action-badge ${log.actionTaken === 'care_monitoring' ? 'monitoring' : 'logged'}`}
                          >
                            <ShieldCheck size={12} />
                            {log.actionTaken === 'care_monitoring'
                              ? 'Care Monitored'
                              : 'Logged Safe'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
