import type { LucideIcon } from "lucide-react"
import { CalendarDays, ClipboardCheck, LayoutDashboard, Users } from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/plantilla", label: "Plantilla", icon: Users },
  { to: "/entrenamientos", label: "Entrenamientos", icon: CalendarDays },
  { to: "/asistencia", label: "Asistencia", icon: ClipboardCheck },
]
