import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { useTeamsQuery } from "@/hooks/use-teams"
import type { Team } from "@/types/database"

interface TeamContextValue {
  teams: Team[]
  selectedTeam: Team | null
  selectedTeamId: string | null
  setSelectedTeamId: (teamId: string) => void
  isLoading: boolean
}

const TeamContext = createContext<TeamContextValue | null>(null)

const STORAGE_KEY = "ffs-entrenadores-selected-team"

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: teams, isLoading } = useTeamsQuery()
  const [selectedTeamId, setSelectedTeamIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  )

  useEffect(() => {
    if (!teams || teams.length === 0) return
    const stillValid = teams.some((t) => t.id === selectedTeamId)
    if (!stillValid) {
      setSelectedTeamIdState(teams[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams])

  const setSelectedTeamId = (teamId: string) => {
    setSelectedTeamIdState(teamId)
    localStorage.setItem(STORAGE_KEY, teamId)
  }

  const value = useMemo<TeamContextValue>(() => {
    const list = teams ?? []
    return {
      teams: list,
      selectedTeamId,
      selectedTeam: list.find((t) => t.id === selectedTeamId) ?? null,
      setSelectedTeamId,
      isLoading,
    }
  }, [teams, selectedTeamId, isLoading])

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error("useTeam debe usarse dentro de TeamProvider")
  return ctx
}
