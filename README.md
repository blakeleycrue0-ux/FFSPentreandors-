# Plataforma de entrenadores — FFS Santa Ponça

Aplicación privada para que los entrenadores del club gestionen su equipo:
plantilla, entrenamientos, asistencia y (en próximos bloques) partidos,
convocatorias, estadísticas e integración con la FFIB.

Proyecto **nuevo e independiente** de la web pública del club (Netlify +
Supabase, repositorio aparte). No comparte base de datos con ella.

## Stack

React · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui (componentes propios,
sin CLI por restricciones de red) · Supabase (Auth + Postgres + RLS) ·
TanStack Query · React Hook Form + Zod · Recharts · React Router.

## Puesta en marcha

1. Crea un proyecto en [Supabase](https://supabase.com) (independiente del de
   la web pública).
2. Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con las credenciales de ese proyecto.
3. Aplica las migraciones de `supabase/migrations/` en orden (0001, 0002,
   0003) desde el SQL Editor de Supabase o con la CLI de Supabase
   (`supabase db push`).
4. En Supabase Auth, crea manualmente el primer usuario (futuro
   administrador) y, tras iniciar sesión una vez para que se cree su fila en
   `profiles`, sube su `role` a `admin` con una consulta SQL:
   ```sql
   update profiles set role = 'admin' where email = 'tu-email@club.com';
   ```
   Desde ahí, ese administrador ya puede crear equipos (`teams`) y asignar
   entrenadores a equipos (`coach_teams`) — no hay panel de administración
   todavía (ver "Pendiente para el siguiente bloque").
5. Instala dependencias y arranca en local:
   ```bash
   npm install
   npm run dev
   ```

## Arquitectura de acceso

- **Roles**: `admin`, `coordinador`, `entrenador` (columna `profiles.role`).
- Un entrenador solo ve los equipos que tiene asignados en `coach_teams`.
  Admin y coordinador ven todos los equipos.
- Row Level Security está activo en todas las tablas; las políticas usan
  funciones `security definer` (`has_team_access`, `is_admin`, …) para evitar
  recursión al consultar `profiles`/`coach_teams` desde las propias políticas.
- El acceso es solo por URL privada + login — no hay enlace desde ninguna
  navegación pública, y `index.html` incluye `noindex, nofollow`.

## Qué incluye este primer bloque

- **Login** con Supabase Auth y sesión persistida.
- **Dashboard**: próximo entrenamiento con resumen de asistencia, jugadoras
  lesionadas, accesos rápidos.
- **Plantilla**: listado con búsqueda/filtro por estado y ficha completa por
  jugadora (datos personales, contacto y tutor legal, salud), con alta,
  edición y baja.
- **Entrenamientos**: calendario (próximos/pasados), alta/edición/baja con
  objetivos, ejercicios, material y comentarios.
- **Asistencia**: por cada entrenamiento se genera automáticamente una fila
  de asistencia (pendiente) para cada jugadora activa; el entrenador marca
  Voy/No voy/Tarde y el motivo de ausencia. Vista agregada mensual con
  gráfico por entrenamiento y ranking de asistencia por jugadora.
- Tema claro/oscuro, diseño responsive, componentes UI propios en el estilo
  shadcn/ui (Tailwind v4 + Radix).

## Pendiente para el siguiente bloque

Explícitamente fuera de alcance de este primer bloque (a confirmar orden de
prioridad con el club):

- Confirmación de asistencia por la propia jugadora (hoy la marca el
  entrenador en su nombre; el modelo de datos ya lo soporta, falta el
  flujo de enlace personal / notificación).
- Partidos: convocatorias, alineaciones, eventos en vivo, estadísticas por
  partido y de equipo.
- Integración con la FFIB (clasificación, resultados, sanciones).
- Notificaciones (recordatorios de entreno/partido, avisos del club).
- Documentos (licencias, DNI, reconocimiento médico, seguros).
- Comunicación interna (chat de equipo, anuncios).
- Informes exportables en PDF/Excel.
- Panel de administración (crear equipos/entrenadores/asignaciones desde la
  UI — hoy se hace por SQL directo, ver "Puesta en marcha").

## Estructura

```
src/
  components/       ui/ (primitivos), layout/, auth/, dashboard/, plantilla/,
                     entrenamientos/, asistencia/
  contexts/          auth-context, team-context, theme-context
  hooks/             React Query hooks por entidad (players, trainings, …)
  lib/               supabase client, labels, format, schemas/ (Zod)
  pages/             una página por ruta
  types/database.ts  tipos generados a mano del esquema Supabase
supabase/migrations/ esquema SQL, RLS, seed de equipos 2025/26
```
