import { supabase } from './supabase/client';
import type { ConteoInventario, Estado, NuevoProducto, Producto } from '@/types/producto';

/**
 * Crea una prenda nueva. El código (P-000001, P-000002...) y el estado
 * ("Disponible") los asigna automáticamente la base de datos.
 */
export async function crearProducto(datos: NuevoProducto): Promise<Producto> {
  const { data, error } = await supabase.from('productos').insert(datos).select().single();

  if (error) throw error;
  return data as Producto;
}

/**
 * Actualiza campos de una prenda existente (por ejemplo, cambiar su estado
 * o completar datos que quedaron pendientes en el registro rápido).
 */
export async function actualizarProducto(
  id: string,
  cambios: Partial<NuevoProducto> & { estado?: Estado }
): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Producto;
}

export async function obtenerProductoPorCodigo(codigo: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from('productos')
    .select()
    .eq('codigo', codigo.trim().toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data as Producto | null;
}

export interface FiltrosInventario {
  busqueda?: string;
  estado?: Estado | 'Todos';
}

/**
 * Lista prendas para el inventario. La búsqueda cubre código, categoría,
 * tipo, marca, talla, color, estado y ubicación en un solo campo de texto.
 */
export async function obtenerProductos(filtros: FiltrosInventario = {}): Promise<Producto[]> {
  let query = supabase.from('productos').select().order('fecha_ingreso', { ascending: false });

  if (filtros.estado && filtros.estado !== 'Todos') {
    query = query.eq('estado', filtros.estado);
  }

  const texto = filtros.busqueda?.trim();
  if (texto) {
    // Si el texto coincide con el formato de código (P-000123), buscamos exacto primero.
    const camposTexto = ['codigo', 'categoria', 'tipo', 'marca', 'talla', 'color', 'ubicacion', 'estado'];
    const orFiltro = camposTexto.map((campo) => `${campo}.ilike.%${texto}%`).join(',');
    query = query.or(orFiltro);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Producto[];
}

export async function obtenerConteoInventario(): Promise<ConteoInventario> {
  const { data, error } = await supabase.from('productos').select('estado');
  if (error) throw error;

  const filas = (data ?? []) as { estado: Estado }[];
  return {
    total: filas.length,
    disponibles: filas.filter((f) => f.estado === 'Disponible').length,
    reservadas: filas.filter((f) => f.estado === 'Reservado').length,
    vendidas: filas.filter((f) => f.estado === 'Vendido').length,
    entregadas: filas.filter((f) => f.estado === 'Entregado').length,
  };
}

export async function obtenerProductosPorIds(ids: string[]): Promise<Producto[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('productos').select().in('id', ids);
  if (error) throw error;
  return (data ?? []) as Producto[];
}
