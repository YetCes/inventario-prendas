import type { Producto } from '@/types/producto';
import QRCodeCanvas from './QRCode';

/**
 * Etiqueta individual: 60mm x 40mm, pensada para recortar a mano.
 * El círculo superior imita la perforación real de una etiqueta de ropa.
 */
export default function LabelPreview({ producto }: { producto: Producto }) {
  return (
    <div
      className="relative flex items-center gap-2 overflow-hidden border border-ink/30 bg-cordel-light p-2"
      style={{ width: '60mm', height: '40mm' }}
    >
      <div className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-paper ring-1 ring-ink/30" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col justify-center pl-2">
        <span className="font-mono text-base font-bold leading-none text-ink">{producto.codigo}</span>
        {producto.tipo && <span className="mt-1 truncate text-[10px] leading-tight text-ink/70">{producto.tipo}</span>}
        {producto.talla && <span className="text-[10px] leading-tight text-ink/70">Talla: {producto.talla}</span>}
        {producto.precio_venta != null && (
          <span className="mt-1 text-[11px] font-semibold leading-tight text-ink">
            S/ {producto.precio_venta.toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex-shrink-0 bg-white p-1">
        <QRCodeCanvas valor={producto.codigo} tamano={72} />
      </div>
    </div>
  );
}
