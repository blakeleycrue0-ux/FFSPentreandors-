import { toast } from "sonner"

import {
  useAssignCoachTeam,
  useRemoveCoachTeam,
} from "@/hooks/use-coach-teams"
import { useUpdateProfileRole } from "@/hooks/use-profiles"
import { roleLabels } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableCell, TableRow } from "@/components/ui/table"
import type { Profile, Team, UserRole } from "@/types/database"

export function CoachRow({
  profile,
  teams,
  assignedTeamIds,
}: {
  profile: Profile
  teams: Team[]
  assignedTeamIds: string[]
}) {
  const updateRole = useUpdateProfileRole()
  const assignTeam = useAssignCoachTeam()
  const removeTeam = useRemoveCoachTeam()

  const handleRoleChange = async (role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id: profile.id, role })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  const toggleTeam = async (teamId: string, assigned: boolean) => {
    try {
      if (assigned) {
        await removeTeam.mutateAsync({ profileId: profile.id, teamId })
      } else {
        await assignTeam.mutateAsync({ profileId: profile.id, teamId })
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{profile.full_name || "(sin nombre)"}</div>
        <div className="text-xs text-muted-foreground">{profile.email}</div>
      </TableCell>
      <TableCell>
        <Select value={profile.role} onValueChange={handleRoleChange}>
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1.5">
          {teams.map((team) => {
            const assigned = assignedTeamIds.includes(team.id)
            return (
              <Badge
                key={team.id}
                variant={assigned ? "success" : "outline"}
                className={cn("cursor-pointer select-none")}
                onClick={() => toggleTeam(team.id, assigned)}
              >
                {team.nombre}
              </Badge>
            )
          })}
        </div>
      </TableCell>
    </TableRow>
  )
}
