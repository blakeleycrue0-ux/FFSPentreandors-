import { Link } from "react-router-dom"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  HeartPulse,
  MapPin,
  Trophy,
  Users,
} from "lucide-react"

import { useTeam } from "@/contexts/team-context"
import { usePlayersQuery } from "@/hooks/use-players"
import { useNextTrainingQuery } from "@/hooks/use-trainings"
import { useTrainingAttendanceQuery } from "@/hooks/use-attendance"
import { formatDateLong, formatTime } from "@/lib/format"
import { StatCard } from "@/components/dashboard/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { selectedTeam, selectedTeamId, teams, isLoading: teamsLoading } = useTeam()
  const { data: players, isLoading: playersLoading } = usePlayersQuery(selectedTeamId)
  const { data: nextTraining, isLoading: trainingLoading } =
    useNextTrainingQuery(selectedTeamId)
  const { data: attendance } = useTrainingAttendanceQuery(nextTraining?.id)

  if (!teamsLoading && teams.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <div>
          <p className="text-lg font-medium">Sin equipos asignados</p>
          <p className="text-sm text-muted-foreground">
            Pide a un administrador que te asigne un equipo para empezar.
          </p>
        </div>
      </div>
    )
  }

  const activePlayers = players?.filter((p) => p.estado === "activa") ?? []
  const injuredPlayers = players?.filter((p) => p.estado === "lesionada") ?? []

  const confirmed = attendance?.filter((a) => a.estado === "voy").length ?? 0
  const pending = attendance?.filter((a) => a.estado === "pendiente").length ?? 0
  const absent = attendance?.filter((a) => a.estado === "no_voy").length ?? 0
  const late = attendance?.filter((a) => a.estado === "tarde").length ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola{selectedTeam ? `, ${selectedTeam.nombre}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen del equipo — temporada {selectedTeam?.temporada ?? ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {playersLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[86px]" />
          ))
        ) : (
          <>
            <StatCard
              label="Jugadoras activas"
              value={activePlayers.length}
              icon={Users}
              accent="brand"
            />
            <StatCard
              label="Lesionadas"
              value={injuredPlayers.length}
              icon={HeartPulse}
              accent="destructive"
            />
            <StatCard
              label="Confirmadas próximo entreno"
              value={confirmed}
              icon={CheckCircle2}
              accent="success"
            />
            <StatCard
              label="Pendientes de confirmar"
              value={pending}
              icon={AlertTriangle}
              accent="warning"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-brand" />
              Próximo entrenamiento
            </CardTitle>
            <CardDescription>Detalles y asistencia confirmada</CardDescription>
          </CardHeader>
          <CardContent>
            {trainingLoading ? (
              <Skeleton className="h-24" />
            ) : nextTraining ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-medium capitalize">
                    {formatDateLong(nextTraining.fecha)}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="size-3.5" />
                    {formatTime(nextTraining.hora_inicio)}
                    {nextTraining.campo && (
                      <>
                        <span>·</span>
                        <MapPin className="size-3.5" />
                        {nextTraining.campo}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">{confirmed} confirmadas</Badge>
                  <Badge variant="warning">{pending} pendientes</Badge>
                  <Badge variant="outline">{late} tarde</Badge>
                  <Badge variant="destructive">{absent} ausentes</Badge>
                </div>
                <Button asChild size="sm" className="w-fit">
                  <Link to={`/entrenamientos/${nextTraining.id}`}>
                    Ver asistencia
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay entrenamientos programados próximamente.{" "}
                <Link to="/entrenamientos" className="text-brand underline">
                  Crear uno
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-brand" />
              Próximo partido
            </CardTitle>
            <CardDescription>Integración FFIB — próximo bloque</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Los partidos, la clasificación y los resultados de la FFIB se
              incorporarán en la siguiente fase del proyecto.
            </p>
          </CardContent>
        </Card>
      </div>

      {injuredPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="size-4 text-destructive" />
              Jugadoras lesionadas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {injuredPlayers.map((p) => (
              <Link key={p.id} to={`/plantilla/${p.id}`}>
                <Badge variant="destructive">
                  {p.nombre} {p.apellidos}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
