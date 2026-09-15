import { useState, useRef, useCallback } from 'react'
import type { Room, RoomState, HomeMapConfig, RingDeviceType } from '../domain/contracts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

export const initialDefaultRooms: Room[] = [
  {
    id: 'living_room',
    name: 'Living Room',
    floor: 'Floor 1',
    deviceId: 'cam_living',
    deviceName: 'Ring Living Room',
    deviceType: 'Indoor Cam',
    signalDbm: 'Excellent · -38 dBm',
    mapCoordinates: { x: 32, y: 35 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    floor: 'Floor 1',
    deviceId: 'cam_bedroom',
    deviceName: 'Ring Bedroom',
    deviceType: 'Indoor Cam',
    signalDbm: 'Excellent · -42 dBm',
    mapCoordinates: { x: 72, y: 35 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'corridor',
    name: 'Corridor',
    floor: 'Floor 1',
    deviceId: 'cam_corridor',
    deviceName: 'Ring Corridor',
    deviceType: 'Stick Up Cam',
    signalDbm: 'Good · -58 dBm',
    mapCoordinates: { x: 50, y: 68 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'entry',
    name: 'Entry / Front Door',
    floor: 'Floor 1',
    deviceId: 'doorbell_entry',
    deviceName: 'Ring Front Door',
    deviceType: 'Video Doorbell',
    signalDbm: 'Good · -61 dBm',
    mapCoordinates: { x: 82, y: 80 },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export interface RoomFormData {
  name: string
  floor: string
  deviceId: string
  deviceName: string
  deviceType: RingDeviceType
  signalDbm: string
  mapX: number
  mapY: number
}

export interface MapFormData {
  presetName: string
  mapUrl: string
}

export interface UseRoomsReturn {
  rawRooms: Room[]
  roomStates: RoomState[]
  homeMap: HomeMapConfig

  isAddRoomOpen: boolean
  editingRoom: Room | null
  isMapModalOpen: boolean
  pinningRoomId: string | null
  hoveredRoomId: string | null
  draggingRoomId: string | null
  dragCoords: { [roomId: string]: { x: number; y: number } }
  roomFormData: RoomFormData
  mapFormData: MapFormData
  mapNotice: string | null

  setIsAddRoomOpen: (open: boolean) => void
  setEditingRoom: (room: Room | null) => void
  setIsMapModalOpen: (open: boolean) => void
  setRoomFormData: React.Dispatch<React.SetStateAction<RoomFormData>>
  setMapFormData: React.Dispatch<React.SetStateAction<MapFormData>>
  setHoveredRoomId: (id: string | null) => void
  setPinningRoomId: (id: string | null) => void
  setMapNotice: (notice: string | null) => void
  setRawRooms: (rooms: Room[]) => void
  setRoomStates: (states: RoomState[]) => void

  openAddRoom: () => void
  openEditRoom: (room: Room) => void
  handleSaveRoomSubmit: (e: React.FormEvent) => Promise<void>
  handleDeleteRoom: (roomId: string, name: string) => Promise<void>
  saveRoomCoordinates: (roomId: string, x: number, y: number) => Promise<void>
  handleMouseDownPin: (e: React.MouseEvent, roomId: string) => void
  handleMouseMoveCanvas: (e: React.MouseEvent<HTMLDivElement>) => void
  handleMouseUpCanvas: () => Promise<void>
  handleMapCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => Promise<void>
  handleSaveHomeMap: (e: React.FormEvent) => Promise<void>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  fetchRooms: () => Promise<void>

  canvasRef: React.RefObject<HTMLDivElement | null>
}

export function useRooms(): UseRoomsReturn {
  const [rawRooms, setRawRooms] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_rooms')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return initialDefaultRooms
  })
  const [roomStates, setRoomStates] = useState<RoomState[]>([])
  const [homeMap, setHomeMap] = useState<HomeMapConfig>({
    mapUrl: '',
    presetName: 'Default Greenwood Blueprint',
    updatedAt: new Date().toISOString(),
  })

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [pinningRoomId, setPinningRoomId] = useState<string | null>(null)
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null)
  const [draggingRoomId, setDraggingRoomId] = useState<string | null>(null)
  const [dragCoords, setDragCoords] = useState<{ [roomId: string]: { x: number; y: number } }>({})
  const [mapNotice, setMapNotice] = useState<string | null>(null)

  const [roomFormData, setRoomFormData] = useState<RoomFormData>({
    name: '',
    floor: 'Floor 1',
    deviceId: '',
    deviceName: '',
    deviceType: 'Indoor Cam',
    signalDbm: 'Excellent · -38 dBm',
    mapX: 50,
    mapY: 50,
  })

  const [mapFormData, setMapFormData] = useState<MapFormData>({
    presetName: 'Default Greenwood Blueprint',
    mapUrl: '',
  })

  const canvasRef = useRef<HTMLDivElement | null>(null)

  const syncRoomsToStorage = (rooms: Room[]) => {
    try {
      localStorage.setItem('hestia_rooms', JSON.stringify(rooms))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`)
      if (res.ok) {
        const data = await res.json()
        if (data.rawRooms && Array.isArray(data.rawRooms)) {
          setRawRooms(data.rawRooms)
          syncRoomsToStorage(data.rawRooms)
        }
        if (data.rooms && Array.isArray(data.rooms)) {
          setRoomStates(data.rooms)
        }
      }
    } catch {
      // Offline fallback
    }
  }, [])

  const openAddRoom = useCallback(() => {
    setRoomFormData({
      name: '',
      floor: 'Floor 1',
      deviceId: '',
      deviceName: '',
      deviceType: 'Indoor Cam',
      signalDbm: 'Excellent · -38 dBm',
      mapX: 50,
      mapY: 50,
    })
    setEditingRoom(null)
    setIsAddRoomOpen(true)
  }, [])

  const openEditRoom = useCallback((room: Room) => {
    setRoomFormData({
      name: room.name,
      floor: room.floor || 'Floor 1',
      deviceId: room.deviceId || '',
      deviceName: room.deviceName || '',
      deviceType: room.deviceType || 'Indoor Cam',
      signalDbm: room.signalDbm || 'Good · -55 dBm',
      mapX: room.mapCoordinates?.x ?? 50,
      mapY: room.mapCoordinates?.y ?? 50,
    })
    setEditingRoom(room)
    setIsAddRoomOpen(true)
  }, [])

  const handleSaveRoomSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!roomFormData.name.trim()) return

      const payload = {
        name: roomFormData.name.trim(),
        floor: roomFormData.floor,
        deviceId: roomFormData.deviceId.trim() || `ring_${roomFormData.name.toLowerCase().replace(/\s+/g, '_')}`,
        deviceName: roomFormData.deviceName.trim() || `Ring ${roomFormData.name.trim()}`,
        deviceType: roomFormData.deviceType,
        signalDbm: roomFormData.signalDbm,
        mapCoordinates: { x: Number(roomFormData.mapX), y: Number(roomFormData.mapY) },
      }

      try {
        if (editingRoom) {
          const res = await fetch(`${API_BASE}/api/rooms/${editingRoom.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.rawRooms) {
              setRawRooms(data.rawRooms)
              syncRoomsToStorage(data.rawRooms)
            }
          } else {
            const updated = rawRooms.map((r) => (r.id === editingRoom.id ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r))
            setRawRooms(updated)
            syncRoomsToStorage(updated)
          }
          setMapNotice(`Room "${payload.name}" updated successfully`)
        } else {
          const res = await fetch(`${API_BASE}/api/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.rawRooms) {
              setRawRooms(data.rawRooms)
              syncRoomsToStorage(data.rawRooms)
            }
          } else {
            const newRoom: Room = {
              id: `room_${Date.now()}`,
              ...payload,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const updated = [...rawRooms, newRoom]
            setRawRooms(updated)
            syncRoomsToStorage(updated)
          }
          setMapNotice(`Room "${payload.name}" created successfully`)
        }

        setTimeout(() => setMapNotice(null), 3000)
        setIsAddRoomOpen(false)
        setEditingRoom(null)
      } catch (error) {
        console.error('Error saving room:', error)
        setIsAddRoomOpen(false)
      }
    },
    [roomFormData, editingRoom, rawRooms]
  )

  const handleDeleteRoom = useCallback(
    async (roomId: string, name: string) => {
      if (!confirm(`Delete room "${name}"?`)) return

      try {
        await fetch(`${API_BASE}/api/rooms/${roomId}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
      const updated = rawRooms.filter((r) => r.id !== roomId)
      setRawRooms(updated)
      syncRoomsToStorage(updated)
      setRoomStates((prev) => prev.filter((r) => r.roomId !== roomId))
      setMapNotice(`Room "${name}" deleted successfully`)
      setTimeout(() => setMapNotice(null), 3000)
    },
    [rawRooms]
  )

  const saveRoomCoordinates = useCallback(
    async (roomId: string, x: number, y: number) => {
      const roundedX = Math.round(x)
      const roundedY = Math.round(y)
      try {
        const res = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mapCoordinates: { x: roundedX, y: roundedY } }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.rawRooms) {
            setRawRooms(data.rawRooms)
            syncRoomsToStorage(data.rawRooms)
          }
        }
      } catch {
        // offline update
        const updated = rawRooms.map((r) => (r.id === roomId ? { ...r, mapCoordinates: { x: roundedX, y: roundedY } } : r))
        setRawRooms(updated)
        syncRoomsToStorage(updated)
      }
      setMapNotice(`Camera pin position calibrated (${roundedX}%, ${roundedY}%)`)
      setTimeout(() => setMapNotice(null), 3000)
    },
    [rawRooms]
  )

  const handleMouseDownPin = useCallback((e: React.MouseEvent, roomId: string) => {
    e.preventDefault()
    setDraggingRoomId(roomId)
  }, [])

  const handleMouseMoveCanvas = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingRoomId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))

    setDragCoords((prev) => ({
      ...prev,
      [draggingRoomId]: { x: Math.round(x), y: Math.round(y) },
    }))
  }, [draggingRoomId])

  const handleMouseUpCanvas = useCallback(async () => {
    if (!draggingRoomId) return
    const coords = dragCoords[draggingRoomId]
    if (coords) {
      await saveRoomCoordinates(draggingRoomId, coords.x, coords.y)
    }
    setDraggingRoomId(null)
  }, [draggingRoomId, dragCoords, saveRoomCoordinates])

  const handleMapCanvasClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!pinningRoomId || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))

      await saveRoomCoordinates(pinningRoomId, x, y)
      setPinningRoomId(null)
    },
    [pinningRoomId, saveRoomCoordinates]
  )

  const handleSaveHomeMap = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const res = await fetch(`${API_BASE}/api/home/map`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            presetName: mapFormData.presetName,
            mapUrl: mapFormData.mapUrl,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          setHomeMap(data.map || data)
          setMapNotice('Floor plan blueprint updated successfully')
          setTimeout(() => setMapNotice(null), 3000)
          setIsMapModalOpen(false)
        }
      } catch (error) {
        console.error('Error saving home map:', error)
      }
    },
    [mapFormData]
  )

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setMapFormData((prev) => ({
        ...prev,
        mapUrl: result,
      }))
    }
    reader.readAsDataURL(file)
  }, [])

  return {
    rawRooms,
    roomStates,
    homeMap,
    isAddRoomOpen,
    editingRoom,
    isMapModalOpen,
    pinningRoomId,
    hoveredRoomId,
    draggingRoomId,
    dragCoords,
    roomFormData,
    mapFormData,
    mapNotice,
    setIsAddRoomOpen,
    setEditingRoom,
    setIsMapModalOpen,
    setRoomFormData,
    setMapFormData,
    setHoveredRoomId,
    setPinningRoomId,
    setMapNotice,
    setRawRooms,
    setRoomStates,
    openAddRoom,
    openEditRoom,
    handleSaveRoomSubmit,
    handleDeleteRoom,
    saveRoomCoordinates,
    handleMouseDownPin,
    handleMouseMoveCanvas,
    handleMouseUpCanvas,
    handleMapCanvasClick,
    handleSaveHomeMap,
    handleFileUpload,
    fetchRooms,
    canvasRef,
  }
}
