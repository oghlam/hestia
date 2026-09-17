import React from 'react'
import {
  Activity,
  Bell,
  Clock3,
  Compass,
  Layers,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Zap,
  X,
} from 'lucide-react'
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

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as RuleCategory
    if (val) {
      applyRulePreset(val)
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div className="drawer-overlay-backdrop" onClick={onClose} />

      {/* Right Drawer Panel */}
      <aside className="resident-right-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-box" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}>
              {editingRule ? <SlidersHorizontal size={18} /> : <Zap size={18} />}
            </div>
            <div>
              <h3>{editingRule ? 'Edit Automation Rule' : 'New Automation Rule'}</h3>
              <p className="drawer-subtitle">
                Ring Scene Classification & Auto-Escalation SLA Policy
              </p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer" title="Close drawer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveRuleSubmit} className="resident-drawer-form">
          <div className="drawer-body resident-drawer-body">
            {/* Quick Load Pulldown Preset */}
            {!editingRule && (
              <div className="drawer-form-section" style={{ background: '#faf5ff', borderColor: '#e9d5ff' }}>
                <div className="section-title-sm" style={{ color: '#6b21a8', borderBottomColor: '#f3e8ff' }}>
                  <Sparkles size={13} style={{ color: '#7c3aed' }} />
                  <span>Quick Load Rule Template Preset</span>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <select
                    className="form-select"
                    defaultValue=""
                    onChange={handlePresetSelect}
                    style={{ background: '#ffffff', borderColor: '#d8b4fe', fontWeight: 500 }}
                  >
                    <option value="" disabled>
                      -- Pulldown to apply a pre-configured template --
                    </option>
                    <option value="fall_detection">Elder Fall & Distress Alert (S3 Critical · 3m SLA)</option>
                    <option value="night_wandering">Night Wandering & Inactivity Guard (S3 · 5m SLA)</option>
                    <option value="visitor_doorbell">Unrecognized Visitor Doorbell Filter (S2 Watch)</option>
                    <option value="hardware_health">Camera Offline & Telemetry Guard (S4 Emergency)</option>
                    <option value="inactivity_guard">Routine Mobility Check (S1 Normal)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Section 1: Rule Identity & Description */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <SlidersHorizontal size={13} />
                <span>Rule Identity & Logic</span>
              </div>

              <div className="form-group">
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
                  placeholder="Brief explanation of scene context logic"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
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
                <div className="form-group" style={{ flex: 1 }}>
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
            </div>

            {/* Section 2: Trigger Scope & Confidence Gating */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <Compass size={13} />
                <span>Scope & AI Confidence Gate</span>
              </div>

              <div className="form-group">
                <label className="form-label">Trigger Room / Zone</label>
                <select
                  className="form-select"
                  value={ruleFormData.triggerZone}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, triggerZone: e.target.value })}
                >
                  <option value="all">All Rooms (Whole Residence)</option>
                  {displayRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>AI Confidence Threshold</label>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0284c7' }}>
                    ≥ {Math.round(ruleFormData.confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  className="form-input"
                  style={{ padding: '4px 0', accentColor: '#005cf5' }}
                  value={Math.round(ruleFormData.confidenceThreshold * 100)}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      confidenceThreshold: Number(e.target.value) / 100,
                    })
                  }
                />
                <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Events below this confidence score will be filtered out to prevent false alarms.
                </small>
              </div>
            </div>

            {/* Section 3: SLA Timeout & Escalation Action */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <Activity size={13} />
                <span>SLA Policy & Action</span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">SLA Timeout (Minutes)</label>
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
                <div className="form-group" style={{ flex: 1.2 }}>
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
            </div>

            {/* Section 4: Time Window & Family Reassurance */}
            <div className="drawer-form-section">
              <div className="section-title-sm">
                <Clock3 size={13} />
                <span>Operating Schedule & Family Reassurance</span>
              </div>

              <div className="primary-target-checkbox-box">
                <label className="checkbox-label-custom">
                  <input
                    type="checkbox"
                    checked={ruleFormData.allDay}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, allDay: e.target.checked })}
                  />
                  <div className="checkbox-text-group">
                    <strong>
                      <Clock3 size={13} className="text-primary" /> Active 24/7 (Entire Day)
                    </strong>
                    <small>
                      {ruleFormData.allDay
                        ? 'Rule continuously monitors activity around the clock.'
                        : 'Custom operational hours enabled.'}
                    </small>
                  </div>
                </label>
              </div>

              {!ruleFormData.allDay && (
                <div className="form-row" style={{ marginTop: '8px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Start Hour (0-23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      className="form-input"
                      value={ruleFormData.startHour}
                      onChange={(e) =>
                        setRuleFormData({ ...ruleFormData, startHour: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">End Hour (0-23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      className="form-input"
                      value={ruleFormData.endHour}
                      onChange={(e) =>
                        setRuleFormData({ ...ruleFormData, endHour: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="primary-target-checkbox-box" style={{ marginTop: '8px' }}>
                <label className="checkbox-label-custom">
                  <input
                    type="checkbox"
                    checked={ruleFormData.reassurancePush}
                    onChange={(e) =>
                      setRuleFormData({ ...ruleFormData, reassurancePush: e.target.checked })
                    }
                  />
                  <div className="checkbox-text-group">
                    <strong>
                      <Bell size={13} style={{ color: '#059669' }} /> Send Family Reassurance Push
                    </strong>
                    <small>
                      Dispatches reassuring confirmation notifications to family members upon caregiver validation.
                    </small>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="resident-drawer-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button primary">
              {editingRule ? 'Update Rule Policy' : 'Create Automation Rule'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
