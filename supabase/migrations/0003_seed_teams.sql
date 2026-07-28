-- Categorías del club para la temporada 2025/26.
-- Puramente informativo/de arranque: esta base de datos es independiente
-- de la web pública, así que estos nombres no se sincronizan automáticamente.

alter table teams add constraint teams_nombre_temporada_key unique (nombre, temporada);

insert into teams (nombre, categoria, temporada, orden) values
  ('Amateur', 'Amateur', '2025/26', 1),
  ('Cadete/Juvenil', 'Cadete/Juvenil', '2025/26', 2),
  ('Infantil', 'Infantil', '2025/26', 3),
  ('Benjamín/Alevín', 'Benjamín/Alevín', '2025/26', 4)
on conflict (nombre, temporada) do nothing;
