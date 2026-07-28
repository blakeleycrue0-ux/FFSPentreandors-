import { useState } from "react"
import { Plus, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/contexts/auth-context"
import { useCoachTeamsQuery } from "@/hooks/use-coach-teams"
import { useProfilesQuery } from "@/hooks/use-profiles"
import { useCreateTeam, useTeamsQuery } from "@/hooks/use-teams"
import type { TeamFormValues } from "@/lib/schemas/team-schema"
import { CoachRow } from "@/components/admin/coach-row"
import { TeamForm } from "@/components/admin/team-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminPage() {
  const { profile } = useAuth()
  const { data: teams, isLoading: teamsLoading } = useTeamsQuery()
  const { data: profiles, isLoading: profilesLoading } = useProfilesQuery()
  const { data: coachTeams } = useCoachTeamsQuery()
  const createTeam = useCreateTeam()
  const [createTeamOpen, setCreateTeamOpen] = useState(false)

  if (profile?.role !== "admin") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="font-medium">No tienes acceso a esta sección</p>
        <p className="text-sm text-muted-foreground">
          Solo los administradores pueden gestionar equipos y entrenadores.
        </p>
      </div>
    )
  }

  const handleCreateTeam = async (values: TeamFormValues) => {
    try {
      await createTeam.mutateAsync({ ...values, orden: (teams?.length ?? 0) + 1 })
      toast.success("Equipo creado")
      setCreateTeamOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administración</h1>
        <p className="text-sm text-muted-foreground">
          Crea equipos y asigna entrenadores — sin tocar SQL.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Equipos</CardTitle>
          <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
            <Button size="sm" onClick={() => setCreateTeamOpen(true)}>
              <Plus />
              Nuevo equipo
            </Button>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Nuevo equipo</DialogTitle>
              </DialogHeader>
              <TeamForm
                submitLabel="Crear equipo"
                isSubmitting={createTeam.isPending}
                onSubmit={handleCreateTeam}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {teamsLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : teams && teams.length > 0 ? (
            teams.map((team) => (
              <Badge key={team.id} variant="secondary">
                {team.nombre} · {team.temporada}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay equipos.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entrenadores</CardTitle>
        </CardHeader>
        <CardContent>
          {profilesLoading ? (
            <Skeleton className="h-40" />
          ) : profiles && profiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Equipos asignados (toca para asignar/quitar)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <CoachRow
                    key={p.id}
                    profile={p}
                    teams={teams ?? []}
                    assignedTeamIds={
                      coachTeams
                        ?.filter((ct) => ct.profile_id === p.id)
                        .map((ct) => ct.team_id) ?? []
                    }
                  />
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no se ha registrado nadie. Comparte el enlace de registro
              con los entrenadores del club.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
