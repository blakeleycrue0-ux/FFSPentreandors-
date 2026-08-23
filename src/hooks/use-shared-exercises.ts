import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { TrainingExercise } from "@/types/database"

export type SharedExercise = TrainingExercise & {
  teams: { nombre: string; color: string } | null
}

export function useSharedExercisesQuery() {
  return useQuery({
    queryKey: ["shared-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_exercises")
        .select("*, teams ( nombre, color )")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as unknown as SharedExercise[]
    },
  })
}

export function useDuplicateExerciseToMyTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      exerciseId,
      teamId,
    }: {
      exerciseId: string
      teamId: string
    }) => {
      const { data: original, error: fetchError } = await supabase
        .from("training_exercises")
        .select("*")
        .eq("id", exerciseId)
        .single()
      if (fetchError) throw fetchError

      const today = new Date().toISOString().slice(0, 10)
      const { data: training, error: trainingError } = await supabase
        .from("trainings")
        .insert({ team_id: teamId, fecha: today, hora_inicio: "18:00" })
        .select()
        .single()
      if (trainingError) throw trainingError

      const { data: created, error: createError } = await supabase
        .from("training_exercises")
        .insert({
          training_id: training.id,
          team_id: teamId,
          orden: 0,
          titulo: original.titulo,
          duracion_minutos: original.duracion_minutos,
          jugadoras_min: original.jugadoras_min,
          jugadoras_max: original.jugadoras_max,
          objetivo: original.objetivo,
          canvas_data: original.canvas_data,
        })
        .select()
        .single()
      if (createError) throw createError

      return { trainingId: training.id, exerciseId: created.id }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainings", variables.teamId] })
    },
  })
}
