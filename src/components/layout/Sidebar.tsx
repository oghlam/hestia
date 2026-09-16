import React from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronDown,
  House,
  Monitor,
  Network,
  Radio,
  Settings,
  SlidersHorizontal,
  UserCheck,
  Users,
} from 'lucide-react'
import type { TabKey } from '../../domain/mock-data'

export interface SidebarProps {
  menuOpen: boolean
  setMenuOpen?: (open: boolean) => void
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  homeName?: string
  homeId?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuOpen,
  setMenuOpen,
  activeTab,
  setActiveTab,
  homeName = 'Greenwood Residence',
  homeId = 'HGW-001',
}) => {
  return (
    <>
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => {
            if (setMenuOpen) setMenuOpen(false)
          }}
        />
      )}
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <nav className="primary-nav">
          <a
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => {
              setActiveTab('overview')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Overview"
          >
            <House size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'residents' || activeTab === 'people' ? 'active' : ''}
            onClick={() => {
              setActiveTab('residents')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Residents"
          >
            <Users size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'rooms' ? 'active' : ''}
            onClick={() => {
              setActiveTab('rooms')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Rooms"
          >
            <Monitor size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'devices' ? 'active' : ''}
            onClick={() => {
              setActiveTab('devices')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Devices"
          >
            <Radio size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'topology' ? 'active' : ''}
            onClick={() => {
              setActiveTab('topology')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Care Topology"
          >
            <Network size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => {
              setActiveTab('alerts')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Alerts"
          >
            <AlertTriangle size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'care_team' ? 'active' : ''}
            onClick={() => {
              setActiveTab('care_team')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Care Team"
          >
            <UserCheck size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'automation' ? 'active' : ''}
            onClick={() => {
              setActiveTab('automation')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Automation"
          >
            <SlidersHorizontal size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => {
              setActiveTab('events')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Events"
          >
            <CalendarDays size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'insights' ? 'active' : ''}
            onClick={() => {
              setActiveTab('insights')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Insights"
          >
            <BarChart3 size={22} strokeWidth={2.2} />
          </a>
          <a
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => {
              setActiveTab('settings')
              if (setMenuOpen) setMenuOpen(false)
            }}
            data-tooltip="Settings"
          >
            <Settings size={22} strokeWidth={2.2} />
          </a>
        </nav>

        <div className="home-switcher" title={`${homeName} (ID: ${homeId})`}>
          <div className="home-photo">⌂</div>
        </div>
      </aside>
    </>
  )
}
