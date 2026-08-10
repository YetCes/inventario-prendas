import { supabase } from './supabase/client';
import { obtenerProductoPorCodigo } from './productos';
import type { EstadoPedido, Pedido, PedidoConDetalle, PedidoResumen } from '@/types/pedido';
import type { Producto } from '@/types/producto';

/**
 * Busca un pedido "Abierto" ya existente para el cliente, o crea uno nuevo.
 * Así, varias prendas asignadas al mismo cliente durante un Live quedan
 * agrupadas en un solo pedido en vez de crear uno por cada prenda.
 */
async function obtenerOCrearPedidoAbierto(clienteId: string): Promise<Pedido> {
  const { data: existente, error: errorBusqueda } = await supabase
    .from('pedidos')
    .select()
    .eq('cliente_id', clienteId)
    .eq('estado', 'Abierto')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorBusqueda) throw errorBusqueda;
  if (existente) return existente as Pedido;

  const { data: nuevo, error: errorCreacion } = await supabase
    .from('pedidos')
    .insert({ cliente_id: clienteId, origen: 'TikTok Live' })
    .select()
    .single();

  if (errorCreacion) throw errorCreacion;
  return nuevo as Pedido;
}

export interface ResultadoAsignacion {
  pedido: Pedido;
  producto: Producto;
}

/**
 * El flujo central de la "Venta rápida": dado un código de prenda y un
 * cliente, agrega la prenda al pedido abierto del cliente (creándolo si
 * hace falta) y marca la prenda como "Reservado". Es una sola operación
 * desde la perspectiva de quien está atendiendo el Live.
 */
export async function asignarProductoACliente(
  codigoProducto: string,
  clienteId: string
): Promise<ResultadoAsignacion> {
  const producto = await obtenerProductoPorCodigo(codigoProducto);
  if (!producto) throw new Error(`No existe ninguna prenda con el código ${codigoProducto}.`);
  if (producto.estado !== 'Disponible') {
    throw new Error(`La prenda ${producto.codigo} ya está "${producto.estado}" y no se puede asignar.`);
  }

  const pedido = await obtenerOCrearPedidoAbierto(clienteId);

  const { error: errorItem } = await supabase
    .from('pedido_items')
    .insert({ pedido_id: pedido.id, producto_id: producto.id });
  if (errorItem) throw errorItem;

  const { data: productoActualizado, error: errorEstado } = await supabase
    .from('productos')
    .update({ estado: 'Reservado' })
    .eq('id', producto.id)
    .select()
    .single();
  if (errorEstado) throw errorEstado;

  return { pedido, producto: productoActualizado as Producto };
}

/**
 * Quita una prenda de un pedido (por ejemplo, si el cliente ya no la quiere)
 * y la devuelve automáticamente a "Disponible" para que nadie la deje
 * atascada en "Reservado".
 */
export async function quitarProductoDePedido(pedidoItemId: string, productoId: string): Promise<void> {
  const { error: errorEliminar } = await supabase.from('pedido_items').delete().eq('id', pedidoItemId);
  if (errorEliminar) throw errorEliminar;

  const { error: errorEstado } = await supabase
    .from('productos')
    .update({ estado: 'Disponible' })
    .eq('id', productoId);
  if (errorEstado) throw errorEstado;
}

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido): Promise<Pedido> {
  const { data, error } = await supabase.from('pedidos').update({ estado }).eq('id', id).select().single();
  if (error) throw error;
  return data as Pedido;
}

export interface FiltrosPedidos {
  estado?: EstadoPedido | 'Todos';
}

export async function obtenerPedidos(filtros: FiltrosPedidos = {}): Promise<PedidoResumen[]> {
  let query = supabase
    .from('pedidos')
    .select('*, cliente:clientes(*), pedido_items(producto:productos(precio_venta))')
    .order('creado_en', { ascending: false });

  if (filtros.estado && filtros.estado !== 'Todos') {
    query = query.eq('estado', filtros.estado);
  }

  const { data, error } = await query;
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

export async function obtenerPedidoPorCodigo(codigo: string): Promise<PedidoConDetalle | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, cliente:clientes(*), pedido_items(id, producto:productos(*))')
    .eq('codigo', codigo.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const items = (data as any).pedido_items as { id: string; producto: Producto }[];
  const productos = items.map((item) => item.producto);
  const total = productos.reduce((suma, p) => suma + (p.precio_venta ?? 0), 0);

  const { pedido_items, ...pedido } = data as any;
  return { ...pedido, productos, total } as PedidoConDetalle;
}

/** Igual que obtenerPedidoPorCodigo, pero devuelve también el id de cada pedido_item (para poder quitarlo). */
export async function obtenerItemsDePedido(pedidoId: string) {
  const { data, error } = await supabase
    .from('pedido_items')
    .select('id, producto:productos(*)')
    .eq('pedido_id', pedidoId);

  if (error) throw error;
  return (data ?? []) as { id: string; producto: Producto }[];
}
