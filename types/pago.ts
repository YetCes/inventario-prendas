export type MetodoPago = 'Yape' | 'Efectivo' | 'Transferencia' | 'Otro';
export type EstadoValidacion = 'Pendiente' | 'Validado' | 'Rechazado';

export const METODOS_PAGO: MetodoPago[] = ['Yape', 'Efectivo', 'Transferencia', 'Otro'];

export interface Pago {
  id: string;
  pedido_id: string;
  monto: number;
  metodo: MetodoPago;
  yape_referencia: string | null;
  yape_comprobante: string | null;
  fecha: string;
  estado_validacion: EstadoValidacion;
}

export interface NuevoPago {
  pedido_id: string;
  monto: number;
  metodo: MetodoPago;
  yape_referencia?: string | null;
  yape_comprobante?: string | null;
}

// Pago con datos del pedido/cliente ya resueltos, para la lista de "Pagos pendientes".
export interface PagoConPedido extends Pago {
  pedido_codigo: string;
  cliente_nombre: string;
}
