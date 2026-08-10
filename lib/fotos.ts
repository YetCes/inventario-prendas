import { supabase, BUCKET_FOTOS } from './supabase/client';
import { optimizarImagen } from './imageOptimize';

/**
 * Optimiza y sube una foto al bucket de prendas. Devuelve la URL pública
 * lista para guardar en la tabla `productos`.
 */
export async function subirFotoPrenda(archivo: File): Promise<string> {
  const imagenOptimizada = await optimizarImagen(archivo);

  const nombreArchivo = `${crypto.randomUUID()}.jpg`;
  const ruta = `${nombreArchivo}`;

  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(ruta, imagenOptimizada, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta);
  return data.publicUrl;
}
