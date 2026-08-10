'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

/**
 * Activa la cámara y llama a onDetectado(texto) cada vez que reconoce un QR.
 * Se usa tanto en Venta rápida (leer el código de una prenda) como en
 * Preparación de pedidos (verificar que cada prenda pertenece al pedido).
 */
export default function QRScannerCamera({
  activo,
  onDetectado,
}: {
  activo: boolean;
  onDetectado: (texto: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectadoRef = useRef(onDetectado);
  onDetectadoRef.current = onDetectado;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activo || !videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (resultado) => onDetectadoRef.current(resultado.data),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
      }
    );

    setError(null);
    scanner.start().catch(() => setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.'));

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [activo]);

  if (!activo) return null;

  return (
    <div className="overflow-hidden rounded-tag bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      {error && <p className="p-3 text-sm text-red-300">{error}</p>}
    </div>
  );
}
