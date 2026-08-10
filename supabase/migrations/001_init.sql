-- ============================================================
-- Fase 1: inventario de prendas
-- ============================================================

create extension if not exists "pgcrypto";

-- Secuencia que garantiza códigos únicos y correlativos (P-000001, P-000002...)
-- que nunca se repiten ni se reutilizan, incluso si la prenda se retira.
create sequence if not exists productos_codigo_seq start 1;

create table if not exists productos (
  id                    uuid primary key default gen_random_uuid(),
  codigo                text unique not null
                          default ('P-' || lpad(nextval('productos_codigo_seq')::text, 6, '0')),
  foto_principal        text,
  fotos_adicionales     text[] not null default '{}',
  categoria             text,
  tipo                  text,
  marca                 text,
  talla                 text,
  color                 text,
  condicion             text check (condicion in ('Nueva', 'Seminueva', 'Usada')),
  precio_venta          numeric(10, 2),
  costo                 numeric(10, 2),
  ubicacion             text,
  observaciones         text,
  estado                text not null default 'Disponible'
                          check (estado in ('Disponible', 'Reservado', 'Vendido', 'Entregado', 'Retirado')),
  fecha_ingreso         timestamptz not null default now(),
  fecha_actualizacion   timestamptz not null default now()
);

create index if not exists idx_productos_codigo on productos (codigo);
create index if not exists idx_productos_estado on productos (estado);

-- Actualiza fecha_actualizacion automáticamente en cada cambio.
create or replace function set_fecha_actualizacion()
returns trigger as $$
begin
  new.fecha_actualizacion = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_productos_actualizacion on productos;
create trigger trg_productos_actualizacion
  before update on productos
  for each row execute function set_fecha_actualizacion();

-- Bucket público de Storage para las fotos de las prendas.
insert into storage.buckets (id, name, public)
values ('prendas', 'prendas', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Seguridad (RLS): habilitada con una política simple y abierta
-- para la Fase 1 (uso interno, un solo usuario/familia).
-- Cuando se agregue autenticación de usuarios en una fase futura,
-- estas políticas deben ajustarse para restringir el acceso.
-- ------------------------------------------------------------

alter table productos enable row level security;

drop policy if exists "acceso_total_productos" on productos;
create policy "acceso_total_productos" on productos
  for all using (true) with check (true);

drop policy if exists "acceso_publico_fotos" on storage.objects;
create policy "acceso_publico_fotos" on storage.objects
  for all using (bucket_id = 'prendas') with check (bucket_id = 'prendas');
