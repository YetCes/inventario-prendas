import { supabase } from './supabase/client';
import { obtenerProductoPorCodigo } from './productos';
import { descontarStockRegalo, elegirRegaloPonderado } from './regalos';
import type { EstadoPedido, Pedido, PedidoConDetalle, PedidoResumen } from '@/types/pedido';
import type { Producto } from '@/types/producto';
import type { Regalo } from '@/types/regalo';

/**
 * Busca un pedido "Abierto" ya existente para el cliente, o crea uno nuevo.
 * Así, varias prendas asignadas al mismo cliente durante un Live quedan
 * agrupadas en un solo pedido en vez de crear uno por cada prenda.
 * Devuelve también si el pedido se acaba de crear, para poder deshacerlo
 * si después no se puede agregar ninguna prenda (evita pedidos "fantasma").
 */
async function obtenerOCrearPedidoAbierto(clienteId: string): Promise<{ pedido: Pedido; creadoAhora: boolean }> {
  const { data: existente, error: errorBusqueda } = await supabase
    .from('pedidos')
    .select()
    .eq('cliente_id', clienteId)
    .eq('estado', 'Abierto')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errorBusqueda) throw errorBusqueda;
  if (existente) return { pedido: existente as Pedido, creadoAhora: false };

  const { data: nuevo, error: errorCreacion } = await supabase
    .from('pedidos')
    .insert({ cliente_id: clienteId, origen: 'TikTok Live' })
    .select()
    .single();

  if (errorCreacion) throw errorCreacion;
  return { pedido: nuevo as Pedido, creadoAhora: true };
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

  // Por seguridad: si por algún motivo quedó un vínculo de pedido "huérfano"
  // para esta prenda (de una versión anterior del sistema, o de datos de
  // prueba), lo limpiamos antes de intentar asignarla de nuevo. Una prenda
  // "Disponible" nunca debería tener un pedido_items vigente.
  await desvincularProductoDePedidos(producto.id);

  const { pedido, creadoAhora } = await obtenerOCrearPedidoAbierto(clienteId);

  const { error: errorItem } = await supabase
    .from('pedido_items')
    .insert({ pedido_id: pedido.id, producto_id: producto.id });

  if (errorItem) {
    // Si el pedido se creó recién para esta asignación y no se pudo agregar
    // la prenda, lo eliminamos para no dejar un pedido vacío en S/ 0.00.
    if (creadoAhora) {
      await supabase.from('pedidos').delete().eq('id', pedido.id);
    }
    throw errorItem;
  }

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

/**
 * Quita a una prenda de CUALQUIER pedido al que esté vinculada (sin tocar su
 * estado). Se usa para mantener todo consistente cuando el estado de la
 * prenda cambia desde otro lugar que no es "Asignar a cliente" — por ejemplo,
 * al cambiar el estado manualmente desde el detalle de producto.
 */
export async function desvincularProductoDePedidos(productoId: string): Promise<void> {
  const { error } = await supabase.from('pedido_items').delete().eq('producto_id', productoId);
  if (error) throw error;
}

export async function cambiarEstadoPedido(id: string, estado: EstadoPedido): Promise<Pedido> {
  // Al cancelar un pedido, liberamos todas sus prendas (vuelven a "Disponible")
  // y quitamos el vínculo, para que puedan asignarse a otro cliente sin problema.
  if (estado === 'Cancelado') {
    const items = await obtenerItemsDePedido(id);
    if (items.length > 0) {
      const { error: errorProductos } = await supabase
        .from('productos')
        .update({ estado: 'Disponible' })
        .in(
          'id',
          items.map((item) => item.producto.id)
        );
      if (errorProductos) throw errorProductos;

      const { error: errorItems } = await supabase.from('pedido_items').delete().eq('pedido_id', id);
      if (errorItems) throw errorItems;
    }
  }

  const { data, error } = await supabase.from('pedidos').update({ estado }).eq('id', id).select().single();
  if (error) throw error;
  return data as Pedido;
}

