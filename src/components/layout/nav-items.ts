import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  adminOnly?: boolean
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/plantilla", label: "Plantilla", icon: Users },
  { to: "/entrenamientos", label: "Entrenamientos", icon: CalendarDays },
  { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { to: "/asistencia", label: "Asistencia", icon: ClipboardCheck },
  { to: "/admin", label: "Administración", icon: ShieldCheck, adminOnly: true },
]
