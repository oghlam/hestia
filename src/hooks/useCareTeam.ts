import { useState, useCallback } from 'react'
import type { CareTeamMember, CareTeamMemberRole, NotificationChannel } from '../domain/contracts'
import { mariaPortrait, johnPortrait, sarahPortrait, robertPortrait } from '../domain/mock-data'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

export const defaultCareTeam: CareTeamMember[] = [
  {
    id: 'member_maria',
    name: 'Maria Vance',
    role: 'primary_caregiver',
    relation: 'Daughter / Primary Validator',
    phone: '+1 (555) 234-5678',
    email: 'maria.vance@example.com',
    channel: 'push_sms',
    slaMinutes: 2,
    isPrimaryValidator: true,
    avatarUrl: mariaPortrait,
    shiftSchedule: '24/7 Primary Response',
    notes: 'Holds spare house key. First recipient of S3/S4 validation requests.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_john',
    name: 'John Vance',
    role: 'family_member',
    relation: 'Son / Secondary Family Contact',
    phone: '+1 (555) 345-6789',
    email: 'john.vance@example.com',
    channel: 'whatsapp',
    slaMinutes: 5,
    isPrimaryValidator: false,
    avatarUrl: johnPortrait,
    shiftSchedule: 'Evening & Weekend On-Call',
    notes: 'Lives 10 mins away. Backup driver for emergency visits.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_sarah',
    name: 'Sarah Jenkins, RN',
    role: 'professional_nurse',
    relation: 'Visiting Geriatric Nurse',
    phone: '+1 (555) 456-7890',
    email: 'sarah.rn@stjudecare.org',
    channel: 'push_sms',
    slaMinutes: 3,
    isPrimaryValidator: false,
    avatarUrl: sarahPortrait,
    shiftSchedule: 'Tue & Thu 09:00 - 14:00',
    notes: 'Conducts weekly wellness checkups and vitals monitoring.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'member_robert',
    name: 'Dr. Robert Chen, MD',
    role: 'physician',
    relation: 'Attending Geriatric Physician',
    phone: '+1 (555) 345-9012',
    email: 'dr.chen@stjudecare.org',
    channel: 'phone_call',
    slaMinutes: 10,
    isPrimaryValidator: false,
    avatarUrl: robertPortrait,
    shiftSchedule: 'Clinic Hours 08:00 - 17:00',
    notes: 'Emergency medical consultation and medication adjustments.',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export interface CareTeamFormData {
  name: string
  role: CareTeamMemberRole
  relation: string
  phone: string
  email: string
  channel: NotificationChannel
  slaMinutes: number
  isPrimaryValidator: boolean
  avatarUrl: string
  shiftSchedule: string
  notes: string
}

export interface UseCareTeamReturn {
  careTeam: CareTeamMember[]
  primaryValidator: CareTeamMember | undefined
  isAddMemberOpen: boolean
  editingMember: CareTeamMember | null
  memberFormData: CareTeamFormData

  setIsAddMemberOpen: (open: boolean) => void
  setEditingMember: (member: CareTeamMember | null) => void
  setMemberFormData: React.Dispatch<React.SetStateAction<CareTeamFormData>>
  setCareTeam: (team: CareTeamMember[]) => void

  openAddMember: () => void
  openEditMember: (member: CareTeamMember) => void
  handleSaveMemberSubmit: (e: React.FormEvent) => Promise<void>
  handleDeleteMember: (id: string, name: string) => Promise<void>
  handleSetPrimaryValidator: (id: string) => Promise<void>
  handleCareMemberPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCareMemberPhotoCapture: () => Promise<void>
  fetchCareTeam: () => Promise<void>
}

const defaultCareTeamFormData: CareTeamFormData = {
  name: '',
  role: 'primary_caregiver',
  relation: '',
  phone: '',
  email: '',
  channel: 'push_sms',
  slaMinutes: 2,
  isPrimaryValidator: false,
  avatarUrl: '',
  shiftSchedule: '24/7 Primary Response',
  notes: '',
}

export function useCareTeam(): UseCareTeamReturn {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_care_team')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return defaultCareTeam
  })

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<CareTeamMember | null>(null)
  const [memberFormData, setMemberFormData] = useState<CareTeamFormData>(defaultCareTeamFormData)

  const syncTeamToStorage = (team: CareTeamMember[]) => {
    try {
      localStorage.setItem('hestia_care_team', JSON.stringify(team))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCareTeam = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/care-team`)
      if (res.ok) {
        const data = await res.json()
        if (data.careTeam && Array.isArray(data.careTeam)) {
          setCareTeam(data.careTeam)
          syncTeamToStorage(data.careTeam)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const primaryValidator = careTeam.find((m) => m.isPrimaryValidator) || careTeam[0]

  const openAddMember = useCallback(() => {
    setMemberFormData(defaultCareTeamFormData)
    setEditingMember(null)
    setIsAddMemberOpen(true)
  }, [])

  const openEditMember = useCallback((member: CareTeamMember) => {
    setMemberFormData({
      name: member.name,
      role: member.role,
      relation: member.relation,
      phone: member.phone,
      email: member.email || '',
      channel: member.channel,
      slaMinutes: member.slaMinutes,
      isPrimaryValidator: member.isPrimaryValidator,
      avatarUrl: member.avatarUrl || '',
      shiftSchedule: member.shiftSchedule || '',
      notes: member.notes || '',
    })
    setEditingMember(member)
    setIsAddMemberOpen(true)
  }, [])

  const handleSaveMemberSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!memberFormData.name.trim()) return

      const payload = {
        name: memberFormData.name.trim(),
        role: memberFormData.role,
        relation: memberFormData.relation.trim() || 'Caregiver',
        phone: memberFormData.phone.trim() || '+1 (555) 000-0000',
        email: memberFormData.email.trim() || undefined,
        channel: memberFormData.channel,
        slaMinutes: Number(memberFormData.slaMinutes) || 3,
        isPrimaryValidator: memberFormData.isPrimaryValidator,
        avatarUrl: memberFormData.avatarUrl.trim() || undefined,
        shiftSchedule: memberFormData.shiftSchedule.trim() || undefined,
        notes: memberFormData.notes.trim() || undefined,
      }

      try {
        if (editingMember) {
          const res = await fetch(`${API_BASE}/api/care-team/${editingMember.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.careTeam) {
              setCareTeam(data.careTeam)
              syncTeamToStorage(data.careTeam)
            }
          } else {
            const updated = careTeam.map((m) =>
              m.id === editingMember.id ? { ...m, ...payload, updatedAt: new Date().toISOString() } : m
            )
            setCareTeam(updated)
            syncTeamToStorage(updated)
          }
        } else {
          const res = await fetch(`${API_BASE}/api/care-team`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.careTeam) {
              setCareTeam(data.careTeam)
              syncTeamToStorage(data.careTeam)
            }
          } else {
            const newMember: CareTeamMember = {
              id: `member_${Date.now()}`,
              ...payload,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const updated = [...careTeam, newMember]
            setCareTeam(updated)
            syncTeamToStorage(updated)
          }
        }

        setIsAddMemberOpen(false)
        setEditingMember(null)
      } catch (error) {
        console.error('Error saving care team member:', error)
        setIsAddMemberOpen(false)
      }
    },
    [memberFormData, editingMember, careTeam]
  )

  const handleDeleteMember = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete care team member "${name}"?`)) return

      try {
        await fetch(`${API_BASE}/api/care-team/${id}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
      const updated = careTeam.filter((m) => m.id !== id)
      setCareTeam(updated)
      syncTeamToStorage(updated)
    },
    [careTeam]
  )

  const handleSetPrimaryValidator = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/api/care-team/${id}/set-primary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          const data = await res.json()
          if (data.careTeam) {
            setCareTeam(data.careTeam)
            syncTeamToStorage(data.careTeam)
            return
          }
        }
      } catch {
        // ignore
      }
      const updated = careTeam.map((m) => ({
        ...m,
        isPrimaryValidator: m.id === id,
      }))
      setCareTeam(updated)
      syncTeamToStorage(updated)
    },
    [careTeam]
  )

  const handleCareMemberPhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setMemberFormData((prev) => ({ ...prev, avatarUrl: result }))
    }
    reader.readAsDataURL(file)
  }, [])

  const handleCareMemberPhotoCapture = useCallback(async () => {
    // Generate SVG placeholder portrait if no camera
    const initial = memberFormData.name ? memberFormData.name.charAt(0).toUpperCase() : 'C'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="50" fill="#0284c7"/>
      <text x="50" y="62" fill="#ffffff" font-size="36" font-weight="bold" text-anchor="middle" font-family="sans-serif">${initial}</text>
    </svg>`
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    setMemberFormData((prev) => ({ ...prev, avatarUrl: dataUrl }))
  }, [memberFormData.name])

  return {
    careTeam,
    primaryValidator,
    isAddMemberOpen,
    editingMember,
    memberFormData,
    setIsAddMemberOpen,
    setEditingMember,
    setMemberFormData,
    setCareTeam,
    openAddMember,
    openEditMember,
    handleSaveMemberSubmit,
    handleDeleteMember,
    handleSetPrimaryValidator,
    handleCareMemberPhotoUpload,
    handleCareMemberPhotoCapture,
    fetchCareTeam,
  }
}
