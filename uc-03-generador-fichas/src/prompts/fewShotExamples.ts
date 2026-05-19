import type { FichaPropiedad, FichaGenerada } from '../generator/fichaGenerator.js';

export const fewShotExamples: Array<{ input: FichaPropiedad; output: FichaGenerada }> = [
  {
    input: {
      tipo: 'APARTAMENTO',
      estrato: 5,
      areaM2: 95,
      habitaciones: 3,
      banos: 2,
      garajes: 2,
      piso: 14,
      antiguedadAnios: 5,
      caracteristicas: ['piscina', 'gimnasio', 'vigilancia 24h', 'cuarto de servicio', 'vista panorámica'],
      operacion: 'VENTA',
      ubicacion: { barrio: 'El Poblado', ciudad: 'Medellín' },
      precio: { valor: 420_000_000, moneda: 'COP' },
    },
    output: {
      titulo: 'Apartamento con vista panorámica al Valle de Aburrá · El Poblado · Estrato 5',
      descripcion:
        'Viva en el corazón de El Poblado con una vista despejada al Valle de Aburrá desde el piso 14. Este espacioso apartamento de 95m² combina elegancia y funcionalidad: cocina integral con acabados de primera, sala-comedor amplia con luz natural todo el día, y tres alcobas con closets empotrados.\n\nEl edificio ofrece piscina, gimnasio equipado, vigilancia 24 horas con portería y acceso a salón comunal. Incluye cuarto de servicio con baño independiente y dos garajes cubiertos.\n\nUbicado en Provenza, a pasos de los mejores restaurantes y centros comerciales de Medellín. Acceso rápido a la avenida El Poblado y a 10 minutos del centro financiero.',
      bullets: [
        'Vista panorámica al Valle de Aburrá desde piso 14',
        'Piscina + gimnasio en áreas comunes',
        'Vigilancia 24h con portería',
        'Cuarto de servicio con baño independiente',
        '2 garajes cubiertos incluidos',
        'A pasos de Provenza · El Poblado',
      ],
    },
  },
  {
    input: {
      tipo: 'APARTAMENTO',
      estrato: 3,
      areaM2: 58,
      habitaciones: 3,
      banos: 2,
      garajes: 1,
      piso: 5,
      antiguedadAnios: 0,
      caracteristicas: ['VIS', 'subsidio Mi Casa Ya', 'piscina', 'cerca metro', 'obra nueva'],
      esVIS: true,
      operacion: 'VENTA',
      ubicacion: { barrio: 'San José', ciudad: 'Sabaneta' },
      precio: { valor: 195_000_000, moneda: 'COP' },
    },
    output: {
      titulo: 'Apartamento VIS de 3 alcobas en Sabaneta · Aplica Mi Casa Ya',
      descripcion:
        'Apartamento nuevo en proyecto de Sabaneta, una de las zonas con mejor calidad de vida del sur del Valle de Aburrá. 58m² distribuidos en tres alcobas, dos baños y cocina integral, ideal para familias que buscan su primera vivienda.\n\nEl edificio incluye piscina, salón social, zona infantil y portería 24 horas. Garaje cubierto numerado. A 8 minutos caminando de la estación Sabaneta del Metro, con acceso directo a Medellín en 20 minutos.\n\nEsta unidad VIS aplica para el subsidio Mi Casa Ya del gobierno y para subsidios de Caja de Compensación, lo que reduce significativamente el monto que debes financiar. Entrega inmediata.',
      bullets: [
        'VIS — aplica Mi Casa Ya + Caja de Compensación',
        '3 alcobas y 2 baños en 58m²',
        'Edificio con piscina, salón social y zona infantil',
        '8 minutos caminando del Metro Sabaneta',
        'Obra nueva con entrega inmediata',
        'Estrato 3 — servicios públicos con tarifa subsidiada',
      ],
    },
  },
  {
    input: {
      tipo: 'APARTAESTUDIO',
      estrato: 4,
      areaM2: 32,
      habitaciones: 1,
      banos: 1,
      garajes: 0,
      piso: 4,
      antiguedadAnios: 10,
      caracteristicas: ['amoblado', 'wifi incluido', 'cerca TransMilenio', 'cerca universidad', 'lavandería compartida'],
      amoblado: true,
      operacion: 'ARRIENDO',
      ubicacion: { barrio: 'Chapinero Central', ciudad: 'Bogotá' },
      precio: { valor: 1_650_000, moneda: 'COP' },
    },
    output: {
      titulo: 'Apartaestudio amoblado Chapinero · 1 cuadra de TransMilenio',
      descripcion:
        'Apartaestudio totalmente amoblado en Chapinero Central, a una cuadra de la estación Marly de TransMilenio y a 10 minutos caminando de la Universidad Javeriana. Ideal para estudiantes de posgrado o profesionales jóvenes que valoran ubicación y conexión.\n\n32m² aprovechados al máximo: cocineta integrada, escritorio para estudio o trabajo remoto y baño completo. Wifi de fibra incluido en el canon. El edificio cuenta con portería y lavandería compartida en el primer piso.\n\nChapinero ofrece una de las mejores ofertas gastronómicas y culturales de Bogotá, con cafés, librerías y centros culturales a poca distancia.',
      bullets: [
        'Amoblado y listo para mudarse',
        'A 1 cuadra de TransMilenio Marly',
        '10 minutos caminando de la Universidad Javeriana',
        'Wifi de fibra incluido en el canon',
        'Lavandería compartida y portería en edificio',
        'Canon: $1.650.000 — administración incluida',
      ],
    },
  },
];
