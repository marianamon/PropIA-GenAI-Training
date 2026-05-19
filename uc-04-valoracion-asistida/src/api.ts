import 'dotenv/config'; // CRÍTICO — primer import para que el SDK encuentre ANTHROPIC_API_KEY
import express, { type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { valorarPropiedad } from './valuation/valuationEngine.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

interface ValoracionBody {
  propiedad?: unknown;
}

app.post('/api/valoracion', async (req: Request<unknown, unknown, ValoracionBody>, res: Response) => {
  const { propiedad } = req.body;
  if (!propiedad) {
    return res.status(400).json({ error: 'propiedad requerida' });
  }

  try {
    const valuacion = await valorarPropiedad(propiedad as Parameters<typeof valorarPropiedad>[0]);
    return res.json({ valuacion });
  } catch (err) {
    if (err instanceof ZodError) {
      // El LLM devolvió JSON inválido — raro con tool_use pero posible
      return res.status(422).json({
        error: 'Respuesta de valoración inválida',
        details: err.issues,
      });
    }
    console.error('Error en valoración:', err);
    return res.status(500).json({ error: 'Error en el motor de valoración' });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Valoración API en http://localhost:${PORT}`);
});
