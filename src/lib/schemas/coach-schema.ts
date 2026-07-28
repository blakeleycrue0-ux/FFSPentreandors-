import { z } from "zod"

export const coachSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["entrenador", "coordinador", "admin"]),
  teamId: z.string().optional(),
})

export type CoachFormValues = z.infer<typeof coachSchema>

export const coachFormDefaults: CoachFormValues = {
  fullName: "",
  email: "",
  password: "",
  role: "entrenador",
  teamId: "",
}
