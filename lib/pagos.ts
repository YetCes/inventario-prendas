import { supabase } from './supabase/client';
import type { EstadoValidacion, NuevoPago, Pago, PagoConPedido } from '@/types/pago';

export async function crearPago(datos: NuevoPago): Promise<Pago> {
  const { data, error } = await supabase.from('pagos').insert(datos).select().single();
  if (error) throw error;
  return data as Pago;
}

export async function obtenerPagosPorPedido(pedidoId: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select()
    .eq('pedido_id', pedidoId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Pago[];
}

/** Pagos que todavía no se han revisado contra la app de Yape, para validarlos con calma. */
export async function obtenerPagosPendientes(): Promise<PagoConPedido[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select('*, pedido:pedidos(codigo, cliente:clientes(nombre))')
    .eq('estado_validacion', 'Pendiente')
    .order('fecha', { ascending: true });

  if (error) throw error;

  return ((data ?? []) as any[]).map((pago) => {
    const pedido = Array.isArray(pago.pedido) ? pago.pedido[0] : pago.pedido;
    const cliente = pedido ? (Array.isArray(pedido.cliente) ? pedido.cliente[0] : pedido.cliente) : null;
    return {
      ...pago,
      pedido_codigo: pedido?.codigo ?? '—',
      cliente_nombre: cliente?.nombre ?? '—',
    } as PagoConPedido;
  });
}

export async function actualizarValidacionPago(id: string, estado: EstadoValidacion): Promise<Pago> {
  const { data, error } = await supabase
    .from('pagos')
    .update({ estado_validacion: estado })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Pago;
}
