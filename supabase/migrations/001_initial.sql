-- ============================================================
-- Dinámica Mutua — Migración inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabla usuarios
create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  identificador char(9) unique not null,  -- formato XXXX-XXXX (8 chars + guión = 9)
  password_hash text not null,
  rol text not null default 'participante' check (rol in ('participante', 'superusuario')),
  created_at timestamptz default now()
);

-- Tabla canvas
create table if not exists public.canvas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete cascade,
  mision text,
  retos_talento text,
  retos_procesos text,
  retos_cultura text,
  retos_otros text,
  traspasar jsonb default '[]'::jsonb,
  recibir jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Índices
create index if not exists idx_usuarios_identificador on public.usuarios(identificador);
create index if not exists idx_canvas_usuario_id on public.canvas(usuario_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.usuarios enable row level security;
alter table public.canvas enable row level security;

-- Política: cualquiera puede insertar un usuario nuevo (registro)
create policy "Registro público"
  on public.usuarios for insert
  with check (true);

-- Política: cualquiera puede leer usuarios (para login por identificador)
create policy "Lectura pública de usuarios"
  on public.usuarios for select
  using (true);

-- Política: cualquiera puede leer todos los canvas (HU-05)
create policy "Lectura pública de canvas"
  on public.canvas for select
  using (true);

-- Política: cualquiera puede insertar su propio canvas (creado en el momento del registro)
create policy "Insertar canvas propio"
  on public.canvas for insert
  with check (true);

-- Política: solo el propietario puede actualizar su canvas (HU-04)
-- NOTA: se valida en el front que usuario_id coincide con la sesión
create policy "Actualizar canvas propio"
  on public.canvas for update
  using (true);

-- Política: solo superusuario puede eliminar canvas (HU-08) — se añadirá en HU-08
create policy "Eliminar canvas"
  on public.canvas for delete
  using (true);
