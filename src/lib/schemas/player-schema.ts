import { z } from "zod"

import type { Player } from "@/types/database"

export const playerSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().optional(),
  dorsal: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 99),
      "Dorsal entre 0 y 99"
    ),
  posicion: z.string().optional(),
  pierna_dominante: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Email no válido"),
  tutor_legal: z.string().optional(),
  telefono_tutor: z.string().optional(),
  direccion: z.string().optional(),
  observaciones: z.string().optional(),
  lesion_actual: z.string().optional(),
  historial_medico: z.string().optional(),
  alergias: z.string().optional(),
  estado: z.enum(["activa", "lesionada", "baja"]),
  foto_url: z.string().optional(),
})

export type PlayerFormValues = z.infer<typeof playerSchema>

export const playerFormDefaults: PlayerFormValues = {
  nombre: "",
  apellidos: "",
  dorsal: "",
  posicion: "",
  pierna_dominante: "",
  fecha_nacimiento: "",
  telefono: "",
  email: "",
  tutor_legal: "",
  telefono_tutor: "",
  direccion: "",
  observaciones: "",
  lesion_actual: "",
  historial_medico: "",
  alergias: "",
  estado: "activa",
  foto_url: "",
}

function orEmpty(value: string | null): string {
  return value ?? ""
}

export function playerToFormValues(player: Player): PlayerFormValues {
  return {
    nombre: player.nombre,
    apellidos: player.apellidos,
    dorsal: player.dorsal === null ? "" : String(player.dorsal),
    posicion: orEmpty(player.posicion),
    pierna_dominante: orEmpty(player.pierna_dominante),
    fecha_nacimiento: orEmpty(player.fecha_nacimiento),
    telefono: orEmpty(player.telefono),
    email: orEmpty(player.email),
    tutor_legal: orEmpty(player.tutor_legal),
    telefono_tutor: orEmpty(player.telefono_tutor),
    direccion: orEmpty(player.direccion),
    observaciones: orEmpty(player.observaciones),
    lesion_actual: orEmpty(player.lesion_actual),
    historial_medico: orEmpty(player.historial_medico),
    alergias: orEmpty(player.alergias),
    estado: player.estado,
    foto_url: orEmpty(player.foto_url),
  }
}

export function playerFormToPayload(
  values: PlayerFormValues
): Partial<Player> & Pick<Player, "nombre" | "estado"> {
  return {
    nombre: values.nombre,
    apellidos: values.apellidos || "",
    dorsal: values.dorsal ? Number(values.dorsal) : null,
    posicion: values.posicion || null,
    pierna_dominante:
      (values.pierna_dominante as Player["pierna_dominante"]) || null,
    fecha_nacimiento: values.fecha_nacimiento || null,
    telefono: values.telefono || null,
    email: values.email || null,
    tutor_legal: values.tutor_legal || null,
    telefono_tutor: values.telefono_tutor || null,
    direccion: values.direccion || null,
    observaciones: values.observaciones || null,
    lesion_actual: values.lesion_actual || null,
    historial_medico: values.historial_medico || null,
    alergias: values.alergias || null,
    estado: values.estado,
    foto_url: values.foto_url || null,
  }
}
