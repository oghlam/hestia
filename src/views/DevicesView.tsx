import React, { useState } from 'react'
import {
  Activity,
  Battery,
  Camera,
  CheckCircle2,
  ChevronRight,
  Filter,
  Layers,
  MoreVertical,
  Network,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Video,
  Wifi,
  Zap,
} from 'lucide-react'
import type { RingMasterDevice, Room } from '../domain/contracts'
import type { DrawerEntity } from '../components/layout/ContextualDrawer'

export interface DevicesViewProps {
  devices: RingMasterDevice[]
  rooms: Room[]
  onOpenAddModal: () => void
  onDeleteDevice: (id: string) => void
  onSelectDeviceForDrawer: (entity: DrawerEntity) => void
  onPingDevice?: (device: RingMasterDevice) => void
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  rooms,
  onOpenAddModal,
  onDeleteDevice,
  onSelectDeviceForDrawer,
  onPingDevice,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Sample default Ring devices if empty
  const sampleDevices: RingMasterDevice[] = devices.length > 0 ? devices : [
    {
      id: 'ring-dev-01',
      macAddress: '9C:76:13:2A:4B:91',
      vendor: 'Ring',
      series: 'Plus',
      model: 'Indoor Cam',
      modelCode: 'RING-IC-PL',
      firmwareVersion: 'v2.8.4',
      ipAddress: '192.168.1.110',
      assignedRoomId: 'living_room',
      signalDbm: 'Excellent · -39 dBm',
      status: 'online',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'ring-dev-02',
      macAddress: '9C:76:13:3E:5C:88',
      vendor: 'Ring',
      series: 'Pro',
      model: 'Indoor Cam',
      modelCode: 'RING-IC-PRO',
      firmwareVersion: 'v3.1.0',
      ipAddress: '192.168.1.111',
      assignedRoomId: 'bedroom',
      signalDbm: 'Excellent · -42 dBm',
      status: 'online',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'ring-dev-03',
      macAddress: '9C:76:13:7F:88:12',
      vendor: 'Ring',
      series: 'Plus',
      model: 'Stick Up Cam',
      modelCode: 'RING-SUC-PL',
      firmwareVersion: 'v2.7.2',
      ipAddress: '192.168.1.112',
      assignedRoomId: 'corridor',
      signalDbm: 'Good · -58 dBm',
      status: 'online',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'ring-dev-04',
      macAddress: '9C:76:13:99:A1:FE',
      vendor: 'Ring',
      series: 'Elite',
      model: 'Video Doorbell',
      modelCode: 'RING-VDB-ELITE',
      firmwareVersion: 'v4.0.1',
      ipAddress: '192.168.1.113',
      assignedRoomId: 'entry',
      signalDbm: 'Good · -61 dBm',
      status: 'online',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ]

  const filteredDevices = sampleDevices.filter((d) => {
    const matchesSearch =
      d.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.ipAddress && d.ipAddress.includes(searchQuery)) ||
      (d.assignedRoomId && d.assignedRoomId.toLowerCase().includes(searchQuery.toLowerCase()))

    if (filterType === 'all') return matchesSearch
    return matchesSearch && d.model.toLowerCase().includes(filterType.toLowerCase())
  })

  const onlineCount = sampleDevices.filter((d) => d.status === 'online').length
  const totalCount = sampleDevices.length

