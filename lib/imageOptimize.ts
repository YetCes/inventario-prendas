const LADO_MAXIMO_PX = 1600;
const CALIDAD_JPEG = 0.8;

/**
 * Redimensiona y comprime una foto tomada desde el celular antes de subirla,
 * para no gastar espacio de almacenamiento innecesariamente.
 */
export async function optimizarImagen(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);

  const escala = Math.min(1, LADO_MAXIMO_PX / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;

  const contexto = canvas.getContext('2d');
  if (!contexto) throw new Error('No se pudo procesar la imagen en este dispositivo.');

  contexto.drawImage(bitmap, 0, 0, ancho, alto);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo comprimir la imagen.'))),
      'image/jpeg',
      CALIDAD_JPEG
    );
  });
}
