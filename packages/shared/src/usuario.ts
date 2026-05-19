import type { TipoPropiedad } from './propiedad.js';

export type TipoUsuario = 'COMPRADOR' | 'VENDEDOR' | 'AGENTE' | 'CONSTRUCTORA' | 'ADMIN';

export interface PreferenciasComprador {
  presupuestoMin: number;
  presupuestoMax: number;
  ciudades: string[];
  barrios?: string[];
  tiposPropiedad: TipoPropiedad[];
  estratos: number[];
  habitacionesMin: number;
  areaMinM2?: number;
  caracteristicasDeseadas: string[];
  descripcionLibre?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipo: TipoUsuario;
  ciudad: string;
  preferencias?: PreferenciasComprador;
  creadoAt: string;
  activo: boolean;
}

export interface Agente {
  id: string;
  usuarioId: string;
  licencia: string;
  empresa?: string;
  especializacion: string[];
  ciudades: string[];
  propiedadesActivas: number;
  calificacion: number;
  resenas: number;
}
