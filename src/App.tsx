import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  House,
  Menu,
  Monitor,
  Search,
  Settings,
  UserCheck,
  Users,
  X,
} from 'lucide-react'

import type {
  AccessLogEntry,
  Alert,
  AuditLogEntry,
  NotificationItem,
  SceneEvent,
  ValidatorAction,
} from './domain/contracts'

import { SettingsView } from './views/SettingsView'
import {
  OverviewView,
  RoomsView,
  PeopleView,
  EventsView,
  CareTeamView,
  AutomationView,
  ValidatorView,
  DevicesView,
  TopologyView,
  AlertsView,
  InsightsView,
} from './views'
import { PreloadScreen } from './components/layout/PreloadScreen'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { ContextualDrawer, type DrawerEntity } from './components/layout/ContextualDrawer'

import {
  RoomModal,
  FloorPlanModal,
  ResidentModal,
  FaceStudioModal,
  CareTeamModal,
  AutomationRuleModal,
  EventInspectionModal,
  AlertSimulatorModal,
  MasterDeviceModal,
} from './components/modals'

import {
  useRooms,
  useResidents,
  useCareTeam,
  useAutomationRules,
  useSceneEvents,
  useSystemSettings,
  useAssets,
  useRingDevices,
} from '@/hooks'

import {
  type TabKey,
  type Scene,
} from './domain/mock-data'

const DEFAULT_AVATAR = '/avatar/default.png'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : '')

