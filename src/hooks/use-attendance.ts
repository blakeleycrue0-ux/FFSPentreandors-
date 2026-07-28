import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { AbsenceReason, AttendanceStatus } from "@/types/database"

export interface AttendanceRow {
  id: string
  training_id: string
  player_id: string
  estado: AttendanceStatus
  motivo: AbsenceReason | null
  comentario: string | null
  respondido_at: string | null
  updated_at: string
  players: {
    id: string
    nombre: string
    apellidos: string
    dorsal: number | null
    foto_url: string | null
  } | null
}

export function useTrainingAttendanceQuery(trainingId: string | undefined) {
  return useQuery({
    queryKey: ["attendance", trainingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_attendance")
        .select(
          "id, training_id, player_id, estado, motivo, comentario, respondido_at, updated_at, players ( id, nombre, apellidos, dorsal, foto_url )"
        )
        .eq("training_id", trainingId as string)
      if (error) throw error
      return data as unknown as AttendanceRow[]
    },
    enabled: !!trainingId,
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      estado,
      motivo,
      comentario,
    }: {
      id: string
      trainingId: string
      estado: AttendanceStatus
      motivo?: AbsenceReason | null
      comentario?: string | null
    }) => {
      const { data, error } = await supabase
        .from("training_attendance")
        .update({
          estado,
          motivo: motivo ?? null,
          comentario: comentario ?? null,
          respondido_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.trainingId] })
    },
  })
}
