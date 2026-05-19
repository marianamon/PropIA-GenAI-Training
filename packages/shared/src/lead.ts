export type EstadoLead =
  | 'NUEVO'
  | 'CONTACTADO'
  | 'EN_VISITA'
  | 'EN_NEGOCIACION'
  | 'CERRADO_GANADO'
  | 'CERRADO_PERDIDO'
  | 'INACTIVO';

export type CanalOrigen =
  | 'WEB'
  | 'WHATSAPP'
  | 'LLAMADA'
  | 'EMAIL'
  | 'REFERIDO'
  | 'PORTALES_EXTERNOS';

export interface Lead {
  id: string;
  propiedadId: string;
  usuarioId: string;
  agenteId?: string;
  estado: EstadoLead;
  canal: CanalOrigen;
  mensaje: string;
  notas: string[];
  ultimoContacto: string;
  proximaAccion?: string;
  creadoAt: string;
  nombreProspecto: string;
  telefonoProspecto: string;
  emailProspecto?: string;
}
