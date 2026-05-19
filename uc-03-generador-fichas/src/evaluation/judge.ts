import Anthropic from '@anthropic-ai/sdk';
import type { FichaGenerada } from '../generator/fichaGenerator.js';

const anthropic = new Anthropic();

export interface JudgeScore {
  relevancia: number;
  atractivo: number;
  correccion: number;
  justificacion: string;
}

export async function evaluarFicha(
  propiedad: unknown,
  fichaGenerada: FichaGenerada,
): Promise<JudgeScore> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    temperature: 0.2,
    system: `Eres un evaluador experto en fichas inmobiliarias colombianas.
Evalúa fichas en una escala del 1 al 5 en tres dimensiones:
- relevancia: ¿los datos de la ficha coinciden con la propiedad? (sin alucinaciones)
- atractivo: ¿la ficha motivaría a un comprador a contactar?
- correccion: ¿usa vocabulario inmobiliario colombiano correcto (alcoba, apartamento, estrato, canon, sala-comedor)?

Retorna SOLO un objeto JSON con exactamente estos campos:
{ "relevancia": N, "atractivo": N, "correccion": N, "justificacion": "..." }
Sin texto adicional, sin code fences, sin comentarios.`,
    messages: [
      {
        role: 'user',
        content: `Evalúa esta ficha generada para la siguiente propiedad:

PROPIEDAD:
${JSON.stringify(propiedad, null, 2)}

FICHA GENERADA:
Título: ${fichaGenerada.titulo}
Descripción: ${fichaGenerada.descripcion}
Bullets:
${fichaGenerada.bullets.map((b) => `- ${b}`).join('\n')}

Retorna SOLO el JSON con relevancia, atractivo, correccion, justificacion.`,
      },
    ],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '{}';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Judge no retornó JSON válido. Texto: ${text.slice(0, 200)}`);
  }

  return JSON.parse(jsonMatch[0]) as JudgeScore;
}
