import { useState } from "react"
import { Plus, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/contexts/auth-context"
import { useCoachTeamsQuery } from "@/hooks/use-coach-teams"
import { useProfilesQuery } from "@/hooks/use-profiles"
import { useCreateTeam, useTeamsQuery } from "@/hooks/use-teams"
import { createCoach } from "@/lib/create-coach"
import type { CoachFormValues } from "@/lib/schemas/coach-schema"
import type { TeamFormValues } from "@/lib/schemas/team-schema"
import { CoachRow } from "@/components/admin/coach-row"
import { CreateCoachForm } from "@/components/admin/create-coach-form"
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
  const queryClient = useQueryClient()
  const { data: teams, isLoading: teamsLoading } = useTeamsQuery()
  const { data: profiles, isLoading: profilesLoading } = useProfilesQuery()
  const { data: coachTeams } = useCoachTeamsQuery()
  const createTeam = useCreateTeam()
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [createCoachOpen, setCreateCoachOpen] = useState(false)
  const [isCreatingCoach, setIsCreatingCoach] = useState(false)

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

  const handleCreateCoach = async (values: CoachFormValues) => {
    setIsCreatingCoach(true)
    try {
      await createCoach({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        role: values.role,
        teamId: values.teamId || null,
      })
      toast.success(
        `Cuenta creada. Pásale a ${values.fullName} el email y la contraseña para que entre.`
      )
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
      queryClient.invalidateQueries({ queryKey: ["coach-teams"] })
      setCreateCoachOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la cuenta")
    } finally {
      setIsCreatingCoach(false)
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Entrenadores</CardTitle>
          <Dialog open={createCoachOpen} onOpenChange={setCreateCoachOpen}>
            <Button size="sm" onClick={() => setCreateCoachOpen(true)}>
              <Plus />
              Crear entrenador
            </Button>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Crear entrenador</DialogTitle>
              </DialogHeader>
              <CreateCoachForm
                teams={teams ?? []}
                isSubmitting={isCreatingCoach}
                onSubmit={handleCreateCoach}
              />
            </DialogContent>
          </Dialog>
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
              Todavía no has creado ninguna cuenta. Usa "Crear entrenador".
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
