'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { obtenerClientePorId, obtenerHistorialCompras } from '@/lib/clientes';
import type { Cliente, PedidoResumen } from '@/types/pedido';

export default function DetalleClientePage() {
  const params = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [historial, setHistorial] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([obtenerClientePorId(params.id), obtenerHistorialCompras(params.id)])
      .then(([c, h]) => {
        setCliente(c);
        setHistorial(h);
      })
      .finally(() => setCargando(false));
  }, [params.id]);

  if (cargando) return <p className="py-20 text-center text-ink/40">Cargando cliente...</p>;

  if (!cliente) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-ink/60">No se encontró este cliente.</p>
        <Link href="/clientes" className="font-semibold text-hilo">
          Volver a Clientes
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-5 py-8">
      <Link href="/clientes" className="text-sm text-ink/50">
        ← Volver a Clientes
      </Link>

      <div className="rounded-tag bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-ink">{cliente.nombre}</h1>
            {cliente.telefono && <p className="text-sm text-ink/60">📞 {cliente.telefono}</p>}
            {cliente.whatsapp && <p className="text-sm text-ink/60">💬 {cliente.whatsapp}</p>}
            {cliente.direccion && <p className="mt-1 text-sm text-ink/50">{cliente.direccion}</p>}
          </div>
          <Link href={`/clientes/${cliente.id}/editar`} className="text-sm font-semibold text-hilo">
            Editar
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-2 font-display text-xl text-ink">Historial de compras</h2>
        <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
          {historial.map((pedido) => (
            <li key={pedido.id}>
              <Link href={`/pedidos/${pedido.codigo}`} className="flex items-center justify-between px-4 py-3 hover:bg-hilo-light/40">
                <span>
                  <span className="block font-mono font-bold text-hilo-dark">{pedido.codigo}</span>
                  <span className="text-sm text-ink/50">
                    {pedido.cantidad_prendas} {pedido.cantidad_prendas === 1 ? 'prenda' : 'prendas'} · {pedido.estado}
                  </span>
                </span>
                <span className="font-mono font-semibold text-cordel">S/ {pedido.total.toFixed(2)}</span>
              </Link>
            </li>
          ))}

          {historial.length === 0 && (
            <p className="px-4 py-10 text-center text-ink/40">Este cliente todavía no tiene pedidos.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
