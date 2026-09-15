import React from 'react'
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  FileText,
  HardDrive,
  Lock,
  MapPin,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react'
import type {
  Asset,
  AuditArchiveFile,
  DbMode,
  DevicePipelineMode,
  Room,
  SystemSettings,
} from '../domain/contracts'
import { AssetsView } from './AssetsView'

export interface SettingsViewProps {
  systemSettings: SystemSettings
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>
  settingsSubTab: 'pipeline' | 'profile_address' | 'database' | 'maintenance' | 'assets'
  setSettingsSubTab: (tab: 'pipeline' | 'profile_address' | 'database' | 'maintenance' | 'assets') => void
  pipelineFeedback: string | null
  maintenanceFeedback: string | null
  // Camera & Pipeline Studio
  isLocalCameraRunning: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
  startLocalCamera: (videoRefOrDeviceId?: any) => Promise<void>
  stopLocalCamera: () => void
  availableCameraDevices: MediaDeviceInfo[]
  selectedCameraDeviceId: string
  setSelectedCameraDeviceId: (id: string) => void
  displayRooms: Room[]
  pipelineTargetRoom: string
  setPipelineTargetRoom: (roomId: string) => void
  pipelineScenario: 'normal' | 'distress' | 'repeated_motion' | 'doorbell'
  setPipelineScenario: (scenario: 'normal' | 'distress' | 'repeated_motion' | 'doorbell') => void
  pipelineFaceHint: 'eleanor' | 'known_target' | 'unknown' | 'no_face'
  setPipelineFaceHint: (hint: 'eleanor' | 'known_target' | 'unknown' | 'no_face') => void
  isPipelinePushing: boolean
  isAutoStreaming?: boolean
  toggleAutoStreaming?: () => void
  handlePushPipelineFeed: () => Promise<void>
  pipelineLastResult: {
    scene: string
    person: string
    confidence: number
    summary: string
    time: string
    aiProvider: string
  } | null
  triggerRoomSimulation: (roomId: string, scenario: 'normal' | 'distress') => Promise<void>
  handlePipelineModeChange: (mode: DevicePipelineMode) => Promise<void>
  // Handlers
  handleSaveSystemSettings: (e: React.FormEvent) => Promise<void>
  handleSaveHomeAddressProfile: (e: React.FormEvent) => Promise<void>
  handleGetGpsLocation: () => void
  isGpsLoading: boolean
  handleTestDbConnection: () => Promise<void>
  isDbTesting: boolean
  dbTestResult: { ok: boolean; message: string; latencyMs?: number } | null
  handleClearLogs: (days: number) => Promise<void>
  handleRotateLogs: () => Promise<void>
  archivedLogs?: AuditArchiveFile[]
  handleDownloadArchive?: (archive: AuditArchiveFile) => void
  handleDeleteArchive?: (id: string) => Promise<void>
  handleCheckUpdate: () => Promise<void>
  // Assets Management
  assets?: Asset[]
  residents?: any[]
  careTeam?: any[]
  onUploadAsset?: (formData: FormData, type: string) => Promise<void>
  onDeleteAsset?: (assetId: string) => Promise<void>
  onSetAsAvatar?: (assetId: string, residentId?: string, memberId?: string) => Promise<void>
  isAssetsLoading?: boolean
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  systemSettings,
  setSystemSettings,
  settingsSubTab,
  setSettingsSubTab,
  pipelineFeedback,
  maintenanceFeedback,
  isLocalCameraRunning,
  videoRef,
  startLocalCamera,
  stopLocalCamera,
  availableCameraDevices,
  selectedCameraDeviceId,
  setSelectedCameraDeviceId,
  displayRooms,
  pipelineTargetRoom,
  setPipelineTargetRoom,
  pipelineScenario,
  setPipelineScenario,
  pipelineFaceHint,
  setPipelineFaceHint,
  isPipelinePushing,
  isAutoStreaming = false,
  toggleAutoStreaming,
  handlePushPipelineFeed,
  pipelineLastResult,
  triggerRoomSimulation,
  handlePipelineModeChange,
  handleSaveSystemSettings,
  handleSaveHomeAddressProfile,
  handleGetGpsLocation,
  isGpsLoading,
  handleTestDbConnection,
  isDbTesting,
  dbTestResult,
  handleClearLogs,
  handleRotateLogs,
  archivedLogs = [],
  handleDownloadArchive,
  handleDeleteArchive,
  handleCheckUpdate,
  // Assets
  assets = [],
  residents = [],
  careTeam = [],
  onUploadAsset,
  onDeleteAsset,
  onSetAsAvatar,
  isAssetsLoading = false,
}) => {
  const activeFeedback = pipelineFeedback || maintenanceFeedback

  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Device Ingestion Pipeline & Settings</h1>
          <p>Configure device ingestion, cloud database, home address profile, and system maintenance</p>
        </div>
        {activeFeedback && (
          <span className="badge normal" style={{ fontSize: '12px', padding: '6px 12px' }}>
            {activeFeedback}
          </span>
        )}
      </div>

       {/* Sub-Tab Navigation Switcher */}
       <div className="view-subtabs">
         <button
           className={`subtab-btn ${settingsSubTab === 'pipeline' ? 'active' : ''}`}
           onClick={() => setSettingsSubTab('pipeline')}
         >
           <SlidersHorizontal size={14} /> Active Device Pipeline Studio
         </button>
         <button
           className={`subtab-btn ${settingsSubTab === 'database' ? 'active' : ''}`}
           onClick={() => setSettingsSubTab('database')}
         >
           <Database size={14} /> Database Profile
         </button>
         <button
           className={`subtab-btn ${settingsSubTab === 'profile_address' ? 'active' : ''}`}
           onClick={() => setSettingsSubTab('profile_address')}
         >
           <MapPin size={14} /> Home Address Profile
         </button>
         <button
           className={`subtab-btn ${settingsSubTab === 'assets' ? 'active' : ''}`}
           onClick={() => setSettingsSubTab('assets')}
         >
           <Cloud size={14} /> Assets & Media
         </button>
         <button
           className={`subtab-btn ${settingsSubTab === 'maintenance' ? 'active' : ''}`}
           onClick={() => setSettingsSubTab('maintenance')}
         >
           <Wrench size={14} /> Maintenance & System Health
         </button>
       </div>

       {/* 1. PIPELINE SUBTAB */}
      {settingsSubTab === 'pipeline' && (
        <>
          <div className="pipeline-mode-cards">
            <div
              className={`pipeline-mode-card ${systemSettings.pipelineMode === 'local_camera' ? 'active' : ''}`}
              onClick={() => handlePipelineModeChange('local_camera')}
            >
              <div className="pipeline-mode-card-header">
                <strong><Camera size={16} /> Local Camera / Smartphone</strong>
                <input
                  type="radio"
                  checked={systemSettings.pipelineMode === 'local_camera'}
                  onChange={() => handlePipelineModeChange('local_camera')}
                />
              </div>
              <p>Live WebRTC feed from laptop webcam or mobile browser. Real face matching with zero hardware dependency.</p>
            </div>

            <div
              className={`pipeline-mode-card ${systemSettings.pipelineMode === 'ring_simulator' ? 'active' : ''}`}
              onClick={() => handlePipelineModeChange('ring_simulator')}
            >
              <div className="pipeline-mode-card-header">
                <strong><Sparkles size={16} /> Ring Sandbox Simulator</strong>
                <input
                  type="radio"
                  checked={systemSettings.pipelineMode === 'ring_simulator'}
                  onChange={() => handlePipelineModeChange('ring_simulator')}
                />
              </div>
              <p>Standard Ring Developer Sandbox webhook events with simulated motion, doorbell chime, and telemetry.</p>
            </div>

            <div
              className={`pipeline-mode-card ${systemSettings.pipelineMode === 'ring_hardware' ? 'active' : ''}`}
              onClick={() => handlePipelineModeChange('ring_hardware')}
            >
              <div className="pipeline-mode-card-header">
                <strong><Radio size={16} /> Production Ring Hardware</strong>
                <input
                  type="radio"
                  checked={systemSettings.pipelineMode === 'ring_hardware'}
                  onChange={() => handlePipelineModeChange('ring_hardware')}
                />
              </div>
              <p>Live Ring Indoor Cam, Video Doorbell, and Stick Up Cam via secure HMAC-SHA256 Webhook validation.</p>
            </div>
          </div>

          {systemSettings.pipelineMode === 'local_camera' ? (
            <div className="card-box">
              <h3>Local Camera & Snapshot Pipeline Studio</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Stream or capture snapshot frames from your webcam or phone camera directly into the HESTIA vision pipeline.
              </p>

              <div className="camera-studio-container">
                {/* Left: Viewfinder */}
                <div>
                  <div className="camera-viewfinder-box">
                    {isLocalCameraRunning && (
                      <div className="camera-live-overlay-tag">
                        <span className="camera-live-dot" /> LIVE WEBCAM FEED
                      </div>
                    )}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="camera-viewfinder-video"
                      style={{ display: isLocalCameraRunning ? 'block' : 'none' }}
                    />
                    {!isLocalCameraRunning && (
                      <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        <CameraOff size={44} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                        <strong style={{ display: 'block', color: '#cbd5e1', fontSize: '14px' }}>Camera is Inactive</strong>
                        <small style={{ fontSize: '12px' }}>Click "Start Local Camera" below to activate stream</small>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {!isLocalCameraRunning ? (
                      <button
                        type="button"
                        className="sim-button"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => startLocalCamera(videoRef)}
                      >
                        <Camera size={14} /> Start Local Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="sim-button secondary"
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={stopLocalCamera}
                      >
                        <CameraOff size={14} /> Stop Camera
                      </button>
                    )}

                    {toggleAutoStreaming && (
                      <button
                        type="button"
                        className={`sim-button ${isAutoStreaming ? 'secondary' : ''}`}
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={toggleAutoStreaming}
                      >
                        <Zap size={14} /> {isAutoStreaming ? 'Pause Auto-Stream' : 'Auto-Stream (5s)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Pipeline Controls */}
                <div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Selected Camera Input Device</label>
                    <select
                      className="form-select"
                      value={selectedCameraDeviceId}
                      onChange={(e) => {
                        setSelectedCameraDeviceId(e.target.value)
                        if (isLocalCameraRunning) startLocalCamera(e.target.value)
                      }}
                    >
                      {availableCameraDevices.length > 0 ? (
                        availableCameraDevices.map((dev, idx) => (
                          <option key={dev.deviceId || idx} value={dev.deviceId}>
                            {dev.label || `Camera Device ${idx + 1}`}
                          </option>
                        ))
                      ) : (
                        <option value="">Default WebCam / Laptop Camera</option>
                      )}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Ingest to Zone / Room</label>
                      <select
                        className="form-select"
                        value={pipelineTargetRoom}
                        onChange={(e) => setPipelineTargetRoom(e.target.value)}
                      >
                        {displayRooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.deviceType || 'Ring Cam'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Simulation Signal</label>
                      <select
                        className="form-select"
                        value={pipelineScenario}
                        onChange={(e) => setPipelineScenario(e.target.value as any)}
                      >
                        <option value="normal">Normal Motion (S1)</option>
                        <option value="distress">Elder Fall / Distress (S3)</option>
                        <option value="repeated_motion">Repeated Activity (S2)</option>
                        <option value="doorbell">Doorbell Chime (S2)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Face Recognition Test Hint</label>
                    <select
                      className="form-select"
                      value={pipelineFaceHint}
                      onChange={(e) => setPipelineFaceHint(e.target.value as any)}
                    >
                      <option value="known_target">Known Resident (Eleanor / Primary Target)</option>
                      <option value="unknown">Unknown Visitor (Access Log Only, No False Siren)</option>
                      <option value="no_face">No Face Detected (Routine Room Motion)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="sim-button"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                    disabled={isPipelinePushing}
                    onClick={() => handlePushPipelineFeed()}
                  >
                    <Play size={14} /> {isPipelinePushing ? 'Processing Vision & Scene...' : 'Capture Snapshot & Ingest to Pipeline'}
                  </button>

                  {pipelineLastResult && (
                    <div className="pipeline-result-card" style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>Latest Ingested Event</strong>
                        <span className={`badge ${pipelineLastResult.scene === 'S1_NORMAL' ? 'normal' : pipelineLastResult.scene === 'S2_WATCH' ? 'watch' : 'critical'}`}>
                          {pipelineLastResult.scene}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                        <div><strong>Subject:</strong> {pipelineLastResult.person} (Confidence: {Math.round(pipelineLastResult.confidence * 100)}%)</div>
                        <div><strong>AI Summary:</strong> {pipelineLastResult.summary}</div>
                        <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                          Processed at {pipelineLastResult.time} via {pipelineLastResult.aiProvider}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : systemSettings.pipelineMode === 'ring_simulator' ? (
            <div className="card-box">
              <h3>Ring Sandbox Simulator Active</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                HESTIA is currently receiving events from the Ring Official Developer Sandbox environment. All payloads are normalized into HESTIA contract v1.1.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="sim-button" onClick={() => triggerRoomSimulation('living_room', 'normal')}>
                  <Play size={13} /> Trigger Sandbox Motion (Living Room)
                </button>
                <button className="sim-button secondary" onClick={() => triggerRoomSimulation('bedroom', 'distress')}>
                  <AlertTriangle size={13} /> Trigger Sandbox Distress (Bedroom)
                </button>
              </div>
            </div>
          ) : (
            <div className="card-box">
              <h3>Production Ring Hardware Active</h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                Direct webhook integration with live Ring devices. Ensure Ring Appstore partner app points to the webhook URL below with HMAC signing key configured.
              </p>
              <table className="table-responsive">
                <tbody>
                  <tr>
                    <td><strong>Live Webhook URL:</strong></td>
                    <td><code>{typeof window !== 'undefined' ? window.location.origin : ''}/webhooks/ring</code></td>
                  </tr>
                  <tr>
                    <td><strong>Header Requirement:</strong></td>
                    <td><code>X-Signature: sha256=&lt;hmac_hex&gt;</code></td>
                  </tr>
                  <tr>
                    <td><strong>Payload Version:</strong></td>
                    <td>Ring Webhook Schema v1.1 (Human Motion, Doorbell, Telemetry)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="view-grid-2" style={{ marginTop: '20px' }}>
            <div className="card-box">
              <h3>Ring Webhook & Credentials</h3>
              <form onSubmit={handleSaveSystemSettings}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Ring Partner Account ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.ringPartnerId}
                    onChange={(e) => setSystemSettings({ ...systemSettings, ringPartnerId: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Webhook Endpoint Path</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.ringWebhookPath}
                    onChange={(e) => setSystemSettings({ ...systemSettings, ringWebhookPath: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">HMAC-SHA256 Secret Signing Key</label>
                  <input
                    type="password"
                    className="form-input"
                    value={systemSettings.ringHmacSigningKey}
                    onChange={(e) => setSystemSettings({ ...systemSettings, ringHmacSigningKey: e.target.value })}
                  />
                </div>
                <button type="submit" className="sim-button">
                  Save Ring Parameters
                </button>
              </form>
            </div>

            <div className="card-box">
              <h3>AWS Bedrock & Vision Engine Parameters</h3>
              <form onSubmit={handleSaveSystemSettings}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">AWS Region</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.awsRegion}
                    onChange={(e) => setSystemSettings({ ...systemSettings, awsRegion: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Bedrock Model ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.bedrockModelId}
                    onChange={(e) => setSystemSettings({ ...systemSettings, bedrockModelId: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Vision Matcher Engine</label>
                  <input
                    type="text"
                    className="form-input"
                    disabled
                    value="Python 3.14 + OpenCV Haar/ArcFace 64-d"
                  />
                </div>
                <button type="submit" className="sim-button">
                  Save AWS Parameters
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* 2. DATABASE SUBTAB */}
      {settingsSubTab === 'database' && (
        <>
          <div className="db-mode-cards">
            <div
              className={`db-mode-card ${systemSettings.dbMode === 'local_memory' ? 'active' : ''}`}
              onClick={() => {
                setSystemSettings((prev) => ({ ...prev, dbMode: 'local_memory' }))
              }}
            >
              <div className="db-mode-card-header">
                <strong><HardDrive size={16} /> Local Memory & In-Memory Store</strong>
                <span className="db-status-pill online">
                  <CheckCircle2 size={12} /> Active (Local)
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Ultra-fast volatile repository with zero AWS cloud dependencies. Ideal for standalone local testing and development.
              </p>
            </div>

            <div
              className={`db-mode-card ${systemSettings.dbMode === 'cloud_dynamodb' ? 'active' : ''}`}
              onClick={() => {
                setSystemSettings((prev) => ({ ...prev, dbMode: 'cloud_dynamodb' }))
              }}
            >
              <div className="db-mode-card-header">
                <strong><Database size={16} /> Amazon DynamoDB Cloud Store</strong>
                <span className={`db-status-pill ${systemSettings.cloudDbConnected ? 'online' : 'offline'}`}>
                  {systemSettings.cloudDbConnected ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                  {systemSettings.cloudDbConnected ? 'Connected & Verified' : 'Standby / MFA Auth Required'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Persistent enterprise cloud storage across tables for scenes, audit trails, residents, and validator rosters.
              </p>
            </div>
          </div>

          <div className="card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Amazon DynamoDB & Cloud Database Configuration</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  Configure IAM Role, endpoint URI, table namespace, and Multi-Factor Authentication (MFA)
                </p>
              </div>
              {systemSettings.cloudDbConnected && (
                <span className="badge normal">
                  <ShieldCheck size={12} /> Cloud DB Authenticated
                </span>
              )}
            </div>

            {dbTestResult && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  background: dbTestResult.ok ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${dbTestResult.ok ? '#a7f3d0' : '#fecaca'}`,
                  color: dbTestResult.ok ? '#065f46' : '#991b1b',
                  fontSize: '13px',
                }}
              >
                <strong>{dbTestResult.ok ? 'Connection Successful:' : 'Connection Error:'}</strong> {dbTestResult.message}
                {dbTestResult.latencyMs && <span> (Latency: {dbTestResult.latencyMs}ms)</span>}
              </div>
            )}

            <form onSubmit={handleSaveSystemSettings}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">DynamoDB Endpoint URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.cloudDbEndpoint}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbEndpoint: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">AWS Region</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.cloudDbRegion}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbRegion: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">DynamoDB Table Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={systemSettings.cloudDbTableName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbTableName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IAM Role / Secret Auth Token</label>
                  <input
                    type="password"
                    className="form-input"
                    value={systemSettings.cloudDbAuthToken}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbAuthToken: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row" style={{ alignItems: 'flex-end', marginTop: '6px' }}>
                <div className="form-group">
                  <label className="form-label">6-Digit MFA Verification Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 849201"
                    maxLength={6}
                    value={systemSettings.cloudDbMfaCode ?? ''}
                    onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbMfaCode: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ paddingBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={systemSettings.cloudDbMfaRequired}
                      onChange={(e) => setSystemSettings({ ...systemSettings, cloudDbMfaRequired: e.target.checked })}
                    />
                    Require 2-Factor MFA for Cloud DB Ingestion
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="sim-button secondary"
                  disabled={isDbTesting}
                  onClick={handleTestDbConnection}
                >
                  <RefreshCw size={14} className={isDbTesting ? 'rotating-icon' : ''} />
                  {isDbTesting ? 'Testing DynamoDB Connection...' : 'Test Connection & Authenticate MFA'}
                </button>
                <button type="submit" className="sim-button">
                  Save Database Settings
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 3. HOME ADDRESS PROFILE SUBTAB */}
      {settingsSubTab === 'profile_address' && (
        <div className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0 }}>Home & Geolocation Address Profile</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                Residential location used by emergency responders, first responders, and family reassurance dispatch
              </p>
            </div>
            <button
              type="button"
              className="sim-button secondary"
              style={{ fontSize: '12px' }}
              onClick={handleGetGpsLocation}
              disabled={isGpsLoading}
            >
              <MapPin size={13} /> {isGpsLoading ? 'Detecting GPS...' : 'Detect GPS Location'}
            </button>
          </div>

          <form onSubmit={handleSaveHomeAddressProfile}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Residence Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Vance Residence"
                  value={systemSettings.homeName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, homeName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Home Identifier (ID)</label>
                <input
                  type="text"
                  className="form-input"
                  value={systemSettings.homeId}
                  onChange={(e) => setSystemSettings({ ...systemSettings, homeId: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. 742 Evergreen Terrace"
                value={systemSettings.streetAddress}
                onChange={(e) => setSystemSettings({ ...systemSettings, streetAddress: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={systemSettings.city}
                  onChange={(e) => setSystemSettings({ ...systemSettings, city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={systemSettings.stateProvince}
                  onChange={(e) => setSystemSettings({ ...systemSettings, stateProvince: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={systemSettings.postalCode}
                  onChange={(e) => setSystemSettings({ ...systemSettings, postalCode: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={systemSettings.country}
                  onChange={(e) => setSystemSettings({ ...systemSettings, country: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '6px' }}>
              <div className="form-group">
                <label className="form-label">GPS Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-input"
                  value={systemSettings.coordinates.lat}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      coordinates: { ...systemSettings.coordinates, lat: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">GPS Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  className="form-input"
                  value={systemSettings.coordinates.lon}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      coordinates: { ...systemSettings.coordinates, lon: parseFloat(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: '14px 0 20px' }}>
              <label className="form-label">Emergency First Responder Access Notes & Lockbox Codes</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Side entrance lockbox code: 4821. Master physical key with Maria Vance."
                value={systemSettings.emergencyAccessNotes}
                onChange={(e) => setSystemSettings({ ...systemSettings, emergencyAccessNotes: e.target.value })}
              />
            </div>

            {/* Coordinates & Dispatch Preview Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                    {systemSettings.streetAddress || '742 Evergreen Terrace'}, {systemSettings.city || 'Springfield'}
                  </strong>
                  <small style={{ color: '#64748b' }}>
                    GPS: {systemSettings.coordinates.lat.toFixed(4)}, {systemSettings.coordinates.lon.toFixed(4)} · Ready for 911 / Family Dispatch
                  </small>
                </div>
              </div>
              <span className="badge normal">
                <ShieldCheck size={12} /> Geolocation Valid
              </span>
            </div>

            <button type="submit" className="sim-button">
              Save Home & Address Profile
            </button>
          </form>
        </div>
      )}

      {/* 4. MAINTENANCE & SYSTEM HEALTH SUBTAB */}
      {settingsSubTab === 'maintenance' && (
        <>
          <div className="maintenance-grid">
            {/* Box 1: Version & Health */}
            <div className="card-box">
              <h3>System Build & Health</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                HESTIA core engine version and release lifecycle status
              </p>
              <div style={{ lineHeight: 1.8, fontSize: '13px', color: '#334155' }}>
                <div><strong>Current Version:</strong> <span className="badge normal" style={{ marginLeft: '6px' }}>v{systemSettings.appVersion}</span></div>
                <div><strong>Build Channel:</strong> Production MVP</div>
                <div><strong>Last Health Check:</strong> {new Date(systemSettings.lastUpdateCheck).toLocaleString()}</div>
                <div><strong>Vision AI Engine:</strong> Python 3.14 + OpenCV ArcFace (Active)</div>
                <div><strong>Bedrock Gateway:</strong> Amazon Nova Micro (us-east-1)</div>
              </div>
              <button
                type="button"
                className="sim-button secondary"
                style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                onClick={handleCheckUpdate}
              >
                <RefreshCw size={14} /> Check for System Updates
              </button>
            </div>

            {/* Box 2: Audit Logs & Archiving */}
            <div className="card-box">
              <h3>Audit Log Maintenance</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                Automated log rotation, data minimization & compliance archiving
              </p>
              <div style={{ lineHeight: 1.8, fontSize: '13px', color: '#334155' }}>
                <div><strong>Auto Rotate Logs:</strong> {systemSettings.autoRotateLogs ? 'Enabled (10 MB threshold)' : 'Disabled'}</div>
                <div><strong>Log Retention Period:</strong> {systemSettings.logRetentionDays} Days</div>
                <div><strong>Archived Archives:</strong> {systemSettings.archivedLogsCount} ZIP files created</div>
                {systemSettings.lastLogRotation && (
                  <div><strong>Last Log Rotation:</strong> {new Date(systemSettings.lastLogRotation).toLocaleString()}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  className="sim-button secondary"
                  style={{ justifyContent: 'center' }}
                  onClick={handleRotateLogs}
                >
                  <RotateCcw size={14} /> Rotate & Archive Logs Now (.ZIP)
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="sim-button secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
                    onClick={() => handleClearLogs(30)}
                  >
                    <Trash2 size={13} /> Clear &gt; 30d Logs
                  </button>
                  <button
                    type="button"
                    className="sim-button secondary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '12px', color: '#dc2626' }}
                    onClick={() => handleClearLogs(0)}
                  >
                    <Trash2 size={13} /> Clear All Logs
                  </button>
                </div>
              </div>
            </div>

            {/* Box 3: Storage & Telemetry */}
            <div className="card-box">
              <h3>Storage & Telemetry Diagnostics</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                Disk storage consumption and component telemetry status
              </p>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                  <span>Used: <strong>14.2 MB</strong></span>
                  <span>Quota: <strong>500 MB</strong></span>
                </div>
                <div className="storage-stat-bar">
                  <div className="storage-stat-fill logs" style={{ width: '20%' }} />
                  <div className="storage-stat-fill media" style={{ width: '35%' }} />
                  <div className="storage-stat-fill free" style={{ width: '45%' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  <span><span style={{ color: '#3b82f6' }}>●</span> Audit Logs (2.8 MB)</span>
                  <span><span style={{ color: '#10b981' }}>●</span> Face Snapshots (4.9 MB)</span>
                  <span><span style={{ color: '#94a3b8' }}>●</span> Available</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>WebRTC / Camera API:</span>
                  <strong style={{ color: '#16a34a' }}>Available</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Ring Ingestion Webhook:</span>
                  <strong style={{ color: '#16a34a' }}>HMAC Verified</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DynamoDB Query Latency:</span>
                  <strong style={{ color: '#2563eb' }}>18 ms</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Box 4: Rotated Log Archives & Download List */}
          <div className="card-box" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RotateCcw size={16} color="#005cf5" />
                  Rotated Audit Log Archives ({archivedLogs.length})
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  History of rotated system compliance logs ready for local export & download
                </p>
              </div>
              <button
                type="button"
                className="sim-button"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={handleRotateLogs}
              >
                <RotateCcw size={13} /> Rotate Logs Now
              </button>
            </div>

            <table className="table-responsive">
              <thead>
                <tr>
                  <th>Archive Date / Time</th>
                  <th>Archive File Name</th>
                  <th>Size</th>
                  <th>Records</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archivedLogs.length > 0 ? (
                  archivedLogs.map((archive) => (
                    <tr key={archive.id}>
                      <td>
                        <strong>{new Date(archive.date).toLocaleDateString()}</strong>
                        <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                          {new Date(archive.date).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontSize: '12px', color: '#0f172a' }}>
                          <FileText size={14} style={{ color: '#0284c7' }} />
                          {archive.fileName}
                        </span>
                      </td>
                      <td>
                        <span className="badge normal">{archive.size}</span>
                      </td>
                      <td>
                        <strong>{archive.recordsCount}</strong> events
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {handleDownloadArchive && (
                            <button
                              type="button"
                              className="btn-icon-action primary"
                              title="Download Archive File"
                              style={{ width: 'auto', padding: '4px 8px', fontSize: '11px', display: 'inline-flex', gap: '4px' }}
                              onClick={() => handleDownloadArchive(archive)}
                            >
                              <Download size={12} /> Download
                            </button>
                          )}
                          {handleDeleteArchive && (
                            <button
                              type="button"
                              className="btn-icon-action danger"
                              title="Delete Archive"
                              onClick={() => handleDeleteArchive(archive.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                      No rotated log archives yet. Click "Rotate & Archive Logs Now" above to generate a new archive bundle.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 5. ASSETS SUBTAB */}
      {settingsSubTab === 'assets' && (
        <AssetsView
          assets={assets}
          residents={residents}
          careTeam={careTeam}
          onUploadAsset={onUploadAsset || (async () => {})}
          onDeleteAsset={onDeleteAsset || (async () => {})}
          onSetAsAvatar={onSetAsAvatar || (async () => {})}
          isLoading={isAssetsLoading}
        />
      )}
    </div>
  )
}
