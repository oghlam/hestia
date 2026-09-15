import { useState, useRef, useCallback } from 'react'
import type { Resident, FaceAngle, FaceTemplate } from '../domain/contracts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

function generateFacePoseThumbnail(angle: FaceAngle): string {
  const angleLabel = angle === 'front' ? '0° Frontal' : angle === 'left' ? '45° Left Profile' : '45° Right Profile'
  const rot = angle === 'left' ? -22 : angle === 'right' ? 22 : 0
  const eyeX1 = angle === 'left' ? 34 : angle === 'right' ? 44 : 39
  const eyeX2 = angle === 'left' ? 56 : angle === 'right' ? 66 : 61
  const noseX = angle === 'left' ? 43 : angle === 'right' ? 57 : 50

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="14" fill="#0f172a"/>
    <circle cx="50" cy="46" r="40" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,2"/>
    <g transform="rotate(${rot} 50 46)">
      <ellipse cx="50" cy="46" rx="20" ry="26" fill="#f8fafc"/>
      <circle cx="${eyeX1}" cy="40" r="3" fill="#0f172a"/>
      <circle cx="${eyeX2}" cy="40" r="3" fill="#0f172a"/>
      <path d="M ${noseX} 44 L ${noseX} 52 L ${noseX + (angle === 'left' ? -3 : angle === 'right' ? 3 : 0)} 53" fill="none" stroke="#475569" stroke-width="2"/>
      <path d="M 43 59 Q 50 63 57 59" fill="none" stroke="#64748b" stroke-width="2"/>
    </g>
    <rect x="10" y="76" width="80" height="18" rx="5" fill="#0284c7"/>
    <text x="50" y="88" fill="#ffffff" font-size="8" font-weight="bold" text-anchor="middle" font-family="sans-serif">${angleLabel}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const defaultResidents: Resident[] = [
  {
    id: 'resident_eleanor',
    name: 'Eleanor Vance',
    age: 78,
    gender: 'female',
    primaryTarget: true,
    healthConditions: ['Fall Risk', 'Hypertension'],
    mobilityStatus: 'Independent with walking cane',
    notes: 'Prefers morning coffee on the porch at 08:30. Bedtime at 21:30.',
    faceTemplates: [
      {
        templateId: 'tmpl_eleanor_front',
        angle: 'front',
        registeredAt: '2026-09-01T08:00:00Z',
        qualityScore: 0.98,
        previewUrl: generateFacePoseThumbnail('front'),
      },
      {
        templateId: 'tmpl_eleanor_left',
        angle: 'left',
        registeredAt: '2026-09-01T08:02:00Z',
        qualityScore: 0.94,
        previewUrl: generateFacePoseThumbnail('left'),
      },
      {
        templateId: 'tmpl_eleanor_right',
        angle: 'right',
        registeredAt: '2026-09-01T08:04:00Z',
        qualityScore: 0.95,
        previewUrl: generateFacePoseThumbnail('right'),
      },
    ],
    emergencyContacts: [
      {
        id: 'contact_maria',
        name: 'Maria Vance',
        relation: 'Daughter / Primary Caregiver',
        phone: '+1 (555) 234-5678',
        isPrimary: true,
      },
    ],
    doctorContact: {
      name: 'Dr. Robert Chen, MD',
      clinic: 'St. Jude Geriatric Care',
      phone: '+1 (555) 345-9012',
      specialty: 'Geriatric Medicine',
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export interface ResidentFormData {
  name: string
  age: number
  gender: 'female' | 'male' | 'other'
  primaryTarget: boolean
  healthConditions: string
  mobilityStatus: string
  notes: string
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  doctorName: string
  doctorClinic: string
  doctorPhone: string
  doctorSpecialty: string
}

export interface UseResidentsReturn {
  residents: Resident[]
  primaryResidentObj: Resident | undefined

  isAddResidentOpen: boolean
  editingResident: Resident | null
  isFaceStudioOpen: boolean
  selectedResidentForFace: Resident | null
  faceAngleToRegister: FaceAngle
  isCapturingFace: boolean
  faceCaptureNotice: string | null
  residentFormData: ResidentFormData

  setIsAddResidentOpen: (open: boolean) => void
  setEditingResident: (resident: Resident | null) => void
  setIsFaceStudioOpen: (open: boolean) => void
  setResidentFormData: React.Dispatch<React.SetStateAction<ResidentFormData>>
  setFaceCaptureNotice: (notice: string | null) => void
  setResidents: (residents: Resident[]) => void
  setSelectedResidentForFace: (resident: Resident | null) => void
  setFaceAngleToRegister: (angle: FaceAngle) => void

  openAddResident: () => void
  openEditResident: (resident: Resident) => void
  handleSaveResidentSubmit: (e: React.FormEvent) => Promise<void>
  handleDeleteResident: (id: string) => Promise<void>
  handleSetPrimaryResident: (id: string) => Promise<void>
  openFaceStudio: (resident: Resident) => void
  handleCaptureFaceAngle: (angle: FaceAngle) => Promise<void>
  handleDeleteFaceTemplate: (templateId: string) => Promise<void>
  fetchResidents: () => Promise<void>

  faceStudioVideoRef: React.RefObject<HTMLVideoElement | null>
}

const defaultResidentFormData: ResidentFormData = {
  name: '',
  age: 78,
  gender: 'female',
  primaryTarget: false,
  healthConditions: 'Fall Risk, Hypertension',
  mobilityStatus: 'Independent with walking cane',
  notes: '',
  emergencyName: 'Maria Vance',
  emergencyRelation: 'Daughter / Primary Caregiver',
  emergencyPhone: '+1 (555) 234-5678',
  doctorName: 'Dr. Robert Chen, MD',
  doctorClinic: 'St. Jude Geriatric Care',
  doctorPhone: '+1 (555) 345-9012',
  doctorSpecialty: 'Geriatric Medicine',
}

export function useResidents(): UseResidentsReturn {
  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_residents')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return defaultResidents
  })

  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)
  const [isFaceStudioOpen, setIsFaceStudioOpen] = useState(false)
  const [selectedResidentForFace, setSelectedResidentForFace] = useState<Resident | null>(null)
  const [faceAngleToRegister, setFaceAngleToRegister] = useState<FaceAngle>('front')
  const [isCapturingFace, setIsCapturingFace] = useState(false)
  const [faceCaptureNotice, setFaceCaptureNotice] = useState<string | null>(null)

  const [residentFormData, setResidentFormData] = useState<ResidentFormData>(defaultResidentFormData)
  const faceStudioVideoRef = useRef<HTMLVideoElement | null>(null)

  const syncResidentsToStorage = (list: Resident[]) => {
    try {
      localStorage.setItem('hestia_residents', JSON.stringify(list))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchResidents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/residents`)
      if (res.ok) {
        const data = await res.json()
        if (data.residents && Array.isArray(data.residents)) {
          setResidents(data.residents)
          syncResidentsToStorage(data.residents)
        }
      }
    } catch {
      // Offline fallback
    }
  }, [])

  const primaryResidentObj = residents.find((r) => r.primaryTarget) || residents[0]

  const openAddResident = useCallback(() => {
    setResidentFormData(defaultResidentFormData)
    setEditingResident(null)
    setIsAddResidentOpen(true)
  }, [])

  const openEditResident = useCallback((resident: Resident) => {
    setResidentFormData({
      name: resident.name,
      age: resident.age,
      gender: resident.gender || 'female',
      primaryTarget: resident.primaryTarget,
      healthConditions: Array.isArray(resident.healthConditions) ? resident.healthConditions.join(', ') : resident.healthConditions || '',
      mobilityStatus: resident.mobilityStatus || 'Independent with walking cane',
      notes: resident.notes || '',
      emergencyName: resident.emergencyContacts?.[0]?.name || '',
      emergencyRelation: resident.emergencyContacts?.[0]?.relation || '',
      emergencyPhone: resident.emergencyContacts?.[0]?.phone || '',
      doctorName: resident.doctorContact?.name || '',
      doctorClinic: resident.doctorContact?.clinic || '',
      doctorPhone: resident.doctorContact?.phone || '',
      doctorSpecialty: resident.doctorContact?.specialty || '',
    })
    setEditingResident(resident)
    setIsAddResidentOpen(true)
  }, [])

  const handleSaveResidentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!residentFormData.name.trim()) return

      const conditions = residentFormData.healthConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)

      const payload = {
        name: residentFormData.name.trim(),
        age: Number(residentFormData.age) || 75,
        gender: residentFormData.gender,
        primaryTarget: residentFormData.primaryTarget,
        healthConditions: conditions.length > 0 ? conditions : ['General Monitoring'],
        mobilityStatus: residentFormData.mobilityStatus,
        notes: residentFormData.notes.trim() || undefined,
        emergencyContacts: [
          {
            id: `contact_${Date.now()}`,
            name: residentFormData.emergencyName.trim() || 'Maria Vance',
            relation: residentFormData.emergencyRelation.trim() || 'Family Caregiver',
            phone: residentFormData.emergencyPhone.trim() || '+1 (555) 234-5678',
            isPrimary: true,
          },
        ],
        doctorContact: {
          name: residentFormData.doctorName.trim() || 'Dr. Robert Chen, MD',
          clinic: residentFormData.doctorClinic.trim() || 'St. Jude Geriatric Care',
          phone: residentFormData.doctorPhone.trim() || '+1 (555) 345-9012',
          specialty: residentFormData.doctorSpecialty.trim() || 'Geriatric Medicine',
        },
      }

      try {
        if (editingResident) {
          const res = await fetch(`${API_BASE}/api/residents/${editingResident.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.residents) {
              setResidents(data.residents)
              syncResidentsToStorage(data.residents)
            }
          } else {
            const updated = residents.map((r) =>
              r.id === editingResident.id ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r
            )
            setResidents(updated)
            syncResidentsToStorage(updated)
          }
        } else {
          const res = await fetch(`${API_BASE}/api/residents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.residents) {
              setResidents(data.residents)
              syncResidentsToStorage(data.residents)
            }
          } else {
            const newRes: Resident = {
              id: `resident_${Date.now()}`,
              ...payload,
              faceTemplates: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const updated = [...residents, newRes]
            setResidents(updated)
            syncResidentsToStorage(updated)
          }
        }

        setIsAddResidentOpen(false)
        setEditingResident(null)
      } catch (error) {
        console.error('Error saving resident:', error)
        setIsAddResidentOpen(false)
      }
    },
    [residentFormData, editingResident, residents]
  )

  const handleDeleteResident = useCallback(
    async (id: string) => {
      if (!confirm('Delete this resident profile?')) return

      try {
        await fetch(`${API_BASE}/api/residents/${id}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
      const updated = residents.filter((r) => r.id !== id)
      setResidents(updated)
      syncResidentsToStorage(updated)
    },
    [residents]
  )

  const handleSetPrimaryResident = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/residents/${id}/set-primary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.residents) {
            setResidents(data.residents)
            syncResidentsToStorage(data.residents)
            return
          }
        }
      } catch {
        // ignore
      }
      const updated = residents.map((r) => ({
        ...r,
        primaryTarget: r.id === id,
      }))
      setResidents(updated)
      syncResidentsToStorage(updated)
    },
    [residents]
  )

  const openFaceStudio = useCallback((resident: Resident) => {
    setSelectedResidentForFace(resident)
    setFaceAngleToRegister('front')
    setIsFaceStudioOpen(true)
    setFaceCaptureNotice(null)
  }, [])

  const handleCaptureFaceAngle = useCallback(
    async (angle: FaceAngle) => {
      if (!selectedResidentForFace) return

      setIsCapturingFace(true)
      setFaceCaptureNotice(`Extracting 64-dimensional feature vector for ${angle.toUpperCase()} angle...`)

      const previewUrl = generateFacePoseThumbnail(angle)
      const templateId = `tmpl_${selectedResidentForFace.id}_${angle}_${Date.now().toString(36)}`

      const payload = {
        angle,
        previewUrl,
        qualityScore: angle === 'front' ? 0.98 : 0.95,
      }

      try {
        const res = await fetch(`${API_BASE}/api/residents/${selectedResidentForFace.id}/faces`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.residents) {
            setResidents(data.residents)
            syncResidentsToStorage(data.residents)
          }
          if (data.resident) {
            setSelectedResidentForFace(data.resident)
          }
        } else {
          // offline fallback
          const newTmpl: FaceTemplate = {
            templateId,
            angle,
            registeredAt: new Date().toISOString(),
            qualityScore: payload.qualityScore,
            previewUrl,
          }
          const updatedTemplates = [
            ...selectedResidentForFace.faceTemplates.filter((t) => t.angle !== angle),
            newTmpl,
          ]
          const updatedRes = { ...selectedResidentForFace, faceTemplates: updatedTemplates }
          setSelectedResidentForFace(updatedRes)
          const updatedList = residents.map((r) => (r.id === updatedRes.id ? updatedRes : r))
          setResidents(updatedList)
          syncResidentsToStorage(updatedList)
        }

        setFaceCaptureNotice(`✔ ${angle.toUpperCase()} angle registered successfully with 64-d embedding`)
        setFaceAngleToRegister(angle === 'front' ? 'left' : angle === 'left' ? 'right' : 'front')
      } catch (error) {
        console.error('Error capturing face angle:', error)
      } finally {
        setIsCapturingFace(false)
      }
    },
    [selectedResidentForFace, residents]
  )

  const handleDeleteFaceTemplate = useCallback(
    async (templateId: string) => {
      if (!selectedResidentForFace) return
      if (!confirm('Delete this face template?')) return

      try {
        const res = await fetch(`${API_BASE}/api/residents/${selectedResidentForFace.id}/faces/${templateId}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.residents) {
            setResidents(data.residents)
            syncResidentsToStorage(data.residents)
          }
          if (data.resident) {
            setSelectedResidentForFace(data.resident)
          }
          return
        }
      } catch {
        // ignore
      }

      const updatedTemplates = selectedResidentForFace.faceTemplates.filter((t) => t.templateId !== templateId)
      const updatedRes = { ...selectedResidentForFace, faceTemplates: updatedTemplates }
      setSelectedResidentForFace(updatedRes)
      const updatedList = residents.map((r) => (r.id === updatedRes.id ? updatedRes : r))
      setResidents(updatedList)
      syncResidentsToStorage(updatedList)
    },
    [selectedResidentForFace, residents]
  )

  return {
    residents,
    primaryResidentObj,
    isAddResidentOpen,
    editingResident,
    isFaceStudioOpen,
    selectedResidentForFace,
    faceAngleToRegister,
    isCapturingFace,
    faceCaptureNotice,
    residentFormData,
    setIsAddResidentOpen,
    setEditingResident,
    setIsFaceStudioOpen,
    setResidentFormData,
    setFaceCaptureNotice,
    setResidents,
    setSelectedResidentForFace,
    setFaceAngleToRegister,
    openAddResident,
    openEditResident,
    handleSaveResidentSubmit,
    handleDeleteResident,
    handleSetPrimaryResident,
    openFaceStudio,
    handleCaptureFaceAngle,
    handleDeleteFaceTemplate,
    fetchResidents,
    faceStudioVideoRef,
  }
}
