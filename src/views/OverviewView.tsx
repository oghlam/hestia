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
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
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
  eleanorPortrait,
  johnPortrait,
  mariaPortrait,
  sarahPortrait,
  sceneLabels,
  type Scene,
  type TabKey,
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
  const eleanorAvatarUrl = primaryResidentObj?.faceTemplates?.[0]?.previewUrl || eleanorPortrait
  const mariaAvatarUrl = careTeam.find((m) => m.id === 'member_maria')?.avatarUrl || mariaPortrait
  const johnAvatarUrl = careTeam.find((m) => m.id === 'member_john')?.avatarUrl || johnPortrait
  const sarahAvatarUrl = careTeam.find((m) => m.id === 'member_sarah')?.avatarUrl || sarahPortrait

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <h1>
            {greeting}, {mariaMember?.name ? mariaMember.name.split(' ')[0] : 'Maria'}.
          </h1>
          <p>{primaryResidentObj?.name || 'Eleanor'} is home and comfortable.</p>
        </div>
        <div className="motto">A home that cares, even when you're away.</div>
        <div className="date">
          <small>{dateFormatted}</small>
          <strong>{timeFormatted}</strong>
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card interactive" onClick={() => setActiveTab('automation')}>
          <span className="summary-icon green">
            <ShieldCheck />
          </span>
          <div>
            <small>Home Status</small>
            <strong>
              {alerts.length > 0 && alerts[0].state === 'VALIDATION_PENDING'
                ? 'Alert Pending'
                : 'All systems OK'}
            </strong>
          </div>
        </div>

        <div className="summary-card interactive" onClick={() => setActiveTab('people')}>
          <img src={eleanorAvatarUrl} alt="Eleanor" className="summary-avatar-img" />
          <div>
            <small>{primaryResidentObj?.name || 'Eleanor'}</small>
            <strong>At home · Safe</strong>
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
            <img src={mariaAvatarUrl} alt="Maria" />
            <img src={johnAvatarUrl} alt="John" />
            <img src={sarahAvatarUrl} alt="Sarah" />
          </div>
        </div>
      </section>

      <section className="section-row">
        <h2>
          Rooms <ChevronRight size={18} />
        </h2>
        <a onClick={() => setActiveTab('rooms')} style={{ cursor: 'pointer' }}>
          View All
        </a>
      </section>

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
                <div className={`room-image ${imgKey}`}>
                  <span>● Live</span>
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

        <aside className="activity-feed">
          <div className="feed-title">
            <h2>Activity Feed</h2>
            <a onClick={() => setActiveTab('events')} style={{ cursor: 'pointer' }}>
              View All
            </a>
          </div>
          {apiScenes.length > 0 ? (
            apiScenes.slice(0, 5).map((sceneItem, idx) => (
              <div
                className="activity-item clickable-event-row"
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
                <div>
                  <strong>
                    {sceneItem.identity?.name ??
                      (sceneItem.identity?.identity === 'unknown'
                        ? 'Visitor'
                        : 'Motion detected')}
                  </strong>
                  <small>
                    {(sceneItem.roomId || 'Unknown Room').replace('_', ' ')} · {sceneLabels[sceneItem.scene]}
                  </small>
                </div>
                <span className="activity-thumb" />
              </div>
            ))
          ) : (
            [
              ['21:18', 'Eleanor sitting on sofa', 'Living Room · Normal', 'normal'],
              ['20:47', 'Front door motion', 'Entry · Person detected', 'watch'],
              ['18:32', 'Eleanor in bedroom', 'Bedroom · Normal', 'normal'],
              ['17:11', 'Visitor at front door', 'Entry · Known (Family)', 'normal'],
              ['13:02', 'Corridor motion', 'Corridor · No person', 'normal'],
            ].map(([time, title, detail, tone]) => (
              <div className="activity-item" key={time + title}>
                <span className={`activity-check ${tone}`}>✓</span>
                <time>{time}</time>
                <div>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
                <span className="activity-thumb" />
              </div>
            ))
          )}
        </aside>
      </section>

      <section className="lower-grid">
        <Panel
          title="Home Map"
          action={
            <span
              style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                fontSize: '11px',
                color: '#005cf5',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => {
                setActiveTab('rooms')
                setRoomsSubTab('map')
              }}
            >
              <Map size={14} /> Floor Map Setup
            </span>
          }
        >
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
                  {isHovered && (
                    <div className="device-tooltip" style={{ display: 'block' }}>
                      <strong>{room.deviceName || `Ring ${room.name}`}</strong>
                      <small>
                        {room.deviceType || 'Indoor Cam'} · {room.floor || 'Floor 1'}
                      </small>
                      <span>
                        <b>Signal</b>
                        {room.signalDbm || 'Good · -55 dBm'}
                      </span>
                      <span>
                        <b>Presence</b>
                        {liveState?.activePerson || 'No person'}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title="Recent Event" action={<Ellipsis size={17} />}>
          <div className="recent-event">
            <div className={`event-image ${activeRoomId.replace('_room', '')}`} />
            <div>
              <h3>{recentEventTitle}</h3>
              <small>
                {recentEventTime} · {recentEventRoom}
              </small>
              <span className={recentEventScene === 'Normal' ? 's1-badge' : 'watch-dot'}>
                {recentEventScene === 'Normal' ? 'S1  Normal' : recentEventScene}
              </span>
              <p>{recentEventContext}</p>
              <small className="ai">
                <Activity size={13} /> AI Summary · Nova Micro
              </small>
            </div>
          </div>
        </Panel>

        <Panel title="Today's Activity" action={<Ellipsis size={17} />}>
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
        </Panel>
      </section>

      <section className="bottom-grid">
        <Panel title="System Status">
          <div className="system-status">
            <Status icon={<Wifi />} title="Ring Integration" value="Online" />
            <Status icon={<Monitor />} title="Local Detection" value="Active" />
            <Status icon={<Activity />} title="Cloud AI (Bedrock)" value="Online" />
            <Status icon={<ShieldCheck />} title="Face Recognition" value="Active" />
            <Status icon={<ShieldCheck />} title="Data & Privacy" value="Protected" />
          </div>
        </Panel>

        <Panel
          title="Care Team"
          action={
            <a onClick={() => setActiveTab('care_team')} style={{ cursor: 'pointer' }}>
              View All
            </a>
          }
        >
          <div className="care-team">
            <div onClick={() => setActiveTab('care_team')} style={{ cursor: 'pointer' }}>
              <div className="team-avatar">
                <img src={mariaAvatarUrl} alt="Maria" />
              </div>
              <small>
                Maria
                <br />
                <b>Family</b>
              </small>
            </div>
            <div onClick={() => setActiveTab('care_team')} style={{ cursor: 'pointer' }}>
              <div className="team-avatar">
                <img src={johnAvatarUrl} alt="John" />
              </div>
              <small>
                John
                <br />
                <b>Son</b>
              </small>
            </div>
            <div onClick={() => setActiveTab('care_team')} style={{ cursor: 'pointer' }}>
              <div className="team-avatar">
                <img src={sarahAvatarUrl} alt="Sarah" />
              </div>
              <small>
                Sarah
                <br />
                <b>Nurse</b>
              </small>
            </div>
            <div onClick={() => setActiveTab('care_team')} style={{ cursor: 'pointer' }}>
              <div className="team-avatar add">+</div>
              <small>Add</small>
            </div>
          </div>
        </Panel>
      </section>

      {/* Quick Simulation Bar for Demonstration */}
      <section
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          margin: '24px 0',
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
