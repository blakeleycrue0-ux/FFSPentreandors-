import type {
  AbsenceReason,
  AttendanceStatus,
  DominantLeg,
  PlayerStatus,
  UserRole,
} from "@/types/database"

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  coordinador: "Coordinador",
  entrenador: "Entrenador",
}

export const playerStatusLabels: Record<PlayerStatus, string> = {
  activa: "Activa",
  lesionada: "Lesionada",
  baja: "Baja",
}

export const dominantLegLabels: Record<DominantLeg, string> = {
  diestra: "Diestra",
  zurda: "Zurda",
  ambidiestra: "Ambidiestra",
}

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  pendiente: "Pendiente",
  voy: "Voy",
  no_voy: "No voy",
  tarde: "Llegaré tarde",
}

export const absenceReasonLabels: Record<AbsenceReason, string> = {
  enfermedad: "Enfermedad",
  lesion: "Lesión",
  estudios: "Estudios",
  trabajo: "Trabajo",
  viaje: "Viaje",
  motivo_familiar: "Motivo familiar",
  otro: "Otro",
}

export const positionOptions = [
  "Portera",
  "Defensa central",
  "Lateral derecha",
  "Lateral izquierda",
  "Mediocentro",
  "Mediocentro defensiva",
  "Mediocentro ofensiva",
  "Extremo derecha",
  "Extremo izquierda",
  "Delantera",
]
