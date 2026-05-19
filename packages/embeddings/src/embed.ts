import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

const MODEL_NAME = process.env.EMBEDDINGS_MODEL ?? 'Xenova/all-MiniLM-L6-v2';

export const EMBEDDING_DIMENSIONS = 384;

let embedderPromise: Promise<unknown> | null = null;

async function getEmbedder(): Promise<unknown> {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', MODEL_NAME);
  }
  return embedderPromise;
}

export async function embed(text: string): Promise<number[]> {
  const embedder = (await getEmbedder()) as (
    input: string,
    options: { pooling: 'mean'; normalize: boolean },
  ) => Promise<{ data: Float32Array }>;

  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (const t of texts) {
    out.push(await embed(t));
  }
  return out;
}
