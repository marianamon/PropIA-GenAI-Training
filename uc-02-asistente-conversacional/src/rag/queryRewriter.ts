import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function rewriteQuery(
  query: string,
  history: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  if (history.length === 0) return query;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: `Reformula la pregunta del usuario para que sea autocontenida y clara,
usando el historial de conversación como contexto.
SOLO retorna la pregunta reformulada, sin explicaciones, sin comillas.
Si la pregunta ya es autocontenida, retórnala sin cambios.`,
    messages: [
      ...history.slice(-4).map((t) => ({ role: t.role, content: t.content })),
      { role: 'user', content: `Reformula esta pregunta: "${query}"` },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text.trim() : query;
}
