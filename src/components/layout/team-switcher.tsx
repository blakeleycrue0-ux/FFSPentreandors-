import { useTeam } from "@/contexts/team-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamSwitcher() {
  const { teams, selectedTeamId, setSelectedTeamId, isLoading } = useTeam()

  if (isLoading) return <Skeleton className="h-9 w-40" />

  if (teams.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin equipos asignados</p>
    )
  }

  if (teams.length === 1) {
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: teams[0].color }}
        />
        {teams[0].nombre}
      </div>
    )
  }

  return (
    <Select value={selectedTeamId ?? undefined} onValueChange={setSelectedTeamId}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecciona un equipo" />
      </SelectTrigger>
      <SelectContent>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: team.color }}
            />
            {team.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
