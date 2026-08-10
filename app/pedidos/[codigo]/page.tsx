'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { cambiarEstadoPedido, obtenerItemsDePedido, obtenerPedidoPorCodigo, quitarProductoDePedido } from '@/lib/pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import type { EstadoPedido, PedidoConDetalle } from '@/types/pedido';
import type { Producto } from '@/types/producto';

export default function DetallePedidoPage() {
  const params = useParams<{ codigo: string }>();
  const [pedido, setPedido] = useState<PedidoConDetalle | null>(null);
  const [items, setItems] = useState<{ id: string; producto: Producto }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  async function cargar() {
    const encontrado = await obtenerPedidoPorCodigo(params.codigo);
    setPedido(encontrado);
    if (encontrado) {
      const listaItems = await obtenerItemsDePedido(encontrado.id);
      setItems(listaItems);
    }
  }

  useEffect(() => {
    cargar().finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.codigo]);

  async function cambiarEstado(nuevoEstado: EstadoPedido) {
    if (!pedido) return;
    setActualizando(true);
    try {
      await cambiarEstadoPedido(pedido.id, nuevoEstado);
      await cargar();
    } finally {
      setActualizando(false);
    }
  }

  async function quitarPrenda(itemId: string, productoId: string) {
    setActualizando(true);
    try {
      await quitarProductoDePedido(itemId, productoId);
      await cargar();
    } finally {
      setActualizando(false);
    }
  }

  if (cargando) return <p className="py-20 text-center text-ink/40">Cargando pedido...</p>;

  if (!pedido) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-ink/60">No se encontró ningún pedido con el código "{params.codigo}".</p>
        <Link href="/pedidos" className="font-semibold text-hilo">
          Volver a Pedidos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-5 py-8">
      <Link href="/pedidos" className="text-sm text-ink/50">
        ← Volver a Pedidos
      </Link>

      <div className="rounded-tag bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-bold text-hilo-dark">{pedido.codigo}</span>
          <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/60">
            {pedido.estado}
          </span>
        </div>
        <Link href={`/clientes/${pedido.cliente.id}`} className="mt-1 block font-medium text-ink hover:text-hilo">
          {pedido.cliente.nombre}
        </Link>
        <p className="text-sm text-ink/50">{pedido.origen}</p>
      </div>

      <section>
        <h2 className="mb-2 font-display text-xl text-ink">Prendas ({items.length})</h2>
        <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link href={`/prendas/${item.producto.codigo}`} className="font-mono font-bold text-hilo-dark">
                  {item.producto.codigo}
                </Link>
                <p className="text-sm text-ink/60">
                  {item.producto.tipo ?? 'Sin tipo'} {item.producto.talla && `· Talla ${item.producto.talla}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {item.producto.precio_venta != null && (
                  <span className="font-mono text-sm font-semibold text-cordel">
                    S/ {item.producto.precio_venta.toFixed(2)}
                  </span>
                )}
                <button
                  disabled={actualizando}
                  onClick={() => quitarPrenda(item.id, item.producto.id)}
                  className="text-sm text-ink/40 hover:text-red-600 disabled:opacity-50"
                  title="Quitar del pedido"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
          {items.length === 0 && <p className="px-4 py-8 text-center text-ink/40">Este pedido no tiene prendas.</p>}
        </ul>

        <div className="mt-3 flex justify-end">
          <span className="font-mono text-lg font-bold text-ink">Total: S/ {pedido.total.toFixed(2)}</span>
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold text-ink/70">Cambiar estado del pedido</p>
        <div className="flex flex-wrap gap-2">
          {ESTADOS_PEDIDO.map((e) => (
            <button
              key={e}
              disabled={actualizando || pedido.estado === e}
              onClick={() => cambiarEstado(e)}
              className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-40 ${
                pedido.estado === e ? 'bg-ink text-white' : 'bg-white text-ink/60 ring-1 ring-ink/10 hover:ring-hilo/40'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
