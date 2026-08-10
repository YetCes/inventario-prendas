'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerPedidos } from '@/lib/pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import type { EstadoPedido, PedidoResumen } from '@/types/pedido';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [estado, setEstado] = useState<EstadoPedido | 'Todos'>('Abierto');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    obtenerPedidos({ estado })
      .then(setPedidos)
      .finally(() => setCargando(false));
  }, [estado]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Pedidos</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['Todos', ...ESTADOS_PEDIDO] as const).map((e) => (
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
        <p className="py-10 text-center text-ink/40">Cargando pedidos...</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <Link href={`/pedidos/${pedido.codigo}`} className="flex items-center justify-between px-4 py-3 hover:bg-hilo-light/40">
                <span>
                  <span className="block font-mono font-bold text-hilo-dark">{pedido.codigo}</span>
                  <span className="text-sm text-ink/60">{pedido.cliente.nombre}</span>
                  <span className="block text-xs text-ink/40">
                    {pedido.cantidad_prendas} {pedido.cantidad_prendas === 1 ? 'prenda' : 'prendas'} · {pedido.origen}
                  </span>
                </span>
                <span className="font-mono font-semibold text-cordel">S/ {pedido.total.toFixed(2)}</span>
              </Link>
            </li>
          ))}

          {pedidos.length === 0 && (
            <p className="px-4 py-10 text-center text-ink/40">No hay pedidos en este estado.</p>
          )}
        </ul>
      )}
    </main>
  );
}
