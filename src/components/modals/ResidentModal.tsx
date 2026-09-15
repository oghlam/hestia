import React from 'react'
import { X } from 'lucide-react'
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingResident ? 'Edit Resident Care Profile' : 'Register New Resident'}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveResidentSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Arthur Pendelton"
                  value={residentFormData.name}
                  onChange={(e) => setResidentFormData({ ...residentFormData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  min="50"
                  max="120"
                  value={residentFormData.age}
                  onChange={(e) => setResidentFormData({ ...residentFormData, age: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
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
                  checked={residentFormData.primaryTarget}
                  onChange={(e) => setResidentFormData({ ...residentFormData, primaryTarget: e.target.checked })}
                />
                Designate as Primary Target (Triggers care monitoring and alerts)
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Health Conditions (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fall Risk, Hypertension, Mild Dementia"
                value={residentFormData.healthConditions}
                onChange={(e) => setResidentFormData({ ...residentFormData, healthConditions: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobility & Daily Assistance Level</label>
              <select
                className="form-select"
                value={residentFormData.mobilityStatus}
                onChange={(e) => setResidentFormData({ ...residentFormData, mobilityStatus: e.target.value })}
              >
                <option value="Fully independent">Fully independent</option>
                <option value="Independent with walking cane">Independent with walking cane</option>
                <option value="Walker / rollator assisted">Walker / rollator assisted</option>
                <option value="Wheelchair assisted">Wheelchair assisted</option>
                <option value="Bedbound / Constant caregiver support">Bedbound / Constant caregiver support</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Caregiver / Family Contact</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contact Name (e.g. Maria Vance)"
                  value={residentFormData.emergencyName}
                  onChange={(e) => setResidentFormData({ ...residentFormData, emergencyName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Caregiver Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 234-5678"
                  value={residentFormData.emergencyPhone}
                  onChange={(e) => setResidentFormData({ ...residentFormData, emergencyPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Primary Physician / Doctor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Dr. Robert Chen, MD"
                  value={residentFormData.doctorName}
                  onChange={(e) => setResidentFormData({ ...residentFormData, doctorName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic / Hospital</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="St. Jude Geriatric Care"
                  value={residentFormData.doctorClinic}
                  onChange={(e) => setResidentFormData({ ...residentFormData, doctorClinic: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Care Notes & Preferences</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="e.g. Scheduled morning routine at 08:30. Bedtime 21:30."
                value={residentFormData.notes}
                onChange={(e) => setResidentFormData({ ...residentFormData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button">
              {editingResident ? 'Update Profile' : 'Register Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
