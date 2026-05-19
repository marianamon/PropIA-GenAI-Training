export type TipoPropiedad =
  | 'APARTAMENTO'
  | 'APARTAESTUDIO'
  | 'CASA'
  | 'CASA_LOTE'
  | 'OFICINA'
  | 'LOCAL_COMERCIAL'
  | 'BODEGA'
  | 'LOTE'
  | 'FINCA'
  | 'PARQUEADERO';

export type TipoOperacion = 'VENTA' | 'ARRIENDO' | 'VENTA_Y_ARRIENDO';

export type EstadoPropiedad =
  | 'BORRADOR'
  | 'PUBLICADA'
  | 'EN_NEGOCIACION'
  | 'VENDIDA'
  | 'ARRENDADA'
  | 'PAUSADA'
  | 'ELIMINADA';

export type Estrato = 1 | 2 | 3 | 4 | 5 | 6;

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface Ubicacion {
  pais: 'Colombia';
  departamento: string;
  ciudad: string;
  barrio: string;
  direccion: string;
  coordenadas?: Coordenadas;
}

export interface Precio {
  valor: number;
  moneda: 'COP' | 'USD';
  negociable: boolean;
  adminIncluida: boolean;
  valorAdmin?: number;
}

export interface Propiedad {
  id: string;
  tipo: TipoPropiedad;
  operacion: TipoOperacion;

  titulo: string;
  descripcion: string;

  ubicacion: Ubicacion;
  estrato: Estrato;

  areaM2: number;
  areaConstruidaM2?: number;
  habitaciones: number;
  banos: number;
  garajes: number;
  piso?: number;
  pisosTotalesEdificio?: number;
  antiguedadAnios: number;

  caracteristicas: string[];
  amoblado?: boolean;

  precio: Precio;
  imagenes: string[];

  publicadoAt: string;
  actualizadoAt: string;
  estado: EstadoPropiedad;

  propietarioId: string;
  agenteId?: string;

  esVIS?: boolean;
  esVIP?: boolean;
  subsidiosAplicables?: string[];
}
