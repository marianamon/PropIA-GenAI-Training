export type TipoContrato =
  | 'PROMESA_COMPRAVENTA'
  | 'COMPRAVENTA'
  | 'ARRENDAMIENTO'
  | 'OPCION_COMPRA';

export type EstadoContrato =
  | 'BORRADOR'
  | 'EN_FIRMA'
  | 'FIRMADO'
  | 'EN_REGISTRO'
  | 'REGISTRADO'
  | 'CANCELADO';

export type NivelRiesgo = 'ALTO' | 'MEDIO' | 'BAJO' | 'INFORMATIVO';

export interface ClausulaContrato {
  numero: number;
  titulo: string;
  contenido: string;
  tipoRiesgo?: NivelRiesgo;
  notaRiesgo?: string;
}

export interface PartesContrato {
  vendedor: string;
  comprador: string;
  agente?: string;
  notaria?: string;
}

export interface Contrato {
  id: string;
  tipo: TipoContrato;
  propiedadId: string;
  compradorId: string;
  vendedorId: string;
  agenteId?: string;
  valor: number;
  moneda: 'COP';
  arras?: number;
  fechaFirma: string;
  fechaEntrega: string;
  clausulas: ClausulaContrato[];
  estado: EstadoContrato;
  documentoUrl: string;
}

export interface AnalisisContrato {
  contratoId?: string;
  tipo: TipoContrato;
  partes: PartesContrato;
  valorTotal: number;
  arras?: number;
  fechaFirma?: string;
  fechaEntrega?: string;
  clausulasRiesgo: ClausulaContrato[];
  scoreRiesgoGeneral: NivelRiesgo;
  resumenEjecutivo: string;
  recomendaciones: string[];
  limitacionLegal: string;
  fechaAnalisis: string;
}
