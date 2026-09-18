import React from 'react'
import {
  Activity,
  ChevronRight,
  Clock3,
  Ellipsis,
  Flame,
  Map,
  Monitor,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  Wifi,
} from 'lucide-react'
import { Panel, SceneDot, Status } from '../components/common/UIComponents'
import type {
  Alert,
  CareTeamMember,
  HomeMapConfig,
  Resident,
  Room,
  RoomState,
  SceneEvent,
} from '../domain/contracts'
import {
  elderPortrait,
  caregiverPortrait,
  familyPortrait,
  nursePortrait,
  doctorPortrait,
  sceneLabels,
  type TabKey,
  type Scene,
} from '../domain/mock-data'

export interface OverviewViewProps {
  greeting: string
  mariaMember?: CareTeamMember
  primaryResidentObj?: Resident
  dateFormatted: string
  timeFormatted: string
  setActiveTab: (tab: TabKey) => void
  setRoomsSubTab: (tab: 'preview' | 'map') => void
  alerts: Alert[]
  displayRooms: Room[]
  apiScenes: SceneEvent[]
  careTeam: CareTeamMember[]
  roomStates: RoomState[]
  homeMap: HomeMapConfig
  activeRoomId: string
  hoveredRoomId: string | null
  setHoveredRoomId: (id: string | null) => void
  setSelectedEventForInspection: (event: SceneEvent) => void
  recentEventTitle: string
  recentEventTime: string
  recentEventRoom: string
  recentEventScene: Scene
  recentEventContext: string
  normalCount: number
  watchCount: number
  helpCount: number
  criticalCount: number
  simLoading: boolean
  triggerSimulation: (scenario: 'normal' | 'distress' | 'visitor' | 'reset') => void
  setIsAlertSimulatorOpen: (open: boolean) => void
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  greeting,
  mariaMember,
  primaryResidentObj,
  dateFormatted,
  timeFormatted,
  setActiveTab,
  setRoomsSubTab,
  alerts,
  displayRooms,
  apiScenes,
  careTeam,
  roomStates,
  homeMap,
  activeRoomId,
  hoveredRoomId,
  setHoveredRoomId,
  setSelectedEventForInspection,
  recentEventTitle,
  recentEventTime,
  recentEventRoom,
  recentEventScene,
  recentEventContext,
  normalCount,
  watchCount,
  helpCount,
  criticalCount,
  simLoading,
  triggerSimulation,
  setIsAlertSimulatorOpen,
}) => {
  const elderAvatarUrl = primaryResidentObj?.faceTemplates?.[0]?.previewUrl || elderPortrait
  const caregiverAvatarUrl = careTeam.find((m) => m.id === 'member_caregiver')?.avatarUrl || caregiverPortrait
  const familyAvatarUrl = careTeam.find((m) => m.id === 'member_family')?.avatarUrl || familyPortrait
  const nurseAvatarUrl = careTeam.find((m) => m.id === 'member_nurse')?.avatarUrl || nursePortrait

  const activeAlert = alerts.find((a) => a.state === 'VALIDATION_PENDING' || a.state === 'CARE_IN_PROGRESS')
  const elderStatusText = activeAlert
    ? activeAlert.scene === 'S4_CRITICAL'
      ? '🚨 Critical Distress'
      : '⚠️ Needs Assistance'
    : 'At home · Safe'

  const activeAlertRoom = displayRooms.find((r) => r.id === activeAlert?.roomId)
  const activeAlertRoomName = activeAlertRoom ? activeAlertRoom.name : activeAlert?.roomId ? activeAlert.roomId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Room'

  const elderGreetingText = activeAlert
    ? `${primaryResidentObj?.name || 'Elder'} may need attention in ${activeAlertRoomName}!`
    : `${primaryResidentObj?.name || 'Elder'} is home and comfortable.`

  // 24-hour occupancy spatial heatmap data
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
    <div className="page">
      {/* Welcome Banner */}
      <section className="welcome">
        <div>
          <h1>
            {greeting}, {mariaMember?.name ? mariaMember.name.split(' ')[0] : 'Caregiver'}.
          </h1>
          <p style={{ color: activeAlert ? '#dc2626' : undefined, fontWeight: activeAlert ? 600 : undefined }}>
            {elderGreetingText}
          </p>
        </div>
        <div className="motto">A home that cares, even when you're away.</div>
        <div className="date">
          <small>{dateFormatted}</small>
          <strong>{timeFormatted}</strong>
        </div>
      </section>

      {/* Summary KPI Cards Grid */}
      <section className="summary-grid">
        <div className="summary-card interactive" onClick={() => setActiveTab('automation')}>
          <span className={`summary-icon ${activeAlert ? (activeAlert.scene === 'S4_CRITICAL' ? 'red' : 'amber') : 'green'}`}>
            <ShieldCheck />
          </span>
          <div>
            <small>Home Status</small>
            <strong style={{ color: activeAlert ? '#dc2626' : undefined }}>
              {activeAlert 
                ? activeAlert.state === 'CARE_IN_PROGRESS' 
                  ? 'CARE IN PROGRESS · Responding'
                  : `${activeAlert.scene.replace('_', ' ')} · Alert Active`
                : 'All systems OK'}
            </strong>
          </div>
        </div>

        <div className="summary-card interactive" onClick={() => setActiveTab('people')}>
          <img src={elderAvatarUrl} alt="Elder" className="summary-avatar-img" />
          <div>
            <small>{primaryResidentObj?.name || 'Elder'}</small>
            <strong style={{ color: activeAlert ? '#dc2626' : undefined }}>{elderStatusText}</strong>
          </div>
        </div>

        <div className="summary-card interactive" onClick={() => setActiveTab('rooms')}>
          <span className="summary-icon blue">
            <Monitor />
          </span>
          <div>
            <small>Rooms</small>
            <strong>{displayRooms.length} Active · 0 Offline</strong>
          </div>
        </div>

        <div className="summary-card interactive" onClick={() => setActiveTab('events')}>
          <span className="summary-icon red">
            <Activity />
          </span>
          <div>
            <small>Today's Events</small>
            <strong>
              <b>{Math.max(12, apiScenes.length)}</b> <em>Active</em>
            </strong>
          </div>
        </div>

        <div className="summary-card interactive" onClick={() => setActiveTab('care_team')}>
          <span className="summary-icon purple">
            <Users />
          </span>
          <div>
            <small>Care Team</small>
            <strong>{careTeam.length} Members</strong>
          </div>
          <div className="mini-avatars">
            <img src={caregiverAvatarUrl} alt="Caregiver" />
            <img src={familyAvatarUrl} alt="Family" />
            <img src={nurseAvatarUrl} alt="Nurse" />
          </div>
        </div>
      </section>

      {/* Section Header */}
      <section className="section-row">
        <h2>
          Active Monitoring Rooms <ChevronRight size={18} />
        </h2>
        <a onClick={() => setActiveTab('rooms')} style={{ cursor: 'pointer' }}>
          View All Rooms
        </a>
      </section>

      {/* Workspace Grid: Rooms + Today's Activity & Live Event Feed Legend */}
      <section className="workspace-grid">
        <div className="rooms-grid">
          {displayRooms.map((room) => {
            const liveRoom = roomStates.find((r) => r.roomId === room.id)
            const apiScene = apiScenes.find((item) => item.roomId === room.id)
            const status = liveRoom
              ? sceneLabels[liveRoom.status]
              : apiScene
              ? sceneLabels[apiScene.scene]
              : 'Normal'
            const activePerson =
              liveRoom?.activePerson ?? (apiScene?.identity?.name ?? 'No person')
            const time = liveRoom?.lastActivityTime ?? '21:24'
            const imgKey = room.id.includes('living')
              ? 'living'
              : room.id.includes('bedroom')
              ? 'bedroom'
              : room.id.includes('corridor')
              ? 'corridor'
              : 'entry'

            return (
              <article
                className="room-card"
                key={room.id}
                onClick={() => setActiveTab('rooms')}
                style={{ cursor: 'pointer' }}
              >
                <div className="room-card-title">
                  <div className="room-heading">
                    <span className="room-name">
                      <SceneDot status={status} />
                      <strong>{room.name}</strong>
                    </span>
                    <small className="room-status">
                      {status} · {room.floor || 'Floor 1'}
                    </small>
                  </div>
                  <Ellipsis className="room-menu" size={17} />
                </div>
                <div
                  className={`room-image ${imgKey}`}
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    backgroundImage: liveRoom?.snapshotUrl ? `url(${liveRoom.snapshotUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', top: '10px', left: '10px' }}>● Live</span>
                </div>
                <div className="room-card-footer">
                  <span>
                    <UserRound size={15} /> {activePerson}
                  </span>
                  <span>
                    <Clock3 size={15} /> {time}
                  </span>
                </div>
              </article>
            )
          })}
        </div>

        {/* Unified Today's Activity & Live Event Stream Legend */}
        <aside className="today-activity-card">
          <div className="activity-card-header">
            <div className="activity-card-title-group">
              <h2>Today's Activity</h2>
              <span className="live-tag-pill">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <a onClick={() => setActiveTab('events')} className="feed-view-all-link">
              View All
            </a>
          </div>

          {/* Activity Category Count Legend */}
          <div className="chart-legend">
            <span>
              <i className="green-dot" /> Normal {normalCount}
            </span>
            <span>
              <i className="watch-dot" /> Watch {watchCount}
            </span>
            <span>
              <i className="help-dot" /> Help {helpCount}
            </span>
            <span>
              <i className="critical-dot" /> Critical {criticalCount}
            </span>
          </div>

          {/* Hourly 24-Hour Activity Rhythm Chart */}
          <div className="chart">
            {Array.from({ length: 28 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${
                    [
                      10, 20, 14, 8, 12, 35, 20, 56, 32, 44, 18, 27, 12, 9, 22, 15, 15, 25, 16,
                      17, 30, 24, 48, 32, 16, 37, 25, 10,
                    ][i]
                  }px`,
                }}
              />
            ))}
          </div>
          <div className="chart-times">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>

          {/* Live Activity Feed Legend (Short Real-Time Event Stream) */}
          <div className="feed-legend-section">
            <div className="feed-legend-header">
              <small>LIVE SCENE FEED LEGEND</small>
            </div>
            <div className="feed-legend-list">
              {apiScenes.length > 0 ? (
                apiScenes.slice(0, 4).map((sceneItem, idx) => (
                  <div
                    className="activity-item compact-item clickable-event-row"
                    key={sceneItem.sceneId || `scene-${idx}`}
                    onClick={() => setSelectedEventForInspection(sceneItem)}
                    title="Click to inspect event snapshot & AI context"
                  >
                    <span
                      className={`activity-check ${
                        sceneItem.scene === 'S1_NORMAL' ? 'normal' : 'watch'
                      }`}
                    >
                      ✓
                    </span>
                    <time>
                      {new Date(sceneItem.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <div className="activity-text">
                      <strong>
                        {sceneItem.identity?.name ??
                          (sceneItem.identity?.identity === 'unknown'
                            ? 'Visitor'
                            : 'Motion detected')}
                      </strong>
                      <small>
                        {(sceneItem.roomId || 'Unknown Room').replace(/_/g, ' ')} · {sceneLabels[sceneItem.scene]}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                [
                  ['21:18', 'Eleanor sitting on sofa', 'Living Room · Normal', 'normal'],
                  ['20:47', 'Front door motion', 'Entry · Person detected', 'watch'],
                  ['18:32', 'Eleanor in bedroom', 'Bedroom · Normal', 'normal'],
                  ['17:11', 'Visitor at front door', 'Entry · Known (Family)', 'normal'],
                ].map(([time, title, detail, tone]) => (
                  <div className="activity-item compact-item" key={time + title}>
                    <span className={`activity-check ${tone}`}>✓</span>
                    <time>{time}</time>
                    <div className="activity-text">
                      <strong>{title}</strong>
                      <small>{detail}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* Row 1: Home Map Spatial Tracking & Recent Event AI Breakdown */}
      <section className="overview-balanced-row">
        {/* Left: Home Map with Live Device Pin Markers */}
        <div className="overview-panel-card map-panel">
          <div className="overview-panel-header">
            <div className="overview-panel-title">
              <h2>Home Map & Ring Device Pins</h2>
            </div>
            <span
              className="panel-action-link"
              onClick={() => {
                setActiveTab('rooms')
                setRoomsSubTab('map')
              }}
            >
              <Map size={13} /> Floor Map Setup
            </span>
          </div>

          <div className="floorplan-canvas overview-mode">
            {homeMap.mapUrl ? (
              <img
                src={homeMap.mapUrl}
                className="floorplan-bg"
                alt="Floor plan"
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <svg className="floorplan-bg" viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern
                    id="grid-pattern-overview"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#f8fafc" />
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#grid-pattern-overview)"
                  opacity="0.6"
                />
                <rect
                  x="40"
                  y="40"
                  width="430"
                  height="260"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  rx="8"
                />
                <text x="60" y="75" fill="#64748b" fontSize="14" fontWeight="bold">
                  Living Room Zone
                </text>

                <rect
                  x="530"
                  y="40"
                  width="430"
                  height="260"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  rx="8"
                />
                <text x="550" y="75" fill="#64748b" fontSize="14" fontWeight="bold">
                  Master Bedroom
                </text>

                <rect
                  x="250"
                  y="340"
                  width="500"
                  height="110"
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  rx="8"
                />
                <text x="270" y="375" fill="#64748b" fontSize="13" fontWeight="bold">
                  Central Corridor
                </text>

                <rect
                  x="40"
                  y="340"
                  width="170"
                  height="240"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  rx="8"
                />
                <text x="55" y="375" fill="#64748b" fontSize="13" fontWeight="bold">
                  Kitchen/Dining
                </text>

                <rect
                  x="790"
                  y="340"
                  width="170"
                  height="240"
                  fill="#f1f5f9"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  rx="8"
                />
                <text x="805" y="375" fill="#64748b" fontSize="13" fontWeight="bold">
                  Entry & Porch
                </text>
              </svg>
            )}
            {displayRooms.map((room) => {
              const coord = room.mapCoordinates ?? { x: 50, y: 50 }
              const liveState = roomStates.find((r) => r.roomId === room.id)
              const status = liveState ? liveState.status : 'S1_NORMAL'
              const isHovered = hoveredRoomId === room.id
              const isActive =
                activeRoomId === room.id || status === 'S3_HELP' || status === 'S4_CRITICAL'

              return (
                <div
                  key={room.id}
                  className={`floorplan-pin-marker ${
                    status === 'S4_CRITICAL'
                      ? 'critical'
                      : status === 'S3_HELP'
                      ? 'help'
                      : status === 'S2_WATCH'
                      ? 'watch'
                      : 'normal'
                  } ${isActive ? 'active' : ''}`}
                  style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                  onMouseEnter={() => setHoveredRoomId(room.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  onClick={() => {
                    setActiveTab('rooms')
                    setRoomsSubTab('map')
                  }}
                >
                  <Wifi size={13} />
                  <span className="pin-label-tag">{room.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Recent Scene Event with AI Nova Micro Explanation */}
        <div className="overview-panel-card recent-event-panel">
          <div className="overview-panel-header">
            <div className="overview-panel-title">
              <h2>Recent Scene Event</h2>
            </div>
            <a onClick={() => setActiveTab('events')} className="panel-action-link">
              Inspect Stream
            </a>
          </div>

          <div className="recent-event-full-box">
            <div
              className={`event-image ${activeRoomId.replace('_room', '')}`}
              style={{
                backgroundImage: apiScenes[0]?.snapshotUrl ? `url(${apiScenes[0].snapshotUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="recent-event-content">
              <div className="recent-event-header-line">
                <h3>{recentEventTitle}</h3>
                <span className={recentEventScene === 'Normal' ? 's1-badge' : 'watch-dot-pill'}>
                  {recentEventScene === 'Normal' ? 'S1 Normal' : recentEventScene}
                </span>
              </div>
              <small className="recent-event-meta">
                <Clock3 size={11} /> {recentEventTime} · {recentEventRoom}
              </small>
              <p className="recent-event-desc">{recentEventContext}</p>
              <div className="ai-summary-tag">
                <Sparkles size={12} className="text-primary" />
                <span>Amazon Nova Micro · Structured Context Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Row 2: 24-Hour Spatial Activity Heatmap & System Telemetry */}
      <section className="overview-balanced-row">
        {/* Left: 24-Hour Spatial Activity Heatmap */}
        <div className="overview-panel-card heatmap-panel">
          <div className="overview-panel-header">
            <div className="overview-panel-title">
              <h2>24-Hour Spatial Activity Heatmap</h2>
              <small style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                Hourly resident occupancy frequency across mapped Ring camera zones
              </small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#64748b' }}>
                <span>Low</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[0, 1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: getHeatColor(lvl),
                      }}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
              <a onClick={() => setActiveTab('insights')} className="panel-action-link">
                Analytics
              </a>
            </div>
          </div>

          <div className="heatmap-scroll-area" style={{ marginTop: '2px' }}>
            <table className="heatmap-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '100px', textAlign: 'left', fontSize: '10.5px', color: '#64748b' }}>
                    Zone
                  </th>
                  {heatmapHours.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        fontSize: '9px',
                        padding: '2px 1px',
                        textAlign: 'center',
                        color: '#94a3b8',
                      }}
                    >
                      {i % 4 === 0 ? h.slice(0, 2) : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(roomOccupancyMap).map(([roomName, hours]) => (
                  <tr key={roomName}>
                    <td
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        padding: '3px 0',
                      }}
                    >
                      {roomName}
                    </td>
                    {hours.map((val, idx) => (
                      <td key={idx} style={{ padding: '2px 1px' }}>
                        <div
                          className="heat-cell"
                          style={{
                            background: getHeatColor(val),
                            height: '18px',
                            borderRadius: '3px',
                            transition: 'background 0.2s ease',
                          }}
                          title={`${roomName} at ${heatmapHours[idx]} · Intensity ${val}/5`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: System & Integration Telemetry Status */}
        <div className="overview-panel-card system-status-panel">
          <div className="overview-panel-header">
            <div className="overview-panel-title">
              <h2>System Telemetry & Platform Status</h2>
            </div>
            <span className="system-health-tag">
              <span className="health-pulse-dot" /> All Nodes Operational
            </span>
          </div>

          <div className="system-status-grid">
            <Status icon={<Wifi />} title="Ring Hardware & Webhooks" value="Connected" />
            <Status icon={<Monitor />} title="Local Pipeline Ingestion" value="Active (18ms)" />
            <Status icon={<Activity />} title="AWS Bedrock (Nova Micro)" value="Online (us-east-1)" />
            <Status icon={<ShieldCheck />} title="Biometric Face Recognition" value="Active Target" />
            <Status icon={<ShieldCheck />} title="HIPAA Data & Privacy Guard" value="Protected" />
          </div>
        </div>
      </section>

      {/* Quick Simulation Bar for Demonstration */}
      <section
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '14px 18px',
          margin: '20px 0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={16} color="#005cf5" />
          <strong style={{ fontSize: '13px', color: '#1a202c' }}>Simulate Ring Webhook Events:</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="sim-button"
            style={{ background: '#0f172a' }}
            onClick={() => setIsAlertSimulatorOpen(true)}
          >
            <SlidersHorizontal size={13} /> Custom Zone Simulator
          </button>
          <button
            className="sim-button secondary"
            disabled={simLoading}
            onClick={() => triggerSimulation('normal')}
          >
            Eleanor Living Room (S1)
          </button>
          <button
            className="sim-button secondary"
            disabled={simLoading}
            onClick={() => triggerSimulation('visitor')}
          >
            Unknown Visitor Doorbell (S2)
          </button>
          <button
            className="sim-button danger"
            disabled={simLoading}
            onClick={() => triggerSimulation('distress')}
          >
            <Flame size={14} /> Bedroom Distress (S3)
          </button>
          <button
            className="sim-button"
            disabled={simLoading}
            onClick={() => triggerSimulation('reset')}
          >
            <RefreshCw size={14} /> Reset Demo
          </button>
        </div>
      </section>
    </div>
  )
}