  return (
    <div className="page-view controller-theme">
      {/* View Header */}
      <div className="view-header">
        <div>
          <div className="flex-row items-center gap-2">
            <h1>Ring Hardware Inventory</h1>
            <span className="badge info">{totalCount} Registered Devices</span>
          </div>
          <p>Master registry for paired Ring Indoor Cams, Doorbells, and Security Hubs.</p>
        </div>
        <div className="flex-row gap-2">
          <button className="sim-button secondary" onClick={() => onPingDevice && onPingDevice(sampleDevices[0])}>
            <RefreshCw size={14} /> Scan Subnet
          </button>
          <button className="sim-button" onClick={onOpenAddModal}>
            <Plus size={15} /> Adopt Device
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Bar (UniFi Controller style) */}
      <div className="controller-kpi-grid">
        <div className="controller-kpi-card">
          <div className="kpi-label">Device Health</div>
          <div className="kpi-value text-emerald-700">{onlineCount} / {totalCount}</div>
          <div className="kpi-subtext">100% Devices Online & Ingesting</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Mean Signal (RSSI)</div>
          <div className="kpi-value">-45 dBm</div>
          <div className="kpi-subtext">Optimal Wi-Fi Coverage</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Live Ingestion Rate</div>
          <div className="kpi-value">4 Streams</div>
          <div className="kpi-subtext">Constant Snapshot Pipeline</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Firmware Compliance</div>
          <div className="kpi-value text-emerald-700">100%</div>
          <div className="kpi-subtext">All Ring Hardware Updated</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="controller-filter-bar">
        <div className="search-input-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search MAC, Model, IP or Room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {['all', 'indoor', 'doorbell', 'stick up'].map((t) => (
            <button
              key={t}
              className={`filter-chip ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="view-mode-toggle">
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
          >
            List
          </button>
          <button
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Table / List View */}
      {viewMode === 'table' ? (
        <div className="card-box controller-table-box">
          <table className="controller-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Device Name / Model</th>
                <th>Hardware Series</th>
                <th>MAC Address</th>
                <th>IP Address</th>
                <th>Assigned Room</th>
                <th>Wi-Fi Signal</th>
                <th>Firmware</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((dev) => (
                <tr
                  key={dev.id}
                  className="interactive-row"
                  onClick={() => onSelectDeviceForDrawer({ type: 'device', data: dev })}
                >
                  <td>
                    <span className="status-dot-indicator online" title="Online & Polling" />
                  </td>
                  <td>
                    <div className="flex-row items-center gap-2">
                      <div className="device-avatar-icon">
                        {dev.model.includes('Doorbell') ? <Video size={15} /> : <Camera size={15} />}
                      </div>
                      <div>
                        <strong>{dev.vendor} {dev.model}</strong>
                        <div className="text-11 text-slate-500">{dev.modelCode || 'RING-HW'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge info">{dev.series}</span>
                  </td>
                  <td>
                    <code className="mac-code">{dev.macAddress}</code>
                  </td>
                  <td>
                    <span>{dev.ipAddress || '192.168.1.100'}</span>
                  </td>
                  <td>
                    <span className="room-tag">
                      {dev.assignedRoomId ? dev.assignedRoomId.replace('_', ' ').toUpperCase() : 'UNASSIGNED'}
                    </span>
                  </td>
                  <td>
                    <div className="signal-cell">
                      <Wifi size={13} className="text-emerald-700" />
                      <span>{dev.signalDbm || '-42 dBm'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-slate-600 text-12">{dev.firmwareVersion || 'v1.0.0'}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="icon-btn danger"
                      title="Delete / Unpair device"
                      onClick={() => onDeleteDevice(dev.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Cards View */
        <div className="view-grid-3">
          {filteredDevices.map((dev) => (
            <div
              key={dev.id}
              className="card-box interactive-device-card"
              onClick={() => onSelectDeviceForDrawer({ type: 'device', data: dev })}
            >
              <div className="device-card-header">
                <div className="flex-row items-center gap-2">
                  <div className="device-avatar-icon">
                    {dev.model.includes('Doorbell') ? <Video size={16} /> : <Camera size={16} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px' }}>{dev.vendor} {dev.model}</h3>
                    <small className="text-slate-500">{dev.series} Grade</small>
                  </div>
                </div>
                <span className="status-dot-indicator online" />
              </div>

              <div className="device-card-metrics mt-3">
                <div className="metric-row">
                  <span className="label">MAC:</span>
                  <code className="mac-code">{dev.macAddress}</code>
                </div>
                <div className="metric-row">
                  <span className="label">IP Address:</span>
                  <span>{dev.ipAddress || '192.168.1.100'}</span>
                </div>
                <div className="metric-row">
                  <span className="label">Assigned Room:</span>
                  <strong className="text-primary">{dev.assignedRoomId ? dev.assignedRoomId.replace('_', ' ').toUpperCase() : 'UNASSIGNED'}</strong>
                </div>
                <div className="metric-row">
                  <span className="label">Wi-Fi RSSI:</span>
                  <span className="text-emerald-700 font-semibold">{dev.signalDbm || '-42 dBm'}</span>
                </div>
              </div>

              <div className="device-card-footer mt-3">
                <span className="text-11 text-slate-500">Firmware {dev.firmwareVersion}</span>
                <span className="view-details-link">
                  Details <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
