'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PhotoCapture from '@/components/PhotoCapture';
import { actualizarRegalo, crearRegalo, obtenerRegalos, subirFotoRegalo } from '@/lib/regalos';
import type { Regalo } from '@/types/regalo';

export default function RegalosPage() {
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nombre, setNombre] = useState('');
  const [stockInicial, setStockInicial] = useState('');
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const lista = await obtenerRegalos();
    setRegalos(lista);
  }

  useEffect(() => {
    cargar().finally(() => setCargando(false));
  }, []);

  async function guardarNuevo() {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      let foto: string | null = null;
      if (archivoFoto) foto = await subirFotoRegalo(archivoFoto);

      await crearRegalo({ nombre: nombre.trim(), stock: Number(stockInicial) || 0, foto });

      setNombre('');
      setStockInicial('');
      setArchivoFoto(null);
      setMostrarForm(false);
      await cargar();
    } finally {
      setGuardando(false);
    }
  }

  async function ajustarStock(regalo: Regalo, delta: number) {
    const nuevoStock = Math.max(0, regalo.stock + delta);
    await actualizarRegalo(regalo.id, { stock: nuevoStock });
    await cargar();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-ink/50">
            ← Volver
          </Link>
          <h1 className="font-display text-3xl text-ink">Regalos</h1>
          <p className="text-sm text-ink/50">Obsequios para tus clientes — sin precio ni costo.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded-tag bg-hilo px-4 py-3 text-sm font-semibold text-white hover:bg-hilo-dark"
        >
          + Nuevo
        </button>
      </header>

      {mostrarForm && (
        <section className="flex flex-col gap-4 rounded-tag bg-white p-4 ring-1 ring-ink/5">
          <PhotoCapture label="Foto del regalo (opcional)" onArchivoSeleccionado={setArchivoFoto} />
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del regalo (ej. Llavero)"
            className="w-full rounded-tag border border-ink/10 px-4 py-3"
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={stockInicial}
            onChange={(e) => setStockInicial(e.target.value)}
            placeholder="Cantidad inicial"
            className="w-full rounded-tag border border-ink/10 px-4 py-3"
          />
          <button
            onClick={guardarNuevo}
            disabled={guardando}
            className="rounded-tag bg-hilo px-4 py-3 font-semibold text-white hover:bg-hilo-dark disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar regalo'}
          </button>
        </section>
      )}

      {cargando ? (
        <p className="py-10 text-center text-ink/40">Cargando regalos...</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
          {regalos.map((regalo) => (
            <li key={regalo.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-tag bg-ink/5">
                {regalo.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={regalo.foto} alt={regalo.nombre} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-ink/20">🎁</div>
                )}
              </div>
              <span className="flex-1 font-medium text-ink">{regalo.nombre}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => ajustarStock(regalo, -1)}
                  aria-label={`Quitar stock a ${regalo.nombre}`}
                  className="h-8 w-8 rounded-full bg-paper font-bold text-ink/60"
                >
                  −
                </button>
                <span className="w-8 text-center font-mono font-semibold text-ink">{regalo.stock}</span>
                <button
                  onClick={() => ajustarStock(regalo, 1)}
                  aria-label={`Agregar stock a ${regalo.nombre}`}
                  className="h-8 w-8 rounded-full bg-paper font-bold text-ink/60"
                >
                  +
                </button>
              </div>
            </li>
          ))}

          {regalos.length === 0 && (
            <p className="px-4 py-10 text-center text-ink/40">Todavía no agregaste regalos.</p>
          )}
        </ul>
      )}
    </main>
  );
}
