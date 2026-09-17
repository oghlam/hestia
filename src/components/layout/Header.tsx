import React from 'react'
import { Building2, Bell, Menu, Smartphone, X } from 'lucide-react'
import type { CareTeamMember, NotificationItem } from '../../domain/contracts'

export interface HeaderProps {
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  notice: boolean
  setNotice: React.Dispatch<React.SetStateAction<boolean>>
  notifications: NotificationItem[]
  mariaAvatarUrl: string
  mariaMember?: CareTeamMember
  activeSiteName?: string
  onSelectSite?: (siteName: string) => void
  onOpenValidator?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  menuOpen,
  setMenuOpen,
  notice,
  setNotice,
  notifications,
  mariaAvatarUrl,
  mariaMember,
  activeSiteName = 'Greenwood Residence',
  onOpenValidator,
}) => {
  const caregiverName = mariaMember?.name || 'Sarah Jenkins'
  const caregiverRole = mariaMember?.role || 'Lead Caregiver'
  const tooltipText = `${caregiverName} (${caregiverRole})`

  const handleValidatorClick = (e: React.MouseEvent) => {
    if (onOpenValidator) {
      e.preventDefault()
      onOpenValidator()
    }
  }

  return (
    <>
      <header className="topbar">
        {/* Left Section: Mobile Toggle + Logo + Site Badge */}
        <div className="topbar-left-section">
          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>

          {/* Logo Hestia di Sudut Kiri Atas */}
          <div className="topbar-logo-area">
            <img src="/logo/hestia_logo_full.png" alt="HESTIA" />
          </div>

          {/* Site Identity Badge */}
          <div className="site-identity-badge" title={`Active site: ${activeSiteName}`}>
            <Building2 size={15} className="text-primary" strokeWidth={2} />
            <div className="site-identity-text">
              <strong>{activeSiteName}</strong>
              <small>Active Site Online</small>
            </div>
          </div>
        </div>

        {/* Right Section: Validator Action + Notifications + Compact Avatar */}
        <div className="top-right">
          {/* Eye-catching Validator PWA Button with Light Edge */}
          <a
            href="?view=validator"
            onClick={handleValidatorClick}
            className="topbar-validator-btn"
            title="Open Validator Fast-Action PWA Interface"
          >
            <span className="validator-btn-icon-wrapper">
              <Smartphone size={14} strokeWidth={2.4} />
            </span>
            <span className="validator-btn-label">Validator</span>
            <span className="validator-btn-pill">PWA</span>
          </a>

          {/* Notification Button */}
          <button
            className="notification"
            onClick={() => setNotice(!notice)}
            title="Care updates & system alerts"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={2} />
            {notifications.length > 0 && <b>{notifications.length}</b>}
          </button>

          {/* Compact Caregiver Avatar (Right Aligned, Custom Tooltip on Hover) */}
          <div className="profile-avatar-wrapper">
            <img src={mariaAvatarUrl} alt={caregiverName} className="profile-avatar-img" />
            <div className="profile-avatar-tooltip">
              <strong>{caregiverName}</strong>
              <small>{caregiverRole}</small>
            </div>
          </div>
        </div>
      </header>

      {notice && (
        <div className="notification-popover">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <strong>Notifications & Care Updates</strong>
            <button
              onClick={() => setNotice(false)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
          {notifications.length === 0 ? (
            <p>No new notifications. All systems safe.</p>
          ) : (
            notifications.slice(0, 4).map((n) => (
              <div
                key={n.id}
                style={{
                  borderBottom: '1px solid #edf2f7',
                  paddingBottom: '6px',
                  marginBottom: '6px',
                }}
              >
                <strong style={{ fontSize: '13px', color: '#1a365d' }}>{n.title}</strong>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#4a5568' }}>{n.body}</p>
                <small style={{ fontSize: '10px', color: '#a0aec0' }}>
                  {new Date(n.sentAt).toLocaleTimeString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
