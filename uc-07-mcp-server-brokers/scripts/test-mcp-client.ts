import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { resolve } from 'node:path';

/**
 * Cliente MCP de prueba — simula lo que haría Claude Desktop.
 * Lanza el servidor como subproceso vía stdio y ejerce:
 *   1. listTools, listResources
 *   2. callTool(get_leads) — no requiere LLM
 *   3. callTool(search_properties) — requiere ChromaDB + embeddings (no LLM)
 *   4. readResource(propiedades://catalogo)
 *   5. callTool con tool inválido — debe retornar isError, no crash
 *
 * Las tools que requieren LLM (generate_listing, get_valuation, analyze_contract)
 * no se prueban aquí — necesitan una API key real.
 */
async function main(): Promise<void> {
  const repoRoot = resolve(import.meta.dirname, '../..');
  const serverPath = resolve(repoRoot, 'uc-07-mcp-server-brokers/src/server.ts');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', serverPath],
    cwd: repoRoot, // CRÍTICO: replica lo que hará Claude Desktop
    env: {
      ...(process.env as Record<string, string>),
    },
  });

  const client = new Client({ name: 'propia-test-client', version: '0.0.1' });
  await client.connect(transport);
  console.log('✓ Conectado al servidor');

  // 1. List tools
  const tools = await client.listTools();
  console.log(`✓ Tools listadas: ${tools.tools.length} (${tools.tools.map((t) => t.name).join(', ')})`);

  // 2. List resources
  const resources = await client.listResources();
  console.log(`✓ Resources listados: ${resources.resources.length} (${resources.resources.map((r) => r.uri).join(', ')})`);

  // 3. get_leads (no LLM, lee data/seeds/leads.json)
  const leads = await client.callTool({
    name: 'get_leads',
    arguments: { agenteId: 'agente-juanfe-001' },
  });
  const leadsContent = (leads.content as Array<{ type: string; text: string }>)[0];
  const parsedLeads = JSON.parse(leadsContent.text) as unknown[];
  console.log(`✓ get_leads: ${parsedLeads.length} leads del agente agente-juanfe-001`);

  // 4. search_properties (ChromaDB + embeddings, sin LLM)
  const search = await client.callTool({
    name: 'search_properties',
    arguments: { query: 'apartamento moderno en El Poblado', precioMax: 800_000_000 },
  });
  const searchContent = (search.content as Array<{ type: string; text: string }>)[0];
  const parsedSearch = JSON.parse(searchContent.text) as { total: number };
  console.log(`✓ search_properties: ${parsedSearch.total} resultados`);

  // 5. readResource
  const catalogo = await client.readResource({ uri: 'propiedades://catalogo' });
  const catalogoContent = catalogo.contents[0];
  const parsedCatalogo = JSON.parse(catalogoContent.text as string) as { total: number };
  console.log(`✓ readResource propiedades://catalogo: ${parsedCatalogo.total} propiedades`);

  // 6. Tool inválida — debe retornar isError, no crashear
  const bad = await client.callTool({ name: 'nonexistent_tool', arguments: {} });
  console.log(`✓ tool inválida → isError=${bad.isError === true ? 'true' : 'false'}`);

  // 7. Tool válida con args malos — debe retornar isError
  const missingArg = await client.callTool({ name: 'generate_listing', arguments: { propiedadId: 'NO-EXISTE' } });
  console.log(`✓ propiedadId inexistente → isError=${missingArg.isError === true ? 'true' : 'false'}`);

  await client.close();
  console.log('\n✓ Todas las verificaciones pasaron');
}

main().catch((err) => {
  console.error('✗ Test falló:', err);
  process.exit(1);
});
