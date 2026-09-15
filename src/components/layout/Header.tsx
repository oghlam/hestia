import React from 'react'
import { Bell, ChevronDown, ExternalLink, Menu, Search, X } from 'lucide-react'
import type { CareTeamMember, NotificationItem } from '../../domain/contracts'

export interface HeaderProps {
  menuOpen: boolean
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  notice: boolean
  setNotice: React.Dispatch<React.SetStateAction<boolean>>
  notifications: NotificationItem[]
  mariaAvatarUrl: string
  mariaMember?: CareTeamMember
}

export const Header: React.FC<HeaderProps> = ({
  menuOpen,
  setMenuOpen,
  notice,
  setNotice,
  notifications,
  mariaAvatarUrl,
  mariaMember,
}) => {
  return (
    <>
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={20} />
        </button>
        <div className="search">
          <Search size={17} />
          <span>Search people, rooms, events...</span>
        </div>
        <div className="top-right">
          <a
            href="/?view=validator"
            target="_blank"
            rel="noreferrer"
            className="sim-button secondary"
            style={{ padding: '6px 12px', textDecoration: 'none', gap: '4px' }}
          >
            <ExternalLink size={14} /> Validator PWA
          </a>
          <span className="online">
            <i /> All Systems Online
          </span>
          <button className="notification" onClick={() => setNotice(!notice)}>
            <Bell size={21} />
            {notifications.length > 0 && <b>{notifications.length}</b>}
          </button>
          <img src={mariaAvatarUrl} alt="Maria" className="profile-avatar-img" />
          <div className="profile">
            <strong>{mariaMember?.name ? mariaMember.name.split(' ')[0] : 'Maria'}</strong>
            <small>Family Caregiver</small>
          </div>
          <ChevronDown size={15} />
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
