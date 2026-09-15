import { useState, useCallback } from 'react'
import type { AutomationRule, RuleCategory, SceneCode, EscalationPolicy } from '../domain/contracts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
  window.location.port === '5173'
    ? 'http://127.0.0.1:8787'
    : ''
)

export const defaultRules: AutomationRule[] = [
  {
    id: 'rule_fall_01',
    name: 'Elder Fall & Sudden Impact Guard',
    description: 'Trigger fast-action validation upon posture collapse or distress vector in any room',
    category: 'fall_detection',
    enabled: true,
    targetScene: 'S3_HELP',
    confidenceThreshold: 0.75,
    triggerZone: 'all',
    timeWindow: { allDay: true, startHour: 0, endHour: 24 },
    slaTimeoutMinutes: 3,
    escalationPolicy: 'notify_primary',
    reassurancePush: true,
    isPreset: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'rule_night_01',
    name: 'Nighttime Wandering & Inactivity Guard',
    description: 'Alert caregiver if continuous hallway motion or bathroom inactivity exceeds 20 minutes',
    category: 'night_wandering',
    enabled: true,
    targetScene: 'S3_HELP',
    confidenceThreshold: 0.8,
    triggerZone: 'corridor',
    timeWindow: { allDay: false, startHour: 22, endHour: 6 },
    slaTimeoutMinutes: 5,
    escalationPolicy: 'notify_primary',
    reassurancePush: true,
    isPreset: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'rule_visitor_01',
    name: 'Front Door Unrecognized Visitor Filter',
    description: 'Log face template and ring doorbell chime without false emergency siren',
    category: 'visitor_doorbell',
    enabled: true,
    targetScene: 'S2_WATCH',
    confidenceThreshold: 0.8,
    triggerZone: 'entry',
    timeWindow: { allDay: true, startHour: 0, endHour: 24 },
    slaTimeoutMinutes: 10,
    escalationPolicy: 'notify_primary',
    reassurancePush: false,
    isPreset: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'rule_health_01',
    name: 'Camera Offline & Heartbeat Guard',
    description: 'Escalate if any Ring camera loses signal while resident is in that zone',
    category: 'hardware_health',
    enabled: true,
    targetScene: 'S4_CRITICAL',
    confidenceThreshold: 0.9,
    triggerZone: 'all',
    timeWindow: { allDay: true, startHour: 0, endHour: 24 },
    slaTimeoutMinutes: 2,
    escalationPolicy: 'trigger_siren',
    reassurancePush: true,
    isPreset: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
]

export interface AutomationRuleFormData {
  name: string
  description: string
  category: RuleCategory
  targetScene: SceneCode
  confidenceThreshold: number
  triggerZone: string
  allDay: boolean
  startHour: number
  endHour: number
  slaTimeoutMinutes: number
  escalationPolicy: EscalationPolicy
  reassurancePush: boolean
}

export interface UseAutomationRulesReturn {
  rules: AutomationRule[]
  rulesSubTab: 'rules' | 'state_machine'
  isAddRuleOpen: boolean
  editingRule: AutomationRule | null
  ruleFormData: AutomationRuleFormData

  setRulesSubTab: (tab: 'rules' | 'state_machine') => void
  setIsAddRuleOpen: (open: boolean) => void
  setEditingRule: (rule: AutomationRule | null) => void
  setRuleFormData: React.Dispatch<React.SetStateAction<AutomationRuleFormData>>
  setRules: (rules: AutomationRule[]) => void

  openAddRule: () => void
  openEditRule: (rule: AutomationRule) => void
  handleSaveRuleSubmit: (e: React.FormEvent) => Promise<void>
  handleDeleteRule: (id: string, name: string) => Promise<void>
  handleToggleRule: (ruleId: string, currentEnabled: boolean) => Promise<void>
  handleResetRules: () => Promise<void>
  applyRulePreset: (category: RuleCategory) => void
  fetchRules: () => Promise<void>
}

const defaultRuleFormData: AutomationRuleFormData = {
  name: '',
  description: '',
  category: 'fall_detection',
  targetScene: 'S3_HELP',
  confidenceThreshold: 0.75,
  triggerZone: 'all',
  allDay: true,
  startHour: 0,
  endHour: 24,
  slaTimeoutMinutes: 3,
  escalationPolicy: 'notify_primary',
  reassurancePush: true,
}

export function useAutomationRules(): UseAutomationRulesReturn {
  const [rules, setRules] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem('hestia_rules')
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return defaultRules
  })

  const [rulesSubTab, setRulesSubTab] = useState<'rules' | 'state_machine'>('rules')
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [ruleFormData, setRuleFormData] = useState<AutomationRuleFormData>(defaultRuleFormData)

  const syncRulesToStorage = (list: AutomationRule[]) => {
    try {
      localStorage.setItem('hestia_rules', JSON.stringify(list))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rules`)
      if (res.ok) {
        const data = await res.json()
        if (data.rules && Array.isArray(data.rules)) {
          setRules(data.rules)
          syncRulesToStorage(data.rules)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const applyRulePreset = useCallback((category: RuleCategory) => {
    switch (category) {
      case 'fall_detection':
        setRuleFormData({
          name: 'Elder Fall & Distress Alert',
          description: 'Trigger fast-action validation upon sudden posture change or collapse in any zone',
          category: 'fall_detection',
          targetScene: 'S3_HELP',
          confidenceThreshold: 0.75,
          triggerZone: 'all',
          allDay: true,
          startHour: 0,
          endHour: 24,
          slaTimeoutMinutes: 3,
          escalationPolicy: 'notify_primary',
          reassurancePush: true,
        })
        break
      case 'night_wandering':
        setRuleFormData({
          name: 'Nighttime Hallway Wandering',
          description: 'Alert primary caregiver if hallway motion detected between 22:00 and 06:00',
          category: 'night_wandering',
          targetScene: 'S3_HELP',
          confidenceThreshold: 0.8,
          triggerZone: 'corridor',
          allDay: false,
          startHour: 22,
          endHour: 6,
          slaTimeoutMinutes: 5,
          escalationPolicy: 'notify_primary',
          reassurancePush: true,
        })
        break
      case 'visitor_doorbell':
        setRuleFormData({
          name: 'Doorbell Visitor Identity Log',
          description: 'Log unrecognized visitors at front porch without triggering siren alarm',
          category: 'visitor_doorbell',
          targetScene: 'S2_WATCH',
          confidenceThreshold: 0.8,
          triggerZone: 'entry',
          allDay: true,
          startHour: 0,
          endHour: 24,
          slaTimeoutMinutes: 10,
          escalationPolicy: 'notify_primary',
          reassurancePush: false,
        })
        break
      case 'hardware_health':
        setRuleFormData({
          name: 'Ring Device Signal & Heartbeat Guard',
          description: 'Immediate alert if a Ring camera goes offline during high-activity hours',
          category: 'hardware_health',
          targetScene: 'S4_CRITICAL',
          confidenceThreshold: 0.9,
          triggerZone: 'all',
          allDay: true,
          startHour: 0,
          endHour: 24,
          slaTimeoutMinutes: 2,
          escalationPolicy: 'trigger_siren',
          reassurancePush: true,
        })
        break
      default:
        break
    }
  }, [])

  const openAddRule = useCallback(() => {
    setRuleFormData(defaultRuleFormData)
    setEditingRule(null)
    setIsAddRuleOpen(true)
  }, [])

  const openEditRule = useCallback((rule: AutomationRule) => {
    setRuleFormData({
      name: rule.name,
      description: rule.description,
      category: rule.category,
      targetScene: rule.targetScene,
      confidenceThreshold: rule.confidenceThreshold,
      triggerZone: rule.triggerZone,
      allDay: rule.timeWindow?.allDay ?? true,
      startHour: rule.timeWindow?.startHour ?? 0,
      endHour: rule.timeWindow?.endHour ?? 24,
      slaTimeoutMinutes: rule.slaTimeoutMinutes,
      escalationPolicy: rule.escalationPolicy,
      reassurancePush: rule.reassurancePush,
    })
    setEditingRule(rule)
    setIsAddRuleOpen(true)
  }, [])

  const handleSaveRuleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!ruleFormData.name.trim()) return

      const payload = {
        name: ruleFormData.name.trim(),
        description: ruleFormData.description.trim() || 'Custom automation rule',
        category: ruleFormData.category,
        targetScene: ruleFormData.targetScene,
        confidenceThreshold: ruleFormData.confidenceThreshold,
        triggerZone: ruleFormData.triggerZone,
        timeWindow: {
          allDay: ruleFormData.allDay,
          startHour: ruleFormData.startHour,
          endHour: ruleFormData.endHour,
        },
        slaTimeoutMinutes: Number(ruleFormData.slaTimeoutMinutes) || 3,
        escalationPolicy: ruleFormData.escalationPolicy,
        reassurancePush: ruleFormData.reassurancePush,
      }

      try {
        if (editingRule) {
          const res = await fetch(`${API_BASE}/api/rules/${editingRule.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.rules) {
              setRules(data.rules)
              syncRulesToStorage(data.rules)
            }
          } else {
            const updated = rules.map((r) =>
              r.id === editingRule.id ? { ...r, ...payload, updatedAt: new Date().toISOString() } : r
            )
            setRules(updated)
            syncRulesToStorage(updated)
          }
        } else {
          const res = await fetch(`${API_BASE}/api/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.rules) {
              setRules(data.rules)
              syncRulesToStorage(data.rules)
            }
          } else {
            const newRule: AutomationRule = {
              id: `rule_${Date.now()}`,
              ...payload,
              enabled: true,
              isPreset: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const updated = [...rules, newRule]
            setRules(updated)
            syncRulesToStorage(updated)
          }
        }

        setIsAddRuleOpen(false)
        setEditingRule(null)
      } catch (error) {
        console.error('Error saving rule:', error)
        setIsAddRuleOpen(false)
      }
    },
    [ruleFormData, editingRule, rules]
  )

  const handleDeleteRule = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Delete automation rule "${name}"?`)) return

      try {
        await fetch(`${API_BASE}/api/rules/${id}`, { method: 'DELETE' })
      } catch {
        // ignore
      }
      const updated = rules.filter((r) => r.id !== id)
      setRules(updated)
      syncRulesToStorage(updated)
    },
    [rules]
  )

  const handleToggleRule = useCallback(
    async (ruleId: string, currentEnabled: boolean) => {
      const newStatus = !currentEnabled
      try {
        await fetch(`${API_BASE}/api/rules/${ruleId}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: newStatus }),
        })
      } catch {
        // ignore
      }
      const updated = rules.map((r) => (r.id === ruleId ? { ...r, enabled: newStatus } : r))
      setRules(updated)
      syncRulesToStorage(updated)
    },
    [rules]
  )

  const handleResetRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rules/reset`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.rules) {
          setRules(data.rules)
          syncRulesToStorage(data.rules)
          return
        }
      }
    } catch {
      // ignore
    }
    setRules(defaultRules)
    syncRulesToStorage(defaultRules)
  }, [])

  return {
    rules,
    rulesSubTab,
    isAddRuleOpen,
    editingRule,
    ruleFormData,
    setRulesSubTab,
    setIsAddRuleOpen,
    setEditingRule,
    setRuleFormData,
    setRules,
    openAddRule,
    openEditRule,
    handleSaveRuleSubmit,
    handleDeleteRule,
    handleToggleRule,
    handleResetRules,
    applyRulePreset,
    fetchRules,
  }
}
