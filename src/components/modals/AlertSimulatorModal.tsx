import React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Flame,
  Play,
  X,
} from 'lucide-react'
import type { Room } from '../../domain/contracts'

export interface AlertSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  simRoomId: string
  setSimRoomId: (id: string) => void
  simScenario: 'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity'
  setSimScenario: (scenario: 'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity') => void
  simLoading: boolean
  displayRooms: Room[]
  handleRunDynamicSimulation: (
    roomId: string,
    scenario: 'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity'
  ) => Promise<void>
}

export const AlertSimulatorModal: React.FC<AlertSimulatorModalProps> = ({
  isOpen,
  onClose,
  simRoomId,
  setSimRoomId,
  simScenario,
  setSimScenario,
  simLoading,
  displayRooms,
  handleRunDynamicSimulation,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Dynamic Alert Simulator Studio</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
            Simulate live Ring event payloads targeting any user-configured zone to test the Scene Engine, Nova Micro
            context generator, and Validator PWA.
          </p>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">Target Zone / Room</label>
            <select
              className="form-select"
              value={simRoomId}
              onChange={(e) => setSimRoomId(e.target.value)}
            >
              {displayRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.deviceType || 'Ring Cam'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Simulation Scenario</label>
            <div className="preset-chip-group">
              {[
                { key: 'normal', label: 'Normal Routine (S1)', icon: <CheckCircle2 size={12} /> },
                { key: 'visitor', label: 'Visitor Doorbell (S2)', icon: <Eye size={12} /> },
                { key: 'distress', label: 'Elder Fall Distress (S3)', icon: <Flame size={12} /> },
                { key: 'critical', label: 'Device Offline Critical (S4)', icon: <AlertTriangle size={12} /> },
                { key: 'inactivity', label: 'Prolonged Inactivity (S2/S3)', icon: <Clock3 size={12} /> },
              ].map((sc) => (
                <button
                  type="button"
                  key={sc.key}
                  className={`preset-chip ${simScenario === sc.key ? 'active' : ''}`}
                  onClick={() =>
                    setSimScenario(sc.key as 'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity')
                  }
                >
                  {sc.icon} {sc.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="sim-button danger"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
            disabled={simLoading}
            onClick={() => handleRunDynamicSimulation(simRoomId, simScenario)}
          >
            <Play size={16} />{' '}
            {simLoading
              ? 'Transmitting Ring Payload...'
              : `Fire ${simScenario.toUpperCase()} Event to ${simRoomId.replace('_', ' ').toUpperCase()}`}
          </button>
        </div>
        <div className="modal-footer">
          <button type="button" className="sim-button secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
