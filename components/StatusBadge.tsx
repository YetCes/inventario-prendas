import type { Estado } from '@/types/producto';

const ESTILOS: Record<Estado, string> = {
  Disponible: 'text-estado-disponible bg-estado-disponibleBg',
  Reservado: 'text-estado-reservado bg-estado-reservadoBg',
  Vendido: 'text-estado-vendido bg-estado-vendidoBg',
  Entregado: 'text-estado-entregado bg-estado-entregadoBg',
  Retirado: 'text-estado-retirado bg-estado-retiradoBg',
};

export default function StatusBadge({ estado }: { estado: Estado }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${ESTILOS[estado]}`}
    >
      {estado}
    </span>
  );
}
