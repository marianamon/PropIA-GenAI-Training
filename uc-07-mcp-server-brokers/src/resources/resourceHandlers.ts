import type { ReadResourceResult, Resource } from '@modelcontextprotocol/sdk/types.js';
import { executeTool as executeLeadTool } from '../../../uc-05-agente-leads/src/tools/toolExecutors.js';
import { getCatalog } from '../tools/toolHandlers.js';

/**
 * Resources MCP: datos navegables expuestos como URIs.
 * A diferencia de las tools, los resources son "read-only" y representan estado.
 */
export const RESOURCES: Resource[] = [
  {
    uri: 'propiedades://catalogo',
    name: 'Catálogo de propiedades',
    description: 'Todas las propiedades publicadas en PropIA (snapshot del seed actual).',
    mimeType: 'application/json',
  },
  {
    uri: 'leads://agente-juanfe-001/activos',
    name: 'Leads activos de Federico',
    description: 'Lista de todos los leads del agente agente-juanfe-001 (todos los estados).',
    mimeType: 'application/json',
  },
];

export async function readResource(uri: string): Promise<ReadResourceResult> {
  if (uri === 'propiedades://catalogo') {
    const catalogo = getCatalog();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ total: catalogo.length, propiedades: catalogo }, null, 2),
        },
      ],
    };
  }

  if (uri === 'leads://agente-juanfe-001/activos') {
    const leads = await executeLeadTool('get_leads', { agenteId: 'agente-juanfe-001' });
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(leads, null, 2),
        },
      ],
    };
  }

  throw new Error(`Resource no encontrado: ${uri}`);
}
