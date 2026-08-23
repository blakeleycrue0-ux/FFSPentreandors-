-- 1) Rango de jugadoras necesarias para el ejercicio (ej. "de 4 a 6").
alter table training_exercises
  add column jugadoras_min integer,
  add column jugadoras_max integer;

-- 2) Compartir ejercicios con todo el cuerpo técnico del club: cualquier
-- entrenador/coordinador/admin puede VER (no editar) los ejercicios de
-- cualquier equipo, para inspirarse o duplicarlos. La plantilla, la
-- asistencia y los datos personales de cada equipo siguen totalmente
-- aislados — esto solo afecta a los dibujos tácticos.

-- Guardamos el equipo directamente en el ejercicio (en vez de tener que
-- consultar el entrenamiento de otro equipo, que sigue sin ser visible).
alter table training_exercises
  add column team_id uuid references teams (id) on delete cascade;

update training_exercises te
  set team_id = t.team_id
  from trainings t
  where t.id = te.training_id
    and te.team_id is null;

alter table training_exercises
  alter column team_id set not null;

create index training_exercises_team_id_idx on training_exercises (team_id);

create or replace function set_exercise_team_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.team_id is null then
    select team_id into new.team_id from trainings where id = new.training_id;
  end if;
  return new;
end;
$$;

create trigger trg_set_exercise_team_id
  before insert on training_exercises
  for each row execute function set_exercise_team_id();

-- Cualquier persona autenticada del club puede ver cualquier ejercicio.
drop policy if exists "exercises_select_with_access" on training_exercises;
create policy "exercises_select_any_authenticated"
  on training_exercises for select
  using (auth.uid() is not null);

-- Necesitamos poder ver el nombre del equipo dueño de cada ejercicio
-- compartido, aunque no sea el tuyo (no expone jugadoras ni entrenamientos).
create policy "teams_select_any_authenticated"
  on teams for select
  using (auth.uid() is not null);
