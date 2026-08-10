import Link from 'next/link';
import type { ReactNode } from 'react';

export default function BigButton({
  href,
  icon,
  label,
  variant = 'primary',
}: {
  href: string;
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary';
}) {
  const estilos =
    variant === 'primary'
      ? 'bg-hilo text-white hover:bg-hilo-dark'
      : 'bg-white text-ink border border-ink/10 hover:border-hilo/40';

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-tag p-6 text-center font-semibold shadow-sm transition-colors ${estilos}`}
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <span className="text-base">{label}</span>
    </Link>
  );
}
