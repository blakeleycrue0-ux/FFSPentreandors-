import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  coachFormDefaults,
  coachSchema,
  type CoachFormValues,
} from "@/lib/schemas/coach-schema"
import { roleLabels } from "@/lib/labels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Team } from "@/types/database"

interface CreateCoachFormProps {
  teams: Team[]
  onSubmit: (values: CoachFormValues) => Promise<void> | void
  isSubmitting?: boolean
}

export function CreateCoachForm({
  teams,
  onSubmit,
  isSubmitting,
}: CreateCoachFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: coachFormDefaults,
  })

  const role = watch("role")
  const teamId = watch("teamId")

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="text" {...register("password")} />
        <p className="text-xs text-muted-foreground">
          Se la tendrás que pasar tú a la persona para que entre.
        </p>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Rol</Label>
        <Select value={role} onValueChange={(v) => setValue("role", v as CoachFormValues["role"])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Equipo</Label>
        <Select value={teamId || undefined} onValueChange={(v) => setValue("teamId", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Sin equipo (se asigna después)" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Creando…" : "Crear entrenador"}
      </Button>
    </form>
  )
}
