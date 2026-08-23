-- Ficha de jugadora más completa: datos federativos, físicos e historial.

alter table players
  add column numero_licencia text,
  add column dni text,
  add column fecha_tramitacion_ficha date,
  add column altura_cm integer,
  add column peso_kg numeric(5, 2),
  add column posicion_secundaria text,
  add column nivel_fisico integer check (nivel_fisico between 1 and 5);

create type player_history_type as enum ('lesion', 'sancion', 'cambio_equipo', 'otro');

create table player_history_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  tipo player_history_type not null,
  fecha_inicio date not null default current_date,
  fecha_fin date,
  descripcion text,
  created_at timestamptz not null default now()
);

create index player_history_events_player_id_idx on player_history_events (player_id);

alter table player_history_events enable row level security;

create policy "history_select_with_access"
  on player_history_events for select
  using (
    exists (
      select 1 from players p
      where p.id = player_history_events.player_id
        and has_team_access(p.team_id)
    )
  );

create policy "history_insert_with_access"
  on player_history_events for insert
  with check (
    exists (
      select 1 from players p
      where p.id = player_history_events.player_id
        and has_team_access(p.team_id)
    )
  );

create policy "history_update_with_access"
  on player_history_events for update
  using (
    exists (
      select 1 from players p
      where p.id = player_history_events.player_id
        and has_team_access(p.team_id)
    )
  );

create policy "history_delete_with_access"
  on player_history_events for delete
  using (
    exists (
      select 1 from players p
      where p.id = player_history_events.player_id
        and has_team_access(p.team_id)
    )
  );
