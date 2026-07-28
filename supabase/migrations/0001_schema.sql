-- Plataforma de entrenadores — FFS Santa Ponça
-- Esquema base: perfiles/roles, equipos, plantilla, entrenamientos, asistencia.
-- Base de datos independiente de la web pública (no comparte tablas).

create extension if not exists "pgcrypto";

create type user_role as enum ('admin', 'coordinador', 'entrenador');
create type player_status as enum ('activa', 'lesionada', 'baja');
create type dominant_leg as enum ('diestra', 'zurda', 'ambidiestra');
create type attendance_status as enum ('pendiente', 'voy', 'no_voy', 'tarde');
create type absence_reason as enum (
  'enfermedad', 'lesion', 'estudios', 'trabajo', 'viaje', 'motivo_familiar', 'otro'
);

-- Un perfil por usuario de Supabase Auth.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role user_role not null default 'entrenador',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null,
  temporada text not null default '2025/26',
  color text not null default '#16a34a',
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

-- Asignación de entrenadores/coordinadores a equipos (many-to-many).
create table coach_teams (
  profile_id uuid not null references profiles (id) on delete cascade,
  team_id uuid not null references teams (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, team_id)
);

create table players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  nombre text not null,
  apellidos text not null default '',
  dorsal integer,
  posicion text,
  pierna_dominante dominant_leg,
  foto_url text,
  fecha_nacimiento date,
  telefono text,
  email text,
  tutor_legal text,
  telefono_tutor text,
  direccion text,
  observaciones text,
  lesion_actual text,
  historial_medico text,
  alergias text,
  fecha_alta date not null default current_date,
  estado player_status not null default 'activa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trainings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams (id) on delete cascade,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time,
  campo text,
  objetivos text,
  ejercicios text,
  material text,
  comentarios text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table training_attendance (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  estado attendance_status not null default 'pendiente',
  motivo absence_reason,
  comentario text,
  respondido_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (training_id, player_id)
);

create index players_team_id_idx on players (team_id);
create index trainings_team_id_idx on trainings (team_id);
create index trainings_fecha_idx on trainings (fecha);
create index training_attendance_training_id_idx on training_attendance (training_id);
create index training_attendance_player_id_idx on training_attendance (player_id);
create index coach_teams_profile_id_idx on coach_teams (profile_id);

-- Crea automáticamente una fila en training_attendance (estado pendiente)
-- para cada jugadora activa del equipo cuando se crea un entrenamiento.
create or replace function create_attendance_rows_for_training()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into training_attendance (training_id, player_id, estado)
  select new.id, p.id, 'pendiente'
  from players p
  where p.team_id = new.team_id
    and p.estado = 'activa';
  return new;
end;
$$;

create trigger trg_create_attendance_rows
  after insert on trainings
  for each row execute function create_attendance_rows_for_training();

-- Mantiene updated_at al día.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_players_updated_at before update on players
  for each row execute function set_updated_at();
create trigger trg_trainings_updated_at before update on trainings
  for each row execute function set_updated_at();
create trigger trg_training_attendance_updated_at before update on training_attendance
  for each row execute function set_updated_at();

-- Crea un perfil automáticamente cuando se registra un usuario en Supabase Auth.
-- El rol por defecto es 'entrenador'; un admin lo eleva a coordinador/admin después.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
