-- ============================================================
-- Fase 3: pagos (Yape), validación de comprobantes y despacho.
-- No modifica las tablas de Fase 1 ni Fase 2.
-- ============================================================

create table if not exists pagos (
  id                  uuid primary key default gen_random_uuid(),
  pedido_id           uuid not null references pedidos(id) on delete cascade,
  monto               numeric(10, 2) not null,
  metodo              text not null default 'Yape'
                        check (metodo in ('Yape', 'Efectivo', 'Transferencia', 'Otro')),
  yape_referencia      text,
  yape_comprobante     text, -- URL de la captura del comprobante en Storage
  fecha                timestamptz not null default now(),
  estado_validacion    text not null default 'Pendiente'
                        check (estado_validacion in ('Pendiente', 'Validado', 'Rechazado'))
);

create index if not exists idx_pagos_pedido on pagos (pedido_id);
create index if not exists idx_pagos_estado_validacion on pagos (estado_validacion);

-- Bucket público de Storage para las capturas de pantalla de los comprobantes Yape.
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', true)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Seguridad (RLS): misma política simple y abierta de Fase 1 y 2.
-- ------------------------------------------------------------

alter table pagos enable row level security;

drop policy if exists "acceso_total_pagos" on pagos;
create policy "acceso_total_pagos" on pagos for all using (true) with check (true);

drop policy if exists "acceso_publico_comprobantes" on storage.objects;
create policy "acceso_publico_comprobantes" on storage.objects
  for all using (bucket_id = 'comprobantes') with check (bucket_id = 'comprobantes');
