-- Row Level Security: cada entrenador solo ve su(s) equipo(s) asignado(s).
-- Admin y Coordinador ven todos los equipos.

alter table profiles enable row level security;
alter table teams enable row level security;
alter table coach_teams enable row level security;
alter table players enable row level security;
alter table trainings enable row level security;
alter table training_attendance enable row level security;

-- Funciones auxiliares SECURITY DEFINER: evitan recursión de RLS al consultar
-- profiles/coach_teams desde dentro de las propias políticas.

create or replace function current_role_name()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'admin', false);
$$;

create or replace function is_admin_or_coordinador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from profiles where id = auth.uid()) in ('admin', 'coordinador'),
    false
  );
$$;

create or replace function has_team_access(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    is_admin_or_coordinador()
    or exists (
      select 1 from coach_teams
      where profile_id = auth.uid() and team_id = target_team_id
    );
$$;

-- profiles: cada usuario ve y edita su propio perfil; el admin ve/edita todos.
create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

create policy "profiles_update_own_or_admin"
  on profiles for update
  using (id = auth.uid() or is_admin());

create policy "profiles_insert_admin"
  on profiles for insert
  with check (is_admin());

create policy "profiles_delete_admin"
  on profiles for delete
  using (is_admin());

-- teams: visibles según asignación; solo admin crea/edita/borra equipos.
create policy "teams_select_with_access"
  on teams for select
  using (has_team_access(id));

create policy "teams_insert_admin"
  on teams for insert
  with check (is_admin());

create policy "teams_update_admin"
  on teams for update
  using (is_admin());

create policy "teams_delete_admin"
  on teams for delete
  using (is_admin());

-- coach_teams: el admin gestiona asignaciones; cada uno ve las suyas.
create policy "coach_teams_select_own_or_admin"
  on coach_teams for select
  using (profile_id = auth.uid() or is_admin());

create policy "coach_teams_insert_admin"
  on coach_teams for insert
  with check (is_admin());

create policy "coach_teams_delete_admin"
  on coach_teams for delete
  using (is_admin());

-- players: visibles/editables por quien tenga acceso al equipo.
create policy "players_select_with_access"
  on players for select
  using (has_team_access(team_id));

create policy "players_insert_with_access"
  on players for insert
  with check (has_team_access(team_id));

create policy "players_update_with_access"
  on players for update
  using (has_team_access(team_id));

create policy "players_delete_admin_or_coordinador"
  on players for delete
  using (is_admin_or_coordinador());

-- trainings: visibles/editables por quien tenga acceso al equipo.
create policy "trainings_select_with_access"
  on trainings for select
  using (has_team_access(team_id));

create policy "trainings_insert_with_access"
  on trainings for insert
  with check (has_team_access(team_id));

create policy "trainings_update_with_access"
  on trainings for update
  using (has_team_access(team_id));

create policy "trainings_delete_with_access"
  on trainings for delete
  using (has_team_access(team_id));

-- training_attendance: visible/editable si se tiene acceso al equipo del entrenamiento.
create policy "attendance_select_with_access"
  on training_attendance for select
  using (
    exists (
      select 1 from trainings t
      where t.id = training_attendance.training_id
        and has_team_access(t.team_id)
    )
  );

create policy "attendance_insert_with_access"
  on training_attendance for insert
  with check (
    exists (
      select 1 from trainings t
      where t.id = training_attendance.training_id
        and has_team_access(t.team_id)
    )
  );

create policy "attendance_update_with_access"
  on training_attendance for update
  using (
    exists (
      select 1 from trainings t
      where t.id = training_attendance.training_id
        and has_team_access(t.team_id)
    )
  );
