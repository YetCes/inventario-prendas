-- ============================================================
-- Fase 4: inventario de regalos, ruleta y enlace público al cliente.
-- No modifica ninguna columna existente de productos ni pedidos,
-- solo agrega columnas nuevas (con default) a `pedidos`.
-- ============================================================

create table if not exists regalos (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  foto        text,
  stock       integer not null default 0,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

alter table pedidos add column if not exists incluye_regalo boolean not null default false;
alter table pedidos add column if not exists regalo_id uuid references regalos(id);
alter table pedidos add column if not exists regalo_asignado_en timestamptz;
alter table pedidos add column if not exists enlace_token uuid not null default gen_random_uuid();

create unique index if not exists idx_pedidos_enlace_token on pedidos (enlace_token);

-- Bucket público de Storage para las fotos de los regalos.
insert into storage.buckets (id, name, public)
values ('regalos', 'regalos', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Seguridad (RLS): misma política simple y abierta de las fases anteriores.
-- El enlace público del cliente depende de que la lectura de `pedidos` sea
-- abierta (ya lo era desde Fase 2); no se agrega autenticación en esta fase,
-- tal como se acordó, así que cualquiera con el enlace puede verlo.
-- ------------------------------------------------------------

alter table regalos enable row level security;

drop policy if exists "acceso_total_regalos" on regalos;
create policy "acceso_total_regalos" on regalos for all using (true) with check (true);

drop policy if exists "acceso_publico_regalos_fotos" on storage.objects;
create policy "acceso_publico_regalos_fotos" on storage.objects
  for all using (bucket_id = 'regalos') with check (bucket_id = 'regalos');
