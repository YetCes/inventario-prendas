'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { actualizarValidacionPago, obtenerPagosPendientes } from '@/lib/pagos';
import type { PagoConPedido } from '@/types/pago';

export default function PagosPendientesPage() {
  const [pagos, setPagos] = useState<PagoConPedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  async function cargar() {
    const lista = await obtenerPagosPendientes();
    setPagos(lista);
  }

  useEffect(() => {
    cargar().finally(() => setCargando(false));
  }, []);

  async function validar(id: string, validado: boolean) {
    setProcesando(id);
    try {
      await actualizarValidacionPago(id, validado ? 'Validado' : 'Rechazado');
      await cargar();
    } finally {
      setProcesando(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-5 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Pagos pendientes de validar</h1>
      </header>

      {cargando ? (
        <p className="py-10 text-center text-ink/40">Cargando pagos...</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pagos.map((pago) => (
            <li key={pago.id} className="rounded-tag bg-white p-4 shadow-sm ring-1 ring-ink/5">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/pedidos/${pago.pedido_codigo}`} className="font-mono font-bold text-hilo-dark">
                    {pago.pedido_codigo}
                  </Link>
                  <p className="text-sm text-ink/60">{pago.cliente_nombre}</p>
                  <p className="text-xs text-ink/40">{pago.metodo}{pago.yape_referencia && ` · Op. ${pago.yape_referencia}`}</p>
                </div>
                <span className="font-mono text-lg font-bold text-cordel">S/ {pago.monto.toFixed(2)}</span>
              </div>

              {pago.yape_comprobante && (
                <a href={pago.yape_comprobante} target="_blank" rel="noreferrer" className="mt-3 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pago.yape_comprobante} alt="Comprobante" className="max-h-48 w-full rounded-tag object-contain bg-paper" />
                </a>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  disabled={procesando === pago.id}
                  onClick={() => validar(pago.id, true)}
                  className="flex-1 rounded-tag bg-hilo px-4 py-3 font-semibold text-white hover:bg-hilo-dark disabled:opacity-50"
                >
                  ✓ Validar
                </button>
                <button
                  disabled={procesando === pago.id}
                  onClick={() => validar(pago.id, false)}
                  className="flex-1 rounded-tag bg-white px-4 py-3 font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 disabled:opacity-50"
                >
                  ✕ Rechazar
                </button>
              </div>
            </li>
          ))}

          {pagos.length === 0 && (
            <p className="rounded-tag bg-white py-10 text-center text-ink/40 ring-1 ring-ink/5">
              No hay pagos pendientes por validar.
            </p>
          )}
        </ul>
      )}
    </main>
  );
}
