'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerClientes } from '@/lib/clientes';
import type { Cliente } from '@/types/pedido';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    const temporizador = setTimeout(() => {
      obtenerClientes(busqueda)
        .then(setClientes)
        .finally(() => setCargando(false));
    }, 250);
    return () => clearTimeout(temporizador);
  }, [busqueda]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-ink/50">
            ← Volver
          </Link>
          <h1 className="font-display text-3xl text-ink">Clientes</h1>
        </div>
        <Link
          href="/clientes/nuevo"
          className="rounded-tag bg-hilo px-4 py-3 text-sm font-semibold text-white hover:bg-hilo-dark"
        >
          + Nuevo
        </Link>
      </header>

      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o teléfono..."
        className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-base shadow-sm outline-none focus:border-hilo"
      />

      <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
        {clientes.map((cliente) => (
          <li key={cliente.id}>
            <Link href={`/clientes/${cliente.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-hilo-light/40">
              <span>
                <span className="block font-semibold text-ink">{cliente.nombre}</span>
                {cliente.telefono && <span className="text-sm text-ink/50">{cliente.telefono}</span>}
              </span>
              <span className="text-ink/30">→</span>
            </Link>
          </li>
        ))}

        {!cargando && clientes.length === 0 && (
          <p className="px-4 py-10 text-center text-ink/40">Aún no hay clientes registrados.</p>
        )}
      </ul>
    </main>
  );
}
