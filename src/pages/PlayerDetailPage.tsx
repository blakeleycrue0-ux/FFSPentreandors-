import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { useDeletePlayer, usePlayerQuery, useUpdatePlayer } from "@/hooks/use-players"
import {
  useCreatePlayerHistoryEvent,
  useDeletePlayerHistoryEvent,
  usePlayerHistoryQuery,
} from "@/hooks/use-player-history"
import { calculateAge, formatDateShort } from "@/lib/format"
import {
  dominantLegLabels,
  nivelFisicoLabels,
  playerHistoryTypeLabels,
  playerStatusLabels,
} from "@/lib/labels"
import { playerToFormValues } from "@/lib/schemas/player-schema"
import { PlayerAvatar } from "@/components/plantilla/player-avatar"
import { PlayerForm } from "@/components/plantilla/player-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import type { Player, PlayerHistoryType, PlayerStatus } from "@/types/database"

const statusBadgeVariant: Record<PlayerStatus, "success" | "destructive" | "secondary"> = {
  activa: "success",
  lesionada: "destructive",
  baja: "secondary",
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()
  const { data: player, isLoading } = usePlayerQuery(playerId)
  const updatePlayer = useUpdatePlayer()
  const deletePlayer = useDeletePlayer()
  const { data: history, isLoading: historyLoading } = usePlayerHistoryQuery(playerId)
  const createHistoryEvent = useCreatePlayerHistoryEvent()
  const deleteHistoryEvent = useDeletePlayerHistoryEvent()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyTipo, setHistoryTipo] = useState<PlayerHistoryType>("lesion")
  const [historyFechaInicio, setHistoryFechaInicio] = useState("")
  const [historyFechaFin, setHistoryFechaFin] = useState("")
  const [historyDescripcion, setHistoryDescripcion] = useState("")

  if (isLoading) {
    return <Skeleton className="h-96" />
  }

  if (!player) {
    return (
      <p className="text-sm text-muted-foreground">Jugadora no encontrada.</p>
    )
  }

  const handleUpdate = async (
    values: Partial<Player> & Pick<Player, "nombre" | "estado">
  ) => {
    try {
      await updatePlayer.mutateAsync({ id: player.id, ...values })
      toast.success("Ficha actualizada")
      setEditOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const handleDelete = async () => {
    try {
      await deletePlayer.mutateAsync({ id: player.id, teamId: player.team_id })
      toast.success("Jugadora eliminada")
      navigate("/plantilla")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar")
    }
  }

  const handleAddHistoryEvent = async () => {
    if (!historyFechaInicio) {
      toast.error("La fecha de inicio es obligatoria")
      return
    }
    try {
      await createHistoryEvent.mutateAsync({
        player_id: player.id,
        tipo: historyTipo,
        fecha_inicio: historyFechaInicio,
        fecha_fin: historyFechaFin || null,
        descripcion: historyDescripcion || null,
      })
      toast.success("Evento añadido")
      setHistoryOpen(false)
      setHistoryTipo("lesion")
      setHistoryFechaInicio("")
      setHistoryFechaFin("")
      setHistoryDescripcion("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const handleDeleteHistoryEvent = async (id: string) => {
    try {
      await deleteHistoryEvent.mutateAsync({ id, playerId: player.id })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link to="/plantilla">
            <ArrowLeft />
            Volver a la plantilla
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            Editar ficha
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

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-2 text-center sm:flex-row sm:text-left">
          <PlayerAvatar
            nombre={player.nombre}
            apellidos={player.apellidos}
            fotoUrl={player.foto_url}
            className="size-20 text-2xl"
          />
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {player.nombre} {player.apellidos}
            </h1>
            <p className="text-sm text-muted-foreground">
              {player.posicion ?? "Sin posición"}
              {player.dorsal !== null ? ` · Dorsal #${player.dorsal}` : ""}
            </p>
          </div>
          <Badge variant={statusBadgeVariant[player.estado]} className="text-sm">
            {playerStatusLabels[player.estado]}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow
              label="Fecha de nacimiento"
              value={
                player.fecha_nacimiento
                  ? `${formatDateShort(player.fecha_nacimiento)} (${calculateAge(player.fecha_nacimiento)} años)`
                  : null
              }
            />
            <InfoRow
              label="Pierna dominante"
              value={
                player.pierna_dominante
                  ? dominantLegLabels[player.pierna_dominante]
                  : null
              }
            />
            <InfoRow label="Teléfono" value={player.telefono} />
            <InfoRow label="Email" value={player.email} />
            <InfoRow label="Dirección" value={player.direccion} />
            <InfoRow
              label="Fecha de alta"
              value={formatDateShort(player.fecha_alta)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tutor legal</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Nombre" value={player.tutor_legal} />
            <InfoRow label="Teléfono" value={player.telefono_tutor} />
            <InfoRow label="Observaciones" value={player.observaciones} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Federativo y físico</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="Nº de licencia FFIB" value={player.numero_licencia} />
            <InfoRow label="DNI" value={player.dni} />
            <InfoRow
              label="Fecha de tramitación"
              value={
                player.fecha_tramitacion_ficha
                  ? formatDateShort(player.fecha_tramitacion_ficha)
                  : null
              }
            />
            <InfoRow label="Posición secundaria" value={player.posicion_secundaria} />
            <InfoRow
              label="Altura"
              value={player.altura_cm ? `${player.altura_cm} cm` : null}
            />
            <InfoRow label="Peso" value={player.peso_kg ? `${player.peso_kg} kg` : null} />
            <InfoRow
              label="Nivel físico"
              value={player.nivel_fisico ? nivelFisicoLabels[player.nivel_fisico] : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Salud</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InfoRow label="Lesión actual" value={player.lesion_actual} />
            <InfoRow label="Historial médico" value={player.historial_medico} />
            <InfoRow label="Alergias" value={player.alergias} />
            {!player.lesion_actual && !player.historial_medico && !player.alergias && (
              <p className="text-sm text-muted-foreground">
                Sin información médica registrada.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Historial</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
              <Plus />
              Añadir evento
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-16" />
            ) : history && history.length > 0 ? (
              <div className="flex flex-col gap-2">
                {history.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {playerHistoryTypeLabels[event.tipo]}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(event.fecha_inicio)}
                          {event.fecha_fin
                            ? ` – ${formatDateShort(event.fecha_fin)}`
                            : ""}
                        </p>
                      </div>
                      {event.descripcion && (
                        <p className="mt-1 text-sm">{event.descripcion}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteHistoryEvent(event.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin eventos registrados (lesiones, sanciones, cambios de equipo…).
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Añadir evento al historial</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Select
                value={historyTipo}
                onValueChange={(v) => setHistoryTipo(v as PlayerHistoryType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(playerHistoryTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="history-fecha-inicio">Fecha inicio</Label>
                <Input
                  id="history-fecha-inicio"
                  type="date"
                  value={historyFechaInicio}
                  onChange={(e) => setHistoryFechaInicio(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="history-fecha-fin">Fecha fin (opcional)</Label>
                <Input
                  id="history-fecha-fin"
                  type="date"
                  value={historyFechaFin}
                  onChange={(e) => setHistoryFechaFin(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="history-descripcion">Descripción</Label>
              <Textarea
                id="history-descripcion"
                rows={3}
                value={historyDescripcion}
                onChange={(e) => setHistoryDescripcion(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddHistoryEvent} disabled={createHistoryEvent.isPending}>
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar ficha</DialogTitle>
          </DialogHeader>
          <PlayerForm
            defaultValues={playerToFormValues(player)}
            submitLabel="Guardar cambios"
            isSubmitting={updatePlayer.isPending}
            onSubmit={handleUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar jugadora</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará la ficha de{" "}
              {player.nombre} {player.apellidos} y sus registros de asistencia.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePlayer.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
