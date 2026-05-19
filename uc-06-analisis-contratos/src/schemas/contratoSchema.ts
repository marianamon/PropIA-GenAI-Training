import type Anthropic from '@anthropic-ai/sdk';
import type { AnalisisContrato } from '@propia/shared';
import { z } from 'zod';

export const NivelRiesgoSchema = z.enum(['ALTO', 'MEDIO', 'BAJO', 'INFORMATIVO']);

export const ClausulaContratoSchema = z.object({
  numero: z.number().int(),
  titulo: z.string(),
  contenido: z.string(),
  tipoRiesgo: NivelRiesgoSchema.optional(),
  notaRiesgo: z.string().optional(),
});

export const TipoContratoSchema = z.enum([
  'PROMESA_COMPRAVENTA',
  'COMPRAVENTA',
  'ARRENDAMIENTO',
  'OPCION_COMPRA',
]);

export const AnalisisContratoSchema = z.object({
  tipo: TipoContratoSchema,
  partes: z.object({
    vendedor: z.string(),
    comprador: z.string(),
    agente: z.string().optional(),
    notaria: z.string().optional(),
  }),
  valorTotal: z.number().positive(),
  arras: z.number().optional(),
  fechaFirma: z.string().optional(),
  fechaEntrega: z.string().optional(),
  clausulasRiesgo: z.array(ClausulaContratoSchema),
  scoreRiesgoGeneral: NivelRiesgoSchema,
  resumenEjecutivo: z.string().min(50),
  recomendaciones: z.array(z.string()).min(1),
  limitacionLegal: z.string(),
  fechaAnalisis: z.string().datetime(),
}) satisfies z.ZodType<AnalisisContrato>;

/**
 * Tool definition para el LLM en la fase REDUCE — fuerza JSON estructurado.
 * fechaAnalisis la pone el servidor (no se pide al LLM).
 */
export const REPORT_TOOL: Anthropic.Tool = {
  name: 'report_contract_analysis',
  description: 'Reporta el análisis consolidado del contrato como JSON estructurado',
  input_schema: {
    type: 'object',
    properties: {
      tipo: {
        type: 'string',
        enum: ['PROMESA_COMPRAVENTA', 'COMPRAVENTA', 'ARRENDAMIENTO', 'OPCION_COMPRA'],
      },
      partes: {
        type: 'object',
        properties: {
          vendedor: { type: 'string' },
          comprador: { type: 'string' },
          agente: { type: 'string' },
          notaria: { type: 'string' },
        },
        required: ['vendedor', 'comprador'],
      },
      valorTotal: { type: 'number', description: 'Valor total del contrato en COP' },
      arras: { type: 'number', description: 'Valor de arras en COP (opcional)' },
      fechaFirma: { type: 'string', description: 'Fecha de firma o "no especificada"' },
      fechaEntrega: { type: 'string', description: 'Fecha de entrega o "no especificada"' },
      clausulasRiesgo: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            numero: { type: 'integer' },
            titulo: { type: 'string' },
            contenido: { type: 'string', description: 'Resumen de la cláusula' },
            tipoRiesgo: { type: 'string', enum: ['ALTO', 'MEDIO', 'BAJO', 'INFORMATIVO'] },
            notaRiesgo: { type: 'string', description: 'Por qué es riesgosa' },
          },
          required: ['numero', 'titulo', 'contenido', 'tipoRiesgo'],
        },
      },
      scoreRiesgoGeneral: { type: 'string', enum: ['ALTO', 'MEDIO', 'BAJO', 'INFORMATIVO'] },
      resumenEjecutivo: { type: 'string', description: '2-3 párrafos resumiendo el contrato' },
      recomendaciones: { type: 'array', items: { type: 'string' } },
      limitacionLegal: {
        type: 'string',
        description: 'DEBE incluir: "Este análisis es orientativo y no reemplaza el concepto de un abogado."',
      },
    },
    required: [
      'tipo',
      'partes',
      'valorTotal',
      'clausulasRiesgo',
      'scoreRiesgoGeneral',
      'resumenEjecutivo',
      'recomendaciones',
      'limitacionLegal',
    ],
  },
};
