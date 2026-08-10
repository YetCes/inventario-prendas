import type { Producto } from '@/types/producto';
import LabelPreview from './LabelPreview';

/**
 * Grilla de etiquetas de 60mm x 40mm sobre una hoja A4 (210 x 297mm),
 * pensada para impresoras domésticas normales (no térmicas).
 * Caben 3 columnas x 6 filas con márgenes cómodos para recortar.
 */
export default function LabelSheetA4({ productos }: { productos: Producto[] }) {
  return (
    <div
      id="hoja-etiquetas"
      className="mx-auto grid grid-cols-3 gap-3 bg-white p-[10mm]"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {productos.map((producto) => (
        <LabelPreview key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
