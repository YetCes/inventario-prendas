import Link from 'next/link';
import type { Producto } from '@/types/producto';
import StatusBadge from './StatusBadge';

export default function ProductTable({ productos }: { productos: Producto[] }) {
  return (
    <div className="overflow-x-auto rounded-tag bg-white ring-1 ring-ink/5">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/50">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Talla</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id} className="border-b border-ink/5 last:border-0 hover:bg-hilo-light/40">
              <td className="px-4 py-3">
                <Link href={`/prendas/${producto.codigo}`} className="font-mono font-bold text-hilo-dark">
                  {producto.codigo}
                </Link>
              </td>
              <td className="px-4 py-3">{producto.tipo ?? '—'}</td>
              <td className="px-4 py-3">{producto.talla ?? '—'}</td>
              <td className="px-4 py-3 font-mono">
                {producto.precio_venta != null ? `S/ ${producto.precio_venta.toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge estado={producto.estado} />
              </td>
              <td className="px-4 py-3">{producto.ubicacion ?? '—'}</td>
            </tr>
          ))}

          {productos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                No hay prendas que coincidan con la búsqueda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
