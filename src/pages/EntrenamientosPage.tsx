import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Clock, MapPin, Plus } from "lucide-react"
import { toast } from "sonner"

import { useTeam } from "@/contexts/team-context"
import { useCreateTraining, useTrainingsQuery } from "@/hooks/use-trainings"
import { formatDateLong, formatTime } from "@/lib/format"
import { TrainingForm } from "@/components/entrenamientos/training-form"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { Training } from "@/types/database"

function TrainingCard({
  training,
}: {
  training: {
    id: string
    fecha: string
    hora_inicio: string
    campo: string | null
    objetivos: string | null
  }
}) {
  return (
    <Link to={`/entrenamientos/${training.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-2">
          <p className="font-medium capitalize">{formatDateLong(training.fecha)}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {formatTime(training.hora_inicio)}
            </span>
            {training.campo && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {training.campo}
              </span>
            )}
          </div>
          {training.objetivos && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {training.objetivos}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default function EntrenamientosPage() {
  const { selectedTeamId } = useTeam()
  const { profile } = useAuth()
  const { data: trainings, isLoading } = useTrainingsQuery(selectedTeamId)
  const createTraining = useCreateTraining()
  const [createOpen, setCreateOpen] = useState(false)

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const list = trainings ?? []
    return {
      upcoming: list.filter((t) => t.fecha >= today),
      past: list.filter((t) => t.fecha < today).reverse(),
    }
  }, [trainings])

  const handleCreate = async (
    values: Partial<Training> & Pick<Training, "fecha" | "hora_inicio">
  ) => {
    if (!selectedTeamId) return
    try {
      await createTraining.mutateAsync({
        ...values,
        team_id: selectedTeamId,
        created_by: profile?.id,
      })
      toast.success("Entrenamiento creado")
      setCreateOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrenamientos</h1>
          <p className="text-sm text-muted-foreground">
            Calendario de entrenamientos del equipo
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo entrenamiento
          </Button>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nuevo entrenamiento</DialogTitle>
            </DialogHeader>
            <TrainingForm
              submitLabel="Crear entrenamiento"
              isSubmitting={createTraining.isPending}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              Próximos
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay entrenamientos programados.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((t) => (
                  <TrainingCard key={t.id} training={t} />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">Pasados</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((t) => (
                  <TrainingCard key={t.id} training={t} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
