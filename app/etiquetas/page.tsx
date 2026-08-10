'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import LabelSheetA4 from '@/components/LabelSheetA4';
import StatusBadge from '@/components/StatusBadge';
import { obtenerProductos } from '@/lib/productos';
import type { Producto } from '@/types/producto';

function ImprimirEtiquetasContenido() {
  const searchParams = useSearchParams();
  const codigoPreseleccionado = searchParams.get('codigo');

  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [mostrarHoja, setMostrarHoja] = useState(false);

  useEffect(() => {
    obtenerProductos({ busqueda }).then((lista) => {
      setProductos(lista);
      if (codigoPreseleccionado) {
        const encontrado = lista.find((p) => p.codigo === codigoPreseleccionado);
        if (encontrado) setSeleccionados((prev) => new Set(prev).add(encontrado.id));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  function alternarSeleccion(id: string) {
    setSeleccionados((prev) => {
      const nuevo = new Set(prev);
      nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id);
      return nuevo;
    });
  }

  const productosSeleccionados = productos.filter((p) => seleccionados.has(p.id));

  if (mostrarHoja) {
    return (
      <div className="flex min-h-screen flex-col items-center gap-4 bg-ink/5 py-8">
        <div className="flex w-full max-w-3xl items-center justify-between px-5 print:hidden">
          <button onClick={() => setMostrarHoja(false)} className="text-sm text-ink/50">
            ← Editar selección
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-tag bg-hilo px-5 py-3 font-semibold text-white hover:bg-hilo-dark"
          >
            🖨️ Imprimir
          </button>
        </div>

        <LabelSheetA4 productos={productosSeleccionados} />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-5 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Imprimir Etiquetas</h1>
        <p className="text-sm text-ink/50">Selecciona las prendas y genera una hoja A4 lista para imprimir.</p>
      </header>

      <SearchBar valor={busqueda} onCambiar={setBusqueda} />

      <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
        {productos.map((producto) => (
          <li key={producto.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={seleccionados.has(producto.id)}
                onChange={() => alternarSeleccion(producto.id)}
                className="h-5 w-5 accent-hilo"
              />
              <span className="font-mono font-bold text-hilo-dark">{producto.codigo}</span>
              <span className="flex-1 text-sm text-ink/70">
                {producto.tipo ?? 'Sin tipo'} {producto.talla && `· Talla ${producto.talla}`}
              </span>
              <StatusBadge estado={producto.estado} />
            </label>
          </li>
        ))}
        {productos.length === 0 && <p className="px-4 py-10 text-center text-ink/40">No hay prendas para mostrar.</p>}
      </ul>

      <button
        disabled={seleccionados.size === 0}
        onClick={() => setMostrarHoja(true)}
        className="sticky bottom-4 rounded-tag bg-hilo px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-hilo-dark disabled:opacity-40"
      >
        Generar hoja de etiquetas ({seleccionados.size})
      </button>
    </main>
  );
}

export default function ImprimirEtiquetasPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-ink/40">Cargando...</p>}>
      <ImprimirEtiquetasContenido />
    </Suspense>
  );
}
