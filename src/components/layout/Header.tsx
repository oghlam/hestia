import React from 'react'
import { Building2, Bell, ChevronDown, Menu, Search, X } from 'lucide-react'
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
  onSearch?: (query: string) => void
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
  onSearch,
}) => {
  const [searchValue, setSearchValue] = React.useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    if (onSearch) onSearch(e.target.value)
  }

  return (
    <>
      <header className="topbar">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} strokeWidth={2.2} />
        </button>

        {/* Logo Hestia di Sudut Kiri Atas */}
        <div className="topbar-logo-area">
          <img src="/logo/hestia_logo_full.png" alt="HESTIA" />
        </div>

        {/* Site Identity Badge - Flat Design */}
        <div className="site-identity-badge">
          <Building2 size={16} className="text-primary" strokeWidth={2} />
          <div className="site-identity-text">
            <strong>{activeSiteName}</strong>
            <small>Active Site Online</small>
          </div>
        </div>

        {/* Global Search Bar - Compact & Flat */}
        <div className="search">
          <Search size={15} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search residents, devices, MAC, events..."
            value={searchValue}
            onChange={handleSearchChange}
            className="search-input-field"
          />
        </div>

        {/* Top Right System Status & Profile - Extra Compact */}
        <div className="top-right">
          <div className="system-health-pill" title="Ring Cloud & AWS Bedrock latency: 18ms">
            <span className="health-pulse-dot" />
            <span>Systems Optimal · 18ms</span>
          </div>
          <button className="notification" onClick={() => setNotice(!notice)}>
            <Bell size={17} strokeWidth={2} />
            {notifications.length > 0 && <b>{notifications.length}</b>}
          </button>
          <img src={mariaAvatarUrl} alt="Maria" className="profile-avatar-img" />
          <div className="profile">
            <strong>{mariaMember?.name ? mariaMember.name.split(' ')[0] : 'Maria'}</strong>
            <small>Primary Caregiver</small>
          </div>
          <ChevronDown size={12} strokeWidth={2} />
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
