import React from 'react'
import {
  CheckCircle2,
  Clock3,
  Edit3,
  Phone,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react'
import type { AuditLogEntry, CareTeamMember } from '../domain/contracts'

export interface CareTeamViewProps {
  careTeam: CareTeamMember[]
  auditLogs: AuditLogEntry[]
  openAddMember: () => void
  handleSetPrimaryValidator: (memberId: string) => Promise<void>
  openEditMember: (member: CareTeamMember) => void
  handleDeleteMember: (memberId: string, name: string) => Promise<void>
}

export const CareTeamView: React.FC<CareTeamViewProps> = ({
  careTeam,
  auditLogs,
  openAddMember,
  handleSetPrimaryValidator,
  openEditMember,
  handleDeleteMember,
}) => {
  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Care Team & Validator Roster</h1>
          <p>Caregivers, family members, and medical personnel assigned to Greenwood Home</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="sim-button" onClick={openAddMember}>
            <UserPlus size={14} /> Add Care Member
          </button>
        </div>
      </div>

      {/* Care Team Member Cards Grid */}
      <div className="care-team-grid">
        {careTeam.map((member) => {
          const roleBadgeClass =
            member.role === 'professional_nurse'
              ? 'nurse'
              : member.role === 'physician'
              ? 'physician'
              : member.role === 'family_member'
              ? 'family'
              : 'primary'

          const roleLabel =
            member.role === 'primary_caregiver'
              ? 'Primary Caregiver'
              : member.role === 'professional_nurse'
              ? 'Professional Nurse'
              : member.role === 'physician'
              ? 'Physician'
              : member.role === 'family_member'
              ? 'Family Contact'
              : 'Emergency Contact'

          return (
            <div
              key={member.id}
              className={`care-member-card ${member.isPrimaryValidator ? 'is-primary' : ''}`}
            >
              <div className="care-member-header">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="care-member-avatar"
                  />
                ) : (
                  <div
                    className="care-member-avatar"
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{member.name}</strong>
                    {member.isPrimaryValidator && (
                      <span className="care-role-badge primary">
                        <ShieldCheck size={11} /> Primary Validator
                      </span>
                    )}
                  </div>
                  <small style={{ color: '#64748b', fontSize: '12px', display: 'block' }}>
                    {member.relation}
                  </small>
                </div>
              </div>

              {/* Contact & Dispatch Details */}
              <table className="table-responsive" style={{ margin: 0 }}>
                <tbody>
                  <tr>
                    <td>
                      <strong>Role / Category</strong>
                    </td>
                    <td>
                      <span className={`care-role-badge ${roleBadgeClass}`}>{roleLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Direct Phone</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#0369a1',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                      >
                        <Phone size={12} /> {member.phone}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Notification Channel</strong>
                    </td>
                    <td>
                      <span
                        className="badge normal"
                        style={{ fontSize: '11px', textTransform: 'capitalize' }}
                      >
                        {member.channel.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>SLA Response Target</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      >
                        <Clock3 size={12} style={{ color: '#005cf5' }} /> &lt; {member.slaMinutes}{' '}
                        minutes avg
                      </span>
                    </td>
                  </tr>
                  {member.shiftSchedule && (
                    <tr>
                      <td>
                        <strong>Availability / Shift</strong>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {member.shiftSchedule}
                      </td>
                    </tr>
                  )}
                  {member.notes && (
                    <tr>
                      <td colSpan={2} style={{ paddingTop: '8px' }}>
                        <div className="resident-notes-box">"{member.notes}"</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  marginTop: 'auto',
                }}
              >
                {!member.isPrimaryValidator ? (
                  <button
                    type="button"
                    className="sim-button secondary"
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                    onClick={() => handleSetPrimaryValidator(member.id)}
                  >
                    <CheckCircle2 size={12} /> Set as Primary Validator
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
                    <ShieldCheck size={14} /> Active Dispatch Target
                  </span>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-icon-action"
                    title="Edit Care Member"
                    onClick={() => openEditMember(member)}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-action danger"
                    title="Remove Care Member"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card-box">
        <h3>Validator Action Audit Log</h3>
        <table className="table-responsive">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Validator Actor</th>
              <th>Target ID</th>
              <th>Transition</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <tr key={log.logId}>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className="badge normal">{log.action}</span>
                  </td>
                  <td>{log.actorId}</td>
                  <td>{log.targetId}</td>
                  <td>
                    {log.previousState ? `${log.previousState} → ${log.newState}` : log.newState}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  No audit actions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
