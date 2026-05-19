import type { Ubicacion } from './propiedad.js';

export type NivelConfianza = 'ALTA' | 'MEDIA' | 'BAJA';

export interface Comparable {
  propiedadId: string;
  titulo: string;
  ubicacion: Ubicacion;
  areaM2: number;
  habitaciones: number;
  estrato: number;
  precioVenta: number;
  fechaOperacion: string;
  scoreSimilititud: number;
}

export interface Valuacion {
  valorMin: number;
  valorMax: number;
  valorSugerido: number;
  moneda: 'COP';
  confianza: NivelConfianza;
  comparablesUsados: number;
  justificacion: string;
  factoresPositivos: string[];
  factoresNegativos: string[];
  fechaValuacion: string;
}
