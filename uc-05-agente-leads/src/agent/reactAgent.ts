import Anthropic from '@anthropic-ai/sdk';
import { AGENT_TOOLS } from '../tools/toolDefinitions.js';
import { executeTool } from '../tools/toolExecutors.js';

const anthropic = new Anthropic();

const AGENT_SYSTEM_PROMPT = `Eres el asistente de gestión de leads de un agente inmobiliario en Colombia.

Tu objetivo: revisar TODOS los leads activos del agente y tomar las acciones de seguimiento apropiadas.

REGLAS DE NEGOCIO:
- Leads NUEVO con > 24h sin contacto: enviar WhatsApp de presentación y cambiar estado a CONTACTADO.
- Leads CONTACTADO con > 3 días sin respuesta: enviar UN solo follow-up; si lleva > 7 días sin respuesta marca INACTIVO.
- Leads EN_VISITA con fecha pasada: enviar follow-up post-visita inmediato.
- Leads EN_NEGOCIACION: agregar nota con estado y próxima acción concreta.
- Leads CERRADO_GANADO o CERRADO_PERDIDO o INACTIVO: NO tomar acción, solo reconocerlos.

REGLAS CRÍTICAS:
- NUNCA envíes más de 1 mensaje al mismo lead en la misma ejecución.
- SIEMPRE agrega una nota con el motivo de cada acción que tomes.
- Usa vocabulario inmobiliario colombiano (alcoba, apartamento, canon, estrato).
- Para mensajes WhatsApp: tono cercano profesional, máximo 300 caracteres, en español colombiano.

PROCESO:
1. Llama get_leads para obtener el panorama actual.
2. Razona en voz alta qué acción corresponde a cada lead según las reglas.
3. Ejecuta las acciones (send_whatsapp, schedule_visit, update_lead_status, add_note).
4. Cuando termines TODOS los leads, responde con un texto resumen de las acciones tomadas y termina.`;

export interface AgentStep {
  type: 'tool_call' | 'tool_result' | 'thought' | 'finish';
  content: unknown;
  timestamp: string;
}

export interface AgentRunResult {
  steps: AgentStep[];
  iterations: number;
  finished: boolean;
  finalMessage: string;
}

const MAX_ITERATIONS = 20;

export async function runLeadAgent(agenteId: string): Promise<AgentRunResult> {
  const steps: AgentStep[] = [];
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `Revisa y gestiona los leads del agente con ID: ${agenteId}.
Empieza llamando get_leads para ver el panorama, luego toma las acciones necesarias para cada lead activo.`,
    },
  ];

  let iteration = 0;
  let finalMessage = '';
  let finished = false;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: AGENT_SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    // Capturar el texto de razonamiento del LLM (pensamiento entre tool_calls)
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim().length > 0) {
        steps.push({ type: 'thought', content: block.text, timestamp: new Date().toISOString() });
      }
    }

    if (response.stop_reason === 'end_turn') {
      const lastText = response.content.find((b) => b.type === 'text');
      finalMessage = lastText && lastText.type === 'text' ? lastText.text : '';
      steps.push({ type: 'finish', content: finalMessage, timestamp: new Date().toISOString() });
      finished = true;
      break;
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUseBlocks.length === 0) break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      steps.push({
        type: 'tool_call',
        content: { name: block.name, input: block.input },
        timestamp: new Date().toISOString(),
      });

      try {
        const result = await executeTool(block.name, block.input as Record<string, unknown>);
        steps.push({ type: 'tool_result', content: result, timestamp: new Date().toISOString() });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        steps.push({ type: 'tool_result', content: { error: msg }, timestamp: new Date().toISOString() });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: `Error: ${msg}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  return { steps, iterations: iteration, finished, finalMessage };
}
