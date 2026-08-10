'use client';

import { useRef, useState } from 'react';

interface Props {
  label: string;
  onArchivoSeleccionado: (archivo: File) => void;
  previewUrl?: string | null;
  obligatoria?: boolean;
}

/**
 * Permite tomar una foto directamente con la cámara del celular (capture="environment")
 * o elegir una existente de la galería, usando el mismo botón.
 */
export default function PhotoCapture({ label, onArchivoSeleccionado, previewUrl, obligatoria }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(previewUrl ?? null);

  function manejarSeleccion(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    setPreviewLocal(URL.createObjectURL(archivo));
    onArchivoSeleccionado(archivo);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={manejarSeleccion}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-tag border-2 border-dashed border-ink/20 bg-white text-ink/50 transition-colors hover:border-hilo/50"
      >
        {previewLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewLocal} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-2 px-4 text-center text-sm">
            <span className="text-4xl" aria-hidden>
              📷
            </span>
            {label}
            {obligatoria && <span className="text-cordel">Obligatoria</span>}
          </span>
        )}
      </button>
    </div>
  );
}