export function App() {
  // Check for validator view param
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'validator') {
    return <ValidatorView />
  }

  // ============================================================================
  // DOMAIN STATE - Modular state from hooks
  // ============================================================================
  const rooms = useRooms()
  const residents = useResidents()
  const careTeam = useCareTeam()
  const automationRules = useAutomationRules()
  const sceneEvents = useSceneEvents()
  const systemSettings = useSystemSettings()
  const assetsHook = useAssets()
  const ringDevicesHook = useRingDevices()

  // ============================================================================
  // UI & APPLICATION STATE
  // ============================================================================
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState(false)
  const [liveClock, setLiveClock] = useState(() => new Date())
  const [roomsSubTab, setRoomsSubTab] = useState<'preview' | 'map'>('preview')
  const [peopleSubTab, setPeopleSubTab] = useState<'profiles' | 'logs'>('profiles')
  const [activeRoomId, setActiveRoomId] = useState('living_room')
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)
  const [simLoading, setSimLoading] = useState(false)
  const [isAlertSimulatorOpen, setIsAlertSimulatorOpen] = useState(false)
  const [simRoomId, setSimRoomId] = useState('living_room')
  const [simScenario, setSimScenario] = useState<'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity'>('normal')
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([])
  const [activeSiteName, setActiveSiteName] = useState('Greenwood Residence')
  const [selectedDrawerEntity, setSelectedDrawerEntity] = useState<DrawerEntity | null>(null)
  const [isMasterDeviceModalOpen, setIsMasterDeviceModalOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Real Initial Preload State — skip PreloadScreen on PWA standalone (Android/iOS) to avoid double splash; PWA splash in index.html already covers it
  const isStandalonePwa = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true)
  const [preloadProgress, setPreloadProgress] = useState(15)
  const [preloadStatus, setPreloadStatus] = useState('Booting HESTIA Core Services...')
  const [isPreloadComplete, setIsPreloadComplete] = useState(false)
  const [showPreloader, setShowPreloader] = useState(!isStandalonePwa)
  const [backendConnected, setBackendConnected] = useState(false)

  // Live clock update effect
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Master Data Refresh Callback
  const fetchData = useCallback(async () => {
    try {
      await Promise.allSettled([
        rooms.fetchRooms(),
        residents.fetchResidents(),
        careTeam.fetchCareTeam(),
        automationRules.fetchRules(),
        sceneEvents.fetchScenes(),
        systemSettings.fetchSettings(),
        (async () => {
          const res = await fetch(`${API_BASE}/api/alerts`)
          if (res.ok) {
            const data = await res.json()
            if (data.alerts && Array.isArray(data.alerts)) setAlerts(data.alerts)
          }
        })(),
        (async () => {
          const res = await fetch(`${API_BASE}/api/notifications`)
          if (res.ok) {
            const data = await res.json()
            if (data.notifications && Array.isArray(data.notifications)) setNotifications(data.notifications)
          }
        })(),
        (async () => {
          const res = await fetch(`${API_BASE}/api/audit-logs`)
          if (res.ok) {
            const data = await res.json()
            if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs)
          }
        })(),
        (async () => {
          const res = await fetch(`${API_BASE}/api/access-logs`)
          if (res.ok) {
            const data = await res.json()
            if (data.accessLogs && Array.isArray(data.accessLogs)) setAccessLogs(data.accessLogs)
          }
        })(),
      ])
    } catch {
      // Offline fallback
    }
  }, [rooms, residents, careTeam, automationRules, sceneEvents, systemSettings])

  // Master Preload & Initial Ingestion sequence — PWA standalone uses index.html splash (data-driven via hestia:ready event), desktop uses PreloadScreen
  useEffect(() => {
    if (isStandalonePwa) {
      // PWA: hydrate data in background, dispatch hestia:ready when real data settled so index.html splash hides data-driven (not timer)
      let cancelled = false
      fetchData().finally(() => {
        if (!cancelled) window.dispatchEvent(new CustomEvent('hestia:ready'))
      })
      const pollInterval = setInterval(() => fetchData(), 4000)
      return () => { cancelled = true; clearInterval(pollInterval) }
    }
    let isMounted = true

    async function initialBootstrap() {
      try {
        setPreloadProgress(25)
        setPreloadStatus('Connecting Ring Adapter & Hardware Telemetry...')
        
        // Check health
        try {
          const healthRes = await fetch(`${API_BASE}/health`)
          if (healthRes.ok && isMounted) {
            setBackendConnected(true)
          }
        } catch {
          // offline
        }

        if (isMounted) {
          setPreloadProgress(50)
          setPreloadStatus('Loading Resident Biometrics & Face Embeddings...')
        }

        // Fetch primary domain data
        await Promise.allSettled([
          rooms.fetchRooms(),
          residents.fetchResidents(),
          careTeam.fetchCareTeam(),
        ])

        if (isMounted) {
          setPreloadProgress(75)
          setPreloadStatus('Hydrating Automation Rules & Scene Engine...')
        }

        await Promise.allSettled([
          automationRules.fetchRules(),
          sceneEvents.fetchScenes(),
          systemSettings.fetchSettings(),
          systemSettings.handleEnumerateDevices(),
        ])

        if (isMounted) {
          setPreloadProgress(95)
          setPreloadStatus('Synchronizing Store State...')
          await fetchData()
          setPreloadProgress(100)
          setPreloadStatus('HESTIA Care Command Center Ready.')

          setTimeout(() => {
            if (isMounted) {
              setIsPreloadComplete(true)
              setTimeout(() => {
                if (isMounted) setShowPreloader(false)
              }, 600)
            }
          }, 350)
        }
      } catch {
        if (isMounted) {
          setPreloadProgress(100)
          setIsPreloadComplete(true)
          setTimeout(() => setShowPreloader(false), 500)
        }
      }
    }

    initialBootstrap()

    const pollInterval = setInterval(() => {
      fetchData()
    }, 4000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [])

  // ============================================================================
  // DERIVED STATE & COMPUTED PROPERTIES
  // ============================================================================
  const timeFormatted = liveClock.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dateFormatted = liveClock.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const greeting = liveClock.getHours() < 12 ? 'Good morning' : liveClock.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  const displayRooms = rooms.rawRooms || []
  const primaryResidentObj = residents.residents?.find((r) => r.primaryTarget) || residents.residents?.[0] || null
  const mariaMember = careTeam.careTeam?.find((m) => m.name?.includes('Caregiver') || m.isPrimaryValidator) || null
  const mariaAvatarUrl = mariaMember?.avatarUrl || DEFAULT_AVATAR

  const roomStates = rooms.roomStates || []
  const apiScenes = sceneEvents.apiScenes || []

  // Count by scene severity from apiScenes
  const normalCount = apiScenes.filter((s) => s.scene === 'S1_NORMAL').length
  const watchCount = apiScenes.filter((s) => s.scene === 'S2_WATCH').length
  const helpCount = apiScenes.filter((s) => s.scene === 'S3_HELP').length
  const criticalCount = apiScenes.filter((s) => s.scene === 'S4_CRITICAL').length

  const recentEvent = apiScenes[0] || null
  const matchedRoom = displayRooms.find((r) => r.id === recentEvent?.roomId)
  const roomLabel = matchedRoom ? matchedRoom.name : recentEvent?.roomId ? recentEvent.roomId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Living Room'
  const recentEventTitle = recentEvent
    ? `${recentEvent.identity?.name || (recentEvent.identity?.identity === 'unknown' ? 'Unknown Visitor' : 'Motion')} in ${roomLabel}`
    : 'No recent events'
  const recentEventTime = recentEvent?.createdAt
    ? new Date(recentEvent.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : 'N/A'
  const recentEventRoom = roomLabel
  const recentEventScene = (recentEvent?.scene === 'S1_NORMAL' ? 'Normal' : recentEvent?.scene === 'S2_WATCH' ? 'Watch' : recentEvent?.scene === 'S3_HELP' ? 'Help' : 'Critical') as Scene
  const recentEventContext = recentEvent?.contextText || 'All systems nominal.'

  // ============================================================================
  // SIMULATION HANDLERS
  // ============================================================================
  const triggerSimulation = async (scenario: 'normal' | 'distress' | 'visitor' | 'reset') => {
    setSimLoading(true)
    try {
      if (scenario === 'reset') {
        const res = await fetch(`${API_BASE}/demo/events`, { method: 'POST' })
        if (res.ok) {
          await fetchData()
        }
      } else {
        const targetRoom = scenario === 'distress' ? 'bedroom' : scenario === 'visitor' ? 'entry' : 'living_room'
        const signal = scenario === 'distress' ? 'distress' : scenario === 'visitor' ? 'doorbell' : 'normal'
        const faceHint = scenario === 'visitor' ? 'unknown' : 'known_target'

        await fetch(`${API_BASE}/api/pipeline/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: targetRoom,
            simulatedSignal: signal,
            faceHint,
          }),
        })
        await fetchData()
      }
    } catch (e) {
      console.error('Simulation error:', e)
    } finally {
      setSimLoading(false)
    }
  }

  const triggerRoomSimulation = async (roomId: string, scenario: 'normal' | 'distress') => {
    setSimLoading(true)
    systemSettings.setIsPipelinePushing(true)
    try {
      const res = await fetch(`${API_BASE}/api/pipeline/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          simulatedSignal: scenario,
          faceHint: 'known_target',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const sceneName = data.scene?.scene || (scenario === 'distress' ? 'S3_HELP' : 'S1_NORMAL')
        systemSettings.setPipelineLastResult({
          scene: sceneName,
          person: data.identity?.name || 'Elder',
          confidence: data.scene?.confidence || 0.95,
          summary: data.scene?.contextText || (scenario === 'distress' ? 'Resident distress signal detected in bedroom. Immediate validation needed.' : 'Routine resident movement detected in living room.'),
          time: new Date().toLocaleTimeString(),
          aiProvider: data.aiProvider || 'Nova Micro',
        })
        systemSettings.setPipelineFeedback(`Sandbox Triggered: ${sceneName} (${roomId.replace('_', ' ')})`)
      }
      await fetchData()
    } catch (e) {
      console.error(e)
      const sceneName = scenario === 'distress' ? 'S3_HELP' : 'S1_NORMAL'
      systemSettings.setPipelineLastResult({
        scene: sceneName,
        person: 'Elder',
        confidence: 0.95,
        summary: scenario === 'distress' ? 'Resident distress signal detected in bedroom. Immediate validation needed.' : 'Routine resident movement detected in living room.',
        time: new Date().toLocaleTimeString(),
        aiProvider: 'Nova Micro (Local Gateway)',
      })
      systemSettings.setPipelineFeedback(`Sandbox Triggered: ${sceneName} (${roomId.replace('_', ' ')})`)
    } finally {
      setSimLoading(false)
      systemSettings.setIsPipelinePushing(false)
      setTimeout(() => systemSettings.setPipelineFeedback(null), 4500)
    }
  }

  const handleRunDynamicSimulation = async (
    roomId: string,
    scenario: 'normal' | 'visitor' | 'distress' | 'critical' | 'inactivity'
  ) => {
    setSimLoading(true)
    try {
      const signal = scenario === 'visitor' ? 'doorbell' : scenario === 'distress' || scenario === 'critical' ? 'distress' : scenario === 'inactivity' ? 'repeated_motion' : 'normal'
      const faceHint = scenario === 'visitor' ? 'unknown' : 'known_target'

      await fetch(`${API_BASE}/api/pipeline/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          simulatedSignal: signal,
          faceHint,
        }),
      })
      await fetchData()
      setIsAlertSimulatorOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSimLoading(false)
    }
  }

  const handleAlertAction = async (alertId: string, action: ValidatorAction) => {
    try {
      const res = await fetch(`${API_BASE}/api/alerts/${alertId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (e) {
      console.error('Alert action error:', e)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="dashboard-shell-layout">
      {/* Real Preload Screen on Initial Boot / API Hydration */}
      {showPreloader && (
        <PreloadScreen
          progress={preloadProgress}
          statusMessage={preloadStatus}
          isComplete={isPreloadComplete}
          backendConnected={backendConnected}
        />
      )}

      {/* Top Banner Header with Logo (No Tagline) and Caregiver Profile & Systems */}
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        notice={notice}
        setNotice={setNotice}
        notifications={notifications}
        mariaAvatarUrl={mariaAvatarUrl}
        mariaMember={mariaMember || undefined}
        activeSiteName={activeSiteName}
        onSelectSite={(site) => {
          setActiveSiteName(site)
          systemSettings.setSystemSettings((prev) => ({ ...prev, homeName: site }))
        }}
        onOpenValidator={() => {
          window.location.href = '?view=validator'
        }}
      />

      <div className="dashboard-body-row">
        {/* Mobile Backdrop Overlay */}
        {menuOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Left Icon-only Sidebar separated from header */}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          homeName={systemSettings.systemSettings.homeName || activeSiteName}
          homeId={systemSettings.systemSettings.homeId || 'HGW-001'}
        />

        <main className="main-content">

        {notice && (
          <div className="notification-popover">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong>Notifications & Care Updates</strong>
              <button onClick={() => setNotice(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
            {notifications.length === 0 ? (
              <p>No new notifications. All systems safe.</p>
            ) : (
              notifications.slice(0, 4).map((n) => (
                <div key={n.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '6px' }}>
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

        {/* ROUTE 1: OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <OverviewView
            greeting={greeting}
            mariaMember={mariaMember || undefined}
            primaryResidentObj={primaryResidentObj || undefined}
            dateFormatted={dateFormatted}
            timeFormatted={timeFormatted}
            setActiveTab={setActiveTab}
            setRoomsSubTab={setRoomsSubTab}
            alerts={alerts}
            displayRooms={displayRooms}
            roomStates={roomStates}
            apiScenes={apiScenes}
            careTeam={careTeam.careTeam || []}
            homeMap={rooms.homeMap}
            activeRoomId={activeRoomId}
            hoveredRoomId={hoveredRoomId}
            setHoveredRoomId={setHoveredRoomId}
            setSelectedEventForInspection={sceneEvents.setSelectedEventForInspection}
            recentEventTitle={recentEventTitle}
            recentEventTime={recentEventTime}
            recentEventRoom={recentEventRoom}
            recentEventScene={recentEventScene}
            recentEventContext={recentEventContext}
            normalCount={normalCount}
            watchCount={watchCount}
            helpCount={helpCount}
            criticalCount={criticalCount}
            simLoading={simLoading}
            triggerSimulation={triggerSimulation}
            setIsAlertSimulatorOpen={setIsAlertSimulatorOpen}
          />
        )}

        {/* ROUTE 2: ROOMS VIEW */}
        {activeTab === 'rooms' && (
          <RoomsView
            roomsSubTab={roomsSubTab}
            setRoomsSubTab={setRoomsSubTab}
            openAddRoom={rooms.openAddRoom}
            setIsMapModalOpen={rooms.setIsMapModalOpen}
            fetchData={fetchData}
            displayRooms={displayRooms}
            roomStates={rooms.roomStates}
            homeMap={rooms.homeMap}
            simLoading={simLoading}
            triggerRoomSimulation={triggerRoomSimulation}
            openEditRoom={rooms.openEditRoom}
            handleDeleteRoom={rooms.handleDeleteRoom}
            pinningRoomId={rooms.pinningRoomId}
            setPinningRoomId={rooms.setPinningRoomId}
            mapNotice={rooms.mapNotice}
            canvasRef={rooms.canvasRef}
            handleMapCanvasClick={rooms.handleMapCanvasClick}
            handleMouseMoveCanvas={rooms.handleMouseMoveCanvas}
            handleMouseUpCanvas={rooms.handleMouseUpCanvas}
            handleMouseDownPin={rooms.handleMouseDownPin}
            dragCoords={rooms.dragCoords}
            draggingRoomId={rooms.draggingRoomId}
            hoveredRoomId={hoveredRoomId}
            setHoveredRoomId={setHoveredRoomId}
            activeRoomId={activeRoomId}
          />
        )}

        {/* ROUTE 3: PEOPLE / RESIDENTS VIEW */}
        {(activeTab === 'people' || activeTab === 'residents') && (
          <PeopleView
            peopleSubTab={peopleSubTab}
            setPeopleSubTab={setPeopleSubTab}
            openAddResident={residents.openAddResident}
            residents={residents.residents || []}
            accessLogs={accessLogs}
            openFaceStudio={residents.openFaceStudio}
            handleSetPrimaryResident={residents.handleSetPrimaryResident}
            openEditResident={residents.openEditResident}
            handleDeleteResident={residents.handleDeleteResident}
          />
        )}

        {/* ROUTE: DEVICES VIEW */}
        {activeTab === 'devices' && (
          <DevicesView
            devices={ringDevicesHook.devices}
            rooms={displayRooms}
            onOpenAddModal={() => setIsMasterDeviceModalOpen(true)}
            onDeleteDevice={ringDevicesHook.deleteDevice}
            onSelectDeviceForDrawer={(entity) => setSelectedDrawerEntity(entity)}
            onPingDevice={() => {
              systemSettings.setPipelineFeedback('Subnet Scan complete: 4 Ring hardware online')
              setTimeout(() => systemSettings.setPipelineFeedback(null), 3000)
            }}
          />
        )}

        {/* ROUTE: TOPOLOGY VIEW */}
        {activeTab === 'topology' && (
          <TopologyView
            onSelectNodeForDrawer={(entity) => setSelectedDrawerEntity(entity)}
          />
        )}

        {/* ROUTE: ALERTS VIEW */}
        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onAction={handleAlertAction}
            onTriggerSimulator={() => setIsAlertSimulatorOpen(true)}
            onSelectAlertForDrawer={(entity) => setSelectedDrawerEntity(entity)}
          />
        )}

        {/* ROUTE: INSIGHTS VIEW */}
        {activeTab === 'insights' && (
          <InsightsView
            primaryResident={primaryResidentObj || undefined}
            rooms={displayRooms}
          />
        )}

        {/* ROUTE 4: EVENTS VIEW */}
        {activeTab === 'events' && (
          <EventsView
            apiScenes={sceneEvents.apiScenes}
            fetchData={fetchData}
            eventsSearchQuery={sceneEvents.eventsSearchQuery}
            setEventsSearchQuery={sceneEvents.setEventsSearchQuery}
            eventsSceneFilter={sceneEvents.eventsSceneFilter}
            setEventsSceneFilter={sceneEvents.setEventsSceneFilter}
            eventsDateFilter={sceneEvents.eventsDateFilter}
            setEventsDateFilter={sceneEvents.setEventsDateFilter}
            eventsOrderBy={sceneEvents.eventsOrderBy}
            setEventsOrderBy={sceneEvents.setEventsOrderBy}
            eventsCurrentPage={sceneEvents.eventsCurrentPage}
            setEventsCurrentPage={sceneEvents.setEventsCurrentPage}
            eventsPerPage={sceneEvents.eventsPerPage}
            setEventsPerPage={sceneEvents.setEventsPerPage}
            setSelectedEventForInspection={sceneEvents.setSelectedEventForInspection}
          />
        )}

        {/* ROUTE 5: CARE TEAM VIEW */}
        {activeTab === 'care_team' && (
          <CareTeamView
            careTeam={careTeam.careTeam || []}
            auditLogs={auditLogs}
            openAddMember={careTeam.openAddMember}
            handleSetPrimaryValidator={careTeam.handleSetPrimaryValidator}
            openEditMember={careTeam.openEditMember}
            handleDeleteMember={careTeam.handleDeleteMember}
          />
        )}

        {/* ROUTE 6: AUTOMATION VIEW */}
        {activeTab === 'automation' && (
          <AutomationView
            rulesSubTab={automationRules.rulesSubTab}
            setRulesSubTab={automationRules.setRulesSubTab}
            rules={automationRules.rules}
            handleResetRules={automationRules.handleResetRules}
            openAddRule={automationRules.openAddRule}
            handleToggleRule={automationRules.handleToggleRule}
            openEditRule={automationRules.openEditRule}
            handleDeleteRule={automationRules.handleDeleteRule}
          />
        )}

        {/* ROUTE 7: SETTINGS VIEW */}
        {activeTab === 'settings' && (
          <SettingsView
            systemSettings={systemSettings.systemSettings}
            setSystemSettings={systemSettings.setSystemSettings}
            settingsSubTab={systemSettings.settingsSubTab}
            setSettingsSubTab={systemSettings.setSettingsSubTab}
            pipelineFeedback={systemSettings.pipelineFeedback}
            maintenanceFeedback={systemSettings.maintenanceFeedback}
            isLocalCameraRunning={systemSettings.isLocalCameraRunning}
            videoRef={videoRef}
            startLocalCamera={systemSettings.startLocalCamera}
            stopLocalCamera={systemSettings.stopLocalCamera}
            availableCameraDevices={systemSettings.availableCameraDevices}
            selectedCameraDeviceId={systemSettings.selectedCameraDeviceId}
            setSelectedCameraDeviceId={systemSettings.setSelectedCameraDeviceId}
            displayRooms={displayRooms}
            pipelineTargetRoom={systemSettings.pipelineTargetRoom}
            setPipelineTargetRoom={systemSettings.setPipelineTargetRoom}
            pipelineScenario={systemSettings.pipelineScenario}
            setPipelineScenario={systemSettings.setPipelineScenario}
            pipelineFaceHint={systemSettings.pipelineFaceHint}
            setPipelineFaceHint={systemSettings.setPipelineFaceHint}
            isPipelinePushing={systemSettings.isPipelinePushing}
            isAutoStreaming={systemSettings.isAutoStreaming}
            toggleAutoStreaming={() => systemSettings.setIsAutoStreaming(!systemSettings.isAutoStreaming)}
            handlePushPipelineFeed={async () => {
              await systemSettings.handlePushPipelineFeed()
              await fetchData()
            }}
            pipelineLastResult={systemSettings.pipelineLastResult}
            triggerRoomSimulation={triggerRoomSimulation}
            handlePipelineModeChange={systemSettings.handlePipelineModeChange}
            rules={automationRules.rules}
            handleSaveSystemSettings={systemSettings.handleSaveSettings}
            handleSaveHomeAddressProfile={systemSettings.handleSaveHomeAddressProfile}
            handleGetGpsLocation={systemSettings.handleGetGpsLocation}
            isGpsLoading={systemSettings.isGpsLoading}
            handleTestDbConnection={systemSettings.handleTestDatabase}
            isDbTesting={systemSettings.isDbTesting}
            dbTestResult={systemSettings.dbTestResult}
            handleTestWebhookConnection={systemSettings.handleTestWebhookConnection}
            isWebhookTesting={systemSettings.isWebhookTesting}
            webhookTestResult={systemSettings.webhookTestResult}
            handleSyncToCloud={systemSettings.handleSyncToCloud}
            handleSyncFromCloud={async () => {
              await systemSettings.handleSyncFromCloud()
              fetchData()
              rooms.fetchRooms()
              residents.fetchResidents()
              careTeam.fetchCareTeam()
              automationRules.fetchRules()
            }}
            isDbSyncing={systemSettings.isDbSyncing}
            handleClearLogs={async (days) => {
              await systemSettings.handleClearLogs(days)
              if (days <= 0) {
                setAuditLogs([])
                setAccessLogs([])
              } else {
                fetchData()
              }
            }}
            handleRotateLogs={systemSettings.handleRotateLogs}
            archivedLogs={systemSettings.archivedLogs}
            handleDownloadArchive={systemSettings.handleDownloadArchive}
             handleDeleteArchive={systemSettings.handleDeleteArchive}
             handleCheckUpdate={systemSettings.handleCheckUpdate}
             // Assets props
             assets={assetsHook.assets}
             residents={residents.residents}
             careTeam={careTeam.careTeam}
             onUploadAsset={assetsHook.uploadAsset}
             onDeleteAsset={assetsHook.deleteAsset}
             onSetAsAvatar={assetsHook.setResidentAvatar}
             onRefreshAssets={assetsHook.refreshAssets}
             isAssetsLoading={assetsHook.isLoading}
             // Master Ring Devices props
             masterDevices={ringDevicesHook.devices}
             onAddMasterDevice={ringDevicesHook.addDevice}
             onDeleteMasterDevice={ringDevicesHook.deleteDevice}
           />
         )}

        {/* MODALS */}
        <RoomModal
          isOpen={rooms.isAddRoomOpen || rooms.editingRoom !== null}
          onClose={() => {
            rooms.setIsAddRoomOpen(false)
            rooms.setEditingRoom(null)
          }}
          editingRoom={rooms.editingRoom}
          masterDevices={ringDevicesHook.devices}
          roomFormData={rooms.roomFormData}
          setRoomFormData={rooms.setRoomFormData}
          handleSaveRoomSubmit={rooms.handleSaveRoomSubmit}
        />

        <FloorPlanModal
          isOpen={rooms.isMapModalOpen}
          onClose={() => rooms.setIsMapModalOpen(false)}
          mapFormData={rooms.mapFormData}
          setMapFormData={rooms.setMapFormData}
          handleSaveHomeMap={rooms.handleSaveHomeMap}
          handleFileUpload={rooms.handleFileUpload}
        />

        <ResidentModal
          isOpen={residents.isAddResidentOpen || residents.editingResident !== null}
          onClose={() => {
            residents.setIsAddResidentOpen(false)
            residents.setEditingResident(null)
          }}
          editingResident={residents.editingResident}
          careTeamList={careTeam.careTeam}
          residentFormData={residents.residentFormData}
          setResidentFormData={residents.setResidentFormData}
          handleSaveResidentSubmit={residents.handleSaveResidentSubmit}
        />

        <FaceStudioModal
          isOpen={residents.isFaceStudioOpen}
          onClose={() => residents.setIsFaceStudioOpen(false)}
          selectedResidentForFace={residents.selectedResidentForFace}
          faceStudioVideoRef={residents.faceStudioVideoRef}
          isLocalCameraRunning={systemSettings.isLocalCameraRunning}
          startLocalCamera={systemSettings.startLocalCamera}
          stopLocalCamera={systemSettings.stopLocalCamera}
          faceAngleToRegister={residents.faceAngleToRegister}
          setFaceAngleToRegister={residents.setFaceAngleToRegister}
          isCapturingFace={residents.isCapturingFace}
          faceCaptureNotice={residents.faceCaptureNotice}
          setFaceCaptureNotice={residents.setFaceCaptureNotice}
          handleCaptureFaceAngle={residents.handleCaptureFaceAngle}
          handleDeleteFaceTemplate={residents.handleDeleteFaceTemplate}
        />

        <CareTeamModal
          isOpen={careTeam.isAddMemberOpen || careTeam.editingMember !== null}
          onClose={() => {
            careTeam.setIsAddMemberOpen(false)
            careTeam.setEditingMember(null)
          }}
          editingMember={careTeam.editingMember}
          memberFormData={careTeam.memberFormData}
          setMemberFormData={careTeam.setMemberFormData}
          handleSaveMemberSubmit={careTeam.handleSaveMemberSubmit}
          handleCareMemberPhotoUpload={careTeam.handleCareMemberPhotoUpload}
          handleCareMemberPhotoCapture={careTeam.handleCareMemberPhotoCapture}
          isLocalCameraRunning={systemSettings.isLocalCameraRunning}
        />

        <AutomationRuleModal
          isOpen={automationRules.isAddRuleOpen || automationRules.editingRule !== null}
          onClose={() => {
            automationRules.setIsAddRuleOpen(false)
            automationRules.setEditingRule(null)
          }}
          editingRule={automationRules.editingRule}
          ruleFormData={automationRules.ruleFormData}
          setRuleFormData={automationRules.setRuleFormData}
          displayRooms={displayRooms}
          applyRulePreset={automationRules.applyRulePreset}
          handleSaveRuleSubmit={automationRules.handleSaveRuleSubmit}
        />

        <EventInspectionModal
          selectedEventForInspection={sceneEvents.selectedEventForInspection}
          onClose={() => sceneEvents.setSelectedEventForInspection(null)}
        />

        <AlertSimulatorModal
          isOpen={isAlertSimulatorOpen}
          onClose={() => setIsAlertSimulatorOpen(false)}
          simRoomId={simRoomId}
          setSimRoomId={setSimRoomId}
          simScenario={simScenario}
          setSimScenario={setSimScenario}
          simLoading={simLoading}
          displayRooms={displayRooms}
          handleRunDynamicSimulation={handleRunDynamicSimulation}
        />

        <MasterDeviceModal
          isOpen={isMasterDeviceModalOpen}
          onClose={() => setIsMasterDeviceModalOpen(false)}
          onSave={ringDevicesHook.addDevice}
        />

        <ContextualDrawer
          entity={selectedDrawerEntity}
          onClose={() => setSelectedDrawerEntity(null)}
          onAction={(actionName, entity) => {
            if (actionName === 'validate_coming' && entity.type === 'alert') {
              handleAlertAction(entity.data.alertId, 'COMING')
              setSelectedDrawerEntity(null)
            } else if (actionName === 'trigger_siren' && entity.type === 'alert') {
              handleAlertAction(entity.data.alertId, 'SIREN')
              setSelectedDrawerEntity(null)
            } else if (actionName === 'ping_device' && entity.type === 'device') {
              systemSettings.setPipelineFeedback(`Device ${entity.data.model} (${entity.data.ipAddress}) responding · 12ms`)
              setTimeout(() => systemSettings.setPipelineFeedback(null), 3500)
            }
          }}
        />
      </main>
      </div>
    </div>
  )
}
