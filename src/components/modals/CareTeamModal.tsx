import React from 'react'
import { Camera, Trash2, Upload, X } from 'lucide-react'
import type {
  CareTeamMember,
  CareTeamMemberRole,
  NotificationChannel,
} from '../../domain/contracts'

export interface CareTeamModalProps {
  isOpen: boolean
  onClose: () => void
  editingMember: CareTeamMember | null
  memberFormData: {
    name: string
    role: CareTeamMemberRole
    relation: string
    phone: string
    email: string
    channel: NotificationChannel
    slaMinutes: number
    isPrimaryValidator: boolean
    avatarUrl: string
    shiftSchedule: string
    notes: string
  }
  setMemberFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      role: CareTeamMemberRole
      relation: string
      phone: string
      email: string
      channel: NotificationChannel
      slaMinutes: number
      isPrimaryValidator: boolean
      avatarUrl: string
      shiftSchedule: string
      notes: string
    }>
  >
  handleSaveMemberSubmit: (e: React.FormEvent) => Promise<void>
  handleCareMemberPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCareMemberPhotoCapture: () => Promise<void>
  isLocalCameraRunning: boolean
}

export const CareTeamModal: React.FC<CareTeamModalProps> = ({
  isOpen,
  onClose,
  editingMember,
  memberFormData,
  setMemberFormData,
  handleSaveMemberSubmit,
  handleCareMemberPhotoUpload,
  handleCareMemberPhotoCapture,
  isLocalCameraRunning,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingMember ? 'Edit Care Team Member' : 'Add Care Team Member & Validator'}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveMemberSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Caregiver, Nurse Sarah, Dr. Robert"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Category</label>
                <select
                  className="form-select"
                  value={memberFormData.role}
                  onChange={(e) =>
                    setMemberFormData({
                      ...memberFormData,
                      role: e.target.value as CareTeamMemberRole,
                    })
                  }
                >
                  <option value="primary_caregiver">Primary Caregiver</option>
                  <option value="professional_nurse">Professional Nurse (RN)</option>
                  <option value="family_member">Family Member</option>
                  <option value="physician">Physician / Doctor</option>
                  <option value="neighbor_emergency">Neighbor / On-Call</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
              >
                <input
                  type="checkbox"
                  checked={memberFormData.isPrimaryValidator}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, isPrimaryValidator: e.target.checked })
                  }
                />
                Designate as Primary Fast-Action Validator (Receives S3/S4 push first)
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Relationship / Title with Target *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Daughter / Primary Validator, Registered Home Nurse"
                  value={memberFormData.relation}
                  onChange={(e) => setMemberFormData({ ...memberFormData, relation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="+1 (555) 234-5678"
                  value={memberFormData.phone}
                  onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Notification & Dispatch Channel</label>
                <select
                  className="form-select"
                  value={memberFormData.channel}
                  onChange={(e) =>
                    setMemberFormData({
                      ...memberFormData,
                      channel: e.target.value as NotificationChannel,
                    })
                  }
                >
                  <option value="push_sms">Push Notification + SMS</option>
                  <option value="whatsapp">WhatsApp Alert</option>
                  <option value="phone_call">Automated Phone Call</option>
                  <option value="push_only">Push App Only</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target SLA Response (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={memberFormData.slaMinutes}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, slaMinutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Shift Schedule / Availability</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 24/7 Primary Response, Weekdays 08:00 - 16:00"
                  value={memberFormData.shiftSchedule}
                  onChange={(e) => setMemberFormData({ ...memberFormData, shiftSchedule: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Caregiver.vance@example.com"
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Member Photo Avatar Setup & Device Capture */}
            <div className="form-group">
              <label className="form-label">Member Photo / Face Avatar</label>
              <div className="modal-avatar-upload-box">
                {memberFormData.avatarUrl ? (
                  <img
                    src={memberFormData.avatarUrl}
                    alt="Avatar Preview"
                    className="modal-avatar-preview"
                  />
                ) : (
                  <div className="modal-avatar-placeholder">
                    {memberFormData.name ? memberFormData.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label
                      className="sim-button secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', margin: 0 }}
                    >
                      <Upload size={13} /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCareMemberPhotoUpload}
                      />
                    </label>

                    <button
                      type="button"
                      className="sim-button"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={handleCareMemberPhotoCapture}
                    >
                      <Camera size={13} />{' '}
                      {isLocalCameraRunning ? 'Capture from Active Camera' : 'Snap with Camera'}
                    </button>

                    {memberFormData.avatarUrl && (
                      <button
                        type="button"
                        className="btn-icon-action danger"
                        title="Reset Photo"
                        onClick={() => setMemberFormData({ ...memberFormData, avatarUrl: '' })}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    className="form-input"
                    style={{ fontSize: '11px', padding: '6px 10px' }}
                    placeholder="Or enter Image URL (e.g. https://.../photo.jpg)"
                    value={memberFormData.avatarUrl}
                    onChange={(e) => setMemberFormData({ ...memberFormData, avatarUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Care Notes & Handle Authorization</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. Holds spare key. Authorized to make medical validation decisions."
                value={memberFormData.notes}
                onChange={(e) => setMemberFormData({ ...memberFormData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button">
              {editingMember ? 'Update Care Member' : 'Add Care Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
