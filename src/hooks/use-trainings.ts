import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { TrainingInsert, TrainingUpdate } from "@/types/database"

export function useTrainingsQuery(teamId: string | null) {
  return useQuery({
    queryKey: ["trainings", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("team_id", teamId as string)
        .order("fecha", { ascending: true })
        .order("hora_inicio", { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!teamId,
  })
}

export function useNextTrainingQuery(teamId: string | null) {
  return useQuery({
    queryKey: ["next-training", teamId],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("team_id", teamId as string)
        .gte("fecha", today)
        .order("fecha", { ascending: true })
        .order("hora_inicio", { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!teamId,
  })
}

export function useCreateTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (training: TrainingInsert) => {
      const { data, error } = await supabase
        .from("trainings")
        .insert(training)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trainings", data.team_id] })
      queryClient.invalidateQueries({ queryKey: ["next-training", data.team_id] })
    },
  })
}

export function useUpdateTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: TrainingUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("trainings")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trainings", data.team_id] })
      queryClient.invalidateQueries({ queryKey: ["next-training", data.team_id] })
    },
  })
}

export function useDeleteTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; teamId: string }) => {
      const { error } = await supabase.from("trainings").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainings", variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ["next-training", variables.teamId] })
    },
  })
}

export function useDuplicateTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      trainingId,
      fecha,
    }: {
      trainingId: string
      fecha: string
    }) => {
      const { data: original, error: fetchError } = await supabase
        .from("trainings")
        .select("*")
        .eq("id", trainingId)
        .single()
      if (fetchError) throw fetchError

      const { data: created, error: createError } = await supabase
        .from("trainings")
        .insert({
          team_id: original.team_id,
          fecha,
          hora_inicio: original.hora_inicio,
          hora_fin: original.hora_fin,
          campo: original.campo,
          objetivos: original.objetivos,
          ejercicios: original.ejercicios,
          material: original.material,
          comentarios: original.comentarios,
        })
        .select()
        .single()
      if (createError) throw createError

      return created
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trainings", data.team_id] })
      queryClient.invalidateQueries({ queryKey: ["next-training", data.team_id] })
    },
  })
}
