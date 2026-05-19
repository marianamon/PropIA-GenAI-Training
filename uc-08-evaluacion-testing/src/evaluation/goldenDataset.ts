import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

/**
 * Schema del golden dataset que evalúan RAGAS, DeepEval y Promptfoo.
 * Validar el dataset en TS antes de correr cualquier evaluación con LLM
 * evita gastar tokens descubriendo que el dataset estaba mal formado.
 */
export const PreguntaGoldenSchema = z.object({
  id: z.string().regex(/^q-\d{3,}$/),
  categoria: z.enum([
    'busqueda-semantica',
    'filtros-mixtos',
    'preferencias-comprador',
    'preferencias-familia',
    'negocio-comercial',
    'negocio-vendedor',
    'presupuesto',
    'ubicacion-especifica',
    'amenidades',
    'fuera-de-rango',
    'conversacional',
  ]),
  question: z.string().min(10),
  expectedPropertyIds: z.array(z.string()),
  idealAnswer: z.string().min(20),
  contexts: z.array(z.string()),
});

export const GoldenDatasetSchema = z.object({
  version: z.string(),
  descripcion: z.string(),
  preguntas: z.array(PreguntaGoldenSchema).min(1),
});

export type PreguntaGolden = z.infer<typeof PreguntaGoldenSchema>;
export type GoldenDataset = z.infer<typeof GoldenDatasetSchema>;

const GOLDEN_PATH = resolve(process.cwd(), 'data/seeds/golden-dataset.json');
const CATALOGO_PATH = resolve(process.cwd(), 'data/seeds/propiedades.json');

export function loadGoldenDataset(): GoldenDataset {
  const raw = JSON.parse(readFileSync(GOLDEN_PATH, 'utf-8'));
  return GoldenDatasetSchema.parse(raw);
}

export function loadCatalogIds(): Set<string> {
  const raw = JSON.parse(readFileSync(CATALOGO_PATH, 'utf-8')) as Array<{ id: string }>;
  return new Set(raw.map((p) => p.id));
}

/**
 * Conjunto de barrios/zonas presentes en el catálogo. Útil para validar que
 * los `idealAnswer` mencionan alguna zona reconocible (anchor de faithfulness).
 * Se extrae del catálogo dinámicamente en vez de hardcodear — así crece con los seeds.
 */
export function loadCatalogBarrios(): Set<string> {
  const raw = JSON.parse(readFileSync(CATALOGO_PATH, 'utf-8')) as Array<{
    ubicacion?: { barrio?: string; zona?: string; ciudad?: string };
  }>;
  const set = new Set<string>();
  for (const p of raw) {
    if (p.ubicacion?.barrio) set.add(p.ubicacion.barrio);
    if (p.ubicacion?.zona) set.add(p.ubicacion.zona);
  }
  return set;
}
