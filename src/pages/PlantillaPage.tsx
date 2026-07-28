import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { useTeam } from "@/contexts/team-context"
import { useCreatePlayer, usePlayersQuery } from "@/hooks/use-players"
import { playerStatusLabels } from "@/lib/labels"
import { PlayerAvatar } from "@/components/plantilla/player-avatar"
import { PlayerForm } from "@/components/plantilla/player-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Player, PlayerStatus } from "@/types/database"

const statusBadgeVariant: Record<PlayerStatus, "success" | "destructive" | "secondary"> = {
  activa: "success",
  lesionada: "destructive",
  baja: "secondary",
}

export default function PlantillaPage() {
  const { selectedTeamId } = useTeam()
  const { data: players, isLoading } = usePlayersQuery(selectedTeamId)
  const createPlayer = useCreatePlayer()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | "todas">("todas")
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!players) return []
    return players.filter((p) => {
      const matchesStatus = statusFilter === "todas" || p.estado === statusFilter
      const fullName = `${p.nombre} ${p.apellidos}`.toLowerCase()
      const matchesSearch = fullName.includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [players, search, statusFilter])

  const handleCreate = async (
    values: Partial<Player> & Pick<Player, "nombre" | "estado">
  ) => {
    if (!selectedTeamId) return
    try {
      await createPlayer.mutateAsync({ ...values, team_id: selectedTeamId })
      toast.success("Jugadora añadida a la plantilla")
      setCreateOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantilla</h1>
          <p className="text-sm text-muted-foreground">
            {players?.length ?? 0} jugadoras en el equipo
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nueva jugadora
          </Button>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nueva jugadora</DialogTitle>
            </DialogHeader>
            <PlayerForm
              submitLabel="Añadir jugadora"
              isSubmitting={createPlayer.isPending}
              onSubmit={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar jugadora…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as PlayerStatus | "todas")}
        >
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="activa">Activas</TabsTrigger>
            <TabsTrigger value="lesionada">Lesionadas</TabsTrigger>
            <TabsTrigger value="baja">Bajas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : filtered.length === 0 ? (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No hay jugadoras que coincidan con la búsqueda.
          </p>
        ) : (
          filtered.map((player) => (
            <Link key={player.id} to={`/plantilla/${player.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3">
                  <PlayerAvatar
                    nombre={player.nombre}
                    apellidos={player.apellidos}
                    fotoUrl={player.foto_url}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {player.nombre} {player.apellidos}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {player.posicion ?? "Sin posición"}
                      {player.dorsal !== null ? ` · #${player.dorsal}` : ""}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant[player.estado]}>
                    {playerStatusLabels[player.estado]}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
