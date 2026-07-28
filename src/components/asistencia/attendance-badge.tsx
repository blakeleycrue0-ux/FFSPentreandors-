import { attendanceStatusLabels } from "@/lib/labels"
import { Badge } from "@/components/ui/badge"
import type { AttendanceStatus } from "@/types/database"

const variantByStatus: Record<
  AttendanceStatus,
  "success" | "warning" | "destructive" | "outline"
> = {
  voy: "success",
  pendiente: "warning",
  no_voy: "destructive",
  tarde: "outline",
}

export function AttendanceBadge({ estado }: { estado: AttendanceStatus }) {
  return <Badge variant={variantByStatus[estado]}>{attendanceStatusLabels[estado]}</Badge>
}
