'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClienteForm from '@/components/ClienteForm';
import QRScannerCamera from '@/components/QRScannerCamera';
import { obtenerProductoPorCodigo } from '@/lib/productos';
import { obtenerClientes, crearCliente } from '@/lib/clientes';
import { actualizarRegaloPedido, asignarProductoACliente } from '@/lib/pedidos';
import type { Producto } from '@/types/producto';
import type { Cliente, NuevoCliente } from '@/types/pedido';

function VentaRapidaContenido() {
  const searchParams = useSearchParams();
  const inputCodigoRef = useRef<HTMLInputElement>(null);

  const [codigo, setCodigo] = useState(searchParams.get('codigo') ?? '');
  const [producto, setProducto] = useState<Producto | null>(null);
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [errorProducto, setErrorProducto] = useState<string | null>(null);

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [incluirRegalo, setIncluirRegalo] = useState(false);

  const [asignando, setAsignando] = useState(false);
  const [ultimaAsignacion, setUltimaAsignacion] = useState<{ codigo: string; cliente: string } | null>(null);

  useEffect(() => {
    if (searchParams.get('codigo')) buscarProducto(searchParams.get('codigo')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      obtenerClientes(busquedaCliente).then(setClientes);
    }, 200);
    return () => clearTimeout(t);
  }, [busquedaCliente]);

  async function buscarProducto(valor: string) {
    if (!valor.trim()) return;
    setBuscandoProducto(true);
    setErrorProducto(null);
    setProducto(null);
    try {
      const encontrado = await obtenerProductoPorCodigo(valor);
      if (!encontrado) {
        setErrorProducto(`No existe ninguna prenda con el código "${valor}".`);
      } else if (encontrado.estado !== 'Disponible') {
        setErrorProducto(`${encontrado.codigo} ya está "${encontrado.estado}".`);
      } else {
        setProducto(encontrado);
      }
    } catch (e) {
      setErrorProducto(e instanceof Error ? e.message : 'No se pudo buscar la prenda.');
    } finally {
      setBuscandoProducto(false);
    }
  }

  async function manejarQRDetectado(texto: string) {
    setEscaneando(false);
    setCodigo(texto);
    await buscarProducto(texto);
  }

  async function asignar(cliente: Cliente) {
    if (!producto) return;
    setAsignando(true);
    try {
      const resultado = await asignarProductoACliente(producto.codigo, cliente.id);
      if (incluirRegalo) {
        await actualizarRegaloPedido(resultado.pedido.id, { incluye_regalo: true });
      }
      setUltimaAsignacion({ codigo: producto.codigo, cliente: cliente.nombre });
      // listo para la siguiente prenda
      setCodigo('');
      setProducto(null);
      setBusquedaCliente('');
      setIncluirRegalo(false);
      inputCodigoRef.current?.focus();
    } catch (e) {
      setErrorProducto(e instanceof Error ? e.message : 'No se pudo asignar la prenda.');
    } finally {
      setAsignando(false);
    }
  }

  async function crearYAsignar(datos: NuevoCliente) {
    const cliente = await crearCliente(datos);
    setMostrarNuevoCliente(false);
    await asignar(cliente);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href="/" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Venta rápida</h1>
        <p className="text-sm text-ink/50">Para usar durante el Live: código de la prenda → cliente.</p>
      </header>

      {ultimaAsignacion && (
        <div className="rounded-tag bg-hilo-light px-4 py-3 text-sm font-medium text-hilo-dark">
          ✅ {ultimaAsignacion.codigo} asignado a {ultimaAsignacion.cliente}
        </div>
      )}

      <section>
        <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="codigo-prenda">
          Código de la prenda
        </label>
        <div className="flex gap-2">
          <input
            id="codigo-prenda"
            ref={inputCodigoRef}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarProducto(codigo)}
            placeholder="P-000145"
            className="min-w-0 flex-1 rounded-tag border border-ink/10 bg-white px-4 py-4 font-mono text-lg outline-none focus:border-hilo"
            autoFocus
          />
          <button
            onClick={() => buscarProducto(codigo)}
            disabled={buscandoProducto}
            aria-label="Buscar"
            className="flex-shrink-0 rounded-tag bg-ink px-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            🔍
          </button>
          <button
            type="button"
            onClick={() => setEscaneando((v) => !v)}
            aria-label="Escanear QR"
            className={`flex-shrink-0 rounded-tag px-4 text-lg font-semibold ${
              escaneando ? 'bg-cordel text-white' : 'bg-cordel-light text-ink'
            }`}
            title="Escanear QR"
          >
            📷
          </button>
        </div>

        <div className="mt-3">
          <QRScannerCamera activo={escaneando} onDetectado={manejarQRDetectado} />
        </div>

        {errorProducto && <p className="mt-2 text-sm font-medium text-red-600">{errorProducto}</p>}
      </section>

      {producto && (
        <section className="flex gap-4 rounded-tag bg-white p-4 shadow-sm ring-1 ring-ink/5">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-tag bg-ink/5">
            {producto.foto_principal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={producto.foto_principal} alt={producto.tipo ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl text-ink/20">👕</div>
            )}
          </div>
          <div>
            <p className="font-mono font-bold text-hilo-dark">{producto.codigo}</p>
            <p className="text-sm text-ink/70">
              {producto.tipo ?? 'Sin tipo'} {producto.talla && `· Talla ${producto.talla}`}
            </p>
            {producto.precio_venta != null && (
              <p className="font-mono text-sm font-semibold text-cordel">S/ {producto.precio_venta.toFixed(2)}</p>
            )}
          </div>
        </section>
      )}

      {producto && (
        <label className="flex items-center gap-3 rounded-tag bg-white px-4 py-3 shadow-sm ring-1 ring-ink/5">
          <input
            type="checkbox"
            checked={incluirRegalo}
            onChange={(e) => setIncluirRegalo(e.target.checked)}
            className="h-5 w-5 accent-hilo"
          />
          <span className="text-sm font-medium text-ink">🎁 Incluir regalo en este pedido</span>
        </label>
      )}

      {producto && (
        <section className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-ink/70" htmlFor="cliente">
            Asignar a cliente
          </label>
          <input
            id="cliente"
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-tag border border-ink/10 bg-white px-4 py-4 text-lg outline-none focus:border-hilo"
          />

          <ul className="flex flex-col divide-y divide-ink/5 overflow-hidden rounded-tag bg-white ring-1 ring-ink/5">
            {clientes.map((cliente) => (
              <li key={cliente.id}>
                <button
                  disabled={asignando}
                  onClick={() => asignar(cliente)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-hilo-light/40 disabled:opacity-50"
                >
                  <span className="font-medium text-ink">{cliente.nombre}</span>
                  <span className="text-sm text-hilo">Asignar →</span>
                </button>
              </li>
            ))}
          </ul>

          {!mostrarNuevoCliente ? (
            <button
              onClick={() => setMostrarNuevoCliente(true)}
              className="text-left text-sm font-semibold text-hilo"
            >
              + Cliente nuevo
            </button>
          ) : (
            <div className="rounded-tag bg-white p-4 ring-1 ring-ink/5">
              <ClienteForm onGuardar={crearYAsignar} textoBoton="Crear y asignar" />
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default function VentaRapidaPage() {
  return (
    <Suspense fallback={<p className="py-20 text-center text-ink/40">Cargando...</p>}>
      <VentaRapidaContenido />
    </Suspense>
  );
}
