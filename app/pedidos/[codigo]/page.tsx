'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import {
  actualizarRegaloPedido,
  cambiarEstadoPedido,
  obtenerItemsDePedido,
  obtenerPedidoPorCodigo,
  quitarProductoDePedido,
} from '@/lib/pedidos';
import { obtenerPagosPorPedido } from '@/lib/pagos';
import { obtenerRegalos } from '@/lib/regalos';
import { ESTADOS_PEDIDO } from '@/types/pedido';
import type { EstadoPedido, PedidoConDetalle } from '@/types/pedido';
import type { Pago } from '@/types/pago';
import type { Producto } from '@/types/producto';
import type { Regalo } from '@/types/regalo';

export default function DetallePedidoPage() {
  const params = useParams<{ codigo: string }>();
  const [pedido, setPedido] = useState<PedidoConDetalle | null>(null);
  const [items, setItems] = useState<{ id: string; producto: Producto }[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [actualizandoRegalo, setActualizandoRegalo] = useState(false);
  const [origen, setOrigen] = useState('');

  useEffect(() => {
    setOrigen(window.location.origin);
  }, []);

  const enlacePublico = pedido ? `${origen}/p/${pedido.enlace_token}` : '';

  async function cargar() {
    const encontrado = await obtenerPedidoPorCodigo(params.codigo);
    setPedido(encontrado);
    if (encontrado) {
      const [listaItems, listaPagos, listaRegalos] = await Promise.all([
        obtenerItemsDePedido(encontrado.id),
        obtenerPagosPorPedido(encontrado.id),
        obtenerRegalos(),
      ]);
      setItems(listaItems);
      setPagos(listaPagos);
      setRegalos(listaRegalos);
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

  async function alternarIncluyeRegalo(activar: boolean) {
    if (!pedido) return;
    setActualizandoRegalo(true);
    try {
      await actualizarRegaloPedido(pedido.id, { incluye_regalo: activar });
      await cargar();
    } finally {
      setActualizandoRegalo(false);
    }
  }

  async function elegirRegaloManual(regaloId: string) {
    if (!pedido) return;
    setActualizandoRegalo(true);
    try {
      await actualizarRegaloPedido(pedido.id, { incluye_regalo: true, regalo_id: regaloId || null });
      await cargar();
    } finally {
      setActualizandoRegalo(false);
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
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-hilo-dark">{pedido.codigo}</span>
            <BotonCopiar texto={pedido.codigo} />
          </div>
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

        <div className="mt-3 flex items-center justify-between">
          <PagoResumen total={pedido.total} pagos={pagos} />
          <span className="font-mono text-lg font-bold text-ink">Total: S/ {pedido.total.toFixed(2)}</span>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">Pagos</h2>
          <Link href={`/pedidos/${pedido.codigo}/pagos/nuevo`} className="text-sm font-semibold text-hilo">
            + Registrar pago
          </Link>
        </div>
        <ul className="flex flex-col divide-y divide-ink/5 rounded-tag bg-white ring-1 ring-ink/5">
          {pagos.map((pago) => (
            <li key={pago.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="block text-sm font-medium text-ink">{pago.metodo}</span>
                <span className="text-xs text-ink/40">{new Date(pago.fecha).toLocaleDateString('es-PE')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-cordel">S/ {pago.monto.toFixed(2)}</span>
                <EstadoValidacionBadge estado={pago.estado_validacion} />
              </div>
            </li>
          ))}
          {pagos.length === 0 && <p className="px-4 py-6 text-center text-ink/40">Todavía no se registró ningún pago.</p>}
        </ul>
      </section>

      <section className="rounded-tag bg-white p-4 shadow-sm ring-1 ring-ink/5">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={pedido.incluye_regalo}
            disabled={actualizandoRegalo}
            onChange={(e) => alternarIncluyeRegalo(e.target.checked)}
            className="h-5 w-5 accent-hilo"
          />
          <span className="font-semibold text-ink">🎁 Incluir regalo</span>
        </label>

        {pedido.incluye_regalo && (
          <div className="mt-3 flex flex-col gap-2">
            {pedido.regalo_id && pedido.regalo ? (
              <p className="text-sm text-ink/70">
                Regalo asignado: <span className="font-semibold text-hilo-dark">{pedido.regalo.nombre}</span>
                {' · '}
                <button onClick={() => elegirRegaloManual('')} className="text-hilo underline">
                  quitar elección
                </button>
              </p>
            ) : (
              <>
                <label className="text-sm text-ink/60" htmlFor="regalo-manual">
                  Elegir regalo específico (opcional — si no eliges ninguno, lo decide la ruleta)
                </label>
                <select
                  id="regalo-manual"
                  disabled={actualizandoRegalo}
                  onChange={(e) => elegirRegaloManual(e.target.value)}
                  defaultValue=""
                  className="rounded-tag border border-ink/10 px-3 py-2"
                >
                  <option value="">-- Dejar a la suerte (ruleta) --</option>
                  {regalos.map((r) => (
                    <option key={r.id} value={r.id} disabled={r.stock <= 0}>
                      {r.nombre} ({r.stock} disponibles)
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `¡Hola ${pedido.cliente.nombre}! 👋 Aquí puedes ver y confirmar tu pedido ${pedido.codigo}: ${enlacePublico}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-tag bg-hilo px-4 py-3 text-center text-sm font-semibold text-white hover:bg-hilo-dark"
          >
            💬 Compartir por WhatsApp
          </a>
          <BotonCopiar texto={enlacePublico} etiqueta="🔗 Copiar enlace" />
        </div>
      </section>

      <Link
        href={`/preparacion?codigo=${pedido.codigo}`}
        className="rounded-tag bg-cordel-light px-6 py-4 text-center font-semibold text-ink hover:bg-cordel-light/70"
      >
        📷 Preparar pedido (verificar con QR)
      </Link>

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

function PagoResumen({ total, pagos }: { total: number; pagos: Pago[] }) {
  const pagado = pagos.filter((p) => p.estado_validacion === 'Validado').reduce((s, p) => s + p.monto, 0);
  const faltante = Math.max(0, total - pagado);

  if (faltante <= 0 && total > 0) {
    return <span className="text-sm font-semibold text-estado-disponible">Pagado</span>;
  }
  return <span className="text-sm font-medium text-cordel">Falta S/ {faltante.toFixed(2)}</span>;
}

function EstadoValidacionBadge({ estado }: { estado: Pago['estado_validacion'] }) {
  const estilos =
    estado === 'Validado'
      ? 'text-estado-disponible bg-estado-disponibleBg'
      : estado === 'Rechazado'
        ? 'text-red-600 bg-red-50'
        : 'text-estado-reservado bg-estado-reservadoBg';

  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${estilos}`}>{estado}</span>;
}

function BotonCopiar({ texto, etiqueta }: { texto: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Si el navegador no permite el portapapeles, no hacemos nada más.
    }
  }

  if (etiqueta) {
    return (
      <button
        type="button"
        onClick={copiar}
        className="flex-1 rounded-tag bg-white px-4 py-3 text-center text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-hilo/40"
      >
        {copiado ? '✓ Copiado' : etiqueta}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar código"
      aria-label="Copiar código"
      className="rounded-tag px-2 py-1 text-sm text-ink/40 hover:bg-paper hover:text-ink"
    >
      {copiado ? '✓' : '📋'}
    </button>
  );
}
