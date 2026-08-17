'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import RuletaRegalos from '@/components/RuletaRegalos';
import { actualizarConfirmacionCliente, asignarRegaloPorRuleta, obtenerPedidoPorEnlaceToken } from '@/lib/pedidos';
import { obtenerRegalosDisponibles } from '@/lib/regalos';
import type { PedidoConDetalle } from '@/types/pedido';
import type { Regalo } from '@/types/regalo';

const NUMERO_WHATSAPP_NEGOCIO = process.env.NEXT_PUBLIC_WHATSAPP_NEGOCIO; // ej. "51987654321", sin "+" ni espacios

export default function PedidoPublicoPage() {
  const params = useParams<{ token: string }>();
  const [pedido, setPedido] = useState<PedidoConDetalle | null | undefined>(undefined);
  const [regalosDisponibles, setRegalosDisponibles] = useState<Regalo[]>([]);
  const [enviandoConfirmacion, setEnviandoConfirmacion] = useState(false);

  useEffect(() => {
    obtenerPedidoPorEnlaceToken(params.token).then(setPedido);
  }, [params.token]);

  useEffect(() => {
    if (pedido?.incluye_regalo && !pedido.regalo_id) {
      obtenerRegalosDisponibles().then(setRegalosDisponibles);
    }
  }, [pedido]);

  async function girarRuleta(): Promise<Regalo> {
    if (!pedido) throw new Error('El pedido todavía no cargó.');
    const ganador = await asignarRegaloPorRuleta(pedido.id);
    setPedido({ ...pedido, regalo_id: ganador.id, regalo: ganador, regalo_asignado_en: new Date().toISOString() });
    return ganador;
  }

  async function responder(respuesta: 'Aceptado' | 'Observado') {
    if (!pedido) return;
    setEnviandoConfirmacion(true);
    try {
      await actualizarConfirmacionCliente(pedido.id, respuesta);
      setPedido({ ...pedido, confirmacion_cliente: respuesta });

      const mensaje =
        respuesta === 'Aceptado'
          ? `Hola! Soy ${pedido.cliente.nombre}. Sobre mi pedido ${pedido.codigo}: todo está correcto ✅`
          : `Hola! Soy ${pedido.cliente.nombre}. Sobre mi pedido ${pedido.codigo}: tengo una observación ⚠️`;

      const url = NUMERO_WHATSAPP_NEGOCIO
        ? `https://wa.me/${NUMERO_WHATSAPP_NEGOCIO}?text=${encodeURIComponent(mensaje)}`
        : `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

      window.open(url, '_blank');
    } finally {
      setEnviandoConfirmacion(false);
    }
  }

  if (pedido === undefined) {
    return <p className="py-20 text-center text-ink/40">Cargando...</p>;
  }

  if (pedido === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-4xl">🔎</p>
        <p className="text-ink/60">Este enlace no es válido o el pedido ya no existe.</p>
      </main>
    );
  }

  // La ruleta se resuelve primero (si aplica); recién después se pide la confirmación.
  const faltaGirarRuleta = pedido.incluye_regalo && !pedido.regalo_id;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-10">
      <header className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-hilo">{pedido.codigo}</p>
        <h1 className="font-display text-3xl text-ink">¡Hola, {pedido.cliente.nombre}! 👋</h1>
        <p className="text-sm text-ink/50">Aquí están las prendas de tu pedido.</p>
      </header>

      <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
        {pedido.productos.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-tag bg-ink/5">
              {p.foto_principal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.foto_principal} alt={p.tipo ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl text-ink/20">👕</div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">
                {p.tipo ?? 'Prenda'} {p.talla && `· Talla ${p.talla}`}
              </p>
              <p className="font-mono text-xs text-ink/40">{p.codigo}</p>
            </div>
            {p.precio_venta != null && (
              <span className="font-mono text-sm font-semibold text-cordel">S/ {p.precio_venta.toFixed(2)}</span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <span className="font-mono text-lg font-bold text-ink">Total: S/ {pedido.total.toFixed(2)}</span>
      </div>

      {faltaGirarRuleta && (
        <section className="flex flex-col items-center gap-4 rounded-tag bg-white p-6 shadow-sm ring-1 ring-ink/5">
          <p className="font-display text-xl text-ink">🎁 ¡Tienes un regalo!</p>
          {regalosDisponibles.length > 0 ? (
            <RuletaRegalos regalos={regalosDisponibles} onGirar={girarRuleta} />
          ) : (
            <p className="text-sm text-ink/50">Por el momento no hay regalos disponibles para sortear.</p>
          )}
        </section>
      )}

      {pedido.incluye_regalo && pedido.regalo_id && pedido.regalo && (
        <p className="text-center text-lg font-semibold text-hilo-dark">🎉 Tu regalo: {pedido.regalo.nombre}</p>
      )}

      {!faltaGirarRuleta && (
        <section className="flex flex-col items-center gap-3 rounded-tag bg-white p-6 text-center shadow-sm ring-1 ring-ink/5">
          {pedido.confirmacion_cliente === 'Pendiente' ? (
            <>
              <p className="font-display text-xl text-ink">¿Todo está correcto con tu pedido?</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => responder('Aceptado')}
                  disabled={enviandoConfirmacion}
                  className="flex-1 rounded-tag bg-hilo px-4 py-4 font-semibold text-white hover:bg-hilo-dark disabled:opacity-60"
                >
                  ✅ Todo correcto
                </button>
                <button
                  onClick={() => responder('Observado')}
                  disabled={enviandoConfirmacion}
                  className="flex-1 rounded-tag bg-white px-4 py-4 font-semibold text-cordel ring-1 ring-cordel/40 hover:bg-cordel-light disabled:opacity-60"
                >
                  ⚠️ Tengo una observación
                </button>
              </div>
              <p className="text-xs text-ink/40">Se abrirá WhatsApp para avisarnos directamente.</p>
            </>
          ) : (
            <p className="font-medium text-ink/70">
              {pedido.confirmacion_cliente === 'Aceptado'
                ? '✅ Nos avisaste que todo está correcto. ¡Gracias! 💚'
                : '⚠️ Nos avisaste que tienes una observación. Ya la revisamos por WhatsApp.'}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
