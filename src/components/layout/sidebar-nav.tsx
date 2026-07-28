import { NavLink } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { navItems } from "@/components/layout/nav-items"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useAuth()
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || profile?.role === "admin"
  )

  return (
    <nav className="flex flex-col gap-1 p-3">
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
