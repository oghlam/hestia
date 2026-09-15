import { useState, useCallback, useMemo } from 'react'
import type { SceneEvent } from '../domain/contracts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

export const defaultDemoScenes: SceneEvent[] = [
  {
    sceneId: 'scene_001',
    eventId: 'evt_001',
    scene: 'S1_NORMAL',
    confidence: 0.94,
    roomId: 'living_room',
    residentId: 'resident_eleanor',
    signals: ['Human motion detected', 'Frontal face pose verified', 'Comfortable seated posture'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_eleanor',
      name: 'Eleanor Vance',
      confidence: 0.96,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Eleanor is seated in living room sofa reading comfortably. Ambient motion and posture routine normal.',
    createdAt: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    sceneId: 'scene_002',
    eventId: 'evt_002',
    scene: 'S2_WATCH',
    confidence: 0.88,
    roomId: 'entry',
    signals: ['Doorbell chime', 'Unregistered person standing at porch'],
    identity: {
      identity: 'unknown',
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Front doorbell motion detected. Visitor at porch cataloged in Access Log without alarm escalation.',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    sceneId: 'scene_003',
    eventId: 'evt_003',
    scene: 'S1_NORMAL',
    confidence: 0.92,
    roomId: 'bedroom',
    residentId: 'resident_eleanor',
    signals: ['Routine bedtime movement', 'Bedside lamp active'],
    identity: {
      identity: 'known_target',
      residentId: 'resident_eleanor',
      name: 'Eleanor Vance',
      confidence: 0.93,
      faceCount: 1,
      source: 'ring_snapshot',
    },
    contextText: 'Evening routine in primary bedroom. Normal posture with standard resting vitals.',
    createdAt: new Date(Date.now() - 170 * 60000).toISOString(),
  },
]

export interface EventsFilterState {
  searchQuery: string
  sceneFilter: string
  dateFilter: string
  orderBy: 'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc'
  currentPage: number
  perPage: number
}

export interface UseSceneEventsReturn {
  apiScenes: SceneEvent[]
  selectedEventForInspection: SceneEvent | null
  eventsSearchQuery: string
  eventsSceneFilter: string
  eventsDateFilter: string
  eventsOrderBy: 'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc'
  eventsCurrentPage: number
  eventsPerPage: number
  filteredAndSortedEvents: SceneEvent[]
  paginatedEvents: SceneEvent[]
  totalPages: number

  setSelectedEventForInspection: (event: SceneEvent | null) => void
  setEventsSearchQuery: (query: string) => void
  setEventsSceneFilter: (filter: string) => void
  setEventsDateFilter: (filter: string) => void
  setEventsOrderBy: (order: 'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc') => void
  setEventsCurrentPage: React.Dispatch<React.SetStateAction<number>>
  setEventsPerPage: (perPage: number) => void
  setApiScenes: (scenes: SceneEvent[]) => void

  handleSelectEvent: (event: SceneEvent) => void
  handleClearEventFilters: () => void
  fetchScenes: () => Promise<void>
}

export function useSceneEvents(): UseSceneEventsReturn {
  const [apiScenes, setApiScenes] = useState<SceneEvent[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_scenes')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return defaultDemoScenes
  })

  const [selectedEventForInspection, setSelectedEventForInspection] = useState<SceneEvent | null>(null)
  const [eventsSearchQuery, setEventsSearchQuery] = useState('')
  const [eventsSceneFilter, setEventsSceneFilter] = useState('all')
  const [eventsDateFilter, setEventsDateFilter] = useState('')
  const [eventsOrderBy, setEventsOrderBy] = useState<'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc'>('time_desc')
  const [eventsCurrentPage, setEventsCurrentPage] = useState(1)
  const [eventsPerPage, setEventsPerPage] = useState(10)

  const syncScenesToStorage = (scenes: SceneEvent[]) => {
    try {
      localStorage.setItem('hestia_scenes', JSON.stringify(scenes))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchScenes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scenes`)
      if (res.ok) {
        const data = await res.json()
        if (data.scenes && Array.isArray(data.scenes) && data.scenes.length > 0) {
          setApiScenes(data.scenes)
          syncScenesToStorage(data.scenes)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const filteredAndSortedEvents = useMemo(() => {
    let events = [...apiScenes]

    if (eventsSearchQuery.trim()) {
      const query = eventsSearchQuery.toLowerCase()
      events = events.filter((e) => {
        const nameMatch = (e.identity?.name || (e.identity?.identity === 'unknown' ? 'visitor' : '')).toLowerCase().includes(query)
        const roomMatch = (e.roomId || '').toLowerCase().includes(query)
        const sceneMatch = (e.scene || '').toLowerCase().includes(query)
        const contextMatch = (e.contextText || '').toLowerCase().includes(query)
        return nameMatch || roomMatch || sceneMatch || contextMatch
      })
    }

    if (eventsSceneFilter !== 'all') {
      events = events.filter((e) => e.scene === eventsSceneFilter)
    }

    if (eventsDateFilter) {
      events = events.filter((e) => {
        const dateStr = new Date(e.createdAt).toISOString().split('T')[0]
        return dateStr === eventsDateFilter
      })
    }

    switch (eventsOrderBy) {
      case 'time_desc':
        events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'time_asc':
        events.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'confidence_desc':
        events.sort((a, b) => b.confidence - a.confidence)
        break
      case 'scene_desc': {
        const rank: Record<string, number> = { S4_CRITICAL: 4, S3_HELP: 3, S2_WATCH: 2, S1_NORMAL: 1 }
        events.sort((a, b) => (rank[b.scene] || 0) - (rank[a.scene] || 0))
        break
      }
      case 'room_asc':
        events.sort((a, b) => a.roomId.localeCompare(b.roomId))
        break
    }

    return events
  }, [apiScenes, eventsSearchQuery, eventsSceneFilter, eventsDateFilter, eventsOrderBy])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedEvents.length / eventsPerPage))

  const paginatedEvents = useMemo(() => {
    const start = (eventsCurrentPage - 1) * eventsPerPage
    return filteredAndSortedEvents.slice(start, start + eventsPerPage)
  }, [filteredAndSortedEvents, eventsCurrentPage, eventsPerPage])

  const handleSelectEvent = useCallback((event: SceneEvent) => {
    setSelectedEventForInspection(event)
  }, [])

  const handleClearEventFilters = useCallback(() => {
    setEventsSearchQuery('')
    setEventsSceneFilter('all')
    setEventsDateFilter('')
    setEventsOrderBy('time_desc')
    setEventsCurrentPage(1)
  }, [])

  return {
    apiScenes,
    selectedEventForInspection,
    eventsSearchQuery,
    eventsSceneFilter,
    eventsDateFilter,
    eventsOrderBy,
    eventsCurrentPage,
    eventsPerPage,
    filteredAndSortedEvents,
    paginatedEvents,
    totalPages,
    setSelectedEventForInspection,
    setEventsSearchQuery,
    setEventsSceneFilter,
    setEventsDateFilter,
    setEventsOrderBy,
    setEventsCurrentPage,
    setEventsPerPage,
    setApiScenes,
    handleSelectEvent,
    handleClearEventFilters,
    fetchScenes,
  }
}
