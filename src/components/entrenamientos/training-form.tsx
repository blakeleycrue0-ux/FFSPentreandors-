import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  trainingFormDefaults,
  trainingFormToPayload,
  trainingSchema,
  type TrainingFormValues,
} from "@/lib/schemas/training-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Training } from "@/types/database"

type TrainingPayload = Partial<Training> & Pick<Training, "fecha" | "hora_inicio">

interface TrainingFormProps {
  defaultValues?: Partial<TrainingFormValues>
  onSubmit: (values: TrainingPayload) => Promise<void> | void
  submitLabel: string
  isSubmitting?: boolean
}

export function TrainingForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: TrainingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: { ...trainingFormDefaults, ...defaultValues },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => onSubmit(trainingFormToPayload(values)))}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fecha">Fecha</Label>
          <Input id="fecha" type="date" {...register("fecha")} />
          {errors.fecha && (
            <p className="text-xs text-destructive">{errors.fecha.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="campo">Campo</Label>
          <Input id="campo" placeholder="Campo municipal…" {...register("campo")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hora_inicio">Hora de inicio</Label>
          <Input id="hora_inicio" type="time" {...register("hora_inicio")} />
          {errors.hora_inicio && (
            <p className="text-xs text-destructive">{errors.hora_inicio.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hora_fin">Hora de fin</Label>
          <Input id="hora_fin" type="time" {...register("hora_fin")} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="objetivos">Objetivos</Label>
        <Textarea id="objetivos" rows={2} {...register("objetivos")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ejercicios">Ejercicios</Label>
        <Textarea id="ejercicios" rows={3} {...register("ejercicios")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="material">Material necesario</Label>
          <Input id="material" {...register("material")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="comentarios">Comentarios</Label>
          <Input id="comentarios" {...register("comentarios")} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? "Guardando…" : submitLabel}
      </Button>
    </form>
  )
}
