'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerPedidos } from '@/lib/pedidos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import type { EstadoPedido, PedidoResumen } from '@/types/pedido';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [estado, setEstado] = useState<EstadoPedido | 'Todos'>('Abierto');
  const [busqueda, setBusqueda] = useState('');
  const [agruparPorCliente, setAgruparPorCliente] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    const temporizador = setTimeout(() => {
      obtenerPedidos({ estado, busqueda })
        .then(setPedidos)
        .finally(() => setCargando(false));
    }, 200);
    return () => clearTimeout(temporizador);
  }, [estado, busqueda]);

  const grupos = useMemo(() => {
    if (!agruparPorCliente) return null;

    const mapa = new Map<string, { nombre: string; pedidos: PedidoResumen[] }>();
    for (const pedido of pedidos) {
      const existente = mapa.get(pedido.cliente.id);
      if (existente) {
        existente.pedidos.push(pedido);
      } else {
        mapa.set(pedido.cliente.id, { nombre: pedido.cliente.nombre, pedidos: [pedido] });
      }
    }
    return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [pedidos, agruparPorCliente]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-5 py-8">
      <header className="flex items-start justify-between">
        <div>
          <Link href="/" className="text-sm text-ink/50">
            ← Volver
          </Link>
          <h1 className="font-display text-3xl text-ink">Pedidos</h1>
        </div>
        <button
          onClick={() => setAgruparPorCliente((v) => !v)}
          className={`whitespace-nowrap rounded-tag px-3 py-2 text-sm font-medium ${
            agruparPorCliente ? 'bg-hilo text-white' : 'bg-white text-ink/60 ring-1 ring-ink/10'
          }`}
        >
          👥 Agrupar por cliente
        </button>
      </header>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/30" aria-hidden>
          🔍
        </span>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por código de pedido o cliente..."
          className="w-full rounded-tag border border-ink/10 bg-white py-3 pl-11 pr-4 text-base shadow-sm outline-none focus:border-hilo"
        />
      </div>

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
      ) : grupos ? (
        <div className="flex flex-col gap-4">
          {grupos.map((grupo) => (
            <div key={grupo.nombre}>
              <p className="mb-1 px-1 text-sm font-semibold text-ink/60">
                {grupo.nombre} <span className="text-ink/30">· {grupo.pedidos.length}</span>
              </p>
              <ListaPedidos pedidos={grupo.pedidos} mostrarCliente={false} />
            </div>
          ))}
          {grupos.length === 0 && (
            <p className="rounded-tag bg-white px-4 py-10 text-center text-ink/40 ring-1 ring-ink/5">
              No hay pedidos que coincidan.
            </p>
          )}
        </div>
      ) : (
        <ListaPedidos pedidos={pedidos} mostrarCliente />
      )}
    </main>
  );
}

function ListaPedidos({ pedidos, mostrarCliente }: { pedidos: PedidoResumen[]; mostrarCliente: boolean }) {
  return (
    <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
      {pedidos.map((pedido) => (
        <li key={pedido.id}>
          <Link href={`/pedidos/${pedido.codigo}`} className="flex items-center justify-between px-4 py-3 hover:bg-hilo-light/40">
            <span>
              <span className="block font-mono font-bold text-hilo-dark">{pedido.codigo}</span>
              {mostrarCliente && <span className="text-sm text-ink/60">{pedido.cliente.nombre}</span>}
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
  );
}
