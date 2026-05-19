import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import type { Propiedad } from '@propia/shared';
import { semanticSearch } from '../../../uc-01-busqueda-semantica/src/search.js';
import { executeTool as executeLeadTool } from '../../../uc-05-agente-leads/src/tools/toolExecutors.js';
import { generarFicha } from '../../../uc-03-generador-fichas/src/generator/fichaGenerator.js';
import { valorarPropiedad } from '../../../uc-04-valoracion-asistida/src/valuation/valuationEngine.js';
import { loadAndChunkPDF } from '../../../uc-06-analisis-contratos/src/document/pdfProcessor.js';
import { analyzeChunk } from '../../../uc-06-analisis-contratos/src/analysis/mapAnalyzer.js';
import { reduceAnalysis } from '../../../uc-06-analisis-contratos/src/analysis/reduceAnalyzer.js';

const PROPIEDADES_PATH = resolve(process.cwd(), 'data/seeds/propiedades.json');
const PROPIEDADES: Propiedad[] = JSON.parse(readFileSync(PROPIEDADES_PATH, 'utf-8'));

function getPropertyById(id: string): Propiedad {
  const p = PROPIEDADES.find((x) => x.id === id);
  if (!p) throw new Error(`Propiedad no encontrada: ${id}`);
  return p;
}

/**
 * Tools expuestas vía MCP. Cada descripción está pensada para que Claude
 * decida cuándo invocarlas — un "Usa esto cuando…" es la pista principal.
 */
export const TOOLS: Tool[] = [
  {
    name: 'search_properties',
    description:
      'Busca propiedades del catálogo PropIA usando lenguaje natural. ' +
      'Usa esto cuando Federico pregunta por propiedades con características específicas ' +
      '(ej: "aptos de 3 hab en El Poblado bajo $700M").',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Descripción en lenguaje natural de lo que busca' },
        ciudad: { type: 'string', description: 'Ciudad (opcional): Medellín, Bogotá, etc.' },
        precioMax: { type: 'number', description: 'Precio máximo en COP (opcional)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_leads',
    description:
      'Consulta los leads del agente inmobiliario. Usa esto cuando Federico pregunta por ' +
      'sus clientes, prospectos o leads (ej: "¿cuántos leads nuevos tengo?", ' +
      '"leads sin contacto en más de 5 días").',
    inputSchema: {
      type: 'object',
      properties: {
        agenteId: { type: 'string', description: 'ID del agente (ej: "juanfe-001")' },
        estado: {
          type: 'string',
          enum: ['NUEVO', 'CONTACTADO', 'EN_VISITA', 'EN_NEGOCIACION', 'INACTIVO', 'CERRADO'],
          description: 'Filtrar por estado (omitir para todos)',
        },
        diasSinContacto: { type: 'number', description: 'Solo leads con N+ días sin actividad' },
      },
      required: ['agenteId'],
    },
  },
  {
    name: 'update_lead_status',
    description:
      'Actualiza el estado de un lead específico. Usa esto cuando Federico dice cosas como ' +
      '"marca el lead L-005 como contactado" o "ese lead ya se cerró".',
    inputSchema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        nuevoEstado: {
          type: 'string',
          enum: ['NUEVO', 'CONTACTADO', 'EN_VISITA', 'EN_NEGOCIACION', 'INACTIVO', 'CERRADO'],
        },
        nota: { type: 'string', description: 'Razón del cambio (opcional)' },
      },
      required: ['leadId', 'nuevoEstado'],
    },
  },
  {
    name: 'generate_listing',
    description:
      'Genera una ficha de venta profesional para una propiedad usando un tono específico. ' +
      'Usa esto cuando Federico quiere crear o mejorar la descripción de una propiedad.',
    inputSchema: {
      type: 'object',
      properties: {
        propiedadId: { type: 'string', description: 'ID de la propiedad (ej: "prop-mde-041")' },
        tone: {
          type: 'string',
          enum: ['familiar', 'lujo', 'inversor'],
          description: 'Tono de la ficha (default: familiar)',
        },
      },
      required: ['propiedadId'],
    },
  },
  {
    name: 'get_valuation',
    description:
      'Obtiene una valoración de mercado para una propiedad usando comparables del catálogo. ' +
      'Usa esto cuando Federico o un cliente pregunta si un precio es razonable o cuánto puede pedir.',
    inputSchema: {
      type: 'object',
      properties: {
        propiedadId: { type: 'string', description: 'ID de la propiedad a valorar' },
      },
      required: ['propiedadId'],
    },
  },
  {
    name: 'analyze_contract',
    description:
      'Analiza un contrato inmobiliario en PDF y devuelve un reporte de riesgo. ' +
      'Usa esto cuando Federico te comparte la ruta a un contrato y quiere saber qué cláusulas son peligrosas.',
    inputSchema: {
      type: 'object',
      properties: {
        pdfPath: {
          type: 'string',
          description: 'Ruta absoluta o relativa al PDF del contrato',
        },
      },
      required: ['pdfPath'],
    },
  },
];

/**
 * Dispatcher de tools. Todas las excepciones se convierten a `{ isError: true }`
 * para que un fallo en una tool no tumbe el servidor MCP.
 */
export async function callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
  try {
    switch (name) {
      case 'search_properties': {
        const results = await semanticSearch(args.query as string, {
          ciudad: args.ciudad as string | undefined,
          precioMax: args.precioMax as number | undefined,
        });
        return ok({ total: results.length, results });
      }

      case 'get_leads': {
        const leads = await executeLeadTool('get_leads', args);
        return ok(leads);
      }

      case 'update_lead_status': {
        const updated = await executeLeadTool('update_lead_status', args);
        return ok(updated);
      }

      case 'generate_listing': {
        const propiedad = getPropertyById(args.propiedadId as string);
        const tone = (args.tone as 'familiar' | 'lujo' | 'inversor' | undefined) ?? 'familiar';
        const ficha = await generarFicha(propiedad, tone);
        return ok(ficha);
      }

      case 'get_valuation': {
        const propiedad = getPropertyById(args.propiedadId as string);
        const valuacion = await valorarPropiedad(propiedad);
        return ok(valuacion);
      }

      case 'analyze_contract': {
        const pdfPath = args.pdfPath as string;
        const chunks = await loadAndChunkPDF(pdfPath);
        const chunkResults = await Promise.all(chunks.map((c) => analyzeChunk(c.text, c.chunkIndex)));
        const analisis = await reduceAnalysis(chunkResults);
        return ok({
          analisis,
          meta: {
            chunksAnalizados: chunks.length,
            clausulasDetectadas: analisis.clausulasRiesgo.length,
            scoreRiesgoGeneral: analisis.scoreRiesgoGeneral,
          },
        });
      }

      default:
        return {
          content: [{ type: 'text', text: `Herramienta desconocida: ${name}` }],
          isError: true,
        };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return {
      content: [{ type: 'text', text: `Error en ${name}: ${message}` }],
      isError: true,
    };
  }
}

function ok(payload: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] };
}

export function getCatalog(): Propiedad[] {
  return PROPIEDADES;
}
