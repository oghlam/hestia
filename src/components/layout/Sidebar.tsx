import React from 'react'
import {
  Activity,
  CalendarDays,
  ChevronDown,
  House,
  Monitor,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react'
import type { TabKey } from '../../domain/mock-data'

export interface SidebarProps {
  menuOpen: boolean
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  homeName?: string
  homeId?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuOpen,
  activeTab,
  setActiveTab,
  homeName = 'Greenwood Home',
  homeId = 'HGW-001',
}) => {
  return (
    <>
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => {
            if (typeof setActiveTab === 'function') {
              // trigger close via parent
            }
          }}
        />
      )}
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <img src="/logo/hestia_logo_full.png" alt="HESTIA" />
          <span>ELDER CARE FOR RING</span>
        </div>
        <nav className="primary-nav">
          <a
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <House size={18} /> Overview
          </a>
          <a className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>
            <Monitor size={18} /> Rooms
          </a>
          <a
            className={activeTab === 'people' ? 'active' : ''}
            onClick={() => setActiveTab('people')}
          >
            <Users size={18} /> People
          </a>
          <a
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            <CalendarDays size={18} /> Events
          </a>
          <a
            className={activeTab === 'care_team' ? 'active' : ''}
            onClick={() => setActiveTab('care_team')}
          >
            <UserCheck size={18} /> Care Team
          </a>
          <a
            className={activeTab === 'automation' ? 'active' : ''}
            onClick={() => setActiveTab('automation')}
          >
            <Activity size={18} /> Automation
          </a>
          <a
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Settings
          </a>
        </nav>
        <div className="home-switcher">
          <div className="home-photo">⌂</div>
          <div>
            <strong>{homeName}</strong>
            <small>Home ID · {homeId}</small>
          </div>
          <ChevronDown size={15} />
        </div>
      </aside>
    </>
  )
}
