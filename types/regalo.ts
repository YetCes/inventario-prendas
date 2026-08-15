export interface Regalo {
  id: string;
  nombre: string;
  foto: string | null;
  stock: number;
  activo: boolean;
  creado_en: string;
}

export interface NuevoRegalo {
  nombre: string;
  foto?: string | null;
  stock: number;
}
