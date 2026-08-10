'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PhotoCapture from '@/components/PhotoCapture';
import { obtenerPedidoPorCodigo } from '@/lib/pedidos';
import { crearPago } from '@/lib/pagos';
import { subirComprobantePago } from '@/lib/comprobantes';
import { METODOS_PAGO } from '@/types/pago';
import type { MetodoPago } from '@/types/pago';
import type { PedidoConDetalle } from '@/types/pedido';

export default function RegistrarPagoPage() {
  const params = useParams<{ codigo: string }>();
  const router = useRouter();

  const [pedido, setPedido] = useState<PedidoConDetalle | null>(null);
  const [cargando, setCargando] = useState(true);

  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState<MetodoPago>('Yape');
  const [referencia, setReferencia] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerPedidoPorCodigo(params.codigo)
      .then((p) => {
        setPedido(p);
        if (p) setMonto(String(p.total));
      })
      .finally(() => setCargando(false));
  }, [params.codigo]);

  async function guardar() {
    if (!pedido) return;
    if (!monto || Number(monto) <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      let urlComprobante: string | null = null;
      if (archivoComprobante) {
        urlComprobante = await subirComprobantePago(archivoComprobante);
      }

      await crearPago({
        pedido_id: pedido.id,
        monto: Number(monto),
        metodo,
        yape_referencia: referencia || null,
        yape_comprobante: urlComprobante,
      });

      router.push(`/pedidos/${pedido.codigo}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el pago.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="py-20 text-center text-ink/40">Cargando pedido...</p>;
  if (!pedido) return <p className="py-20 text-center text-ink/40">No se encontró este pedido.</p>;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href={`/pedidos/${pedido.codigo}`} className="text-sm text-ink/50">
          ← Volver al pedido
        </Link>
        <h1 className="font-display text-3xl text-ink">Registrar pago</h1>
        <p className="text-sm text-ink/50">
          Pedido {pedido.codigo} · {pedido.cliente.nombre} · Total S/ {pedido.total.toFixed(2)}
        </p>
      </header>

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="monto">
          Monto pagado (S/)
        </label>
        <input
          id="monto"
          type="number"
          inputMode="decimal"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-ink/70">Método de pago</p>
        <div className="flex flex-wrap gap-2">
          {METODOS_PAGO.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetodo(m)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                metodo === m ? 'bg-hilo text-white' : 'bg-white text-ink/70 ring-1 ring-ink/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {metodo === 'Yape' && (
        <>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="referencia">
              N.° de operación Yape (opcional)
            </label>
            <input
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink/70">Captura del comprobante (opcional)</p>
            <PhotoCapture label="Foto del comprobante Yape" onArchivoSeleccionado={setArchivoComprobante} />
          </div>
        </>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        onClick={guardar}
        disabled={guardando}
        className="rounded-tag bg-hilo px-6 py-4 text-lg font-semibold text-white hover:bg-hilo-dark disabled:opacity-60"
      >
        {guardando ? 'Guardando...' : 'Registrar pago'}
      </button>
    </main>
  );
}
