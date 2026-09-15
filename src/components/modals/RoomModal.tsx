import React from 'react'
import { X } from 'lucide-react'
import type { RingDeviceType, Room } from '../../domain/contracts'

export interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  editingRoom: Room | null
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
  roomFormData,
  setRoomFormData,
  handleSaveRoomSubmit,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingRoom ? 'Edit Room & Ring Device' : 'Add New Room & Pair Ring Camera'}</h2>
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
                placeholder="e.g. Patio & Backyard, Dining Room, Guest Suite"
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
                <label className="form-label">Ring Device Type</label>
                <select
                  className="form-select"
                  value={roomFormData.deviceType}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, deviceType: e.target.value as RingDeviceType })
                  }
                >
                  <option value="Indoor Cam">Indoor Cam</option>
                  <option value="Stick Up Cam">Stick Up Cam</option>
                  <option value="Video Doorbell">Video Doorbell</option>
                  <option value="Floodlight Cam">Floodlight Cam</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ring Device Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ring Backyard Stick Up"
                  value={roomFormData.deviceName}
                  onChange={(e) => setRoomFormData({ ...roomFormData, deviceName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ring Hardware Device ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. cam_patio_01"
                  value={roomFormData.deviceId}
                  onChange={(e) => setRoomFormData({ ...roomFormData, deviceId: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Signal Strength (dBm)</label>
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
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
