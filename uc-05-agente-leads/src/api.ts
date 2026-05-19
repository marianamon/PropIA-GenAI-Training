import 'dotenv/config'; // CRÍTICO — primer import para que el SDK encuentre ANTHROPIC_API_KEY
import express, { type Request, type Response } from 'express';
import { runLeadAgent } from './agent/reactAgent.js';
import { getMessageLog, getVisitsLog } from './tools/toolExecutors.js';

const app = express();
app.use(express.json());

interface RunBody {
  agenteId?: string;
}

app.post('/api/agent/run', async (req: Request<unknown, unknown, RunBody>, res: Response) => {
  const { agenteId } = req.body;
  if (!agenteId) {
    return res.status(400).json({ error: 'agenteId requerido' });
  }

  try {
    const result = await runLeadAgent(agenteId);
    const toolCalls = result.steps.filter((s) => s.type === 'tool_call').length;
    return res.json({
      finished: result.finished,
      iterations: result.iterations,
      toolCalls,
      totalSteps: result.steps.length,
      finalMessage: result.finalMessage,
      steps: result.steps,
    });
  } catch (err) {
    console.error('Error en agente:', err);
    return res.status(500).json({ error: 'Error ejecutando el agente' });
  }
});

// Útil para tests: ver qué mensajes y visitas se han ejecutado
app.get('/api/agent/log', (_req: Request, res: Response) => {
  res.json({
    messages: getMessageLog(),
    visits: getVisitsLog(),
  });
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Agent API en http://localhost:${PORT}`);
});
