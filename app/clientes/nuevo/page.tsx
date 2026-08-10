'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClienteForm from '@/components/ClienteForm';
import { crearCliente } from '@/lib/clientes';
import type { NuevoCliente } from '@/types/pedido';

export default function NuevoClientePage() {
  const router = useRouter();

  async function guardar(datos: NuevoCliente) {
    const cliente = await crearCliente(datos);
    router.push(`/clientes/${cliente.id}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href="/clientes" className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Nuevo Cliente</h1>
      </header>

      <ClienteForm onGuardar={guardar} textoBoton="Guardar cliente" />
    </main>
  );
}
