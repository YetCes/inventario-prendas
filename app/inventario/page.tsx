'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import ProductTable from '@/components/ProductTable';
import { obtenerProductos } from '@/lib/productos';
import { ESTADOS } from '@/types/producto';
import type { Estado, Producto } from '@/types/producto';

type Vista = 'tarjetas' | 'tabla';

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<Estado | 'Todos'>('Todos');
  const [vista, setVista] = useState<Vista>('tarjetas');

  useEffect(() => {
    setCargando(true);
    const temporizador = setTimeout(() => {
      obtenerProductos({ busqueda, estado })
        .then(setProductos)
        .finally(() => setCargando(false));
    }, 250); // pequeño debounce para no buscar en cada tecla

    return () => clearTimeout(temporizador);
  }, [busqueda, estado]);

  const filtrosEstado = useMemo(() => ['Todos', ...ESTADOS] as const, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-ink/50">
            ← Volver
          </Link>
          <h1 className="font-display text-3xl text-ink">Inventario</h1>
        </div>
        <div className="flex overflow-hidden rounded-tag ring-1 ring-ink/10">
          <button
            onClick={() => setVista('tarjetas')}
            className={`px-3 py-2 text-sm ${vista === 'tarjetas' ? 'bg-hilo text-white' : 'bg-white text-ink/60'}`}
          >
            🗂️ Tarjetas
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={`px-3 py-2 text-sm ${vista === 'tabla' ? 'bg-hilo text-white' : 'bg-white text-ink/60'}`}
          >
            ☰ Tabla
          </button>
        </div>
      </header>

      <SearchBar valor={busqueda} onCambiar={setBusqueda} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtrosEstado.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              estado === e ? 'bg-ink text-white' : 'bg-white text-ink/60 ring-1 ring-ink/10'
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="py-10 text-center text-ink/40">Cargando prendas...</p>
      ) : vista === 'tarjetas' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
          {productos.length === 0 && (
            <p className="col-span-full py-10 text-center text-ink/40">No hay prendas que coincidan con la búsqueda.</p>
          )}
        </div>
      ) : (
        <ProductTable productos={productos} />
      )}
    </main>
  );
}
