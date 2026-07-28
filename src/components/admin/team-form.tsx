import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  teamFormDefaults,
  teamSchema,
  type TeamFormValues,
} from "@/lib/schemas/team-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TeamFormProps {
  onSubmit: (values: TeamFormValues) => Promise<void> | void
  submitLabel: string
  isSubmitting?: boolean
}

export function TeamForm({ onSubmit, submitLabel, isSubmitting }: TeamFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: teamFormDefaults,
  })

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre del equipo</Label>
        <Input id="nombre" placeholder="Amateur" {...register("nombre")} />
        {errors.nombre && (
          <p className="text-xs text-destructive">{errors.nombre.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoria">Categoría</Label>
        <Input id="categoria" placeholder="Amateur" {...register("categoria")} />
        {errors.categoria && (
          <p className="text-xs text-destructive">{errors.categoria.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="temporada">Temporada</Label>
        <Input id="temporada" placeholder="2025/26" {...register("temporada")} />
        {errors.temporada && (
          <p className="text-xs text-destructive">{errors.temporada.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Guardando…" : submitLabel}
      </Button>
    </form>
  )
}
