import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Copy, Search } from "lucide-react"
import { toast } from "sonner"

import { useTeam } from "@/contexts/team-context"
import {
  useDuplicateExerciseToMyTeam,
  useSharedExercisesQuery,
} from "@/hooks/use-shared-exercises"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function BibliotecaPage() {
  const navigate = useNavigate()
  const { selectedTeamId, selectedTeam } = useTeam()
  const { data: exercises, isLoading } = useSharedExercisesQuery()
  const duplicate = useDuplicateExerciseToMyTeam()
  const [search, setSearch] = useState("")
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!exercises) return []
    const q = search.toLowerCase()
    return exercises.filter(
      (ex) =>
        ex.titulo.toLowerCase().includes(q) ||
        (ex.objetivo ?? "").toLowerCase().includes(q) ||
        (ex.teams?.nombre ?? "").toLowerCase().includes(q)
    )
  }, [exercises, search])

  const handleDuplicate = async (exerciseId: string) => {
    if (!selectedTeamId) return
    setDuplicatingId(exerciseId)
    try {
      const result = await duplicate.mutateAsync({
        exerciseId,
        teamId: selectedTeamId,
      })
      toast.success(`Copiado a ${selectedTeam?.nombre ?? "tu equipo"}`)
      navigate(`/entrenamientos/${result.trainingId}/ejercicios/${result.exerciseId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al duplicar")
    } finally {
      setDuplicatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Biblioteca de ejercicios
        </h1>
        <p className="text-sm text-muted-foreground">
          Ejercicios de todos los equipos del club — cópialos al tuyo cuando quieras.
        </p>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, equipo, objetivo…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay ejercicios guardados en ningún equipo.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
            <Card key={exercise.id}>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">
                    {exercise.titulo || "Ejercicio sin título"}
                  </p>
                  {exercise.teams && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: exercise.teams.color }}
                    >
                      {exercise.teams.nombre}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {exercise.duracion_minutos ? `${exercise.duracion_minutos} min` : ""}
                  {exercise.jugadoras_min || exercise.jugadoras_max
                    ? ` · ${exercise.jugadoras_min ?? "?"}-${exercise.jugadoras_max ?? "?"} jugadoras`
                    : ""}
                </p>
                {exercise.objetivo && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {exercise.objetivo}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 w-fit"
                  disabled={!selectedTeamId || duplicatingId === exercise.id}
                  onClick={() => handleDuplicate(exercise.id)}
                >
                  <Copy />
                  {duplicatingId === exercise.id ? "Copiando…" : "Duplicar a mi equipo"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
