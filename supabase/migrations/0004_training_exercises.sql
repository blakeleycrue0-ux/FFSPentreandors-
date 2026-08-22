-- Ejercicios del planificador de entrenos: cada entrenamiento puede tener
-- varios ejercicios, cada uno con su propio dibujo táctico (canvas_data),
-- duración y objetivo.

create table training_exercises (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references trainings (id) on delete cascade,
  orden integer not null default 0,
  titulo text not null default '',
  duracion_minutos integer,
  objetivo text,
  canvas_data jsonb not null default '{"elements":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index training_exercises_training_id_idx on training_exercises (training_id);

create trigger trg_training_exercises_updated_at before update on training_exercises
  for each row execute function set_updated_at();

alter table training_exercises enable row level security;

create policy "exercises_select_with_access"
  on training_exercises for select
  using (
    exists (
      select 1 from trainings t
      where t.id = training_exercises.training_id
        and has_team_access(t.team_id)
    )
  );

create policy "exercises_insert_with_access"
  on training_exercises for insert
  with check (
    exists (
      select 1 from trainings t
      where t.id = training_exercises.training_id
        and has_team_access(t.team_id)
    )
  );

create policy "exercises_update_with_access"
  on training_exercises for update
  using (
    exists (
      select 1 from trainings t
      where t.id = training_exercises.training_id
        and has_team_access(t.team_id)
    )
  );

create policy "exercises_delete_with_access"
  on training_exercises for delete
  using (
    exists (
      select 1 from trainings t
      where t.id = training_exercises.training_id
        and has_team_access(t.team_id)
    )
  );
