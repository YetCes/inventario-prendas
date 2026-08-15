'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRScannerCamera from '@/components/QRScannerCamera';
import { marcarPedidoComoEntregado, obtenerPedidoPorCodigo } from '@/lib/pedidos';
import type { PedidoConDetalle } from '@/types/pedido';

function PreparacionContenido() {
  const searchParams = useSearchParams();

  const [codigoBusqueda, setCodigoBusqueda] = useState(searchParams.get('codigo') ?? '');
  const [pedido, setPedido] = useState<PedidoConDetalle | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  const [verificados, setVerificados] = useState<Set<string>>(new Set());
  const [escaneando, setEscaneando] = useState(false);
  const [ultimoMensaje, setUltimoMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [codigoManual, setCodigoManual] = useState('');
  const [despachando, setDespachando] = useState(false);
  const [despachado, setDespachado] = useState(false);

  useEffect(() => {
    if (searchParams.get('codigo')) buscarPedido(searchParams.get('codigo')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buscarPedido(codigo: string) {
    if (!codigo.trim()) return;
    setBuscando(true);
    setErrorBusqueda(null);
    setPedido(null);
    setVerificados(new Set());
    setDespachado(false);
    try {
      const encontrado = await obtenerPedidoPorCodigo(codigo);
      if (!encontrado) {
        setErrorBusqueda(`No existe ningún pedido con el código "${codigo}".`);
      } else {
        setPedido(encontrado);
      }
    } catch (e) {
      setErrorBusqueda(e instanceof Error ? e.message : 'No se pudo buscar el pedido.');
    } finally {
      setBuscando(false);
    }
  }

  function verificarCodigo(codigoEscaneado: string) {
    if (!pedido) return;
    const codigoNormalizado = codigoEscaneado.trim().toUpperCase();
    const prenda = pedido.productos.find((p) => p.codigo === codigoNormalizado);

    if (!prenda) {
      setUltimoMensaje({ ok: false, texto: `${codigoNormalizado} no pertenece a este pedido.` });
      return;
    }
    if (verificados.has(prenda.id)) {
      setUltimoMensaje({ ok: true, texto: `${prenda.codigo} ya estaba verificada.` });
      return;
    }

    setVerificados((prev) => new Set(prev).add(prenda.id));
    setUltimoMensaje({ ok: true, texto: `${prenda.codigo} verificada.` });
  }

  function manejarQRDetectado(texto: string) {
    verificarCodigo(texto);
  }

  async function despacharPedido() {
    if (!pedido) return;
    setDespachando(true);
    try {
      await marcarPedidoComoEntregado(pedido.id);
      setDespachado(true);
      setEscaneando(false);
    } finally {
      setDespachando(false);
    }
  }

  const todasVerificadas = pedido ? verificados.size === pedido.productos.length && pedido.productos.length > 0 : false;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Preparación de pedidos</h1>
        <p className="text-sm text-ink/50">Escanea cada prenda para confirmar que pertenece al pedido.</p>
      </header>

      {!pedido && (
        <section className="flex gap-2">
          <input
            value={codigoBusqueda}
            onChange={(e) => setCodigoBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarPedido(codigoBusqueda)}
            placeholder="PED-00145"
            className="min-w-0 flex-1 rounded-tag border border-ink/10 bg-white px-4 py-4 font-mono text-lg outline-none focus:border-hilo"
            autoFocus
          />
          <button
            onClick={() => buscarPedido(codigoBusqueda)}
            disabled={buscando}
            aria-label="Buscar"
            className="flex-shrink-0 rounded-tag bg-ink px-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            🔍
          </button>
        </section>
      )}

      {errorBusqueda && <p className="text-sm font-medium text-red-600">{errorBusqueda}</p>}

      {pedido && !despachado && (
        <>
          <section className="rounded-tag bg-white p-4 shadow-sm ring-1 ring-ink/5">
            <p className="font-mono text-xl font-bold text-hilo-dark">{pedido.codigo}</p>
            <p className="text-sm text-ink/60">{pedido.cliente.nombre}</p>
          </section>

          <p className="font-display text-xl text-ink">
            {verificados.size} de {pedido.productos.length} prendas verificadas
          </p>

          {ultimoMensaje && (
            <p className={`text-sm font-medium ${ultimoMensaje.ok ? 'text-hilo-dark' : 'text-red-600'}`}>
              {ultimoMensaje.ok ? '✅' : '⚠️'} {ultimoMensaje.texto}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEscaneando((v) => !v)}
              className={`flex-1 rounded-tag px-4 py-3 font-semibold ${
                escaneando ? 'bg-cordel text-white' : 'bg-cordel-light text-ink'
              }`}
            >
              📷 {escaneando ? 'Detener cámara' : 'Escanear QR'}
            </button>
          </div>

          <QRScannerCamera activo={escaneando} onDetectado={manejarQRDetectado} />

          <div className="flex gap-2">
            <input
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verificarCodigo(codigoManual);
                  setCodigoManual('');
                }
              }}
              placeholder="O escribe el código manualmente"
              className="flex-1 rounded-tag border border-ink/10 bg-white px-4 py-3 font-mono outline-none focus:border-hilo"
            />
          </div>

          <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
            {pedido.productos.map((producto) => (
              <li key={producto.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-mono font-medium text-ink">{producto.codigo}</span>
                <span className={verificados.has(producto.id) ? 'text-hilo-dark' : 'text-ink/30'}>
                  {verificados.has(producto.id) ? '✅ Verificada' : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={despacharPedido}
            disabled={!todasVerificadas || despachando}
            className="rounded-tag bg-hilo px-6 py-4 text-lg font-semibold text-white hover:bg-hilo-dark disabled:opacity-40"
          >
            {despachando ? 'Despachando...' : 'Marcar como despachado / entregado'}
          </button>
        </>
      )}

      {despachado && pedido && (
        <div className="flex flex-col items-center gap-4 rounded-tag bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <span className="text-5xl" aria-hidden>
            📦✅
          </span>
          <p className="font-display text-2xl text-ink">Pedido {pedido.codigo} entregado</p>
          <p className="text-sm text-ink/50">Todas las prendas quedaron marcadas como "Entregado".</p>
          <Link href={`/pedidos/${pedido.codigo}`} className="font-semibold text-hilo">
            Ver pedido
          </Link>
        </div>
      )}
    </main>
  );
}

export default function PreparacionPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-ink/40">Cargando...</p>}>
      <PreparacionContenido />
    </Suspense>
  );
}
