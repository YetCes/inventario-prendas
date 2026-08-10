-- ============================================================
-- REFERENCIA ÚNICAMENTE — NO SE EJECUTA TODAVÍA
-- Estructura planificada para Fase 3: pagos por Yape,
-- preparación de pedidos y despachos.
-- ============================================================

-- create table pagos (
--   id                    uuid primary key default gen_random_uuid(),
--   pedido_id             uuid references pedidos(id),
--   monto                 numeric(10, 2) not null,
--   metodo                text not null, -- 'Yape', 'Efectivo', etc.
--   yape_referencia       text,
--   fecha                 timestamptz not null default now(),
--   estado_validacion     text not null default 'Pendiente' -- Pendiente | Validado | Rechazado
-- );

-- Preparación de pedidos (verificación por QR): se resuelve en la
-- aplicación comparando el código escaneado contra pedido_items,
-- sin necesitar tablas adicionales.
