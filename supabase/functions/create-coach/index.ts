// Edge Function: crea una cuenta de entrenador desde el Panel de Administración.
// Usa la service_role key (inyectada automáticamente por Supabase, nunca
// expuesta al navegador) para crear el usuario en Auth y asignarle equipo.
// Solo quien llama con el token de un admin puede ejecutar esto.
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return json({ error: "Falta autenticación" }, 401)
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await callerClient.auth.getUser()
    if (!user) {
      return json({ error: "Sesión no válida" }, 401)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (callerProfile?.role !== "admin") {
      return json({ error: "Solo un administrador puede crear entrenadores" }, 403)
    }

    const { email, fullName, password, teamId, role } = await req.json()

    if (!email || !password) {
      return json({ error: "Email y contraseña son obligatorios" }, 400)
    }

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName ?? "" },
      })

    if (createError || !created.user) {
      return json({ error: createError?.message ?? "No se pudo crear el usuario" }, 400)
    }

    if (role && role !== "entrenador") {
      await adminClient
        .from("profiles")
        .update({ role })
        .eq("id", created.user.id)
    }

    if (teamId) {
      const { error: assignError } = await adminClient
        .from("coach_teams")
        .insert({ profile_id: created.user.id, team_id: teamId })
      if (assignError) {
        return json(
          { error: `Usuario creado, pero falló asignar equipo: ${assignError.message}` },
          207
        )
      }
    }

    return json({ ok: true, userId: created.user.id })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Error inesperado" }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
