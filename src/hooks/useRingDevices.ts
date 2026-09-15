import { useState, useEffect, useCallback } from 'react'
import type { RingMasterDevice } from '../domain/contracts'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : '')

export function useRingDevices() {
  const [devices, setDevices] = useState<RingMasterDevice[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE}/api/ring-devices`)
      if (res.ok) {
        const data = await res.json()
        if (data.devices) {
          setDevices(data.devices)
        }
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDevices()
    const interval = setInterval(fetchDevices, 4000)
    return () => clearInterval(interval)
  }, [fetchDevices])

  const addDevice = useCallback(async (dev: Partial<RingMasterDevice>) => {
    try {
      const res = await fetch(`${API_BASE}/api/ring-devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dev),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.devices) setDevices(data.devices)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const deleteDevice = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/ring-devices/${id}`, { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        if (data.devices) setDevices(data.devices)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  return {
    devices,
    isLoading,
    fetchDevices,
    addDevice,
    deleteDevice,
  }
}