/**
 * Cierra el ciclo de un pedido: pasa cada prenda que contiene a "Entregado"
 * (reutilizando el mismo estado de Fase 1) y el pedido mismo a "Entregado".
 * Se usa al terminar la Preparación de pedidos, cuando todas las prendas
 * ya fueron verificadas por QR. Si el pedido tiene un regalo asignado,
 * recién en este momento se descuenta 1 de su stock (tal como se definió).
 */
export async function marcarPedidoComoEntregado(pedidoId: string): Promise<void> {
  const items = await obtenerItemsDePedido(pedidoId);

  if (items.length > 0) {
    const { error: errorProductos } = await supabase
      .from('productos')
      .update({ estado: 'Entregado' })
      .in(
        'id',
        items.map((item) => item.producto.id)
      );
    if (errorProductos) throw errorProductos;
  }

  const { data: pedidoActual, error: errorLectura } = await supabase
    .from('pedidos')
    .select('regalo_id')
    .eq('id', pedidoId)
    .single();
  if (errorLectura) throw errorLectura;

  if (pedidoActual?.regalo_id) {
    await descontarStockRegalo(pedidoActual.regalo_id as string);
  }

  const { error: errorPedido } = await supabase.from('pedidos').update({ estado: 'Entregado' }).eq('id', pedidoId);
  if (errorPedido) throw errorPedido;
}

/**
 * Activa o desactiva el regalo de un pedido, y opcionalmente elige el
 * regalo a mano. Si se deja `regalo_id` sin definir con el regalo activado,
 * la elección queda pendiente para que la decida la ruleta.
 */
export async function actualizarRegaloPedido(
  pedidoId: string,
  cambios: { incluye_regalo: boolean; regalo_id?: string | null }
): Promise<void> {
  const payload: Record<string, unknown> = { incluye_regalo: cambios.incluye_regalo };

  if (!cambios.incluye_regalo) {
    // Si se desactiva el regalo, se limpia cualquier asignación previa.
    payload.regalo_id = null;
    payload.regalo_asignado_en = null;
  } else if (cambios.regalo_id !== undefined) {
    payload.regalo_id = cambios.regalo_id;
    payload.regalo_asignado_en = cambios.regalo_id ? new Date().toISOString() : null;
  }

  const { error } = await supabase.from('pedidos').update(payload).eq('id', pedidoId);
  if (error) throw error;
}

/**
 * El cliente gira la ruleta desde su enlace público: se sortea un regalo
 * ponderado por stock y queda fijo para este pedido (no se puede repetir,
 * gracias a `.is('regalo_id', null)`).
 */
export async function asignarRegaloPorRuleta(pedidoId: string): Promise<Regalo> {
  const ganador = await elegirRegaloPonderado();

  const { data, error } = await supabase
    .from('pedidos')
    .update({ regalo_id: ganador.id, regalo_asignado_en: new Date().toISOString() })
    .eq('id', pedidoId)
    .is('regalo_id', null)
    .select('regalo_id')
    .maybeSingle();

  if (error) throw error;

  if (data) {
    // Nuestra actualización sí se aplicó: el ganador es el que acabamos de sortear.
    return ganador;
  }

  // Si no se aplicó (por ejemplo, un doble clic que ya había asignado un
  // regalo un instante antes), devolvemos el que realmente quedó guardado,
  // para que lo que ve el cliente siempre coincida con lo que hay en la base.
  const { data: pedidoActual, error: errorLectura } = await supabase
    .from('pedidos')
    .select('regalo:regalos(*)')
    .eq('id', pedidoId)
    .single();
  if (errorLectura) throw errorLectura;

  const regaloCrudo = (pedidoActual as any).regalo;
  return (Array.isArray(regaloCrudo) ? regaloCrudo[0] : regaloCrudo) as Regalo;
}

