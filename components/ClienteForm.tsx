'use client';

import { useState } from 'react';
import type { NuevoCliente } from '@/types/pedido';

export default function ClienteForm({
  valoresIniciales,
  onGuardar,
  textoBoton = 'Guardar cliente',
}: {
  valoresIniciales?: NuevoCliente;
  onGuardar: (datos: NuevoCliente) => Promise<void>;
  textoBoton?: string;
}) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? '');
  const [telefono, setTelefono] = useState(valoresIniciales?.telefono ?? '');
  const [whatsapp, setWhatsapp] = useState(valoresIniciales?.whatsapp ?? '');
  const [direccion, setDireccion] = useState(valoresIniciales?.direccion ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        telefono: telefono || null,
        whatsapp: whatsapp || null,
        direccion: direccion || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70" htmlFor="nombre">
          Nombre
        </label>
        <input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Carla Ramírez"
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
          autoFocus
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70" htmlFor="telefono">
          Teléfono
        </label>
        <input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70" htmlFor="whatsapp">
          WhatsApp
        </label>
        <input
          id="whatsapp"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Si es distinto al teléfono"
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-ink/70" htmlFor="direccion">
          Dirección
        </label>
        <textarea
          id="direccion"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          rows={2}
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-3 outline-none focus:border-hilo"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="rounded-tag bg-hilo px-6 py-4 text-lg font-semibold text-white hover:bg-hilo-dark disabled:opacity-60"
      >
        {guardando ? 'Guardando...' : textoBoton}
      </button>
    </form>
  );
}
