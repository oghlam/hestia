import React from 'react'
import { Shield, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react'

export interface PreloadScreenProps {
  progress: number
  statusMessage: string
  isComplete: boolean
  backendConnected: boolean
}

export const PreloadScreen: React.FC<PreloadScreenProps> = ({
  progress,
  statusMessage,
  isComplete,
  backendConnected,
}) => {
  return (
    <div className={`hestia-preload-container ${isComplete ? 'preload-fade-out' : ''}`}>
      {/* Background Image: Desktop (Cozy Scene) vs Mobile (Elderly Woman Portrait) via CSS classes */}
      <div className="preload-backdrop-art" />
      
      {/* Decorative Warm Glow Elements */}
      <div className="preload-glow glow-1" />
      <div className="preload-glow glow-2" />

      {/* Preload Central Glass Card */}
      <div className="preload-card">
        {/* Brand Logo & Wordmark */}
        <div className="preload-brand">
          <img
            src="/logo/hestia_logo_full.png"
            alt="HESTIA"
            className="preload-logo-img"
          />
          <div className="preload-tagline">ELDER CARE FOR RING</div>
        </div>

        {/* Ambient Warm Scene Banner */}
        <div className="preload-scene-banner">
          <div className="scene-banner-badge">
            <Shield size={13} className="text-emerald-400" />
            <span>AI-Assisted Resident Safety</span>
          </div>
          <p className="scene-banner-text">
            "Connecting Ring smart cameras, Amazon Nova Micro AI, and dedicated caregiver response circles."
          </p>
        </div>

        {/* Progress Bar & Status */}
        <div className="preload-progress-section">
          <div className="preload-progress-info">
            <span className="preload-status-text">
              <RefreshCw size={13} className="rotating-icon" />
              {statusMessage}
            </span>
            <span className="preload-percentage">{Math.min(100, Math.round(progress))}%</span>
          </div>

          <div className="preload-progress-track">
            <div
              className="preload-progress-bar"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Telemetry Status Dots */}
        <div className="preload-telemetry">
          <div className={`telemetry-item ${progress > 25 ? 'ready' : ''}`}>
            <span className="dot" />
            <small>Ring Adapter</small>
          </div>
          <div className={`telemetry-item ${progress > 55 ? 'ready' : ''}`}>
            <span className="dot" />
            <small>Nova Micro AI</small>
          </div>
          <div className={`telemetry-item ${progress > 80 ? 'ready' : ''}`}>
            <span className="dot" />
            <small>Hybrid Store</small>
          </div>
          <div className={`telemetry-item ${backendConnected ? 'ready' : ''}`}>
            <span className="dot" />
            <small>{backendConnected ? 'API Live' : 'Offline Mode'}</small>
          </div>
        </div>
      </div>
    </div>
  )
}
