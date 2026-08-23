import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/auth/require-auth"
import { AppLayout } from "@/components/layout/app-layout"
import LoginPage from "@/pages/LoginPage"

const DashboardPage = lazy(() => import("@/pages/DashboardPage"))
const PlantillaPage = lazy(() => import("@/pages/PlantillaPage"))
const PlayerDetailPage = lazy(() => import("@/pages/PlayerDetailPage"))
const EntrenamientosPage = lazy(() => import("@/pages/EntrenamientosPage"))
const TrainingDetailPage = lazy(() => import("@/pages/TrainingDetailPage"))
const ExercisePage = lazy(() => import("@/pages/ExercisePage"))
const BibliotecaPage = lazy(() => import("@/pages/BibliotecaPage"))
const AsistenciaPage = lazy(() => import("@/pages/AsistenciaPage"))
const AdminPage = lazy(() => import("@/pages/AdminPage"))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="plantilla"
            element={
              <Suspense fallback={<PageFallback />}>
                <PlantillaPage />
              </Suspense>
            }
          />
          <Route
            path="plantilla/:playerId"
            element={
              <Suspense fallback={<PageFallback />}>
                <PlayerDetailPage />
              </Suspense>
            }
          />
          <Route
            path="entrenamientos"
            element={
              <Suspense fallback={<PageFallback />}>
                <EntrenamientosPage />
              </Suspense>
            }
          />
          <Route
            path="entrenamientos/:trainingId"
            element={
              <Suspense fallback={<PageFallback />}>
                <TrainingDetailPage />
              </Suspense>
            }
          />
          <Route
            path="entrenamientos/:trainingId/ejercicios/:exerciseId"
            element={
              <Suspense fallback={<PageFallback />}>
                <ExercisePage />
              </Suspense>
            }
          />
          <Route
            path="biblioteca"
            element={
              <Suspense fallback={<PageFallback />}>
                <BibliotecaPage />
              </Suspense>
            }
          />
          <Route
            path="asistencia"
            element={
              <Suspense fallback={<PageFallback />}>
                <AsistenciaPage />
              </Suspense>
            }
          />
          <Route
            path="admin"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
