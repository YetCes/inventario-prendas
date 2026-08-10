import { supabase } from './supabase/client';
import type { Cliente, NuevoCliente, PedidoResumen } from '@/types/pedido';

export async function crearCliente(datos: NuevoCliente): Promise<Cliente> {
  const { data, error } = await supabase.from('clientes').insert(datos).select().single();
  if (error) throw error;
  return data as Cliente;
}

export async function actualizarCliente(id: string, cambios: Partial<NuevoCliente>): Promise<Cliente> {
  const { data, error } = await supabase.from('clientes').update(cambios).eq('id', id).select().single();
  if (error) throw error;
  return data as Cliente;
}

export async function obtenerClientePorId(id: string): Promise<Cliente | null> {
  const { data, error } = await supabase.from('clientes').select().eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Cliente | null;
}

/** Lista clientes, opcionalmente filtrados por nombre o teléfono. Útil para la búsqueda rápida durante el Live. */
export async function obtenerClientes(busqueda?: string): Promise<Cliente[]> {
  let query = supabase.from('clientes').select().order('nombre', { ascending: true });

  const texto = busqueda?.trim();
  if (texto) {
    query = query.or(`nombre.ilike.%${texto}%,telefono.ilike.%${texto}%,whatsapp.ilike.%${texto}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Cliente[];
}

/** Historial de pedidos de un cliente, con el total y la cantidad de prendas de cada uno. */
export async function obtenerHistorialCompras(clienteId: string): Promise<PedidoResumen[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, cliente:clientes(*), pedido_items(producto:productos(precio_venta))')
    .eq('cliente_id', clienteId)
    .order('creado_en', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((pedido: any) => ({
    ...pedido,
    cantidad_prendas: pedido.pedido_items.length,
    total: pedido.pedido_items.reduce(
      (suma: number, item: any) => suma + (item.producto?.precio_venta ?? 0),
      0
    ),
  }));
}
