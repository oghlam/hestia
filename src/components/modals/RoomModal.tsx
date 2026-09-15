import React from 'react'
import { X } from 'lucide-react'
import type { RingDeviceType, RingMasterDevice, Room } from '../../domain/contracts'

export interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  editingRoom: Room | null
  masterDevices?: RingMasterDevice[]
  roomFormData: {
    name: string
    floor: string
    deviceId: string
    deviceName: string
    deviceType: RingDeviceType
    signalDbm: string
    mapX: number
    mapY: number
  }
  setRoomFormData: React.Dispatch<
    React.SetStateAction<{
      name: string
      floor: string
      deviceId: string
      deviceName: string
      deviceType: RingDeviceType
      signalDbm: string
      mapX: number
      mapY: number
    }>
  >
  handleSaveRoomSubmit: (e: React.FormEvent) => Promise<void>
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  editingRoom,
  masterDevices = [],
  roomFormData,
  setRoomFormData,
  handleSaveRoomSubmit,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingRoom ? 'Edit Room & Paired Device' : 'Add New Room & Pair Hardware'}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveRoomSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Room / Zone Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Living Room, Bedroom, Patio, Main Entrance"
                value={roomFormData.name}
                onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Floor / Zone</label>
                <select
                  className="form-select"
                  value={roomFormData.floor}
                  onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                >
                  <option value="Floor 1">Floor 1 (Ground)</option>
                  <option value="Floor 2">Floor 2 (Upper)</option>
                  <option value="Outdoor">Outdoor / Perimeter</option>
                  <option value="Basement">Basement</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Master Ring Device (Hardware Lock) *</label>
                <select
                  className="form-select"
                  value={roomFormData.deviceId}
                  onChange={(e) => {
                    const devId = e.target.value
                    const dev = masterDevices.find((d) => d.id === devId || d.macAddress === devId)
                    if (dev) {
                      setRoomFormData({
                        ...roomFormData,
                        deviceId: dev.id,
                        deviceType: dev.model,
                        deviceName: roomFormData.deviceName || `${dev.vendor} ${dev.model} (${dev.series})`,
                        signalDbm: dev.signalDbm || roomFormData.signalDbm,
                      })
                    } else {
                      setRoomFormData({ ...roomFormData, deviceId: devId })
                    }
                  }}
                >
                  <option value="">-- Choose Registered Master Device --</option>
                  {masterDevices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.vendor} {d.model} [{d.series}] · MAC: {d.macAddress} ({d.modelCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Custom Room Device Label</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ring Living Room Cam"
                  value={roomFormData.deviceName}
                  onChange={(e) => setRoomFormData({ ...roomFormData, deviceName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Device Type</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  style={{ background: '#f8fafc', color: '#64748b' }}
                  value={roomFormData.deviceType}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Signal Strength Telemetry</label>
              <select
                className="form-select"
                value={roomFormData.signalDbm}
                onChange={(e) => setRoomFormData({ ...roomFormData, signalDbm: e.target.value })}
              >
                <option value="Excellent · -38 dBm">Excellent · -38 dBm</option>
                <option value="Good · -54 dBm">Good · -54 dBm</option>
                <option value="Fair · -68 dBm">Fair · -68 dBm</option>
                <option value="Weak · -78 dBm">Weak · -78 dBm</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Floor Plan Position X: {roomFormData.mapX}%</label>
                <input
                  type="range"
                  min="5"
                  max="95"
                  className="form-input"
                  value={roomFormData.mapX}
                  onChange={(e) => setRoomFormData({ ...roomFormData, mapX: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Floor Plan Position Y: {roomFormData.mapY}%</label>
                <input
                  type="range"
                  min="5"
                  max="95"
                  className="form-input"
                  value={roomFormData.mapY}
                  onChange={(e) => setRoomFormData({ ...roomFormData, mapY: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button">
              {editingRoom ? 'Update Room Pairing' : 'Pair & Save Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
