import { z } from "zod"

export const teamSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  categoria: z.string().min(1, "La categoría es obligatoria"),
  temporada: z.string().min(1, "La temporada es obligatoria"),
})

export type TeamFormValues = z.infer<typeof teamSchema>

export const teamFormDefaults: TeamFormValues = {
  nombre: "",
  categoria: "",
  temporada: "2025/26",
}
