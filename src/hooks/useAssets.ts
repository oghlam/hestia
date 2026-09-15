import { useState, useEffect, useCallback } from 'react'
import type { Asset } from '../domain/contracts'

const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export interface UseAssetsReturn {
  assets: Asset[]
  isLoading: boolean
  error: string | null
  uploadAsset: (formData: FormData, type: string) => Promise<Asset>
  deleteAsset: (assetId: string) => Promise<boolean>
  setResidentAvatar: (residentId: string, assetId: string) => Promise<boolean>
  clearResidentAvatar: (residentId: string) => Promise<boolean>
  setTeamMemberAvatar: (memberId: string, assetId: string) => Promise<boolean>
  clearTeamMemberAvatar: (memberId: string) => Promise<boolean>
  refreshAssets: () => Promise<void>
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE}/api/assets`)
      if (!response.ok) throw new Error(`Failed to fetch assets: ${response.statusText}`)
      const data = await response.json()
      setAssets(data.assets || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch assets'
      setError(message)
      console.error('useAssets fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const uploadAsset = useCallback(
    async (formData: FormData, type: string): Promise<Asset> => {
      try {
        setIsLoading(true)
        setError(null)

        // Convert FormData to JSON for API
        const file = formData.get('file') as File
        const label = formData.get('label') as string

        if (!file) throw new Error('No file selected')

        // Read file as base64
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string
              const response = await fetch(`${API_BASE}/api/assets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type,
                  label: label || file.name.replace(/\.[^/.]+$/, ''),
                  fileName: file.name,
                  fileUrl: base64,
                  qualityScore: 0.85,
                }),
              })

              if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`)
              const asset = await response.json()
              setAssets(prev => [asset, ...prev])
              resolve(asset)
            } catch (err) {
              reject(err)
            } finally {
              setIsLoading(false)
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      }
    },
    []
  )

  const deleteAsset = useCallback(async (assetId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/api/assets/${assetId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(`Delete failed: ${response.statusText}`)
      setAssets(prev => prev.filter(a => a.assetId !== assetId))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setResidentAvatar = useCallback(
    async (residentId: string, assetId: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE}/api/residents/${residentId}/set-avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        })
        if (!response.ok) throw new Error('Failed to set avatar')
        return true
      } catch (err) {
        console.error('Set resident avatar error:', err)
        return false
      }
    },
    []
  )

  const clearResidentAvatar = useCallback(async (residentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/residents/${residentId}/clear-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to clear avatar')
      return true
    } catch (err) {
      console.error('Clear resident avatar error:', err)
      return false
    }
  }, [])

  const setTeamMemberAvatar = useCallback(
    async (memberId: string, assetId: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_BASE}/api/care-team/${memberId}/set-avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        })
        if (!response.ok) throw new Error('Failed to set avatar')
        return true
      } catch (err) {
        console.error('Set team member avatar error:', err)
        return false
      }
    },
    []
  )

  const clearTeamMemberAvatar = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/care-team/${memberId}/clear-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!response.ok) throw new Error('Failed to clear avatar')
      return true
    } catch (err) {
      console.error('Clear team member avatar error:', err)
      return false
    }
  }, [])

  return {
    assets,
    isLoading,
    error,
    uploadAsset,
    deleteAsset,
    setResidentAvatar,
    clearResidentAvatar,
    setTeamMemberAvatar,
    clearTeamMemberAvatar,
    refreshAssets: fetchAssets,
  }
}
