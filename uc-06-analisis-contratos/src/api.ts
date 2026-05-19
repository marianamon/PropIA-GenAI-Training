import 'dotenv/config'; // CRÍTICO — primer import para que el SDK encuentre ANTHROPIC_API_KEY
import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { loadAndChunkPDF } from './document/pdfProcessor.js';
import { analyzeChunk } from './analysis/mapAnalyzer.js';
import { reduceAnalysis } from './analysis/reduceAnalyzer.js';

const app = express();
const upload = multer({
  dest: '/tmp/propia-contratos/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
});

app.post('/api/contratos/analizar', upload.single('contrato'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'PDF requerido en el campo "contrato"' });
  }

  try {
    // 1. Cargar y chunkear
    const chunks = await loadAndChunkPDF(req.file.path);

    // 2. MAP: analizar chunks en paralelo (limitado a evitar rate limits)
    const chunkResults = await Promise.all(chunks.map((c) => analyzeChunk(c.text, c.chunkIndex)));

    // 3. REDUCE: consolidar
    const analisis = await reduceAnalysis(chunkResults);

    return res.json({
      analisis,
      meta: {
        chunksAnalizados: chunks.length,
        clausulasDetectadas: analisis.clausulasRiesgo.length,
        scoreRiesgoGeneral: analisis.scoreRiesgoGeneral,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(422).json({
        error: 'Análisis devuelto por el LLM no cumple el schema',
        details: err.issues,
      });
    }
    console.error('Error analizando contrato:', err);
    return res.status(500).json({ error: 'Error al analizar el contrato' });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Contratos API en http://localhost:${PORT}`);
});
