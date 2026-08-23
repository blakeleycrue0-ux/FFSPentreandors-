import { Link } from "react-router-dom"
import { Clock, MapPin, CalendarDays, TrendingUp, BellRing } from "lucide-react"

import { useTeam } from "@/contexts/team-context"
import { usePlayersQuery } from "@/hooks/use-players"
import { useNextTrainingQuery, useTrainingsQuery } from "@/hooks/use-trainings"
import { useTrainingAttendanceQuery } from "@/hooks/use-attendance"
import { useTeamAttendanceOverviewQuery } from "@/hooks/use-attendance-overview"
import { formatDateLong, formatDateShort, formatTime } from "@/lib/format"
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
  const { data: monthTrainings, isLoading: monthLoading } =
    useTrainingsQuery(selectedTeamId)
  const { data: attendanceOverview, isLoading: overviewLoading } =
    useTeamAttendanceOverviewQuery(selectedTeamId)

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

  const now = new Date()
  const thisMonthTrainings = (monthTrainings ?? []).filter((t) => {
    const d = new Date(`${t.fecha}T00:00:00`)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })

  const overviewTrainings = attendanceOverview?.trainings ?? []
  const overallRate = overviewTrainings.length
    ? Math.round(
        (overviewTrainings.reduce((sum, t) => sum + t.confirmed + t.late, 0) /
          overviewTrainings.reduce((sum, t) => sum + t.total, 0 || 1)) * 100
      )
    : null

  const notices: string[] = []
  if (pending > 0 && nextTraining) {
    notices.push(
      `${pending} jugadora${pending === 1 ? "" : "s"} sin confirmar el próximo entreno`
    )
  }
  if (overallRate !== null && overallRate < 70) {
    notices.push(`La asistencia del último mes ha bajado al ${overallRate}%`)
  }

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
              accent="brand"
            />
            <StatCard
              label="Lesionadas"
              value={injuredPlayers.length}
              accent="destructive"
            />
            <StatCard
              label="Confirmadas próximo entreno"
              value={confirmed}
              accent="success"
            />
            <StatCard
              label="Pendientes de confirmar"
              value={pending}
              accent="warning"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximo entrenamiento</CardTitle>
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
            <CardTitle>Próximo partido</CardTitle>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4 text-brand" />
              Calendario del mes
            </CardTitle>
            <CardDescription>Entrenamientos programados este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {monthLoading ? (
              <Skeleton className="h-24" />
            ) : thisMonthTrainings.length > 0 ? (
              <ul className="flex flex-col divide-y divide-border">
                {thisMonthTrainings.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                    <Link
                      to={`/entrenamientos/${t.id}`}
                      className="flex items-center gap-2 hover:text-brand"
                    >
                      <span className="font-medium capitalize">
                        {formatDateShort(t.fecha)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(t.hora_inicio)}
                      </span>
                    </Link>
                    {t.campo && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {t.campo}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay entrenamientos programados este mes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-brand" />
              Racha de asistencia
            </CardTitle>
            <CardDescription>Últimas cuatro semanas</CardDescription>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <Skeleton className="h-24" />
            ) : overviewTrainings.length > 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-3xl font-semibold text-brand">
                  {overallRate}%
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    de asistencia media
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overviewTrainings.map((t) => {
                    const rate = t.total > 0 ? Math.round(((t.confirmed + t.late) / t.total) * 100) : 0
                    return (
                      <Badge
                        key={t.trainingId}
                        variant={rate >= 70 ? "success" : rate >= 40 ? "warning" : "destructive"}
                        title={formatDateShort(t.fecha)}
                      >
                        {formatDateShort(t.fecha)} · {rate}%
                      </Badge>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay datos de asistencia del último mes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {(injuredPlayers.length > 0 || notices.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="size-4 text-warning" />
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {notices.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {notices.map((notice, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    · {notice}
                  </li>
                ))}
              </ul>
            )}
            {injuredPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {injuredPlayers.map((p) => (
                  <Link key={p.id} to={`/plantilla/${p.id}`}>
                    <Badge variant="destructive">
                      {p.nombre} {p.apellidos}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
