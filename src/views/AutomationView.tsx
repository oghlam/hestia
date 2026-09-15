import React from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Compass,
  Edit3,
  Eye,
  Layers,
  Plus,
  Radio,
  RefreshCw,
  Shield,
  SlidersHorizontal,
  Trash2,
  Zap,
} from 'lucide-react'
import type { AutomationRule } from '../domain/contracts'

export interface AutomationViewProps {
  rulesSubTab: 'rules' | 'state_machine'
  setRulesSubTab: (tab: 'rules' | 'state_machine') => void
  rules: AutomationRule[]
  handleResetRules: () => void
  openAddRule: () => void
  handleToggleRule: (ruleId: string, currentEnabled: boolean) => void
  openEditRule: (rule: AutomationRule) => void
  handleDeleteRule: (ruleId: string, name: string) => Promise<void>
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  rulesSubTab,
  setRulesSubTab,
  rules,
  handleResetRules,
  openAddRule,
  handleToggleRule,
  openEditRule,
  handleDeleteRule,
}) => {
  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Scene Engine & Automation Rules</h1>
          <p>Deterministic rules, confidence gating thresholds, and alert state machine</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sim-button secondary" onClick={handleResetRules}>
            <RefreshCw size={13} /> Reset Presets
          </button>
          <button className="sim-button" onClick={openAddRule}>
            <Plus size={14} /> Create Custom Rule
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="view-subtabs">
        <button
          className={`subtab-btn ${rulesSubTab === 'rules' ? 'active' : ''}`}
          onClick={() => setRulesSubTab('rules')}
        >
          <SlidersHorizontal size={14} /> Active Automation Rules ({rules.length})
        </button>
        <button
          className={`subtab-btn ${rulesSubTab === 'state_machine' ? 'active' : ''}`}
          onClick={() => setRulesSubTab('state_machine')}
        >
          <Layers size={14} /> Deterministic Gates & State Machine
        </button>
      </div>

      {rulesSubTab === 'rules' ? (
        <div className="rules-cards-grid">
          {rules.map((rule) => {
            const categoryIcon =
              rule.category === 'fall_detection' ? (
                <AlertTriangle size={12} />
              ) : rule.category === 'night_wandering' ? (
                <Clock3 size={12} />
              ) : rule.category === 'visitor_doorbell' ? (
                <Eye size={12} />
              ) : rule.category === 'hardware_health' ? (
                <Radio size={12} />
              ) : (
                <Zap size={12} />
              )

            const categoryLabel =
              rule.category === 'fall_detection'
                ? 'Fall Detection'
                : rule.category === 'night_wandering'
                ? 'Night Wandering'
                : rule.category === 'visitor_doorbell'
                ? 'Visitor Filter'
                : rule.category === 'hardware_health'
                ? 'Hardware Guard'
                : 'Custom Rule'

            return (
              <div key={rule.id} className={`rule-card ${!rule.enabled ? 'disabled' : ''}`}>
                <div className="rule-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="rule-category-pill">
                      {categoryIcon} {categoryLabel}
                    </span>
                    <span
                      className={`badge ${
                        rule.targetScene === 'S1_NORMAL'
                          ? 'normal'
                          : rule.targetScene === 'S2_WATCH'
                          ? 'watch'
                          : 'critical'
                      }`}
                    >
                      {rule.targetScene}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle-switch-input"
                    checked={rule.enabled}
                    onChange={() => handleToggleRule(rule.id, rule.enabled)}
                    title={rule.enabled ? 'Disable Rule' : 'Enable Rule'}
                  />
                </div>

                <div>
                  <strong
                    style={{
                      fontSize: '15px',
                      color: '#0f172a',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {rule.name}
                  </strong>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                    {rule.description}
                  </p>
                </div>

                {/* Rule Trigger & SLA Parameters */}
                <div className="rule-param-pills">
                  <span className="rule-param-tag">
                    <CheckCircle2 size={11} style={{ color: '#16a34a' }} /> ≥{' '}
                    {Math.round(rule.confidenceThreshold * 100)}% Confidence
                  </span>
                  <span className="rule-param-tag">
                    <Compass size={11} /> Zone:{' '}
                    {rule.triggerZone === 'all' ? 'All Rooms' : rule.triggerZone.replace('_', ' ')}
                  </span>
                  <span className="rule-param-tag">
                    <Clock3 size={11} />{' '}
                    {rule.timeWindow.allDay
                      ? '24/7 Window'
                      : `${rule.timeWindow.startHour}:00 - ${rule.timeWindow.endHour}:00`}
                  </span>
                  <span className="rule-param-tag">
                    <Activity size={11} /> SLA: &lt; {rule.slaTimeoutMinutes}m Auto-Escalate
                  </span>
                  <span className="rule-param-tag">
                    <Shield size={11} /> Action: {rule.escalationPolicy.replace('_', ' ')}
                  </span>
                  {rule.reassurancePush && (
                    <span
                      className="rule-param-tag"
                      style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        borderColor: '#a7f3d0',
                      }}
                    >
                      <Bell size={11} /> Family Reassurance Push
                    </span>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '10px',
                    marginTop: 'auto',
                  }}
                >
                  <small
                    style={{
                      color: rule.enabled ? '#16a34a' : '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {rule.enabled ? '● Active Rule Guard' : '○ Disabled'}
                  </small>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-icon-action"
                      title="Edit Rule"
                      onClick={() => openEditRule(rule)}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-action danger"
                      title="Delete Rule"
                      onClick={() => handleDeleteRule(rule.id, rule.name)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="view-grid-2" style={{ marginBottom: '24px' }}>
          <div className="card-box">
            <h3>Scene Classification Gates</h3>
            <table className="table-responsive">
              <thead>
                <tr>
                  <th>Scene</th>
                  <th>Condition / Signal</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="badge normal">S1_NORMAL</span>
                  </td>
                  <td>Regular motion, known resident relaxing/routine</td>
                  <td>≥ 90% confidence</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge watch">S2_WATCH</span>
                  </td>
                  <td>Doorbell chime, unknown visitor, repeated motion</td>
                  <td>≥ 80% confidence</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge help">S3_HELP</span>
                  </td>
                  <td>Distress signal, fall probability, long inactivity</td>
                  <td>≥ 75% confidence</td>
                </tr>
                <tr>
                  <td>
                    <span className="badge critical">S4_CRITICAL</span>
                  </td>
                  <td>Distress + Device Offline + Active Target</td>
                  <td>Immediate Escalation</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card-box">
            <h3>Validator State Machine</h3>
            <table className="table-responsive">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Target State</th>
                  <th>Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>OK</strong>
                  </td>
                  <td>
                    <code>RESOLVED</code>
                  </td>
                  <td>Clears alert, sends family reassurance update</td>
                </tr>
                <tr>
                  <td>
                    <strong>COMING</strong>
                  </td>
                  <td>
                    <code>CARE_IN_PROGRESS</code>
                  </td>
                  <td>Sets caregiver ETA, notifies family en route</td>
                </tr>
                <tr>
                  <td>
                    <strong>SIREN</strong>
                  </td>
                  <td>
                    <code>ESCALATED</code>
                  </td>
                  <td>Emergency escalation & loud alert</td>
                </tr>
                <tr>
                  <td>
                    <strong>I_HAVE_ARRIVED</strong>
                  </td>
                  <td>
                    <code>HANDLED</code>
                  </td>
                  <td>Confirms on-site care delivered</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
