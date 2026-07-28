import { useState } from "react"

import { useUpdateAttendance, type AttendanceRow as AttendanceRowData } from "@/hooks/use-attendance"
import { absenceReasonLabels, attendanceStatusLabels } from "@/lib/labels"
import { PlayerAvatar } from "@/components/plantilla/player-avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AbsenceReason, AttendanceStatus } from "@/types/database"

export function AttendanceRow({ row }: { row: AttendanceRowData }) {
  const updateAttendance = useUpdateAttendance()
  const [motivo, setMotivo] = useState<AbsenceReason | null>(row.motivo)

  if (!row.players) return null

  const needsReason = row.estado === "no_voy" || row.estado === "tarde"

  const handleStatusChange = (estado: AttendanceStatus) => {
    updateAttendance.mutate({
      id: row.id,
      trainingId: row.training_id,
      estado,
      motivo: estado === "no_voy" || estado === "tarde" ? motivo : null,
    })
  }

  const handleReasonChange = (nextMotivo: AbsenceReason) => {
    setMotivo(nextMotivo)
    updateAttendance.mutate({
      id: row.id,
      trainingId: row.training_id,
      estado: row.estado,
      motivo: nextMotivo,
    })
  }

  return (
    <div className="flex flex-col gap-3 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <PlayerAvatar
          nombre={row.players.nombre}
          apellidos={row.players.apellidos}
          fotoUrl={row.players.foto_url}
          className="size-9"
        />
        <div>
          <p className="text-sm font-medium">
            {row.players.nombre} {row.players.apellidos}
          </p>
          {row.players.dorsal !== null && (
            <p className="text-xs text-muted-foreground">#{row.players.dorsal}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Select value={row.estado} onValueChange={handleStatusChange}>
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(attendanceStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {needsReason && (
          <Select value={motivo ?? undefined} onValueChange={handleReasonChange}>
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Motivo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(absenceReasonLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
