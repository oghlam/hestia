/**
 * HESTIA Hooks Index
 * 
 * Central export for all custom hooks used throughout the application.
 * Each hook manages a specific domain of state and business logic.
 * 
 * Usage in components:
 * ```tsx
 * import { useRooms, useResidents } from '@/hooks'
 * 
 * function MyComponent() {
 *   const rooms = useRooms()
 *   const residents = useResidents()
 *   // ...
 * }
 * ```
 */

// Core domain hooks - each manages a specific feature area
export { useRooms, type UseRoomsReturn, type RoomFormData, type MapFormData } from './useRooms'
export { useResidents, type UseResidentsReturn, type ResidentFormData } from './useResidents'
export { useCareTeam, type UseCareTeamReturn, type CareTeamFormData } from './useCareTeam'
export { useAutomationRules, type UseAutomationRulesReturn, type AutomationRuleFormData } from './useAutomationRules'
export { useSceneEvents, type UseSceneEventsReturn, type EventsFilterState } from './useSceneEvents'
export { useSystemSettings, type UseSystemSettingsReturn } from './useSystemSettings'
export { useAssets, type UseAssetsReturn } from "./useAssets"

// Utility hooks
export { useLocalStorage } from './useLocalStorage'

/**
 * Hook Categories:
 * 
 * 📍 Domain Hooks (State + Logic):
 *   - useRooms: Room/camera management + floor plan mapping
 *   - useResidents: Resident profiles + face registration
 *   - useCareTeam: Care team roster + SLA configuration
 *   - useAutomationRules: Automation rules + escalation policies
 *   - useSceneEvents: Event history + filtering/sorting/pagination
 *   - useSystemSettings: System config + pipeline/AWS/database
 * 
 * 🔧 Utility Hooks:
 *   - useLocalStorage: Generic localStorage state management
 * 
 * 📊 Context:
 *   - HestiaContext + HestiaProvider: Central state aggregation (see contexts/HestiaContext.tsx)
 */
