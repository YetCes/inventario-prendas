'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ClienteForm from '@/components/ClienteForm';
import { actualizarCliente, obtenerClientePorId } from '@/lib/clientes';
import type { Cliente, NuevoCliente } from '@/types/pedido';

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerClientePorId(params.id)
      .then(setCliente)
      .finally(() => setCargando(false));
  }, [params.id]);

  async function guardar(datos: NuevoCliente) {
    await actualizarCliente(params.id, datos);
    router.push(`/clientes/${params.id}`);
  }

  if (cargando) return <p className="py-20 text-center text-ink/40">Cargando...</p>;
  if (!cliente) return <p className="py-20 text-center text-ink/40">No se encontró este cliente.</p>;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-5 py-8">
      <header>
        <Link href={`/clientes/${params.id}`} className="text-sm text-ink/50">
          ← Volver
        </Link>
        <h1 className="font-display text-3xl text-ink">Editar Cliente</h1>
      </header>

      <ClienteForm valoresIniciales={cliente} onGuardar={guardar} textoBoton="Guardar cambios" />
    </main>
  );
}
