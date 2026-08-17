import type { Producto } from './producto';
import type { Regalo } from './regalo';

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  creado_en: string;
}

export interface NuevoCliente {
  nombre: string;
  telefono?: string | null;
  whatsapp?: string | null;
  direccion?: string | null;
}

export type OrigenPedido = 'TikTok Live' | 'WhatsApp' | 'Otro';
export type EstadoPedido = 'Abierto' | 'Confirmado' | 'Entregado' | 'Cancelado';

export const ESTADOS_PEDIDO: EstadoPedido[] = ['Abierto', 'Confirmado', 'Entregado', 'Cancelado'];

export type ConfirmacionCliente = 'Pendiente' | 'Aceptado' | 'Observado';

export interface Pedido {
  id: string;
  codigo: string;
  cliente_id: string;
  origen: OrigenPedido;
  estado: EstadoPedido;
  creado_en: string;
  incluye_regalo: boolean;
  regalo_id: string | null;
  regalo_asignado_en: string | null;
  enlace_token: string;
  confirmacion_cliente: ConfirmacionCliente;
}

// Pedido con sus datos relacionados ya resueltos, tal como se
// necesita para mostrar la pantalla de detalle de un pedido.
export interface PedidoConDetalle extends Pedido {
  cliente: Cliente;
  productos: Producto[];
  total: number;
  regalo: Regalo | null;
}

// Pedido resumido para listar en "Pedidos" y en el historial de un cliente.
export interface PedidoResumen extends Pedido {
  cliente: Cliente;
  cantidad_prendas: number;
  total: number;
}
