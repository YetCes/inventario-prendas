'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { actualizarProducto, obtenerProductoPorCodigo } from '@/lib/productos';
import { desvincularProductoDePedidos } from '@/lib/pedidos';
import { ESTADOS } from '@/types/producto';
import type { Estado, Producto } from '@/types/producto';

export default function DetalleProductoPage() {
  const params = useParams<{ codigo: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  useEffect(() => {
    obtenerProductoPorCodigo(params.codigo)
      .then(setProducto)
      .finally(() => setCargando(false));
  }, [params.codigo]);

  async function cambiarEstado(nuevoEstado: Estado) {
    if (!producto) return;
    setActualizandoEstado(true);
    try {
      // Si la prenda estaba vinculada a algún pedido, cambiar su estado aquí
      // manualmente la desvincula de ese pedido, para que no quede desincronizada.
      await desvincularProductoDePedidos(producto.id);
      const actualizado = await actualizarProducto(producto.id, { estado: nuevoEstado });
      setProducto(actualizado);
    } finally {
      setActualizandoEstado(false);
    }
  }

  if (cargando) {
    return <p className="py-20 text-center text-ink/40">Cargando prenda...</p>;
  }

  if (!producto) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-4xl">🔎</p>
        <p className="text-ink/60">No se encontró ninguna prenda con el código "{params.codigo}".</p>
        <Link href="/inventario" className="font-semibold text-hilo">
          Volver al inventario
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-5 py-8">
      <Link href="/inventario" className="text-sm text-ink/50">
        ← Volver al inventario
      </Link>

      <div className="overflow-hidden rounded-tag bg-white shadow-sm ring-1 ring-ink/5">
        <div className="aspect-square w-full bg-ink/5">
          {producto.foto_principal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={producto.foto_principal} alt={producto.tipo ?? producto.codigo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-ink/20">👕</div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-2xl font-bold text-hilo-dark">{producto.codigo}</span>
            <StatusBadge estado={producto.estado} />
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <Campo etiqueta="Categoría" valor={producto.categoria} />
            <Campo etiqueta="Tipo" valor={producto.tipo} />
            <Campo etiqueta="Marca" valor={producto.marca} />
            <Campo etiqueta="Talla" valor={producto.talla} />
            <Campo etiqueta="Color" valor={producto.color} />
            <Campo etiqueta="Condición" valor={producto.condicion} />
            <Campo etiqueta="Precio" valor={producto.precio_venta != null ? `S/ ${producto.precio_venta.toFixed(2)}` : null} />
            <Campo etiqueta="Costo" valor={producto.costo != null ? `S/ ${producto.costo.toFixed(2)}` : null} />
            <Campo etiqueta="Ubicación" valor={producto.ubicacion} />
            <Campo etiqueta="Ingreso" valor={new Date(producto.fecha_ingreso).toLocaleDateString('es-PE')} />
          </dl>

          {producto.observaciones && (
            <p className="rounded-tag bg-paper p-3 text-sm text-ink/70">{producto.observaciones}</p>
          )}
        </div>
      </div>

      {producto.estado === 'Disponible' && (
        <Link
          href={`/venta-rapida?codigo=${producto.codigo}`}
          className="rounded-tag bg-hilo px-6 py-4 text-center font-semibold text-white hover:bg-hilo-dark"
        >
          👤 Asignar a cliente
        </Link>
      )}

      <section>
        <p className="mb-2 text-sm font-semibold text-ink/70">Cambiar estado</p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              disabled={actualizandoEstado || producto.estado === e}
              onClick={() => cambiarEstado(e)}
              className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                producto.estado === e ? 'bg-ink text-white' : 'bg-white text-ink/60 ring-1 ring-ink/10 hover:ring-hilo/40'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-ink/40">
          Si esta prenda pertenecía a un pedido, cambiar su estado aquí la desvincula de ese pedido.
        </p>
      </section>

      <Link
        href={`/etiquetas?codigo=${producto.codigo}`}
        className="rounded-tag bg-cordel-light px-6 py-4 text-center font-semibold text-ink hover:bg-cordel-light/70"
      >
        🏷️ Generar etiqueta
      </Link>
    </main>
  );
}

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <div>
      <dt className="text-ink/40">{etiqueta}</dt>
      <dd className="font-medium text-ink">{valor ?? '—'}</dd>
    </div>
  );
}
