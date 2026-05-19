import 'dotenv/config'; // PRIMER import — los SDKs que cargan abajo leen process.env al importarse
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { callTool, TOOLS } from './tools/toolHandlers.js';
import { readResource, RESOURCES } from './resources/resourceHandlers.js';

const server = new Server(
  {
    name: 'propia-broker-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  return callTool(name, (args ?? {}) as Record<string, unknown>);
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: RESOURCES }));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  return readResource(req.params.uri);
});

// IMPORTANTE: usar console.error (stderr). stdout es el canal MCP — un log ahí rompe el handshake.
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[propIA-mcp] Servidor MCP corriendo en stdio');
}

main().catch((err) => {
  console.error('[propIA-mcp] Error fatal:', err);
  process.exit(1);
});
