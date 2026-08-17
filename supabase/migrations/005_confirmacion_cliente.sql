-- ============================================================
-- Agrega la respuesta del cliente (Aceptado / Observado) desde
-- el enlace público del pedido. No modifica ninguna columna existente.
-- ============================================================

alter table pedidos add column if not exists confirmacion_cliente text not null default 'Pendiente'
  check (confirmacion_cliente in ('Pendiente', 'Aceptado', 'Observado'));
