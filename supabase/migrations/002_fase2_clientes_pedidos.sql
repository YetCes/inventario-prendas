-- ============================================================
-- Fase 2: clientes, pedidos (reservas) y venta rápida por Live
-- No modifica la tabla `productos` de Fase 1, solo la referencia.
-- ============================================================

create table if not exists clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  telefono    text,
  whatsapp    text,
  direccion   text,
  creado_en   timestamptz not null default now()
);

create index if not exists idx_clientes_nombre on clientes using gin (to_tsvector('spanish', nombre));

create sequence if not exists pedidos_codigo_seq start 1;

create table if not exists pedidos (
  id            uuid primary key default gen_random_uuid(),
  codigo        text unique not null
                  default ('PED-' || lpad(nextval('pedidos_codigo_seq')::text, 5, '0')),
  cliente_id    uuid not null references clientes(id),
  origen        text not null default 'TikTok Live'
                  check (origen in ('TikTok Live', 'WhatsApp', 'Otro')),
  estado        text not null default 'Abierto'
                  check (estado in ('Abierto', 'Confirmado', 'Entregado', 'Cancelado')),
  creado_en     timestamptz not null default now()
);

create index if not exists idx_pedidos_codigo on pedidos (codigo);
create index if not exists idx_pedidos_cliente on pedidos (cliente_id);

create table if not exists pedido_items (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references pedidos(id) on delete cascade,
  producto_id   uuid not null references productos(id),
  agregado_en   timestamptz not null default now(),
  -- Una prenda solo puede estar en un pedido activo a la vez:
  -- evita vender por error la misma unidad única dos veces.
  unique (producto_id)
);

create index if not exists idx_pedido_items_pedido on pedido_items (pedido_id);

-- ------------------------------------------------------------
-- Seguridad (RLS): misma política simple y abierta de Fase 1.
-- ------------------------------------------------------------

alter table clientes enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;

drop policy if exists "acceso_total_clientes" on clientes;
create policy "acceso_total_clientes" on clientes for all using (true) with check (true);

drop policy if exists "acceso_total_pedidos" on pedidos;
create policy "acceso_total_pedidos" on pedidos for all using (true) with check (true);

drop policy if exists "acceso_total_pedido_items" on pedido_items;
create policy "acceso_total_pedido_items" on pedido_items for all using (true) with check (true);
