import { embed } from '@propia/embeddings';
import { getOrCreateCollection, COLECCION_PROPIEDADES } from '@propia/db';

export interface SearchResult {
  propiedadId: string;
  documento: string;
  score: number;
  metadata: Record<string, unknown>;
}

export async function semanticSearch(
  query: string,
  filters?: { ciudad?: string; precioMax?: number },
  k = 10,
): Promise<SearchResult[]> {
  const collection = await getOrCreateCollection(COLECCION_PROPIEDADES);
  const queryVector = await embed(query);

  const conditions: Record<string, unknown>[] = [];
  if (filters?.ciudad) conditions.push({ ciudad: filters.ciudad });
  if (filters?.precioMax) conditions.push({ precio: { $lte: filters.precioMax } });

  const where =
    conditions.length > 1
      ? { $and: conditions }
      : conditions.length === 1
        ? conditions[0]
        : undefined;

  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: k,
    where,
  });

  return (results.ids[0] ?? []).map((id, i) => ({
    propiedadId: id,
    documento: results.documents[0]?.[i] ?? '',
    score: 1 - (results.distances?.[0]?.[i] ?? 1),
    metadata: (results.metadatas[0]?.[i] ?? {}) as Record<string, unknown>,
  }));
}
