import React from 'react'
import {
  Check,
  Crosshair,
  Edit3,
  Flame,
  Map,
  Monitor,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Wifi,
} from 'lucide-react'
import { SceneDot } from '../components/common/UIComponents'
import type { HomeMapConfig, Room, RoomState } from '../domain/contracts'
import { sceneLabels } from '../domain/mock-data'

export interface RoomsViewProps {
  roomsSubTab: 'preview' | 'map'
  setRoomsSubTab: (tab: 'preview' | 'map') => void
  openAddRoom: () => void
  setIsMapModalOpen: (open: boolean) => void
  fetchData: () => void
  displayRooms: Room[]
  roomStates: RoomState[]
  homeMap: HomeMapConfig
  simLoading: boolean
  triggerRoomSimulation: (roomId: string, scenario: 'normal' | 'distress') => Promise<void>
  openEditRoom: (room: Room) => void
  handleDeleteRoom: (roomId: string, name: string) => Promise<void>
  pinningRoomId: string | null
  setPinningRoomId: (id: string | null) => void
  mapNotice: string | null
  canvasRef: React.RefObject<HTMLDivElement | null>
  handleMapCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void
  handleMouseMoveCanvas: (e: React.MouseEvent<HTMLDivElement>) => void
  handleMouseUpCanvas: () => void
  handleMouseDownPin: (e: React.MouseEvent, roomId: string) => void
  dragCoords: { [roomId: string]: { x: number; y: number } }
  draggingRoomId: string | null
  hoveredRoomId: string | null
  setHoveredRoomId: (id: string | null) => void
  activeRoomId: string
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  roomsSubTab,
  setRoomsSubTab,
  openAddRoom,
  setIsMapModalOpen,
  fetchData,
  displayRooms,
  roomStates,
  homeMap,
  simLoading,
  triggerRoomSimulation,
  openEditRoom,
  handleDeleteRoom,
  pinningRoomId,
  setPinningRoomId,
  mapNotice,
  canvasRef,
  handleMapCanvasClick,
  handleMouseMoveCanvas,
  handleMouseUpCanvas,
  handleMouseDownPin,
  dragCoords,
  draggingRoomId,
  hoveredRoomId,
  setHoveredRoomId,
  activeRoomId,
}) => {
  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Multi-Room Surveillance & Zone Monitoring</h1>
          <p>Live camera preview feed, resident presence, and Ring hardware telemetry per zone</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sim-button" onClick={openAddRoom}>
            <Plus size={14} /> Pair Ring Camera / Room
          </button>
          {roomsSubTab === 'preview' ? (
            <button className="sim-button secondary" onClick={fetchData}>
              <RefreshCw size={14} /> Refresh Rooms
            </button>
          ) : (
            <>
              <button className="sim-button secondary" onClick={() => setIsMapModalOpen(true)}>
                <Upload size={14} /> Change Blueprint
              </button>
              <button className="sim-button secondary" onClick={fetchData}>
                <RefreshCw size={14} /> Refresh Map
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="view-subtabs">
        <button
          className={`subtab-btn ${roomsSubTab === 'preview' ? 'active' : ''}`}
          onClick={() => setRoomsSubTab('preview')}
        >
          <Monitor size={15} /> Real Preview & Live Monitoring
        </button>
        <button
          className={`subtab-btn ${roomsSubTab === 'map' ? 'active' : ''}`}
          onClick={() => setRoomsSubTab('map')}
        >
          <Map size={15} /> Floor Map Setup & Pin Calibration
        </button>
      </div>

      {/* SUB-TAB 1: REAL PREVIEW & SURVEILLANCE */}
      {roomsSubTab === 'preview' && (
        <div className="view-grid-2">
          {displayRooms.map((room) => {
            const liveRoom = roomStates.find((r) => r.roomId === room.id)
            const status = liveRoom ? sceneLabels[liveRoom.status] : 'Normal'
            const activePerson = liveRoom?.activePerson ?? 'No person'
            const imgKey = room.id.includes('living')
              ? 'living'
              : room.id.includes('bedroom')
              ? 'bedroom'
              : room.id.includes('corridor')
              ? 'corridor'
              : 'entry'

            return (
              <div className="card-box" key={room.id}>
                <h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SceneDot status={status} />
                    {room.name}
                    <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                      ({room.floor || 'Floor 1'})
                    </small>
                  </span>
                  <span className={`badge ${status.toLowerCase()}`}>{status}</span>
                </h3>
                <div
                  className={`room-image ${imgKey}`}
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    minHeight: '260px',
                    borderRadius: '10px',
                    marginBottom: '14px',
                    backgroundImage: liveRoom?.snapshotUrl ? `url(${liveRoom.snapshotUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', top: '10px', left: '10px' }}>● Live Feed</span>
                </div>
                <table className="table-responsive">
                  <tbody>
                    <tr>
                      <td>
                        <strong>Active Presence</strong>
                      </td>
                      <td>{activePerson}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Assigned Ring Device</strong>
                      </td>
                      <td>
                        {room.deviceName || `Ring ${room.name}`} ({room.deviceType || 'Indoor Cam'})
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Hardware Device ID</strong>
                      </td>
                      <td>
                        <code>{room.deviceId || room.id}</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Signal Strength</strong>
                      </td>
                      <td>
                        <span className="badge normal">{room.signalDbm || 'Good · -55 dBm'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Floor Plan Location</strong>
                      </td>
                      <td>
                        <span className="coord-badge">
                          X: {room.mapCoordinates?.x ?? 50}%, Y: {room.mapCoordinates?.y ?? 50}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="room-actions-bar">
                  <button
                    className="btn-icon-action"
                    disabled={simLoading}
                    onClick={() => triggerRoomSimulation(room.id, 'normal')}
                  >
                    <Play size={13} /> Test Motion
                  </button>
                  <button
                    className="btn-icon-action"
                    disabled={simLoading}
                    onClick={() => triggerRoomSimulation(room.id, 'distress')}
                    style={{ color: '#b91c1c' }}
                  >
                    <Flame size={13} /> Test Distress
                  </button>
                  <button className="btn-icon-action" onClick={() => openEditRoom(room)}>
                    <Edit3 size={13} /> Edit Room
                  </button>
                  <button
                    className="btn-icon-action danger"
                    onClick={() => handleDeleteRoom(room.id, room.name)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SUB-TAB 2: FLOOR MAP SETUP & PIN CALIBRATION */}
      {roomsSubTab === 'map' && (
        <>
          {pinningRoomId && (
            <div
              style={{
                background: '#dbeafe',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                padding: '12px 18px',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <Crosshair size={16} />
                <span>
                  <strong>Pin Placement Mode Active:</strong> Click anywhere on the floor plan canvas
                  below to position the camera for{' '}
                  <b>{displayRooms.find((r) => r.id === pinningRoomId)?.name}</b>.
                </span>
              </span>
              <button
                className="sim-button secondary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => setPinningRoomId(null)}
              >
                Cancel
              </button>
            </div>
          )}

          {mapNotice && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                color: '#166534',
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              <span>{mapNotice}</span>
            </div>
          )}

          {/* Precision Floor Plan Canvas (Aspect Ratio 16:10, Never Stretched) */}
          <div className="card-box" style={{ marginBottom: '24px' }}>
            <h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Map size={17} color="#005cf5" />
                Architectural Floor Plan Blueprint
              </span>
              <span className="badge info">
                {homeMap.presetName ?? 'Default Greenwood Blueprint'}
              </span>
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Click <strong>"Calibrate Position"</strong> on any room in the table below, then click on
              the floor plan to position its camera pin.
            </p>

            <div
              ref={canvasRef}
              className={`floorplan-canvas ${pinningRoomId ? 'pinning-active' : ''}`}
              onClick={handleMapCanvasClick}
              onMouseMove={handleMouseMoveCanvas}
              onMouseUp={handleMouseUpCanvas}
              onMouseLeave={handleMouseUpCanvas}
            >
              {homeMap.mapUrl ? (
                <img src={homeMap.mapUrl} className="floorplan-bg" alt="Custom floor plan" />
              ) : (
                <svg className="floorplan-bg" viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern
                      id="grid-pattern-map-setup"
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
                    fill="url(#grid-pattern-map-setup)"
                    opacity="0.6"
                  />

                  {/* Living Room */}
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
                  <text x="60" y="75" fill="#475569" fontSize="14" fontWeight="bold">
                    Living Room & Lounge Zone
                  </text>

                  {/* Master Bedroom */}
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
                  <text x="550" y="75" fill="#475569" fontSize="14" fontWeight="bold">
                    Master Bedroom (Resident Care)
                  </text>

                  {/* Corridor */}
                  <rect
                    x="250"
                    y="340"
                    width="500"
                    height="110"
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="6,4"
                    rx="8"
                  />
                  <text x="270" y="375" fill="#475569" fontSize="13" fontWeight="bold">
                    Central Hallway / Corridor
                  </text>

                  {/* Kitchen */}
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
                  <text x="55" y="375" fill="#475569" fontSize="13" fontWeight="bold">
                    Kitchen & Dining
                  </text>

                  {/* Entry Porch */}
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
                  <text x="805" y="375" fill="#475569" fontSize="13" fontWeight="bold">
                    Entry & Porch
                  </text>
                </svg>
              )}

              {displayRooms.map((room) => {
                const coord = dragCoords[room.id] ?? room.mapCoordinates ?? { x: 50, y: 50 }
                const liveState = roomStates.find((r) => r.roomId === room.id)
                const status = liveState ? liveState.status : 'S1_NORMAL'
                const isPinning = pinningRoomId === room.id
                const isDragging = draggingRoomId === room.id
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
                    } ${isPinning ? 'is-pinning-target' : ''} ${isDragging ? 'is-dragging' : ''} ${
                      isActive ? 'active' : ''
                    }`}
                    style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    onMouseDown={(e) => handleMouseDownPin(e, room.id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (pinningRoomId && pinningRoomId !== room.id) {
                        handleMapCanvasClick(e)
                      } else {
                        setPinningRoomId(isPinning ? null : room.id)
                      }
                    }}
                    onMouseEnter={() => setHoveredRoomId(room.id)}
                    onMouseLeave={() => setHoveredRoomId(null)}
                  >
                    <Wifi size={13} />
                    <span className="pin-label-tag">{room.name}</span>
                    {(isHovered || isPinning || isDragging) && (
                      <div
                        className="device-tooltip"
                        style={{
                          display: 'block',
                          left: coord.x > 75 ? 'auto' : coord.x < 25 ? '0' : '50%',
                          right: coord.x > 75 ? '0' : 'auto',
                          bottom: coord.y < 35 ? 'auto' : 'calc(100% + 10px)',
                          top: coord.y < 35 ? 'calc(100% + 10px)' : 'auto',
                          transform: coord.x >= 25 && coord.x <= 75 ? 'translateX(-50%)' : 'none',
                        }}
                      >
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
                        <span>
                          <b>Coordinates</b>X: {coord.x}%, Y: {coord.y}%
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Camera Pin Location Setup Table */}
          <div className="card-box">
            <h3>Camera Pin Coordinates & Zone Setup</h3>
            <table className="table-responsive">
              <thead>
                <tr>
                  <th>Room / Zone</th>
                  <th>Ring Device</th>
                  <th>Device Type</th>
                  <th>Position Coordinates</th>
                  <th>Current Status</th>
                  <th>Location Setup Action</th>
                </tr>
              </thead>
              <tbody>
                {displayRooms.map((room) => {
                  const coord = dragCoords[room.id] ?? room.mapCoordinates ?? { x: 50, y: 50 }
                  const liveState = roomStates.find((r) => r.roomId === room.id)
                  const status = liveState ? sceneLabels[liveState.status] : 'Normal'
                  const isPinning = pinningRoomId === room.id

                  return (
                    <tr key={room.id}>
                      <td>
                        <strong>{room.name}</strong>
                        <small style={{ color: '#64748b', display: 'block' }}>
                          {room.floor || 'Floor 1'}
                        </small>
                      </td>
                      <td>{room.deviceName || `Ring ${room.name}`}</td>
                      <td>{room.deviceType || 'Indoor Cam'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="coord-badge">
                            X: {coord.x}%, Y: {coord.y}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${status.toLowerCase()}`}>{status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className={`btn-icon-action ${isPinning ? 'primary' : ''}`}
                            onClick={() => setPinningRoomId(isPinning ? null : room.id)}
                            title="Calibrate marker position on blueprint"
                          >
                            <Crosshair size={13} />{' '}
                            {isPinning ? 'Click on Blueprint...' : 'Calibrate'}
                          </button>
                          <button
                            className="btn-icon-action"
                            onClick={() => openEditRoom(room)}
                            title="Edit Device & Signal Telemetry"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          <button
                            className="btn-icon-action danger"
                            onClick={() => handleDeleteRoom(room.id, room.name)}
                            title="Delete Room & Ring Device"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
