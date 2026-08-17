'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ENLACES = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/prendas/nueva', label: 'Nueva Prenda', icon: '➕' },
  { href: '/inventario', label: 'Inventario', icon: '🗂️' },
  { href: '/etiquetas', label: 'Etiquetas', icon: '🏷️' },
  { href: '/venta-rapida', label: 'Venta rápida', icon: '⚡' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
  { href: '/pedidos', label: 'Pedidos', icon: '📦' },
  { href: '/preparacion', label: 'Preparar pedido', icon: '📷' },
  { href: '/pagos-pendientes', label: 'Pagos pendientes', icon: '💳' },
  { href: '/regalos', label: 'Regalos', icon: '🎁' },
];

export default function Sidebar() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  // La vista pública del cliente (/p/[token]) no debe mostrar la navegación interna.
  if (pathname?.startsWith('/p/')) return null;

  return (
    <>
      <div className="flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3 md:hidden">
        <button onClick={() => setAbierto(true)} aria-label="Abrir menú" className="text-2xl leading-none">
          ☰
        </button>
        <span className="font-display text-lg text-ink">Inventario</span>
        <span className="w-6" aria-hidden />
      </div>

      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 md:static md:z-auto md:w-56 md:flex-shrink-0 md:translate-x-0 md:border-r md:border-ink/10 md:shadow-none ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <span className="font-display text-xl text-ink">Inventario</span>
          <button onClick={() => setAbierto(false)} className="text-xl md:hidden" aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 pb-6">
          {ENLACES.map((enlace) => {
            const activo = pathname === enlace.href;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                onClick={() => setAbierto(false)}
                className={`flex items-center gap-3 rounded-tag px-3 py-2 text-sm font-medium ${
                  activo ? 'bg-hilo-light text-hilo-dark' : 'text-ink/70 hover:bg-paper'
                }`}
              >
                <span aria-hidden>{enlace.icon}</span>
                {enlace.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
