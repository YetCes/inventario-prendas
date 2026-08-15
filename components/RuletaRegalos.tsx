'use client';

import { useState } from 'react';
import type { Regalo } from '@/types/regalo';

const COLORES = ['#2F6F62', '#C98A2C', '#3167A6', '#8B8579', '#5B6472', '#2F8F5B', '#B04A57', '#6B4E8E'];

/**
 * Ruleta visual cuyos segmentos son proporcionales al stock de cada regalo
 * (más stock = segmento más grande = más probabilidad). La ganadora real
 * la decide el backend (onGirar); esta ruleta solo la anima visualmente
 * hasta apuntar al resultado.
 */
export default function RuletaRegalos({
  regalos,
  onGirar,
}: {
  regalos: Regalo[];
  onGirar: () => Promise<Regalo>;
}) {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0);
  const [ganador, setGanador] = useState<Regalo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = regalos.reduce((suma, r) => suma + r.stock, 0);
  let acumulado = 0;
  const segmentos = regalos.map((regalo, i) => {
    const inicio = (acumulado / total) * 360;
    acumulado += regalo.stock;
    const fin = (acumulado / total) * 360;
    return { regalo, inicio, fin, color: COLORES[i % COLORES.length] };
  });

  const gradiente = `conic-gradient(${segmentos.map((s) => `${s.color} ${s.inicio}deg ${s.fin}deg`).join(', ')})`;

  async function girar() {
    if (girando) return;
    setGirando(true);
    setError(null);
    try {
      const resultado = await onGirar();

      const segmento = segmentos.find((s) => s.regalo.id === resultado.id);
      const anguloMedio = segmento ? (segmento.inicio + segmento.fin) / 2 : 0;
      // El puntero está fijo arriba (0°); giramos varias vueltas completas
      // para el efecto y ajustamos para que el segmento ganador quede debajo.
      const vueltas = 5 * 360;
      const destino = vueltas + (360 - anguloMedio);

      setRotacion((prev) => prev + destino);

      setTimeout(() => {
        setGanador(resultado);
        setGirando(false);
      }, 3200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo girar la ruleta.');
      setGirando(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-64 w-64">
        <div
          className="h-full w-full rounded-full border-4 border-white shadow-lg transition-transform duration-[3000ms] ease-out"
          style={{ background: gradiente, transform: `rotate(${rotacion}deg)` }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 text-3xl" aria-hidden>
          🔻
        </div>
      </div>

      {!ganador ? (
        <button
          onClick={girar}
          disabled={girando}
          className="rounded-tag bg-hilo px-8 py-4 text-lg font-semibold text-white hover:bg-hilo-dark disabled:opacity-60"
        >
          {girando ? 'Girando...' : '🎡 Girar la ruleta'}
        </button>
      ) : (
        <p className="font-display text-2xl text-ink">🎉 ¡Ganaste: {ganador.nombre}!</p>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <ul className="flex flex-wrap justify-center gap-2 text-xs text-ink/50">
        {segmentos.map((s) => (
          <li key={s.regalo.id} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.regalo.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
