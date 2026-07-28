export type UserRole = "admin" | "coordinador" | "entrenador"
export type PlayerStatus = "activa" | "lesionada" | "baja"
export type DominantLeg = "diestra" | "zurda" | "ambidiestra"
export type AttendanceStatus = "pendiente" | "voy" | "no_voy" | "tarde"
export type AbsenceReason =
  | "enfermedad"
  | "lesion"
  | "estudios"
  | "trabajo"
  | "viaje"
  | "motivo_familiar"
  | "otro"

export type Profile = {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Team = {
  id: string
  nombre: string
  categoria: string
  temporada: string
  color: string
  orden: number
  created_at: string
}

export type CoachTeam = {
  profile_id: string
  team_id: string
  created_at: string
}

export type Player = {
  id: string
  team_id: string
  nombre: string
  apellidos: string
  dorsal: number | null
  posicion: string | null
  pierna_dominante: DominantLeg | null
  foto_url: string | null
  fecha_nacimiento: string | null
  telefono: string | null
  email: string | null
  tutor_legal: string | null
  telefono_tutor: string | null
  direccion: string | null
  observaciones: string | null
  lesion_actual: string | null
  historial_medico: string | null
  alergias: string | null
  fecha_alta: string
  estado: PlayerStatus
  created_at: string
  updated_at: string
}

export type Training = {
  id: string
  team_id: string
  fecha: string
  hora_inicio: string
  hora_fin: string | null
  campo: string | null
  objetivos: string | null
  ejercicios: string | null
  material: string | null
  comentarios: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TrainingAttendance = {
  id: string
  training_id: string
  player_id: string
  estado: AttendanceStatus
  motivo: AbsenceReason | null
  comentario: string | null
  respondido_at: string | null
  updated_at: string
}

type Insertable<Row, RequiredKeys extends keyof Row> = Partial<Row> &
  Pick<Row, RequiredKeys>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Insertable<Profile, "id" | "email">
        Update: Partial<Profile>
        Relationships: []
      }
      teams: {
        Row: Team
        Insert: Insertable<Team, "nombre" | "categoria">
        Update: Partial<Team>
        Relationships: []
      }
      coach_teams: {
        Row: CoachTeam
        Insert: Insertable<CoachTeam, "profile_id" | "team_id">
        Update: Partial<CoachTeam>
        Relationships: [
          {
            foreignKeyName: "coach_teams_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: Player
        Insert: Insertable<Player, "team_id" | "nombre">
        Update: Partial<Player>
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: Training
        Insert: Insertable<Training, "team_id" | "fecha" | "hora_inicio">
        Update: Partial<Training>
        Relationships: [
          {
            foreignKeyName: "trainings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      training_attendance: {
        Row: TrainingAttendance
        Insert: Insertable<TrainingAttendance, "training_id" | "player_id">
        Update: Partial<TrainingAttendance>
        Relationships: [
          {
            foreignKeyName: "training_attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type Tables = Database["public"]["Tables"]

export type PlayerInsert = Tables["players"]["Insert"]
export type PlayerUpdate = Tables["players"]["Update"]
export type TrainingInsert = Tables["trainings"]["Insert"]
export type TrainingUpdate = Tables["trainings"]["Update"]
export type TrainingAttendanceUpdate = Tables["training_attendance"]["Update"]
export type TeamInsert = Tables["teams"]["Insert"]
export type ProfileUpdate = Tables["profiles"]["Update"]
export type CoachTeamInsert = Tables["coach_teams"]["Insert"]
