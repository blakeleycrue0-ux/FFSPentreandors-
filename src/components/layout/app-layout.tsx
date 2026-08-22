import { useState } from "react"
import { Menu } from "lucide-react"
import { Outlet } from "react-router-dom"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Toaster } from "@/components/ui/sonner"

function BrandMark() {
  return (
    <div className="flex items-center gap-2 px-4 py-4">
      <img src="/crest.png" alt="Escudo FFS Santa Ponça" className="h-8 w-auto" />
      <div className="leading-tight">
        <p className="font-heading text-xs tracking-tight uppercase">
          FFS Santa Ponça
        </p>
        <p className="text-xs text-muted-foreground">Entrenadores</p>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col">
        <BrandMark />
        <SidebarNav />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <BrandMark />
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-4" />
            </Button>
            <TeamSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-center" />
    </div>
  )
}
