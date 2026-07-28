import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { PlayerInsert, PlayerUpdate } from "@/types/database"

export function usePlayersQuery(teamId: string | null) {
  return useQuery({
    queryKey: ["players", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId as string)
        .order("dorsal", { ascending: true, nullsFirst: false })
      if (error) throw error
      return data
    },
    enabled: !!teamId,
  })
}

export function usePlayerQuery(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId as string)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!playerId,
  })
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (player: PlayerInsert) => {
      const { data, error } = await supabase
        .from("players")
        .insert(player)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["players", data.team_id] })
    },
  })
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: PlayerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("players")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["players", data.team_id] })
      queryClient.invalidateQueries({ queryKey: ["player", data.id] })
    },
  })
}

export function useDeletePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; teamId: string }) => {
      const { error } = await supabase.from("players").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players", variables.teamId] })
    },
  })
}
