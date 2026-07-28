import { Navigate, Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/auth/require-auth"
import { AppLayout } from "@/components/layout/app-layout"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/SignUpPage"
import DashboardPage from "@/pages/DashboardPage"
import PlantillaPage from "@/pages/PlantillaPage"
import PlayerDetailPage from "@/pages/PlayerDetailPage"
import EntrenamientosPage from "@/pages/EntrenamientosPage"
import TrainingDetailPage from "@/pages/TrainingDetailPage"
import AsistenciaPage from "@/pages/AsistenciaPage"
import AdminPage from "@/pages/AdminPage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<SignUpPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="plantilla" element={<PlantillaPage />} />
          <Route path="plantilla/:playerId" element={<PlayerDetailPage />} />
          <Route path="entrenamientos" element={<EntrenamientosPage />} />
          <Route path="entrenamientos/:trainingId" element={<TrainingDetailPage />} />
          <Route path="asistencia" element={<AsistenciaPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
