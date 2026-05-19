import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { chat } from './rag/ragChain.js';
import { getHistory } from './session/sessionManager.js';

const app = express();
app.use(express.json());

interface ChatBody {
  message?: string;
  sessionId?: string;
}

app.post('/api/chat', async (req: Request<unknown, unknown, ChatBody>, res: Response) => {
  const { message, sessionId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message requerido' });
  }

  const sid = sessionId ?? randomUUID();

  try {
    const result = await chat(sid, message);
    return res.json({
      reply: result.reply,
      sessionId: sid,
      sourceDocIds: result.sourceDocIds,
      rewrittenQuery: result.rewrittenQuery,
    });
  } catch (err) {
    console.error('Error en chat:', err);
    return res.status(500).json({ error: 'Error en el asistente' });
  }
});

app.get('/api/chat/:sessionId/history', (req: Request<{ sessionId: string }>, res: Response) => {
  const history = getHistory(req.params.sessionId);
  return res.json({ history, total: history.length });
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Chat API en http://localhost:${PORT}`);
});
