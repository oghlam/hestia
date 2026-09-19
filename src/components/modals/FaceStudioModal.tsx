import React from 'react'
import { Camera, CameraOff, Trash2, X } from 'lucide-react'
import type { FaceAngle, Resident } from '../../domain/contracts'

export interface FaceStudioModalProps {
  isOpen: boolean
  onClose: () => void
  selectedResidentForFace: Resident | null
  faceStudioVideoRef: React.RefObject<HTMLVideoElement | null>
  isLocalCameraRunning: boolean
  startLocalCamera: (videoRef?: any) => Promise<void>
  stopLocalCamera: () => void
  faceCaptureNotice: string | null
  setFaceCaptureNotice: (notice: string | null) => void
  faceAngleToRegister: FaceAngle
  setFaceAngleToRegister: (angle: FaceAngle) => void
  isCapturingFace: boolean
  handleCaptureFaceAngle: (angle: FaceAngle) => Promise<void>
  handleDeleteFaceTemplate: (templateId: string) => Promise<void>
}

export const FaceStudioModal: React.FC<FaceStudioModalProps> = ({
  isOpen,
  onClose,
  selectedResidentForFace,
  faceStudioVideoRef,
  isLocalCameraRunning,
  startLocalCamera,
  stopLocalCamera,
  faceCaptureNotice,
  setFaceCaptureNotice,
  faceAngleToRegister,
  setFaceAngleToRegister,
  isCapturingFace,
  handleCaptureFaceAngle,
  handleDeleteFaceTemplate,
}) => {
  if (!isOpen || !selectedResidentForFace) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Multi-Angle Face Studio — {selectedResidentForFace.name}</h2>
          <button onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', lineHeight: 1.5 }}>
            Register 3 canonical angles (Front 0°, Left 45°, Right 45°) to train the local OpenCV 5 YuNet+SFace feature matcher.
          </p>

          {/* Simulated / Live Camera Viewfinder with Sweep Scanner */}
          <div className="face-studio-camera-box">
            {isLocalCameraRunning && (
              <div className="camera-live-overlay-tag" style={{ top: '8px', left: '8px', fontSize: '10px' }}>
                <span className="camera-live-dot" /> LIVE CAMERA FEED
              </div>
            )}
            <video
              ref={faceStudioVideoRef}
              autoPlay
              playsInline
              muted
              className="camera-viewfinder-video"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isLocalCameraRunning ? 'block' : 'none',
              }}
            />
            <div className="face-studio-scanner-line" style={{ zIndex: 3 }} />
            <div
              className="face-studio-reticle"
              style={{
                zIndex: 4,
                background: isLocalCameraRunning ? 'transparent' : 'rgba(15, 23, 42, 0.6)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                {!isLocalCameraRunning && <Camera size={32} style={{ margin: '0 auto 6px', opacity: 0.8 }} />}
                <span
                  style={{
                    fontSize: '11px',
                    color: '#93c5fd',
                    fontWeight: 600,
                    display: 'block',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}
                >
                  {isLocalCameraRunning ? 'ALIGNED TO RETICLE' : 'RING CAMERA FEED'}
                </span>
                <small style={{ fontSize: '10px', color: '#cbd5e1', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                  {faceAngleToRegister.toUpperCase()} ANGLE (0°/45°)
                </small>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              {isLocalCameraRunning ? 'Camera active for real face snapshot' : 'Using synthetic feature calibration'}
            </small>
            <button
              type="button"
              className="sim-button secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => (isLocalCameraRunning ? stopLocalCamera() : startLocalCamera(faceStudioVideoRef))}
            >
              {isLocalCameraRunning ? (
                <>
                  <CameraOff size={12} /> Stop Camera
                </>
              ) : (
                <>
                  <Camera size={12} /> Enable Camera
                </>
              )}
            </button>
          </div>

          {faceCaptureNotice && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                fontSize: '12px',
                marginBottom: '14px',
              }}
            >
              {faceCaptureNotice}
            </div>
          )}

          {/* Angle Selector Tabs */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Select Calibration Angle</label>
            <div className="preset-chip-group">
              {(['front', 'left', 'right'] as FaceAngle[]).map((angle) => {
                const isRegistered = selectedResidentForFace.faceTemplates.some((t) => t.angle === angle)
                return (
                  <button
                    type="button"
                    key={angle}
                    className={`preset-chip ${faceAngleToRegister === angle ? 'active' : ''}`}
                    onClick={() => {
                      setFaceAngleToRegister(angle)
                      setFaceCaptureNotice(null)
                    }}
                  >
                    <Camera size={12} /> {angle.toUpperCase()} (0°/45°) {isRegistered ? '✔' : ''}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            className="sim-button"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
            disabled={isCapturingFace}
            onClick={() => handleCaptureFaceAngle(faceAngleToRegister)}
          >
            <Camera size={16} />{' '}
            {isCapturingFace
              ? 'Extracting 128-d SFace Feature Vector...'
              : `Capture & Register ${faceAngleToRegister.toUpperCase()} Angle`}
          </button>

          {/* Registered Angle Templates List */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>
              Registered Templates for {selectedResidentForFace.name} ({selectedResidentForFace.faceTemplates.length}/3)
            </label>

            {selectedResidentForFace.faceTemplates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedResidentForFace.faceTemplates.map((t) => (
                  <div
                    key={t.templateId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {t.previewUrl ? (
                        <img
                          src={t.previewUrl}
                          alt={`${t.angle} angle thumbnail`}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1.5px solid #38bdf8',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '6px',
                            background: '#e2e8f0',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#64748b',
                          }}
                        >
                          <Camera size={16} />
                        </div>
                      )}
                      <div>
                        <strong style={{ color: '#0f172a' }}>{t.angle.toUpperCase()} Angle Pose</strong>
                        <small style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>
                          Registered: {new Date(t.registeredAt).toLocaleTimeString()} · Quality:{' '}
                          {Math.round(t.qualityScore * 100)}%
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon-action danger"
                      title="Delete template"
                      onClick={() => handleDeleteFaceTemplate(t.templateId)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: '8px 0' }}>
                No face templates registered yet.
              </p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="sim-button secondary" onClick={onClose}>
            Close Face Studio
          </button>
        </div>
      </div>
    </div>
  )
}
