import React, { useState, useRef } from 'react'
import {
  Cloud,
  Download,
  FileText,
  Grid3x3,
  Images,
  List,
  MapPin,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  User,
  X,
} from 'lucide-react'
import type { Asset } from '../domain/contracts'

export interface AssetsViewProps {
  assets: Asset[]
  residents: any[]
  careTeam: any[]
  onUploadAsset: (formData: FormData, type: string) => Promise<void>
  onDeleteAsset: (assetId: string) => Promise<void>
  onSetAsAvatar: (assetId: string, residentId?: string, memberId?: string) => Promise<void>
  isLoading: boolean
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'resident_photo' | 'care_team_photo' | 'floor_plan' | 'training_data'

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  residents,
  careTeam,
  onUploadAsset,
  onDeleteAsset,
  onSetAsAvatar,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadType, setUploadType] = useState<'resident_photo' | 'care_team_photo' | 'floor_plan' | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType
    const matchesSearch = !searchQuery || 
      asset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadType) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', uploadType)
    formData.append('label', file.name.replace(/\.[^/.]+$/, ''))

    try {
      await onUploadAsset(formData, uploadType)
      setShowUploadModal(false)
      setUploadType(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }

  const assetStats = {
    total: assets.length,
    residentPhotos: assets.filter(a => a.type === 'resident_photo').length,
    careTeamPhotos: assets.filter(a => a.type === 'care_team_photo').length,
    floorPlans: assets.filter(a => a.type === 'floor_plan').length,
    trainingData: assets.filter(a => a.type === 'training_data').length,
  }

  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Assets Library & Media Manager</h1>
          <p>Manage resident photos, care team avatars, floor plans, and training datasets</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="sim-button"
            style={{ fontSize: '12px' }}
            onClick={() => {
              setUploadType('resident_photo')
              setShowUploadModal(true)
            }}
          >
            <Plus size={14} /> Resident Photo
          </button>
          <button
            className="sim-button"
            style={{ fontSize: '12px' }}
            onClick={() => {
              setUploadType('care_team_photo')
              setShowUploadModal(true)
            }}
          >
            <Plus size={14} /> Care Team Avatar
          </button>
          <button
            className="sim-button"
            style={{ fontSize: '12px' }}
            onClick={() => {
              setUploadType('floor_plan')
              setShowUploadModal(true)
            }}
          >
            <Plus size={14} /> Floor Plan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="view-grid-4" style={{ marginBottom: '20px' }}>
        <div
          className="card-box"
          style={{
            padding: '14px',
            textAlign: 'center',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
            {assetStats.total}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Assets</div>
        </div>

        <div
          className="card-box"
          style={{
            padding: '14px',
            textAlign: 'center',
            background: '#fef3c7',
            border: '1px solid #fde68a',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>
            {assetStats.residentPhotos}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Resident Photos</div>
        </div>

        <div
          className="card-box"
          style={{
            padding: '14px',
            textAlign: 'center',
            background: '#dbeafe',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
            {assetStats.careTeamPhotos}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Care Team Photos</div>
        </div>

        <div
          className="card-box"
          style={{
            padding: '14px',
            textAlign: 'center',
            background: '#f3e8ff',
            border: '1px solid #e9d5ff',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
            {assetStats.floorPlans}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Floor Plans</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="card-box" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search assets by label or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`sim-button ${viewMode === 'grid' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px' }}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={14} />
            </button>
            <button
              className={`sim-button ${viewMode === 'list' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px' }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'resident_photo', 'care_team_photo', 'floor_plan'].map(type => (
            <button
              key={type}
              className={`sim-button ${filterType === type ? '' : 'secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setFilterType(type as FilterType)}
            >
              {type === 'all' && 'All'}
              {type === 'resident_photo' && <><User size={12} /> Resident</>}
              {type === 'care_team_photo' && <><Users size={12} /> Care Team</>}
              {type === 'floor_plan' && <><MapPin size={12} /> Floor Plan</>}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Display */}
      {filteredAssets.length === 0 ? (
        <div
          className="card-box"
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
          }}
        >
          <Cloud size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <strong>No assets found</strong>
          <p style={{ fontSize: '13px', margin: '4px 0 0' }}>
            {searchQuery ? 'Try adjusting your search' : 'Upload photos to get started'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {filteredAssets.map(asset => (
            <div key={asset.assetId} className="card-box" style={{ padding: '0', overflow: 'hidden' }}>
              <div
                style={{
                  width: '100%',
                  height: '160px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {asset.fileUrl.startsWith('data:') || asset.fileUrl.startsWith('/uploads/') ? (
                  <img
                    src={asset.fileUrl}
                    alt={asset.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <FileText size={40} style={{ color: '#cbd5e1' }} />
                )}
              </div>

              <div style={{ padding: '12px' }}>
                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px', color: '#0f172a' }}>
                  {asset.label}
                </strong>
                <small style={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  {asset.type.replace(/_/g, ' ').toUpperCase()}
                </small>

                {asset.residentId && (
                  <small style={{ color: '#3b82f6', display: 'block', marginBottom: '6px' }}>
                    <User size={10} /> {residents.find(r => r.id === asset.residentId)?.name || 'Unknown'}
                  </small>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="sim-button secondary"
                    style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                    onClick={() => onDeleteAsset(asset.assetId)}
                    disabled={isLoading}
                  >
                    <Trash2 size={12} />
                  </button>
                  <button
                    className="sim-button"
                    style={{ flex: 1, fontSize: '11px', padding: '6px' }}
                    onClick={() => window.open(asset.fileUrl, '_blank')}
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-box">
          <table className="table-responsive" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Label</th>
                <th>Type</th>
                <th>Size</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.assetId}>
                  <td>
                    <strong>{asset.label}</strong>
                    <br />
                    <small style={{ color: '#64748b' }}>{asset.fileName}</small>
                  </td>
                  <td>
                    <span className="badge normal">{asset.type.replace(/_/g, ' ')}</span>
                  </td>
                  <td>
                    <small>{(Math.random() * 5 + 0.5).toFixed(1)} MB</small>
                  </td>
                  <td>
                    <small>{new Date(asset.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="sim-button secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => onDeleteAsset(asset.assetId)}
                      disabled={isLoading}
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      className="sim-button"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => window.open(asset.fileUrl, '_blank')}
                    >
                      <Download size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card-box" style={{ width: '90%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Upload {uploadType?.replace(/_/g, ' ')}</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadType(null)
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '30px',
                textAlign: 'center',
                marginBottom: '16px',
                cursor: 'pointer',
                background: '#f8fafc',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} style={{ margin: '0 auto 12px', color: '#64748b' }} />
              <strong>Click to upload</strong>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>or drag and drop</p>
              <small style={{ color: '#94a3b8' }}>PNG, JPG up to 10MB</small>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <button
              className="sim-button secondary"
              style={{ width: '100%' }}
              onClick={() => {
                setShowUploadModal(false)
                setUploadType(null)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
