import { z } from "zod"

import type { Training } from "@/types/database"

export const trainingSchema = z.object({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  hora_inicio: z.string().min(1, "La hora es obligatoria"),
  hora_fin: z.string().optional(),
  campo: z.string().optional(),
  objetivos: z.string().optional(),
  ejercicios: z.string().optional(),
  material: z.string().optional(),
  comentarios: z.string().optional(),
})

export type TrainingFormValues = z.infer<typeof trainingSchema>

export const trainingFormDefaults: TrainingFormValues = {
  fecha: "",
  hora_inicio: "",
  hora_fin: "",
  campo: "",
  objetivos: "",
  ejercicios: "",
  material: "",
  comentarios: "",
}

function orEmpty(value: string | null): string {
  return value ?? ""
}

export function trainingToFormValues(training: Training): TrainingFormValues {
  return {
    fecha: training.fecha,
    hora_inicio: training.hora_inicio,
    hora_fin: orEmpty(training.hora_fin),
    campo: orEmpty(training.campo),
    objetivos: orEmpty(training.objetivos),
    ejercicios: orEmpty(training.ejercicios),
    material: orEmpty(training.material),
    comentarios: orEmpty(training.comentarios),
  }
}

export function trainingFormToPayload(
  values: TrainingFormValues
): Partial<Training> & Pick<Training, "fecha" | "hora_inicio"> {
  return {
    fecha: values.fecha,
    hora_inicio: values.hora_inicio,
    hora_fin: values.hora_fin || null,
    campo: values.campo || null,
    objetivos: values.objetivos || null,
    ejercicios: values.ejercicios || null,
    material: values.material || null,
    comentarios: values.comentarios || null,
  }
}
