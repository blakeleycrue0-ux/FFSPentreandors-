import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, Copy, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useTrainingAttendanceQuery } from "@/hooks/use-attendance"
import {
  useDeleteTraining,
  useDuplicateTraining,
  useTrainingsQuery,
  useUpdateTraining,
} from "@/hooks/use-trainings"
import { useTeam } from "@/contexts/team-context"
import { formatDateLong, formatTime } from "@/lib/format"
import { trainingToFormValues } from "@/lib/schemas/training-schema"
import { AttendanceRow } from "@/components/asistencia/attendance-row"
import { TrainingForm } from "@/components/entrenamientos/training-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { Training } from "@/types/database"

export default function TrainingDetailPage() {
  const { trainingId } = useParams<{ trainingId: string }>()
  const navigate = useNavigate()
  const { selectedTeamId } = useTeam()
  const { data: trainings, isLoading: trainingsLoading } =
    useTrainingsQuery(selectedTeamId)
  const training = trainings?.find((t) => t.id === trainingId)
  const { data: attendance, isLoading: attendanceLoading } =
    useTrainingAttendanceQuery(trainingId)
  const updateTraining = useUpdateTraining()
  const deleteTraining = useDeleteTraining()
  const duplicateTraining = useDuplicateTraining()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateDate, setDuplicateDate] = useState("")

  if (trainingsLoading) {
    return <Skeleton className="h-96" />
  }

  if (!training) {
    return <p className="text-sm text-muted-foreground">Entrenamiento no encontrado.</p>
  }

  const confirmed = attendance?.filter((a) => a.estado === "voy").length ?? 0
  const pending = attendance?.filter((a) => a.estado === "pendiente").length ?? 0
  const absent = attendance?.filter((a) => a.estado === "no_voy").length ?? 0
  const late = attendance?.filter((a) => a.estado === "tarde").length ?? 0

  const handleUpdate = async (
    values: Partial<Training> & Pick<Training, "fecha" | "hora_inicio">
  ) => {
    try {
      await updateTraining.mutateAsync({ id: training.id, ...values })
      toast.success("Entrenamiento actualizado")
      setEditOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTraining.mutateAsync({ id: training.id, teamId: training.team_id })
      toast.success("Entrenamiento eliminado")
      navigate("/entrenamientos")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar")
    }
  }

  const handleDuplicate = async () => {
    if (!trainingId || !duplicateDate) return
    try {
      const created = await duplicateTraining.mutateAsync({
        trainingId,
        fecha: duplicateDate,
      })
      toast.success("Entrenamiento duplicado")
      setDuplicateOpen(false)
      navigate(`/entrenamientos/${created.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al duplicar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/entrenamientos">
            <ArrowLeft />
            Volver a entrenamientos
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDuplicateDate(training.fecha)
              setDuplicateOpen(true)
            }}
          >
            <Copy />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight capitalize">
          {formatDateLong(training.fecha)}
        </h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          {formatTime(training.hora_inicio)}
          {training.hora_fin ? ` – ${formatTime(training.hora_fin)}` : ""}
          {training.campo && (
            <>
              <span>·</span>
              <MapPin className="size-3.5" />
              {training.campo}
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Detalles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {training.objetivos && (
              <div>
                <p className="text-xs text-muted-foreground">Objetivos</p>
                <p>{training.objetivos}</p>
              </div>
            )}
            {training.ejercicios && (
              <div>
                <p className="text-xs text-muted-foreground">Ejercicios</p>
                <p className="whitespace-pre-line">{training.ejercicios}</p>
              </div>
            )}
            {training.material && (
              <div>
                <p className="text-xs text-muted-foreground">Material necesario</p>
                <p>{training.material}</p>
              </div>
            )}
            {training.comentarios && (
              <div>
                <p className="text-xs text-muted-foreground">Comentarios</p>
                <p>{training.comentarios}</p>
              </div>
            )}
            {!training.objetivos &&
              !training.ejercicios &&
              !training.material &&
              !training.comentarios && (
                <p className="text-muted-foreground">Sin detalles adicionales.</p>
              )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Asistencia</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">{confirmed} confirmadas</Badge>
              <Badge variant="warning">{pending} pendientes</Badge>
              <Badge variant="outline">{late} tarde</Badge>
              <Badge variant="destructive">{absent} ausentes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? (
              <Skeleton className="h-48" />
            ) : attendance && attendance.length > 0 ? (
              <div>
                {attendance.map((row) => (
                  <AttendanceRow key={row.id} row={row} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay jugadoras activas asignadas a este entrenamiento.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Duplicar entrenamiento</DialogTitle>
            <DialogDescription>
              Se creará un entrenamiento nuevo con los mismos datos en otra fecha.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duplicate-date">Nueva fecha</Label>
            <Input
              id="duplicate-date"
              type="date"
              value={duplicateDate}
              onChange={(e) => setDuplicateDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={duplicateTraining.isPending}>
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar entrenamiento</DialogTitle>
          </DialogHeader>
          <TrainingForm
            defaultValues={trainingToFormValues(training)}
            submitLabel="Guardar cambios"
            isSubmitting={updateTraining.isPending}
            onSubmit={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar entrenamiento</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también los registros de
              asistencia asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTraining.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
