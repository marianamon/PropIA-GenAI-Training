import Anthropic from '@anthropic-ai/sdk';
import type { AnalisisContrato } from '@propia/shared';
import { AnalisisContratoSchema, REPORT_TOOL } from '../schemas/contratoSchema.js';
import type { ChunkAnalysis } from './mapAnalyzer.js';

const anthropic = new Anthropic();

const REDUCE_SYSTEM_PROMPT = `Eres un experto en análisis de contratos inmobiliarios colombianos.
Recibes los análisis parciales de varios chunks de un contrato y consolidas un reporte final.

REGLAS DE CONSOLIDACIÓN:
- Deduplica cláusulas que aparezcan en múltiples chunks (por overlap del splitter).
- scoreRiesgoGeneral se asigna así:
  - Si hay 1 o más cláusulas ALTO → scoreRiesgoGeneral = ALTO
  - Si hay 2 o más cláusulas MEDIO sin ALTO → scoreRiesgoGeneral = MEDIO
  - En otro caso → BAJO

CAMPOS OBLIGATORIOS DEL REPORTE (NO los omitas, son requeridos):
- tipo, partes (vendedor y comprador), valorTotal
- clausulasRiesgo: array (puede ser vacío si todo es BAJO)
- scoreRiesgoGeneral
- resumenEjecutivo: 2-3 párrafos
- **recomendaciones**: array de strings con al menos 1 recomendación accionable
  (por ejemplo: "Negociar reducción de la cláusula penal del 30% al 10-15%")
- **limitacionLegal**: string que DEBE incluir literalmente la frase:
  "Este análisis es orientativo y no reemplaza el concepto de un abogado."

USA la herramienta report_contract_analysis con TODOS los campos requeridos completos.`;

export async function reduceAnalysis(chunkResults: ChunkAnalysis[]): Promise<AnalisisContrato> {
  const consolidated = JSON.stringify(chunkResults, null, 2);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.2,
    system: REDUCE_SYSTEM_PROMPT,
    tools: [REPORT_TOOL],
    tool_choice: { type: 'tool', name: 'report_contract_analysis' },
    messages: [
      {
        role: 'user',
        content:
          `Consolida los análisis parciales de los chunks de este contrato y reporta vía la herramienta. ` +
          `Asegúrate de incluir TODOS los campos requeridos (recomendaciones, limitacionLegal, resumenEjecutivo).\n\n` +
          `Análisis de chunks:\n${consolidated}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('El LLM no usó la herramienta de análisis');
  }

  const raw = toolUse.input as Record<string, unknown>;

  // Defensa adicional: si el LLM ignoró limitacionLegal a pesar de ser required,
  // la inyectamos nosotros con el texto canónico.
  if (typeof raw.limitacionLegal !== 'string' || raw.limitacionLegal.length === 0) {
    raw.limitacionLegal = 'Este análisis es orientativo y no reemplaza el concepto de un abogado.';
  }
  if (!Array.isArray(raw.recomendaciones) || raw.recomendaciones.length === 0) {
    raw.recomendaciones = ['Revise este contrato con un abogado especializado antes de firmar.'];
  }

  return AnalisisContratoSchema.parse({
    ...raw,
    fechaAnalisis: new Date().toISOString(),
  });
}
