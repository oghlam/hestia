import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HeartPulse,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Volume2,
} from 'lucide-react'
import type { Alert, AlertState, SceneCode, ValidatorAction } from '../domain/contracts'
import type { DrawerEntity } from '../components/layout/ContextualDrawer'

export interface AlertsViewProps {
  alerts: Alert[]
  onAction: (alertId: string, action: ValidatorAction) => Promise<void>
  onTriggerSimulator: () => void
  onSelectAlertForDrawer: (entity: DrawerEntity) => void
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAction,
  onTriggerSimulator,
  onSelectAlertForDrawer,
}) => {
  const [filterState, setFilterState] = useState<string>('all')
  const [countdown, setCountdown] = useState(82)

  // Simulation countdown timer for pending validation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 90))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pendingAlerts = alerts.filter((a) => a.state === 'VALIDATION_PENDING' || a.state === 'DETECTED')
  const activeAlert = pendingAlerts[0] || null

  const filteredAlerts = alerts.filter((a) => {
    if (filterState === 'all') return true
    return a.state.toLowerCase() === filterState.toLowerCase()
  })

  return (
    <div className="page-view controller-theme">
      {/* View Header */}
      <div className="view-header">
        <div>
          <div className="flex-row items-center gap-2">
            <h1>Alert Triage & Care Validation</h1>
            {pendingAlerts.length > 0 ? (
              <span className="badge critical animate-pulse">{pendingAlerts.length} Action Required</span>
            ) : (
              <span className="badge normal">All Clear · 0 Pending</span>
            )}
          </div>
          <p>Caregiver state machine triage queue. AI classifies S1–S4 scenes; human caregiver confirms dispatch.</p>
        </div>
        <div className="flex-row gap-2">
          <button className="sim-button secondary" onClick={onTriggerSimulator}>
            <Play size={14} /> Open Simulator
          </button>
        </div>
      </div>

      {/* Hero Active Pending Alert Card (if any pending) */}
      {activeAlert ? (
        <div className="card-box alert-active-hero-box mb-4">
          <div className="hero-top-row">
            <div className="flex-row items-center gap-3">
              <div className="alert-hero-icon pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-18 font-bold m-0 text-amber-900">
                  {activeAlert.scene === 'S4_CRITICAL' ? 'S4 CRITICAL — Potential Fall Detected' : 'S3 HELP — Resident Assistance Needed'}
                </h2>
                <span className="text-13 text-amber-800">
                  Room: <strong>{activeAlert.roomId.replace('_', ' ').toUpperCase()}</strong> · AI Confidence: <strong>{Math.round(activeAlert.confidence * 100)}%</strong>
                </span>
              </div>
            </div>

            <div className="sla-timer-badge">
              <Clock size={16} />
              <span>SLA ESCALATION IN: <strong>{countdown}s</strong></span>
            </div>
          </div>

          <p className="hero-description text-13 text-slate-700 mt-3 mb-4">
            Amazon Nova Micro detected high-impact floor motion with inactivity exceeding standard threshold in {activeAlert.roomId.replace('_', ' ')}.
            Confirm care action or trigger siren if resident is unresponsive.
          </p>

          <div className="hero-actions-bar">
            <button
              className="sim-button secondary text-emerald-800"
              style={{ background: '#dcfce7', borderColor: '#bbf7d0' }}
              onClick={() => onAction(activeAlert.alertId, 'OK')}
            >
              <CheckCircle2 size={16} /> False Alarm (OK / Safe)
            </button>
            <button
              className="sim-button"
              style={{ background: '#0284c7' }}
              onClick={() => onAction(activeAlert.alertId, 'COMING')}
            >
              <UserCheck size={16} /> Dispatched (I'm Coming)
            </button>
            <button
              className="sim-button danger"
              onClick={() => onAction(activeAlert.alertId, 'SIREN')}
            >
              <Volume2 size={16} /> Escalate Ring Siren
            </button>
            <button
              className="sim-button secondary"
              style={{ background: '#f1f5f9' }}
              onClick={() => onAction(activeAlert.alertId, 'I_HAVE_ARRIVED')}
            >
              <ShieldCheck size={16} /> Handled (Arrived)
            </button>
          </div>
        </div>
      ) : (
        <div className="card-box all-clear-banner mb-4">
          <div className="flex-row items-center gap-3">
            <ShieldCheck size={28} className="text-emerald-600" />
            <div>
              <strong className="text-16 text-emerald-900 block">No Active Validation Pending</strong>
              <small className="text-slate-600">All rooms are in normal S1/S2 routine state. Ring motion sensors operational.</small>
            </div>
          </div>
        </div>
      )}

      {/* S1-S4 Classification Matrix Cards */}
      <div className="controller-kpi-grid">
        <div className="controller-kpi-card">
          <div className="kpi-label">S1 Normal</div>
          <div className="kpi-value text-emerald-700">Routine Safe</div>
          <div className="kpi-subtext">Known target resident detected</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">S2 Watch</div>
          <div className="kpi-value text-amber-700">Observation</div>
          <div className="kpi-subtext">Unrecognized guest / door ring</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">S3 Help</div>
          <div className="kpi-value text-rose-600">Assistance</div>
          <div className="kpi-subtext">Extended inactivity / night wander</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">S4 Critical</div>
          <div className="kpi-value text-red-600">Fall Emergency</div>
          <div className="kpi-subtext">High impact & zero motion</div>
        </div>
      </div>

      {/* Filter and State Audit Log */}
      <div className="controller-filter-bar mt-4">
        <div className="filter-chips">
          {['all', 'validation_pending', 'care_in_progress', 'resolved', 'handled', 'escalated'].map((st) => (
            <button
              key={st}
              className={`filter-chip ${filterState === st ? 'active' : ''}`}
              onClick={() => setFilterState(st)}
            >
              {st.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Audit Table */}
      <div className="card-box controller-table-box mt-3">
        <table className="controller-table">
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Scene Code</th>
              <th>Location</th>
              <th>Confidence</th>
              <th>State Machine</th>
              <th>Timestamp</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  No alerts matching filter.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((a) => (
                <tr
                  key={a.alertId}
                  className="interactive-row"
                  onClick={() => onSelectAlertForDrawer({ type: 'alert', data: a })}
                >
                  <td>
                    <code className="mac-code">#{a.alertId.slice(-8)}</code>
                  </td>
                  <td>
                    <span className={`badge ${a.scene === 'S4_CRITICAL' ? 'critical' : 'help'}`}>
                      {a.scene}
                    </span>
                  </td>
                  <td>
                    <strong>{a.roomId.replace('_', ' ').toUpperCase()}</strong>
                  </td>
                  <td>
                    <span>{Math.round(a.confidence * 100)}%</span>
                  </td>
                  <td>
                    <span className={`status-pill ${a.state === 'RESOLVED' || a.state === 'HANDLED' ? 'online' : 'critical'}`}>
                      <span className="dot" /> {a.state}
                    </span>
                  </td>
                  <td>
                    <span className="text-12 text-slate-500">{new Date(a.createdAt).toLocaleTimeString()}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    {a.state === 'VALIDATION_PENDING' && (
                      <div className="flex-row justify-end gap-1">
                        <button
                          className="sim-button secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => onAction(a.alertId, 'OK')}
                        >
                          OK
                        </button>
                        <button
                          className="sim-button"
                          style={{ padding: '4px 8px', fontSize: '11px', background: '#0284c7' }}
                          onClick={() => onAction(a.alertId, 'COMING')}
                        >
                          Coming
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
