import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { PlayerHistoryEventInsert } from "@/types/database"

export function usePlayerHistoryQuery(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player-history", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_history_events")
        .select("*")
        .eq("player_id", playerId as string)
        .order("fecha_inicio", { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!playerId,
  })
}

export function useCreatePlayerHistoryEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (event: PlayerHistoryEventInsert) => {
      const { data, error } = await supabase
        .from("player_history_events")
        .insert(event)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["player-history", data.player_id] })
    },
  })
}

export function useDeletePlayerHistoryEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; playerId: string }) => {
      const { error } = await supabase
        .from("player_history_events")
        .delete()
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["player-history", variables.playerId] })
    },
  })
}
