import { useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ShieldCheck } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
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

const schema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { session, signInWithPassword } = useAuth()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/"
    return <Navigate to={from} replace />
  }

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    const { error } = await signInWithPassword(values.email, values.password)
    if (error) setFormError(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-brand/10">
            <ShieldCheck className="size-6 text-brand" />
          </div>
          <CardTitle className="text-xl">Plataforma de entrenadores</CardTitle>
          <CardDescription>
            Fútbol Femenino Santa Ponça — acceso privado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="entrenador@santaponca.com"
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
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            {formError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="mt-1">
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Acceso solo para entrenadores, coordinadores y administradores del club.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
