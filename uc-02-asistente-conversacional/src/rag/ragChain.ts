import Anthropic from '@anthropic-ai/sdk';
import { embed } from '@propia/embeddings';
import { getOrCreateCollection, COLECCION_PROPIEDADES } from '@propia/db';
import { addTurn, getHistory } from '../session/sessionManager.js';
import { rewriteQuery } from './queryRewriter.js';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Eres PropIA, el asistente inmobiliario de la plataforma PropIA Colombia.

REGLAS CRÍTICAS:
1. SOLO usa información de las propiedades que te proporcionan en el contexto
2. Si no tienes datos suficientes para responder, dilo explícitamente
3. Usa vocabulario inmobiliario colombiano (apartamento, alcoba, canon, estrato, etc.)
4. Cuando menciones precios, usa formato colombiano: $285.000.000 o $285M COP
5. Sé conciso — máximo 3 párrafos por respuesta`;

async function retrieveContext(query: string): Promise<{ docs: string[]; ids: string[] }> {
  const collection = await getOrCreateCollection(COLECCION_PROPIEDADES);
  const queryVector = await embed(query);

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 5,
  });

  return {
    docs: (results.documents[0]?.filter(Boolean) as string[]) ?? [],
    ids: results.ids[0] ?? [],
  };
}

export interface ChatResponse {
  reply: string;
  sourceDocIds: string[];
  rewrittenQuery: string;
}

export async function chat(sessionId: string, userMessage: string): Promise<ChatResponse> {
  const history = getHistory(sessionId);

  const rewrittenQuery = await rewriteQuery(
    userMessage,
    history.map((t) => ({ role: t.role, content: t.content })),
  );

  const { docs, ids } = await retrieveContext(rewrittenQuery);

  const propiedadesCtx =
    docs.length > 0
      ? `PROPIEDADES DISPONIBLES:\n${docs.map((d, i) => `[${i + 1}] ${d}`).join('\n\n')}`
      : 'No se encontraron propiedades relevantes para esta consulta.';

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-6).map((t) => ({
      role: t.role,
      content: t.content,
    })),
    {
      role: 'user',
      content: `${propiedadesCtx}\n\nPregunta del usuario: ${userMessage}`,
    },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const firstBlock = response.content[0];
  const reply = firstBlock.type === 'text' ? firstBlock.text : '';

  const now = new Date().toISOString();
  addTurn(sessionId, { role: 'user', content: userMessage, timestamp: now });
  addTurn(sessionId, {
    role: 'assistant',
    content: reply,
    timestamp: now,
    sourceDocIds: ids,
  });

  return { reply, sourceDocIds: ids, rewrittenQuery };
}
