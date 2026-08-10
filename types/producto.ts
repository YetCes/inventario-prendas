export type Condicion = 'Nueva' | 'Seminueva' | 'Usada';

export type Estado = 'Disponible' | 'Reservado' | 'Vendido' | 'Entregado' | 'Retirado';

export const ESTADOS: Estado[] = ['Disponible', 'Reservado', 'Vendido', 'Entregado', 'Retirado'];

export const CONDICIONES: Condicion[] = ['Nueva', 'Seminueva', 'Usada'];

// Categorías y tallas sugeridas para los "chips" del formulario rápido.
// Son solo sugerencias iniciales: el campo sigue siendo texto libre.
export const CATEGORIAS_SUGERIDAS = [
  'Blusa',
  'Vestido',
  'Pantalón',
  'Polo',
  'Casaca',
  'Falda',
  'Short',
  'Conjunto',
  'Accesorio',
];

export const TALLAS_SUGERIDAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];

export interface Producto {
  id: string;
  codigo: string;
  foto_principal: string | null;
  fotos_adicionales: string[];
  categoria: string | null;
  tipo: string | null;
  marca: string | null;
  talla: string | null;
  color: string | null;
  condicion: Condicion | null;
  precio_venta: number | null;
  costo: number | null;
  ubicacion: string | null;
  observaciones: string | null;
  estado: Estado;
  fecha_ingreso: string;
  fecha_actualizacion: string;
}

// Campos que se pueden enviar al crear una prenda. Todo opcional salvo la foto,
// que se valida en el formulario (no en el tipo) para mantener esto simple.
export interface NuevoProducto {
  foto_principal?: string | null;
  fotos_adicionales?: string[];
  categoria?: string | null;
  tipo?: string | null;
  marca?: string | null;
  talla?: string | null;
  color?: string | null;
  condicion?: Condicion | null;
  precio_venta?: number | null;
  costo?: number | null;
  ubicacion?: string | null;
  observaciones?: string | null;
}

export interface ConteoInventario {
  total: number;
  disponibles: number;
  reservadas: number;
  vendidas: number;
  entregadas: number;
}
