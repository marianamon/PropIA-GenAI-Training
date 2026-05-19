import type Anthropic from '@anthropic-ai/sdk';
import type { Valuacion } from '@propia/shared';
import { z } from 'zod';

export const NivelConfianzaSchema = z.enum(['ALTA', 'MEDIA', 'BAJA']);

export const ValuacionSchema = z.object({
  valorMin: z.number().positive(),
  valorMax: z.number().positive(),
  valorSugerido: z.number().positive(),
  moneda: z.literal('COP'),
  confianza: NivelConfianzaSchema,
  comparablesUsados: z.number().int().min(0),
  justificacion: z.string().min(50),
  factoresPositivos: z.array(z.string()).min(1),
  factoresNegativos: z.array(z.string()),
  fechaValuacion: z.string().datetime(),
}) satisfies z.ZodType<Valuacion>;

/**
 * Tool definition para Claude. El LLM debe llamar esta tool con el resultado
 * de su análisis — tool_use garantiza JSON estructurado válido.
 */
export const VALUATION_TOOL: Anthropic.Tool = {
  name: 'report_valuation',
  description: 'Reporta el resultado del análisis de valoración de la propiedad',
  input_schema: {
    type: 'object',
    properties: {
      valorMin: { type: 'number', description: 'Valor mínimo estimado en COP' },
      valorMax: { type: 'number', description: 'Valor máximo estimado en COP' },
      valorSugerido: { type: 'number', description: 'Valor sugerido de publicación en COP' },
      moneda: { type: 'string', enum: ['COP'] },
      confianza: {
        type: 'string',
        enum: ['ALTA', 'MEDIA', 'BAJA'],
        description: 'ALTA: 4+ comparables muy similares. MEDIA: 2-3 comparables. BAJA: <2 comparables',
      },
      comparablesUsados: { type: 'integer', description: 'Número de comparables analizados' },
      justificacion: { type: 'string', description: 'Explicación del rango en 2-3 párrafos' },
      factoresPositivos: {
        type: 'array',
        items: { type: 'string' },
        description: 'Factores que suben el precio (ubicación, vista, acabados, etc.)',
      },
      factoresNegativos: {
        type: 'array',
        items: { type: 'string' },
        description: 'Factores que bajan el precio (antigüedad, ruido, etc.)',
      },
    },
    required: [
      'valorMin',
      'valorMax',
      'valorSugerido',
      'moneda',
      'confianza',
      'comparablesUsados',
      'justificacion',
      'factoresPositivos',
      'factoresNegativos',
    ],
  },
};
