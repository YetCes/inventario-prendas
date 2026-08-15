import { supabase } from './supabase/client';
import { optimizarImagen } from './imageOptimize';
import type { NuevoRegalo, Regalo } from '@/types/regalo';

const BUCKET_REGALOS = 'regalos';

export async function crearRegalo(datos: NuevoRegalo): Promise<Regalo> {
  const { data, error } = await supabase.from('regalos').insert(datos).select().single();
  if (error) throw error;
  return data as Regalo;
}

export async function actualizarRegalo(
  id: string,
  cambios: Partial<NuevoRegalo> & { activo?: boolean }
): Promise<Regalo> {
  const { data, error } = await supabase.from('regalos').update(cambios).eq('id', id).select().single();
  if (error) throw error;
  return data as Regalo;
}

export async function obtenerRegalos(): Promise<Regalo[]> {
  const { data, error } = await supabase.from('regalos').select().order('nombre', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Regalo[];
}

/** Regalos que hoy se pueden sortear en la ruleta: activos y con stock disponible. */
export async function obtenerRegalosDisponibles(): Promise<Regalo[]> {
  const { data, error } = await supabase
    .from('regalos')
    .select()
    .eq('activo', true)
    .gt('stock', 0)
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Regalo[];
}

export async function subirFotoRegalo(archivo: File): Promise<string> {
  const imagenOptimizada = await optimizarImagen(archivo);
  const ruta = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage.from(BUCKET_REGALOS).upload(ruta, imagenOptimizada, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_REGALOS).getPublicUrl(ruta);
  return data.publicUrl;
}

/**
 * Elige un regalo al azar entre los disponibles, ponderado por stock:
 * un regalo con 20 unidades tiene 20 veces más probabilidad de salir
 * que uno con 1 unidad. Es la base de la ruleta.
 */
export async function elegirRegaloPonderado(): Promise<Regalo> {
  const disponibles = await obtenerRegalosDisponibles();
  if (disponibles.length === 0) throw new Error('No hay regalos disponibles para sortear.');

  const totalPapeletas = disponibles.reduce((suma, r) => suma + r.stock, 0);
  let sorteo = Math.random() * totalPapeletas;

  for (const regalo of disponibles) {
    sorteo -= regalo.stock;
    if (sorteo <= 0) return regalo;
  }
  return disponibles[disponibles.length - 1];
}

/** Descuenta 1 del stock de un regalo. Se llama al confirmar la entrega del pedido, no al girar la ruleta. */
export async function descontarStockRegalo(regaloId: string): Promise<void> {
  const { data, error } = await supabase.from('regalos').select('stock').eq('id', regaloId).single();
  if (error) throw error;

  const nuevoStock = Math.max(0, (data?.stock ?? 0) - 1);
  const { error: errorUpdate } = await supabase.from('regalos').update({ stock: nuevoStock }).eq('id', regaloId);
  if (errorUpdate) throw errorUpdate;
}
