import React from 'react'
import { Activity, HeartPulse, Phone, ShieldCheck, Stethoscope, User, UserCheck, UserPlus, X } from 'lucide-react'
import type { Resident } from '../../domain/contracts'

export interface ResidentModalProps {
  isOpen: boolean
  onClose: () => void
  editingResident: Resident | null
  residentFormData: {
    name: string
    age: number
    gender: 'female' | 'male' | 'other'
    primaryTarget: boolean
    healthConditions: string
    mobilityStatus: string
    notes: string
    emergencyName: string
    emergencyRelation: string
    emergencyPhone: string
    doctorName: string
    doctorClinic: string
    doctorPhone: string
    doctorSpecialty: string
  }
  setResidentFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      age: number
      gender: 'female' | 'male' | 'other'
      primaryTarget: boolean
      healthConditions: string
      mobilityStatus: string
      notes: string
      emergencyName: string
      emergencyRelation: string
      emergencyPhone: string
      doctorName: string
      doctorClinic: string
      doctorPhone: string
      doctorSpecialty: string
    }>
  >
  handleSaveResidentSubmit: (e: React.FormEvent) => Promise<void>
}

export const ResidentModal: React.FC<ResidentModalProps> = ({
  isOpen,
  onClose,
  editingResident,
  residentFormData,
  setResidentFormData,
  handleSaveResidentSubmit,
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div className="drawer-overlay-backdrop" onClick={onClose} />

      {/* Right Drawer Panel */}
      <aside className="resident-right-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box resident">
              {editingResident ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h3>{editingResident ? 'Edit Resident Profile' : 'Register New Resident'}</h3>
              <p className="drawer-subtitle">
                Elder Care Record & Ring Biometric Target Configuration
              </p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer" title="Close drawer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveResidentSubmit} className="resident-drawer-form">
          <div className="drawer-body resident-drawer-body">
            {/* Section 1: Basic Identity */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <User size={13} />
                <span>Personal Identity</span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Arthur Pendelton"
                    value={residentFormData.name}
                    onChange={(e) =>
                      setResidentFormData({ ...residentFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    min="50"
                    max="120"
                    value={residentFormData.age}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        age: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={residentFormData.gender}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        gender: e.target.value as 'female' | 'male' | 'other',
                      })
                    }
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="primary-target-checkbox-box">
                <label className="checkbox-label-custom">
                  <input
                    type="checkbox"
                    checked={residentFormData.primaryTarget}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        primaryTarget: e.target.checked,
                      })
                    }
                  />
                  <div className="checkbox-text-group">
                    <strong>
                      <ShieldCheck size={14} className="text-primary" /> Designate as Primary Care Target
                    </strong>
                    <small>
                      HESTIA will match Ring scene events against this resident's biometric face template.
                    </small>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Health Profile & Mobility */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <HeartPulse size={13} />
                <span>Health Profile & Mobility</span>
              </div>

              <div className="form-group">
                <label className="form-label">Health Conditions (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fall Risk, Hypertension, Mild Dementia"
                  value={residentFormData.healthConditions}
                  onChange={(e) =>
                    setResidentFormData({
                      ...residentFormData,
                      healthConditions: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobility & Assistance Level</label>
                <select
                  className="form-select"
                  value={residentFormData.mobilityStatus}
                  onChange={(e) =>
                    setResidentFormData({
                      ...residentFormData,
                      mobilityStatus: e.target.value,
                    })
                  }
                >
                  <option value="Fully independent">Fully independent</option>
                  <option value="Independent with walking cane">Independent with walking cane</option>
                  <option value="Walker / rollator assisted">Walker / rollator assisted</option>
                  <option value="Wheelchair assisted">Wheelchair assisted</option>
                  <option value="Bedbound / Constant caregiver support">
                    Bedbound / Constant caregiver support
                  </option>
                </select>
              </div>
            </div>

            {/* Section 3: Emergency Caregiver Contacts */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <UserCheck size={13} />
                <span>Emergency Caregiver & Family Contact</span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label className="form-label">Caregiver Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maria Vance"
                    value={residentFormData.emergencyName}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        emergencyName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Daughter"
                    value={residentFormData.emergencyRelation}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        emergencyRelation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number / WhatsApp</label>
                <div className="input-with-icon">
                  <Phone size={14} className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+1 (555) 234-5678"
                    value={residentFormData.emergencyPhone}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        emergencyPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Physician / Doctor */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <Stethoscope size={13} />
                <span>Primary Physician & Clinic</span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label className="form-label">Physician Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. Robert Chen, MD"
                    value={residentFormData.doctorName}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        doctorName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group" style={{ flex: 0.8 }}>
                  <label className="form-label">Clinic / Hospital</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. St. Jude Geriatric"
                    value={residentFormData.doctorClinic}
                    onChange={(e) =>
                      setResidentFormData({
                        ...residentFormData,
                        doctorClinic: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Care Notes & Preferences */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <Activity size={13} />
                <span>Care Notes & Preferences</span>
              </div>

              <div className="form-group">
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Scheduled morning routine at 08:30. Medication with breakfast."
                  value={residentFormData.notes}
                  onChange={(e) =>
                    setResidentFormData({ ...residentFormData, notes: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="resident-drawer-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button primary">
              {editingResident ? 'Update Care Profile' : 'Register Resident'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
