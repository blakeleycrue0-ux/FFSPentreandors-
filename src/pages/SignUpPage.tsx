import { useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { UserPlus } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const schema = z
  .object({
    fullName: z.string().min(1, "Tu nombre es obligatorio"),
    email: z.string().email("Introduce un email válido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof schema>

export default function SignUpPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session) return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    })
    if (error) {
      setFormError(error.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle>Cuenta creada</CardTitle>
            <CardDescription>
              Ya puedes iniciar sesión. Pide a un administrador que te asigne
              un equipo para poder ver datos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-brand/10">
            <UserPlus className="size-6 text-brand" />
          </div>
          <CardTitle className="text-xl">Crear cuenta de entrenador</CardTitle>
          <CardDescription>
            Fútbol Femenino Santa Ponça — acceso privado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" autoComplete="name" {...register("fullName")} />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">Repite la contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brand underline">Inicia sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
