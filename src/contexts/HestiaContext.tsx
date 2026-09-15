import React, { createContext, useContext, ReactNode } from 'react'
import { UseRoomsReturn } from '../hooks/useRooms'
import { UseResidentsReturn } from '../hooks/useResidents'
import { UseCareTeamReturn } from '../hooks/useCareTeam'
import { UseAutomationRulesReturn } from '../hooks/useAutomationRules'
import { UseSceneEventsReturn } from '../hooks/useSceneEvents'
import { UseSystemSettingsReturn } from '../hooks/useSystemSettings'

export interface HestiaContextValue {
  // Rooms
  rooms: UseRoomsReturn
  
  // Residents
  residents: UseResidentsReturn
  
  // Care Team
  careTeam: UseCareTeamReturn
  
  // Automation Rules
  automationRules: UseAutomationRulesReturn
  
  // Scene Events
  sceneEvents: UseSceneEventsReturn
  
  // System Settings
  systemSettings: UseSystemSettingsReturn
}

const HestiaContext = createContext<HestiaContextValue | undefined>(undefined)

export const useHestia = (): HestiaContextValue => {
  const context = useContext(HestiaContext)
  if (!context) {
    throw new Error('useHestia must be used within HestiaProvider')
  }
  return context
}

export interface HestiaProviderProps {
  children: ReactNode
  value: HestiaContextValue
}

export function HestiaProvider({ children, value }: HestiaProviderProps) {
  return <HestiaContext.Provider value={value}>{children}</HestiaContext.Provider>
}
