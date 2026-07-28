import { supabase } from "@/lib/supabase"
import type { UserRole } from "@/types/database"

interface CreateCoachInput {
  email: string
  fullName: string
  password: string
  role: UserRole
  teamId: string | null
}

export async function createCoach(input: CreateCoachInput) {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token
  if (!accessToken) {
    throw new Error("Sesión no válida, vuelve a iniciar sesión")
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const response = await fetch(`${supabaseUrl}/functions/v1/create-coach`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      email: input.email,
      fullName: input.fullName,
      password: input.password,
      role: input.role,
      teamId: input.teamId,
    }),
  })

  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error ?? "No se pudo crear el entrenador")
  }
  return body
}
