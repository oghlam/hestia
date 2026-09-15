import React from 'react'
import { AlertTriangle, Clock3, Eye, Radio, X } from 'lucide-react'
import type {
  AutomationRule,
  EscalationPolicy,
  Room,
  RuleCategory,
  SceneCode,
} from '../../domain/contracts'

export interface AutomationRuleModalProps {
  isOpen: boolean
  onClose: () => void
  editingRule: AutomationRule | null
  ruleFormData: {
    name: string
    description: string
    category: RuleCategory
    targetScene: SceneCode
    confidenceThreshold: number
    triggerZone: string
    allDay: boolean
    startHour: number
    endHour: number
    slaTimeoutMinutes: number
    escalationPolicy: EscalationPolicy
    reassurancePush: boolean
  }
  setRuleFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      description: string
      category: RuleCategory
      targetScene: SceneCode
      confidenceThreshold: number
      triggerZone: string
      allDay: boolean
      startHour: number
      endHour: number
      slaTimeoutMinutes: number
      escalationPolicy: EscalationPolicy
      reassurancePush: boolean
    }>
  >
  displayRooms: Room[]
  applyRulePreset: (category: RuleCategory) => void
  handleSaveRuleSubmit: (e: React.FormEvent) => Promise<void>
}

export const AutomationRuleModal: React.FC<AutomationRuleModalProps> = ({
  isOpen,
  onClose,
  editingRule,
  ruleFormData,
  setRuleFormData,
  displayRooms,
  applyRulePreset,
  handleSaveRuleSubmit,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingRule ? 'Edit Automation Rule' : 'Automation Rule Template Builder'}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveRuleSubmit}>
          <div className="modal-body">
            {!editingRule && (
              <div className="form-group">
                <label className="form-label">Quick Load Rule Template Preset</label>
                <div className="preset-chip-group">
                  <button
                    type="button"
                    className={`preset-chip ${ruleFormData.category === 'fall_detection' ? 'active' : ''}`}
                    onClick={() => applyRulePreset('fall_detection')}
                  >
                    <AlertTriangle size={12} /> Elder Fall Alert (S3)
                  </button>
                  <button
                    type="button"
                    className={`preset-chip ${ruleFormData.category === 'night_wandering' ? 'active' : ''}`}
                    onClick={() => applyRulePreset('night_wandering')}
                  >
                    <Clock3 size={12} /> Night Wandering (S3)
                  </button>
                  <button
                    type="button"
                    className={`preset-chip ${ruleFormData.category === 'visitor_doorbell' ? 'active' : ''}`}
                    onClick={() => applyRulePreset('visitor_doorbell')}
                  >
                    <Eye size={12} /> Visitor Filter (S2)
                  </button>
                  <button
                    type="button"
                    className={`preset-chip ${ruleFormData.category === 'hardware_health' ? 'active' : ''}`}
                    onClick={() => applyRulePreset('hardware_health')}
                  >
                    <Radio size={12} /> Camera Offline (S4)
                  </button>
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '14px' }}>
              <label className="form-label">Rule Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Elder Fall & Distress Guard"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief explanation of trigger logic"
                value={ruleFormData.description}
                onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rule Category</label>
                <select
                  className="form-select"
                  value={ruleFormData.category}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, category: e.target.value as RuleCategory })
                  }
                >
                  <option value="fall_detection">Fall Detection Guard</option>
                  <option value="night_wandering">Night Inactivity & Wandering</option>
                  <option value="visitor_doorbell">Visitor Doorbell Filter</option>
                  <option value="hardware_health">Hardware & Telemetry Guard</option>
                  <option value="inactivity_guard">Routine Mobility Check</option>
                  <option value="custom">Custom Automation Rule</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Scene Code</label>
                <select
                  className="form-select"
                  value={ruleFormData.targetScene}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, targetScene: e.target.value as SceneCode })
                  }
                >
                  <option value="S1_NORMAL">S1_NORMAL (Routine / Safe)</option>
                  <option value="S2_WATCH">S2_WATCH (Observation / Visitor)</option>
                  <option value="S3_HELP">S3_HELP (Caregiver Alert Needed)</option>
                  <option value="S4_CRITICAL">S4_CRITICAL (Emergency Escalation)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Trigger Room / Zone</label>
                <select
                  className="form-select"
                  value={ruleFormData.triggerZone}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, triggerZone: e.target.value })}
                >
                  <option value="all">All Rooms / Entire House</option>
                  {displayRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Confidence Threshold Gate: {Math.round(ruleFormData.confidenceThreshold * 100)}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  className="form-input"
                  value={Math.round(ruleFormData.confidenceThreshold * 100)}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      confidenceThreshold: Number(e.target.value) / 100,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SLA Auto-Escalation (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={ruleFormData.slaTimeoutMinutes}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, slaTimeoutMinutes: Number(e.target.value) })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Escalation Policy</label>
                <select
                  className="form-select"
                  value={ruleFormData.escalationPolicy}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      escalationPolicy: e.target.value as EscalationPolicy,
                    })
                  }
                >
                  <option value="notify_primary">Notify Primary Caregiver</option>
                  <option value="notify_all">Notify All Care Team Members</option>
                  <option value="trigger_siren">Trigger Emergency Siren</option>
                  <option value="call_emergency">Call Physician / EMS</option>
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
                  color: '#1e293b',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={ruleFormData.allDay}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, allDay: e.target.checked })}
                />
                Active 24/7 (Entire Day)
              </label>
            </div>

            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: '#1e293b',
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={ruleFormData.reassurancePush}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, reassurancePush: e.target.checked })
                  }
                />
                Send Family Reassurance Push when resolved
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button">
              {editingRule ? 'Update Rule' : 'Create Automation Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
