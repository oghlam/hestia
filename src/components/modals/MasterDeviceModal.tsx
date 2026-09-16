import React, { useState } from 'react'
import { X, Network, Wifi } from 'lucide-react'
import type { RingDeviceType, RingMasterDevice } from '../../domain/contracts'

export interface MasterDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (deviceData: {
    ipAddress: string
    macAddress: string
    vendor: 'Ring'
    series: 'Plus' | 'Pro' | 'Elite' | 'Standard'
    model: RingDeviceType
    signalDbm: string
    status: 'online' | 'offline' | 'paired'
  }) => Promise<void>
}

export const MasterDeviceModal: React.FC<MasterDeviceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [ipAddress, setIpAddress] = useState('192.168.1.115')
  const [macAddress, setMacAddress] = useState('9C:76:13:FF:EE:AA')
  const [deviceLabel, setDeviceLabel] = useState('Ring Indoor Cam Plus')
  const [model, setModel] = useState<RingDeviceType>('Indoor Cam')
  const [series, setSeries] = useState<'Plus' | 'Pro' | 'Elite' | 'Standard'>('Plus')
  const [signalQuality] = useState('Excellent · -42 dBm')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleIpChange = (val: string) => {
    setIpAddress(val)
    const lastOctet = parseInt(val.split('.').pop() || '100', 10)
    const hex1 = (lastOctet * 7).toString(16).toUpperCase().padStart(2, '0')
    const hex2 = (lastOctet * 13 % 255).toString(16).toUpperCase().padStart(2, '0')
    setMacAddress(`9C:76:13:${hex1}:${hex2}:B9`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({
        ipAddress: ipAddress.trim() || '192.168.1.150',
        macAddress: macAddress.trim() || '9C:76:13:AB:CD:EF',
        vendor: 'Ring',
        series,
        model,
        signalDbm: signalQuality,
        status: 'online',
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} style={{ color: '#0284c7' }} />
            <h2>Register Master Ring Device</h2>
          </div>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Connected Device IP Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 192.168.1.115"
                value={ipAddress}
                onChange={(e) => handleIpChange(e.target.value)}
                required
              />
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                MAC Address and telemetry parameters automatically synchronize upon IP adoption.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Device Label / Name</label>
              <input
                type="text"
                className="form-input"
                value={deviceLabel}
                onChange={(e) => setDeviceLabel(e.target.value)}
                required
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">MAC Address (Locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value={macAddress}
                  disabled
                  style={{ background: '#f8fafc', fontWeight: 600, fontFamily: 'monospace', color: '#64748b' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Vendor (Locked)</label>
                <input
                  type="text"
                  className="form-input"
                  value="Ring"
                  disabled
                  style={{ background: '#f8fafc', fontWeight: 600, color: '#64748b' }}
                />
              </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Hardware Type</label>
                <select
                  className="form-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value as RingDeviceType)}
                >
                  <option value="Indoor Cam">Indoor Cam</option>
                  <option value="Stick Up Cam">Stick Up Cam</option>
                  <option value="Video Doorbell">Video Doorbell</option>
                  <option value="Floodlight Cam">Floodlight Cam</option>
                  <option value="Spotlight Cam">Spotlight Cam</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Series</label>
                <select
                  className="form-input"
                  value={series}
                  onChange={(e) => setSeries(e.target.value as any)}
                >
                  <option value="Plus">Plus</option>
                  <option value="Pro">Pro</option>
                  <option value="Elite">Elite</option>
                  <option value="Standard">Standard</option>
                </select>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Wifi size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#334155' }}>
                <strong>Status:</strong> Connected · Signal Power <code>{signalQuality}</code>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button" disabled={isSubmitting}>
              {isSubmitting ? 'Adopting...' : 'Adopt & Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
