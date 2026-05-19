import Anthropic from '@anthropic-ai/sdk';
import type { Propiedad } from '@propia/shared';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt.js';
import { fewShotExamples } from '../prompts/fewShotExamples.js';

const anthropic = new Anthropic();

export interface FichaGenerada {
  titulo: string;
  descripcion: string;
  bullets: string[];
}

export type ToneType = 'familiar' | 'lujo' | 'inversor';

const TONE_INSTRUCTIONS: Record<ToneType, string> = {
  familiar: 'Tono cercano y familiar. Enfocado en comodidad para familia con niños.',
  lujo: 'Tono premium y aspiracional. Enfocado en exclusividad, acabados y experiencia de vida.',
  inversor: 'Tono analítico. Enfocado en valorización del sector, canon potencial de arrendamiento y retorno de inversión.',
};

export type FichaPropiedad = Pick<
  Propiedad,
  | 'tipo'
  | 'estrato'
  | 'areaM2'
  | 'habitaciones'
  | 'banos'
  | 'garajes'
  | 'piso'
  | 'antiguedadAnios'
  | 'caracteristicas'
  | 'amoblado'
  | 'esVIS'
  | 'operacion'
> & {
  ubicacion: Pick<Propiedad['ubicacion'], 'barrio' | 'ciudad'>;
  precio: Pick<Propiedad['precio'], 'valor' | 'moneda'>;
};

function buildUserMessage(propiedad: FichaPropiedad, tone: ToneType): string {
  return `ANALIZA este inmueble y genera la ficha:

DATOS DEL INMUEBLE:
- Tipo: ${propiedad.tipo} · Estrato ${propiedad.estrato}
- Ubicación: ${propiedad.ubicacion.barrio}, ${propiedad.ubicacion.ciudad}
- Área: ${propiedad.areaM2}m² · Piso ${propiedad.piso ?? 'No aplica'}
- Habitaciones: ${propiedad.habitaciones} · Baños: ${propiedad.banos} · Garajes: ${propiedad.garajes}
- Antigüedad: ${propiedad.antiguedadAnios} años
- Características: ${propiedad.caracteristicas.join(', ')}
- Precio: $${(propiedad.precio.valor / 1_000_000).toFixed(0)}M ${propiedad.precio.moneda}
- Operación: ${propiedad.operacion}
${propiedad.amoblado ? '- Amoblado: Sí' : ''}
${propiedad.esVIS ? '- Aplica subsidios VIS' : ''}

TONO REQUERIDO: ${TONE_INSTRUCTIONS[tone]}

PROCESO:
1. Primero identifica los 3 puntos más fuertes de este inmueble (piensa en voz alta brevemente).
2. Identifica el buyer persona ideal para esta propiedad.
3. Genera la ficha final como un único objeto JSON, sin texto adicional después.`;
}

export async function generarFicha(
  propiedad: FichaPropiedad,
  tone: ToneType = 'familiar',
): Promise<FichaGenerada> {
  const fewShotMessages: Anthropic.MessageParam[] = fewShotExamples.flatMap((ex) => [
    { role: 'user' as const, content: buildUserMessage(ex.input, tone) },
    { role: 'assistant' as const, content: JSON.stringify(ex.output) },
  ]);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [...fewShotMessages, { role: 'user', content: buildUserMessage(propiedad, tone) }],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '{}';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`El LLM no retornó JSON válido. Texto: ${text.slice(0, 200)}`);
  }

  return JSON.parse(jsonMatch[0]) as FichaGenerada;
}
