import 'dotenv/config'; // CRÍTICO — primer import para que process.env tenga ANTHROPIC_API_KEY
import express, { type Request, type Response } from 'express';
import { generarFicha, type ToneType } from './generator/fichaGenerator.js';
import { evaluarFicha } from './evaluation/judge.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

const TONES_VALIDOS: readonly ToneType[] = ['familiar', 'lujo', 'inversor'];

interface GenerarBody {
  propiedad?: unknown;
  tone?: string;
}

app.post('/api/fichas/generar', async (req: Request<unknown, unknown, GenerarBody>, res: Response) => {
  const { propiedad, tone = 'familiar' } = req.body;
  if (!propiedad) {
    return res.status(400).json({ error: 'propiedad requerida' });
  }
  if (!TONES_VALIDOS.includes(tone as ToneType)) {
    return res.status(400).json({ error: `tone debe ser uno de ${TONES_VALIDOS.join(', ')}` });
  }

  try {
    const ficha = await generarFicha(propiedad as Parameters<typeof generarFicha>[0], tone as ToneType);
    return res.json({ ficha, tone });
  } catch (err) {
    console.error('Error generando ficha:', err);
    return res.status(500).json({ error: 'Error al generar la ficha' });
  }
});

app.post('/api/fichas/variantes', async (req: Request<unknown, unknown, GenerarBody>, res: Response) => {
  const { propiedad } = req.body;
  if (!propiedad) {
    return res.status(400).json({ error: 'propiedad requerida' });
  }

  try {
    const variantes = await Promise.all(
      TONES_VALIDOS.map(async (tone) => ({
        tone,
        ficha: await generarFicha(propiedad as Parameters<typeof generarFicha>[0], tone),
      })),
    );
    return res.json({ variantes });
  } catch (err) {
    console.error('Error generando variantes:', err);
    return res.status(500).json({ error: 'Error al generar las variantes' });
  }
});

interface EvaluarBody {
  propiedad?: unknown;
  ficha?: { titulo: string; descripcion: string; bullets: string[] };
}

app.post('/api/fichas/evaluar', async (req: Request<unknown, unknown, EvaluarBody>, res: Response) => {
  const { propiedad, ficha } = req.body;
  if (!propiedad || !ficha) {
    return res.status(400).json({ error: 'propiedad y ficha requeridas' });
  }

  try {
    const score = await evaluarFicha(propiedad, ficha);
    return res.json({ score });
  } catch (err) {
    console.error('Error evaluando ficha:', err);
    return res.status(500).json({ error: 'Error al evaluar la ficha' });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Fichas API en http://localhost:${PORT}`);
});
