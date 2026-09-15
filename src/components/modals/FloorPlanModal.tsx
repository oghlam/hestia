import React from 'react'
import { Map, X } from 'lucide-react'

export interface FloorPlanModalProps {
  isOpen: boolean
  onClose: () => void
  mapFormData: {
    presetName: string
    mapUrl: string
  }
  setMapFormData: React.Dispatch<
    React.SetStateAction<{
      presetName: string
      mapUrl: string
    }>
  >
  handleSaveHomeMap: (e: React.FormEvent) => Promise<void>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FloorPlanModal: React.FC<FloorPlanModalProps> = ({
  isOpen,
  onClose,
  mapFormData,
  setMapFormData,
  handleSaveHomeMap,
  handleFileUpload,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Floor Plan Blueprint & Map Settings</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveHomeMap}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Choose Blueprint Preset</label>
              <div className="preset-chip-group">
                {[
                  { name: 'Default Greenwood Blueprint', label: 'Greenwood Haven (SVG Blueprint)' },
                  { name: 'Elder Single-Story Cottage', label: 'Elder Single-Story Cottage' },
                  { name: 'Two-Story Residence', label: 'Two-Story Family Residence' },
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset.name}
                    className={`preset-chip ${mapFormData.presetName === preset.name ? 'active' : ''}`}
                    onClick={() => setMapFormData({ ...mapFormData, presetName: preset.name, mapUrl: '' })}
                  >
                    <Map size={13} /> {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Or Upload Custom Floor Plan Image</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handleFileUpload}
              />
              <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Supports PNG, JPG, or SVG architectural floor plans.
              </small>
            </div>
            <div className="form-group">
              <label className="form-label">Or Custom Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/my-floorplan.png"
                value={mapFormData.mapUrl}
                onChange={(e) =>
                  setMapFormData({ ...mapFormData, mapUrl: e.target.value, presetName: 'Custom Floor Plan URL' })
                }
              />
            </div>
            {mapFormData.mapUrl && (
              <div
                style={{
                  marginTop: '12px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  maxHeight: '140px',
                }}
              >
                <img
                  src={mapFormData.mapUrl}
                  alt="Floor plan preview"
                  style={{ width: '100%', height: '140px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="sim-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sim-button">
              Save Blueprint Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
