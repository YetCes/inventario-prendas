import { supabase } from './supabase/client';
import { optimizarImagen } from './imageOptimize';

const BUCKET_COMPROBANTES = 'comprobantes';

/** Optimiza y sube la captura de un comprobante de pago (ej. Yape). Devuelve la URL pública. */
export async function subirComprobantePago(archivo: File): Promise<string> {
  const imagenOptimizada = await optimizarImagen(archivo);
  const ruta = `${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage.from(BUCKET_COMPROBANTES).upload(ruta, imagenOptimizada, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_COMPROBANTES).getPublicUrl(ruta);
  return data.publicUrl;
}
