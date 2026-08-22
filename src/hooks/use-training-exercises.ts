import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { TrainingExerciseInsert, TrainingExerciseUpdate } from "@/types/database"
import { emptyCanvasData, type CanvasData } from "@/types/pitch"

export function useTrainingExercisesQuery(trainingId: string | undefined) {
  return useQuery({
    queryKey: ["training-exercises", trainingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_exercises")
        .select("*")
        .eq("training_id", trainingId as string)
        .order("orden", { ascending: true })
      if (error) throw error
      return data
    },
    enabled: !!trainingId,
  })
}

export function useTrainingExerciseQuery(exerciseId: string | undefined) {
  return useQuery({
    queryKey: ["training-exercise", exerciseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_exercises")
        .select("*")
        .eq("id", exerciseId as string)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!exerciseId,
  })
}

export function useCreateTrainingExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (exercise: TrainingExerciseInsert & { training_id: string }) => {
      const { data, error } = await supabase
        .from("training_exercises")
        .insert({ canvas_data: emptyCanvasData, ...exercise })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["training-exercises", data.training_id],
      })
    },
  })
}

export function useUpdateTrainingExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TrainingExerciseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("training_exercises")
        .update(updates)
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["training-exercises", data.training_id],
      })
      queryClient.invalidateQueries({ queryKey: ["training-exercise", data.id] })
    },
  })
}

export function useSaveCanvasData() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      canvasData,
    }: {
      id: string
      trainingId: string
      canvasData: CanvasData
    }) => {
      const { error } = await supabase
        .from("training_exercises")
        .update({ canvas_data: canvasData })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["training-exercises", variables.trainingId],
      })
      queryClient.invalidateQueries({ queryKey: ["training-exercise", variables.id] })
    },
  })
}

export function useDeleteTrainingExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; trainingId: string }) => {
      const { error } = await supabase.from("training_exercises").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["training-exercises", variables.trainingId],
      })
    },
  })
}
