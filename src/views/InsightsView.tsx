import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Moon,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Zap,
} from 'lucide-react'
import type { Resident, Room } from '../domain/contracts'

export interface InsightsViewProps {
  primaryResident?: Resident
  rooms: Room[]
}

export const InsightsView: React.FC<InsightsViewProps> = ({ primaryResident, rooms }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')

  // 24-hour occupancy heatmap data
  const heatmapHours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const roomOccupancyMap: Record<string, number[]> = {
    'Living Room': [0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 4, 3, 5, 4, 3, 4, 5, 4, 3, 2, 1, 0, 0, 0],
    'Bedroom': [5, 5, 5, 5, 5, 4, 2, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 1, 2, 4, 5, 5, 5],
    'Corridor': [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 0],
    'Front Entry': [0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 2, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  }

  const getHeatColor = (level: number) => {
    switch (level) {
      case 5:
        return '#0284c7' // High
      case 4:
        return '#38bdf8'
      case 3:
        return '#7dd3fc'
      case 2:
        return '#bae6fd'
      case 1:
        return '#e0f2fe'
      default:
        return '#f1f5f9' // Zero
    }
  }

  return (
    <div className="page-view controller-theme">
      {/* View Header */}
      <div className="view-header">
        <div>
          <div className="flex-row items-center gap-2">
            <h1>Elder-Care Insights & Mobility Intelligence</h1>
            <span className="badge normal">AI Analytics Active</span>
          </div>
          <p>Circadian routine stability, room occupancy heatmaps, fall-risk trends, and caregiver response SLA metrics.</p>
        </div>
        <div className="flex-row gap-2">
          <div className="filter-chips">
            {(['24h', '7d', '30d'] as const).map((t) => (
              <button
                key={t}
                className={`filter-chip ${timeframe === t ? 'active' : ''}`}
                onClick={() => setTimeframe(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Intelligence KPI Cards */}
      <div className="controller-kpi-grid">
        <div className="controller-kpi-card">
          <div className="kpi-label">Routine Consistency</div>
          <div className="kpi-value text-emerald-700">96.2%</div>
          <div className="kpi-subtext flex-row items-center gap-1">
            <TrendingUp size={13} className="text-emerald-700" /> +3.1% vs last week
          </div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Fall-Risk Stability</div>
          <div className="kpi-value text-emerald-700">Low Risk (88/100)</div>
          <div className="kpi-subtext">Steady gait and posture balance</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Mean Caregiver SLA</div>
          <div className="kpi-value">28 Seconds</div>
          <div className="kpi-subtext">100% Validated within SLA limit</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Sleep Cycle Quality</div>
          <div className="kpi-value">7h 45m</div>
          <div className="kpi-subtext">No night wandering detected</div>
        </div>
      </div>

      {/* Bedrock AI Intelligence Summary */}
      <div className="card-box ai-insight-highlight-box mb-4">
        <div className="flex-row items-center gap-2 mb-2">
          <Sparkles size={18} className="text-amber-500" />
          <strong className="text-15 text-slate-800">Amazon Nova Micro Daily Health Brief</strong>
        </div>
        <p className="text-13 text-slate-700 m-0 leading-relaxed">
          Target resident <strong>{primaryResident?.name || 'Resident'}</strong> maintained steady mobility across the daytime cycle with primary occupancy in the Living Room (4.2 hours) and regular meal prep in the Kitchen. Nighttime rest was continuous with zero corridor transitions between 22:00 and 06:00. Fall risk score remains optimal with no gait degradation observed across Ring motion sensors.
        </p>
      </div>

      {/* 24-Hour Room Occupancy Heatmap */}
      <div className="card-box mb-4">
        <div className="flex-row justify-between items-center mb-3">
          <div>
            <h3 style={{ margin: 0 }}>24-Hour Spatial Activity Heatmap</h3>
            <small className="text-slate-500">Hourly resident occupancy frequency across mapped Ring camera zones</small>
          </div>
          <div className="flex-row items-center gap-2 text-11 text-slate-500">
            <span>Low</span>
            <div className="flex-row gap-1">
              {[0, 1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: getHeatColor(lvl),
                  }}
                />
              ))}
            </div>
            <span>High Occupancy</span>
          </div>
        </div>

        <div className="heatmap-scroll-area">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th style={{ width: '130px', textAlign: 'left' }}>Room Zone</th>
                {heatmapHours.map((h, i) => (
                  <th key={i} style={{ fontSize: '10px', padding: '4px 2px', textAlign: 'center' }}>
                    {i % 3 === 0 ? h.slice(0, 2) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(roomOccupancyMap).map(([roomName, hours]) => (
                <tr key={roomName}>
                  <td className="font-semibold text-12 text-slate-800">{roomName}</td>
                  {hours.map((val, idx) => (
                    <td key={idx} style={{ padding: '3px 2px' }}>
                      <div
                        className="heat-cell"
                        style={{
                          background: getHeatColor(val),
                          height: '22px',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease',
                        }}
                        title={`${roomName} at ${heatmapHours[idx]} · Intensity Level ${val}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column Trends Breakdown */}
      <div className="view-grid-2">
        {/* Circadian Rhythm Breakdown */}
        <div className="card-box">
          <h3>Circadian Rhythm Timeline</h3>
          <div className="routine-timeline-list">
            <div className="routine-item">
              <div className="routine-icon morning">
                <Sun size={15} />
              </div>
              <div className="routine-info">
                <strong>Morning Wake & Kitchen Activity</strong>
                <small className="text-slate-500">07:15 AM · On Schedule</small>
              </div>
              <span className="badge normal">Consistent</span>
            </div>

            <div className="routine-item mt-2">
              <div className="routine-icon day">
                <Activity size={15} />
              </div>
              <div className="routine-info">
                <strong>Mid-day Rest & Living Room Reading</strong>
                <small className="text-slate-500">01:30 PM – 03:00 PM · Normal</small>
              </div>
              <span className="badge normal">Optimal</span>
            </div>

            <div className="routine-item mt-2">
              <div className="routine-icon night">
                <Moon size={15} />
              </div>
              <div className="routine-info">
                <strong>Night Sleep Inactivity Guard</strong>
                <small className="text-slate-500">10:00 PM – 06:30 AM · Protected</small>
              </div>
              <span className="badge normal">Protected</span>
            </div>
          </div>
        </div>

        {/* Care Team SLA Performance */}
        <div className="card-box">
          <h3>Caregiver SLA & Triage Response</h3>
          <div className="sla-metric-list">
            <div className="sla-metric-row">
              <span className="text-slate-600">Mean Validation Response Time</span>
              <strong className="text-emerald-700">28 Seconds</strong>
            </div>
            <div className="progress-bar-bg mt-1 mb-3">
              <div className="progress-bar-fill" style={{ width: '92%', background: '#16a34a' }} />
            </div>

            <div className="sla-metric-row">
              <span className="text-slate-600">Alert False Positive Rate</span>
              <strong className="text-slate-800">4.1% (Low)</strong>
            </div>
            <div className="progress-bar-bg mt-1 mb-3">
              <div className="progress-bar-fill" style={{ width: '12%', background: '#0284c7' }} />
            </div>

            <div className="sla-metric-row">
              <span className="text-slate-600">Primary Caregiver Uptime</span>
              <strong className="text-emerald-700">99.8%</strong>
            </div>
            <div className="progress-bar-bg mt-1">
              <div className="progress-bar-fill" style={{ width: '99%', background: '#16a34a' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
