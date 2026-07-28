import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useTeam } from "@/contexts/team-context"
import { useTeamAttendanceOverviewQuery } from "@/hooks/use-attendance-overview"
import { formatDateShort } from "@/lib/format"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AsistenciaPage() {
  const { selectedTeamId } = useTeam()
  const { data, isLoading } = useTeamAttendanceOverviewQuery(selectedTeamId)

  const chartData =
    data?.trainings.map((t) => ({
      fecha: formatDateShort(t.fecha),
      Confirmadas: t.confirmed,
      Tarde: t.late,
      Ausentes: t.absent,
      Pendientes: t.pending,
    })) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asistencia</h1>
        <p className="text-sm text-muted-foreground">
          Estadísticas de asistencia del último mes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asistencia por entrenamiento</CardTitle>
          <CardDescription>Confirmadas, tarde, ausentes y pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-72" />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay datos de asistencia en el último mes.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="fecha" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="Confirmadas" stackId="a" fill="var(--success)" />
                <Bar dataKey="Tarde" stackId="a" fill="var(--chart-4)" />
                <Bar dataKey="Ausentes" stackId="a" fill="var(--destructive)" />
                <Bar dataKey="Pendientes" stackId="a" fill="var(--muted-foreground)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Asistencia por jugadora</CardTitle>
          <CardDescription>% de entrenamientos confirmados o con retraso</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : !data || data.players.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay datos suficientes todavía.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jugadora</TableHead>
                  <TableHead>Entrenamientos</TableHead>
                  <TableHead>Confirmadas</TableHead>
                  <TableHead>% asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.players.map((p) => (
                  <TableRow key={p.playerId}>
                    <TableCell className="font-medium">
                      {p.nombre} {p.apellidos}
                    </TableCell>
                    <TableCell>{p.totalTrainings}</TableCell>
                    <TableCell>{p.confirmed}</TableCell>
                    <TableCell>{p.attendanceRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
