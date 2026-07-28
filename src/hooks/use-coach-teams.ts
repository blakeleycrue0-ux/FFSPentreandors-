import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

export function useCoachTeamsQuery() {
  return useQuery({
    queryKey: ["coach-teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coach_teams").select("*")
      if (error) throw error
      return data
    },
  })
}

export function useAssignCoachTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      profileId,
      teamId,
    }: {
      profileId: string
      teamId: string
    }) => {
      const { error } = await supabase
        .from("coach_teams")
        .insert({ profile_id: profileId, team_id: teamId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-teams"] })
    },
  })
}

export function useRemoveCoachTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      profileId,
      teamId,
    }: {
      profileId: string
      teamId: string
    }) => {
      const { error } = await supabase
        .from("coach_teams")
        .delete()
        .eq("profile_id", profileId)
        .eq("team_id", teamId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-teams"] })
    },
  })
}
