import Link from 'next/link';
import type { Producto } from '@/types/producto';
import StatusBadge from './StatusBadge';

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link
      href={`/prendas/${producto.codigo}`}
      className="group flex flex-col overflow-hidden rounded-tag bg-white shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full bg-ink/5">
        {producto.foto_principal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.foto_principal}
            alt={producto.tipo ?? producto.codigo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-ink/20">👕</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="font-mono text-sm font-bold text-hilo-dark">{producto.codigo}</span>

        <span className="font-display text-lg leading-tight text-ink">
          {producto.tipo ?? 'Sin tipo'}
          {producto.talla && <span className="text-ink/50"> · Talla {producto.talla}</span>}
        </span>

        {producto.precio_venta != null && (
          <span className="font-mono text-base font-semibold text-cordel">
            S/ {producto.precio_venta.toFixed(2)}
          </span>
        )}

        <div className="mt-1 flex items-center justify-between">
          <StatusBadge estado={producto.estado} />
          {producto.ubicacion && <span className="text-xs text-ink/50">{producto.ubicacion}</span>}
        </div>
      </div>
    </Link>
  );
}
