import { embed } from '@propia/embeddings';
import { getOrCreateCollection, COLECCION_PROPIEDADES } from '@propia/db';

export interface ComparableRetrieval {
  propiedadId: string;
  documento: string;
  scoreSimilititud: number;
  metadata: Record<string, unknown>;
}

export interface ComparablesFilters {
  ciudad?: string;
  estratoMin?: number;
  estratoMax?: number;
  excluirId?: string; // útil para no usar la propiedad como su propio comparable
}

export async function buscarComparables(
  propiedadQuery: string,
  filters?: ComparablesFilters,
  k = 5,
): Promise<ComparableRetrieval[]> {
  const collection = await getOrCreateCollection(COLECCION_PROPIEDADES);
  const queryVector = await embed(propiedadQuery);

  // ChromaDB v2 no acepta `{ $gte, $lte }` juntos en un mismo objeto.
  // Convertimos el rango de estratos a una lista discreta con $in (estratos son 1-6).
  const conditions: Record<string, unknown>[] = [];
  if (filters?.ciudad) conditions.push({ ciudad: filters.ciudad });
  if (filters?.estratoMin !== undefined && filters?.estratoMax !== undefined) {
    const estratos: number[] = [];
    for (let e = filters.estratoMin; e <= filters.estratoMax; e++) estratos.push(e);
    conditions.push({ estrato: { $in: estratos } });
  }

  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : { $and: conditions };

  // Pedimos k+1 para tener margen si filtramos la propia propiedad después
  const results = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: filters?.excluirId ? k + 1 : k,
    where: whereClause,
  });

  const items: ComparableRetrieval[] = (results.ids[0] ?? []).map((id, i) => ({
    propiedadId: id,
    documento: results.documents[0]?.[i] ?? '',
    scoreSimilititud: 1 - (results.distances?.[0]?.[i] ?? 1),
    metadata: (results.metadatas[0]?.[i] ?? {}) as Record<string, unknown>,
  }));

  const filtered = filters?.excluirId
    ? items.filter((c) => c.propiedadId !== filters.excluirId)
    : items;

  return filtered.slice(0, k);
}
