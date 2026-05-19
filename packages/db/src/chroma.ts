import { ChromaClient, type Collection } from 'chromadb';

export const COLECCION_PROPIEDADES = 'propiedades';

let clientSingleton: ChromaClient | null = null;

export function getChromaClient(): ChromaClient {
  if (!clientSingleton) {
    const host = process.env.CHROMA_HOST ?? 'localhost';
    const port = Number(process.env.CHROMA_PORT ?? 8000);
    clientSingleton = new ChromaClient({ path: `http://${host}:${port}` });
  }
  return clientSingleton;
}

export async function getOrCreateCollection(name: string): Promise<Collection> {
  const client = getChromaClient();
  return client.getOrCreateCollection({ name });
}

export async function heartbeat(): Promise<number> {
  const client = getChromaClient();
  return client.heartbeat();
}
