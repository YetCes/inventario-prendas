'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhotoCapture from '@/components/PhotoCapture';
import { crearProducto } from '@/lib/productos';
import { subirFotoPrenda } from '@/lib/fotos';
import { CATEGORIAS_SUGERIDAS, TALLAS_SUGERIDAS, CONDICIONES } from '@/types/producto';
import type { Condicion, Producto } from '@/types/producto';

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        activo ? 'bg-hilo text-white' : 'bg-white text-ink/70 ring-1 ring-ink/10 hover:ring-hilo/40'
      }`}
    >
      {children}
    </button>
  );
}

export default function NuevaPrendaPage() {
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [categoria, setCategoria] = useState('');
  const [talla, setTalla] = useState('');
  const [precio, setPrecio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [mostrarMas, setMostrarMas] = useState(false);
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [color, setColor] = useState('');
  const [condicion, setCondicion] = useState<Condicion | ''>('');
  const [costo, setCosto] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productoGuardado, setProductoGuardado] = useState<Producto | null>(null);

  function limpiarFormulario() {
    setArchivoFoto(null);
    setCategoria('');
    setTalla('');
    setPrecio('');
    setUbicacion('');
    setTipo('');
    setMarca('');
    setColor('');
    setCondicion('');
    setCosto('');
    setObservaciones('');
    setMostrarMas(false);
    setProductoGuardado(null);
  }

  async function guardarPrenda() {
    if (!archivoFoto) {
      setError('La fotografía es obligatoria.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      const urlFoto = await subirFotoPrenda(archivoFoto);

      const producto = await crearProducto({
        foto_principal: urlFoto,
        categoria: categoria || null,
        tipo: tipo || categoria || null,
        talla: talla || null,
        precio_venta: precio ? Number(precio) : null,
        ubicacion: ubicacion || null,
        marca: marca || null,
        color: color || null,
        condicion: condicion || null,
        costo: costo ? Number(costo) : null,
        observaciones: observaciones || null,
      });

      setProductoGuardado(producto);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la prenda. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  if (productoGuardado) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-5 py-8 text-center">
        <span className="text-5xl" aria-hidden>
          ✅
        </span>
        <h1 className="font-display text-2xl text-ink">Prenda registrada correctamente</h1>
        <p className="font-mono text-3xl font-bold text-hilo-dark">{productoGuardado.codigo}</p>

        <div className="flex w-full flex-col gap-3">
          <button
            onClick={limpiarFormulario}
            className="rounded-tag bg-hilo px-6 py-4 font-semibold text-white hover:bg-hilo-dark"
          >
            Registrar otra prenda
          </button>
          <Link
            href={`/etiquetas?codigo=${productoGuardado.codigo}`}
            className="rounded-tag bg-cordel-light px-6 py-4 text-center font-semibold text-ink hover:bg-cordel-light/70"
          >
            Imprimir etiqueta
          </Link>
          <Link
            href={`/prendas/${productoGuardado.codigo}`}
            className="rounded-tag px-6 py-4 text-center font-semibold text-ink/70 ring-1 ring-ink/10 hover:ring-hilo/40"
          >
            Ver producto
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Nueva Prenda</h1>
        <p className="text-sm text-ink/50">Solo la foto es obligatoria. El resto lo puedes completar rápido o después.</p>
      </header>

      <PhotoCapture label="Tomar o subir foto" onArchivoSeleccionado={setArchivoFoto} obligatoria />

      <section>
        <p className="mb-2 text-sm font-semibold text-ink/70">Categoría</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS_SUGERIDAS.map((c) => (
            <Chip key={c} activo={categoria === c} onClick={() => setCategoria(categoria === c ? '' : c)}>
              {c}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold text-ink/70">Talla</p>
        <div className="flex flex-wrap gap-2">
          {TALLAS_SUGERIDAS.map((t) => (
            <Chip key={t} activo={talla === t} onClick={() => setTalla(talla === t ? '' : t)}>
              {t}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="precio">
          Precio de venta (S/)
        </label>
        <input
          id="precio"
          type="number"
          inputMode="decimal"
          min={0}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="35"
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
        />
      </section>

      <section>
        <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="ubicacion">
          Ubicación física
        </label>
        <input
          id="ubicacion"
          type="text"
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Caja B, Rack 1..."
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
        />
      </section>

      <button
        type="button"
        onClick={() => setMostrarMas((v) => !v)}
        className="text-left text-sm font-semibold text-hilo"
      >
        {mostrarMas ? '− Ocultar campos adicionales' : '+ Agregar más datos (opcional)'}
      </button>

      {mostrarMas && (
        <section className="flex flex-col gap-4 rounded-tag bg-white p-4 ring-1 ring-ink/5">
          <div>
            <label className="mb-1 block text-sm text-ink/60" htmlFor="tipo">
              Tipo de prenda
            </label>
            <input
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ej. Vestido casual"
              className="w-full rounded-tag border border-ink/10 px-3 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/60" htmlFor="marca">
              Marca
            </label>
            <input
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full rounded-tag border border-ink/10 px-3 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/60" htmlFor="color">
              Color
            </label>
            <input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full rounded-tag border border-ink/10 px-3 py-3"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-ink/60">Condición</p>
            <div className="flex gap-2">
              {CONDICIONES.map((c) => (
                <Chip key={c} activo={condicion === c} onClick={() => setCondicion(condicion === c ? '' : c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/60" htmlFor="costo">
              Costo de adquisición (S/)
            </label>
            <input
              id="costo"
              type="number"
              inputMode="decimal"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              className="w-full rounded-tag border border-ink/10 px-3 py-3"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/60" htmlFor="observaciones">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              className="w-full rounded-tag border border-ink/10 px-3 py-3"
            />
          </div>
        </section>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={guardarPrenda}
        disabled={guardando}
        className="sticky bottom-4 rounded-tag bg-hilo px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-hilo-dark disabled:opacity-60"
      >
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </main>
  );
}