/**
 * Registra la respuesta del cliente desde su enlace público (¿todo bien con
 * el pedido, o tiene una observación?). El detalle de la observación, si la
 * hay, se resuelve por fuera del sistema (WhatsApp), tal como se acordó.
 */
export async function actualizarConfirmacionCliente(
  pedidoId: string,
  confirmacion: 'Aceptado' | 'Observado'
): Promise<void> {
  const { error } = await supabase.from('pedidos').update({ confirmacion_cliente: confirmacion }).eq('id', pedidoId);
  if (error) throw error;
}

export interface FiltrosPedidos {
  estado?: EstadoPedido | 'Todos';
  busqueda?: string;
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

  let resultado: PedidoResumen[] = (data ?? []).map((pedido: any) => ({
    ...pedido,
    cantidad_prendas: pedido.pedido_items.length,
    total: pedido.pedido_items.reduce(
      (suma: number, item: any) => suma + (item.producto?.precio_venta ?? 0),
      0
    ),
  }));

  // Búsqueda predictiva por código de pedido o nombre de cliente (ej. escribir
  // "4" encuentra PED-00004, PED-00048, etc). Se filtra en el cliente porque
  // combina dos tablas relacionadas y el volumen de pedidos es chico.
  const texto = filtros.busqueda?.trim().toLowerCase();
  if (texto) {
    resultado = resultado.filter(
      (p) => p.codigo.toLowerCase().includes(texto) || p.cliente.nombre.toLowerCase().includes(texto)
    );
  }

  return resultado;
}

export async function obtenerPedidoPorCodigo(codigo: string): Promise<PedidoConDetalle | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, cliente:clientes(*), pedido_items(id, producto:productos(*)), regalo:regalos(*)')
    .eq('codigo', codigo.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapearPedidoConDetalle(data);
}

/** Igual que obtenerPedidoPorCodigo, pero busca por el enlace secreto que se comparte con el cliente. */
export async function obtenerPedidoPorEnlaceToken(token: string): Promise<PedidoConDetalle | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, cliente:clientes(*), pedido_items(id, producto:productos(*)), regalo:regalos(*)')
    .eq('enlace_token', token)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapearPedidoConDetalle(data);
}

/** Normaliza la respuesta de Supabase (que tipa las relaciones anidadas como arreglo) a un PedidoConDetalle. */
function mapearPedidoConDetalle(data: any): PedidoConDetalle {
  const itemsCrudos = data.pedido_items as { id: string; producto: Producto | Producto[] }[];
  const productos = itemsCrudos.map((item) => (Array.isArray(item.producto) ? item.producto[0] : item.producto));
  const total = productos.reduce((suma, p) => suma + (p.precio_venta ?? 0), 0);

  const regaloCrudo = data.regalo as Regalo | Regalo[] | null;
  const regalo = Array.isArray(regaloCrudo) ? (regaloCrudo[0] ?? null) : (regaloCrudo ?? null);

  const { pedido_items, regalo: _regaloSinUsar, ...pedido } = data;
  return { ...pedido, productos, total, regalo } as PedidoConDetalle;
}

/** Igual que obtenerPedidoPorCodigo, pero devuelve también el id de cada pedido_item (para poder quitarlo). */
export async function obtenerItemsDePedido(pedidoId: string): Promise<{ id: string; producto: Producto }[]> {
  const { data, error } = await supabase
    .from('pedido_items')
    .select('id, producto:productos(*)')
    .eq('pedido_id', pedidoId);

  if (error) throw error;

  // Supabase tipa las relaciones anidadas como arreglo por defecto (no sabe que
  // producto_id es único), así que normalizamos a un solo objeto por seguridad.
  return ((data ?? []) as any[]).map((item) => ({
    id: item.id as string,
    producto: (Array.isArray(item.producto) ? item.producto[0] : item.producto) as Producto,
  }));
}
