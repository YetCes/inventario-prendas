'use client';

import { useEffect, useState } from 'react';
import BigButton from '@/components/BigButton';
import { obtenerConteoInventario } from '@/lib/productos';
import type { ConteoInventario } from '@/types/producto';

export default function Dashboard() {
  const [conteo, setConteo] = useState<ConteoInventario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerConteoInventario()
      .then(setConteo)
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-5 py-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-hilo">Inventario</p>
        <h1 className="font-display text-3xl text-ink">Tu tienda, al día</h1>
      </header>

      <section className="rounded-tag bg-white p-6 shadow-sm ring-1 ring-ink/5">
        {cargando ? (
          <p className="text-ink/40">Cargando resumen...</p>
        ) : (
          <>
            <p className="font-mono text-4xl font-bold text-ink">{conteo?.total ?? 0}</p>
            <p className="mb-4 text-ink/50">prendas registradas</p>

            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-ink/50">Disponibles</dt>
                <dd className="font-mono text-lg font-semibold text-estado-disponible">{conteo?.disponibles ?? 0}</dd>
              </div>
              <div>
                <dt className="text-ink/50">Reservadas</dt>
                <dd className="font-mono text-lg font-semibold text-estado-reservado">{conteo?.reservadas ?? 0}</dd>
              </div>
              <div>
                <dt className="text-ink/50">Vendidas</dt>
                <dd className="font-mono text-lg font-semibold text-estado-vendido">{conteo?.vendidas ?? 0}</dd>
              </div>
              <div>
                <dt className="text-ink/50">Entregadas</dt>
                <dd className="font-mono text-lg font-semibold text-estado-entregado">{conteo?.entregadas ?? 0}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4">
        <BigButton href="/prendas/nueva" icon="➕" label="Nueva Prenda" />
        <BigButton href="/inventario" icon="🗂️" label="Inventario" variant="secondary" />
        <BigButton href="/etiquetas" icon="🏷️" label="Imprimir Etiquetas" variant="secondary" />
        <BigButton href="/inventario" icon="🔍" label="Buscar Producto" variant="secondary" />
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/40">Ventas</p>
        <div className="grid grid-cols-2 gap-4">
          <BigButton href="/venta-rapida" icon="⚡" label="Venta rápida (Live)" />
          <BigButton href="/pedidos" icon="📦" label="Pedidos" variant="secondary" />
          <BigButton href="/clientes" icon="👥" label="Clientes" variant="secondary" />
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/40">Pagos y despacho</p>
        <div className="grid grid-cols-2 gap-4">
          <BigButton href="/preparacion" icon="📷" label="Preparar pedido" />
          <BigButton href="/pagos-pendientes" icon="💳" label="Pagos pendientes" variant="secondary" />
          <BigButton href="/regalos" icon="🎁" label="Regalos" variant="secondary" />
        </div>
      </section>
    </main>
  );
}
