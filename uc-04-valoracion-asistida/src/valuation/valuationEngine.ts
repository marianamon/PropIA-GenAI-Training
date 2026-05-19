import Anthropic from '@anthropic-ai/sdk';
import type { Propiedad, Valuacion } from '@propia/shared';
import { buscarComparables } from '../comparables/comparablesSearch.js';
import { VALUATION_TOOL, ValuacionSchema } from '../schemas/valuacionSchema.js';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Eres un perito inmobiliario colombiano certificado, especializado en
valoración de propiedades en Medellín y Bogotá.

Tu proceso de valoración SIEMPRE sigue estos pasos:
1. Analiza las características del inmueble a valorar
2. Revisa los comparables disponibles y evalúa su similitud
3. Aplica ajustes por: piso, antigüedad, características diferenciales, estado del mercado
4. Calcula un rango conservador (±10-15% del valor central)
5. Determina el nivel de confianza según la cantidad y calidad de comparables
6. Usa la herramienta report_valuation para reportar el resultado

REGLAS CRÍTICAS:
- Valores siempre en COP (pesos colombianos), enteros (sin decimales)
- Si tienes menos de 2 comparables, la confianza es BAJA siempre
- Si el inmueble está en zona sin comparables directos, amplía el rango
- NUNCA inventes comparables — solo usa los que te proporcionan
- La justificación debe mencionar específicamente al menos 2 comparables usados`;

type ValuationInput = Pick<
  Propiedad,
  | 'id'
  | 'tipo'
  | 'operacion'
  | 'estrato'
  | 'areaM2'
  | 'habitaciones'
  | 'banos'
  | 'garajes'
  | 'piso'
  | 'antiguedadAnios'
  | 'caracteristicas'
> & {
  ubicacion: Pick<Propiedad['ubicacion'], 'barrio' | 'ciudad'>;
};

export async function valorarPropiedad(propiedad: ValuationInput): Promise<Valuacion> {
  // 1. Construir query de búsqueda
  const query =
    `${propiedad.tipo} ${propiedad.areaM2}m² Estrato ${propiedad.estrato} ` +
    `${propiedad.ubicacion.barrio} ${propiedad.ubicacion.ciudad} ` +
    `${propiedad.habitaciones} habitaciones`;

  // 2. Recuperar comparables del vector DB (excluyendo la propia propiedad si está indexada)
  const comparables = await buscarComparables(query, {
    ciudad: propiedad.ubicacion.ciudad,
    estratoMin: Math.max(1, propiedad.estrato - 1),
    estratoMax: Math.min(6, propiedad.estrato + 1),
    excluirId: propiedad.id,
  });

  // 3. Construir mensaje con datos de la propiedad y comparables
  const comparablesTexto = comparables.length === 0
    ? 'NO HAY COMPARABLES DISPONIBLES — la confianza debe ser BAJA y el rango muy amplio.'
    : comparables.map((c, i) => {
        const precio = typeof c.metadata['precio'] === 'number' ? c.metadata['precio'] : 0;
        return `[${i + 1}] Similitud: ${(c.scoreSimilititud * 100).toFixed(0)}%
  ${c.documento}
  Precio: $${(precio / 1_000_000).toFixed(0)}M COP`;
      }).join('\n\n');

  const userMessage = `PROPIEDAD A VALORAR:
Tipo: ${propiedad.tipo} · Operación: ${propiedad.operacion} · Estrato ${propiedad.estrato}
Ubicación: ${propiedad.ubicacion.barrio}, ${propiedad.ubicacion.ciudad}
Área: ${propiedad.areaM2}m² · Piso ${propiedad.piso ?? 'Casa'}
Habitaciones: ${propiedad.habitaciones} · Baños: ${propiedad.banos} · Garajes: ${propiedad.garajes}
Antigüedad: ${propiedad.antiguedadAnios} años
Características: ${propiedad.caracteristicas.join(', ')}

NOTA: Si la operación es ARRIENDO, el valor reportado debe ser el canon mensual (no precio de venta).

COMPARABLES DISPONIBLES (${comparables.length}):
${comparablesTexto}

Analiza y usa la herramienta report_valuation con el resultado.`;

  // 4. Llamar al LLM con tool_use
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    tools: [VALUATION_TOOL],
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content: userMessage }],
  });

  // 5. Extraer el tool_use del response
  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('El LLM no usó la herramienta de valoración');
  }

  // 6. Validar con Zod — agrega fechaValuacion (el tool no la pide, la pone el servidor)
  const valuacion = ValuacionSchema.parse({
    ...(toolUse.input as object),
    fechaValuacion: new Date().toISOString(),
  });

  return valuacion;
}
