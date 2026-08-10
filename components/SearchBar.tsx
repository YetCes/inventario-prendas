'use client';

export default function SearchBar({
  valor,
  onCambiar,
}: {
  valor: string;
  onCambiar: (valor: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-ink/30" aria-hidden>
        🔍
      </span>
      <input
        type="search"
        inputMode="search"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        placeholder="Buscar por código, tipo, talla, color, ubicación..."
        className="w-full rounded-tag border border-ink/10 bg-white py-4 pl-12 pr-4 text-base shadow-sm outline-none focus:border-hilo"
      />
    </div>
  );
}
