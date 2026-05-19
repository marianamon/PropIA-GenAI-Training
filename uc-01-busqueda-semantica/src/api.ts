import express, { type Request, type Response } from 'express';
import { semanticSearch } from './search.js';

const app = express();
app.use(express.json());

interface SearchBody {
  query?: string;
  ciudad?: string;
  precioMax?: number;
}

app.post('/api/search', async (req: Request<unknown, unknown, SearchBody>, res: Response) => {
  const { query, ciudad, precioMax } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query requerida' });
  }

  try {
    const results = await semanticSearch(query, { ciudad, precioMax });
    return res.json({ results, total: results.length, query });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error en la búsqueda' });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`PropIA Search API en http://localhost:${PORT}`);
});
