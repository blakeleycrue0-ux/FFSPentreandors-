import { useQuery } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"
import type { AttendanceStatus } from "@/types/database"

export interface TrainingAttendanceSummary {
  trainingId: string
  fecha: string
  confirmed: number
  pending: number
  absent: number
  late: number
  total: number
}

export interface PlayerAttendanceSummary {
  playerId: string
  nombre: string
  apellidos: string
  totalTrainings: number
  confirmed: number
  attendanceRate: number
}

interface RawRow {
  training_id: string
  player_id: string
  estado: AttendanceStatus
  trainings: { fecha: string; team_id: string } | null
  players: { nombre: string; apellidos: string } | null
}

export function useTeamAttendanceOverviewQuery(teamId: string | null) {
  return useQuery({
    queryKey: ["attendance-overview", teamId],
    queryFn: async () => {
      const since = new Date()
      since.setMonth(since.getMonth() - 1)

      const { data, error } = await supabase
        .from("training_attendance")
        .select(
          "training_id, player_id, estado, trainings!inner ( fecha, team_id ), players ( nombre, apellidos )"
        )
        .eq("trainings.team_id", teamId as string)
        .gte("trainings.fecha", since.toISOString().slice(0, 10))

      if (error) throw error
      const rows = data as unknown as RawRow[]

      const byTraining = new Map<string, TrainingAttendanceSummary>()
      const byPlayer = new Map<
        string,
        { nombre: string; apellidos: string; total: number; confirmed: number }
      >()

      for (const row of rows) {
        if (!row.trainings) continue

        const trainingEntry =
          byTraining.get(row.training_id) ??
          ({
            trainingId: row.training_id,
            fecha: row.trainings.fecha,
            confirmed: 0,
            pending: 0,
            absent: 0,
            late: 0,
            total: 0,
          } satisfies TrainingAttendanceSummary)
        trainingEntry.total += 1
        if (row.estado === "voy") trainingEntry.confirmed += 1
        if (row.estado === "pendiente") trainingEntry.pending += 1
        if (row.estado === "no_voy") trainingEntry.absent += 1
        if (row.estado === "tarde") trainingEntry.late += 1
        byTraining.set(row.training_id, trainingEntry)

        if (row.players) {
          const playerEntry = byPlayer.get(row.player_id) ?? {
            nombre: row.players.nombre,
            apellidos: row.players.apellidos,
            total: 0,
            confirmed: 0,
          }
          playerEntry.total += 1
          if (row.estado === "voy" || row.estado === "tarde") playerEntry.confirmed += 1
          byPlayer.set(row.player_id, playerEntry)
        }
      }

      const trainings = Array.from(byTraining.values()).sort((a, b) =>
        a.fecha.localeCompare(b.fecha)
      )

      const players: PlayerAttendanceSummary[] = Array.from(byPlayer.entries())
        .map(([playerId, p]) => ({
          playerId,
          nombre: p.nombre,
          apellidos: p.apellidos,
          totalTrainings: p.total,
          confirmed: p.confirmed,
          attendanceRate: p.total > 0 ? Math.round((p.confirmed / p.total) * 100) : 0,
        }))
        .sort((a, b) => b.attendanceRate - a.attendanceRate)

      return { trainings, players }
    },
    enabled: !!teamId,
  })
}
