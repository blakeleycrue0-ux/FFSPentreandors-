import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/contexts/auth-context"
import { TeamProvider } from "@/contexts/team-context"

export function RequireAuth() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <TeamProvider>
      <Outlet />
    </TeamProvider>
  )
}
