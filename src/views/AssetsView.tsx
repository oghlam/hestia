import React, { useState, useRef } from 'react'
import {
  Cloud,
  Download,
  FileText,
  Grid3x3,
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

type ViewMode = 'list' | 'grid'
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
  const [viewMode, setViewMode] = useState<ViewMode>('list')
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

  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Assets & Media Library</h1>
          <p>Manage resident photos, care team avatars, floor plans, and camera training snapshots</p>
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

      {/* Search & Filter Toolbar */}
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
              className={`sim-button ${viewMode === 'list' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px' }}
              onClick={() => setViewMode('list')}
              title="Table List View"
            >
              <List size={14} /> Table
            </button>
            <button
              className={`sim-button ${viewMode === 'grid' ? '' : 'secondary'}`}
              style={{ padding: '8px 12px' }}
              onClick={() => setViewMode('grid')}
              title="Thumbnail Grid View"
            >
              <Grid3x3 size={14} /> Grid
            </button>
          </div>
        </div>

        {/* Type Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'resident_photo', 'care_team_photo', 'floor_plan', 'training_data'] as FilterType[]).map(type => (
            <button
              key={type}
              className={`sim-button ${filterType === type ? '' : 'secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => setFilterType(type)}
            >
              {type === 'all' && 'All Assets'}
              {type === 'resident_photo' && <><User size={12} /> Resident Photos</>}
              {type === 'care_team_photo' && <><Users size={12} /> Care Team</>}
              {type === 'floor_plan' && <><MapPin size={12} /> Floor Plans</>}
              {type === 'training_data' && <><Cloud size={12} /> Training Snapshots</>}
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
          <strong>No media assets found</strong>
          <p style={{ fontSize: '13px', margin: '4px 0 0' }}>
            {searchQuery ? 'No assets match your search query.' : 'Upload photos above or capture snapshots from the pipeline camera.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="card-box">
          <table className="table-responsive" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Preview</th>
                <th>Asset Label & Filename</th>
                <th>Category</th>
                <th>Attached Profile</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => {
                const isImage = asset.fileUrl && (asset.fileUrl.startsWith('data:image/') || asset.fileUrl.startsWith('/uploads/') || asset.fileUrl.startsWith('http'))
                const residentName = asset.residentId ? residents.find(r => r.id === asset.residentId)?.name : null
                const memberName = asset.careTeamMemberId ? careTeam.find(m => m.id === asset.careTeamMemberId)?.name : null

                return (
                  <tr key={asset.assetId}>
                    <td>
                      <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isImage ? (
                          <img src={asset.fileUrl} alt={asset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FileText size={20} style={{ color: '#94a3b8' }} />
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{asset.label}</strong>
                      <small style={{ color: '#64748b', display: 'block', fontSize: '11px', fontFamily: 'monospace' }}>{asset.fileName}</small>
                    </td>
                    <td>
                      <span className="badge normal" style={{ textTransform: 'capitalize' }}>
                        {asset.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {residentName ? (
                        <span style={{ fontSize: '12px', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> {residentName}
                        </span>
                      ) : memberName ? (
                        <span style={{ fontSize: '12px', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={12} /> {memberName}
                        </span>
                      ) : (
                        <small style={{ color: '#94a3b8' }}>Unattached</small>
                      )}
                    </td>
                    <td>
                      <small style={{ color: '#64748b' }}>{new Date(asset.createdAt).toLocaleDateString()} {new Date(asset.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-icon-action primary"
                          style={{ width: 'auto', padding: '4px 8px', fontSize: '11px', display: 'inline-flex', gap: '4px' }}
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = asset.fileUrl
                            link.download = asset.fileName
                            link.target = '_blank'
                            link.click()
                          }}
                          title="Download Asset"
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          className="btn-icon-action danger"
                          onClick={() => onDeleteAsset(asset.assetId)}
                          disabled={isLoading}
                          title="Delete Asset"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
          {filteredAssets.map(asset => {
            const isImage = asset.fileUrl && (asset.fileUrl.startsWith('data:image/') || asset.fileUrl.startsWith('/uploads/') || asset.fileUrl.startsWith('http'))
            return (
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
                  {isImage ? (
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
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = asset.fileUrl
                        link.download = asset.fileName
                        link.target = '_blank'
                        link.click()
                      }}
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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
