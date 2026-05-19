/**
 * Indexa data/seeds/propiedades.json en ChromaDB.
 *
 * Idempotente: usa upsert (no duplica si lo corres varias veces).
 *
 * Uso: npm run seed:chromadb
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import { embed, EMBEDDING_DIMENSIONS } from '../packages/embeddings/src/embed.js';
import { getOrCreateCollection, heartbeat, COLECCION_PROPIEDADES } from '../packages/db/src/chroma.js';
import type { Propiedad } from '../packages/shared/src/propiedad.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = resolve(__dirname, '../data/seeds/propiedades.json');

function buildDocument(p: Propiedad): string {
  const parts: string[] = [
    p.titulo,
    p.descripcion,
    `${p.tipo} en ${p.ubicacion.barrio}, ${p.ubicacion.ciudad}, ${p.ubicacion.departamento}`,
    `Estrato ${p.estrato}, ${p.areaM2}m², ${p.habitaciones} habitaciones, ${p.banos} baños, ${p.garajes} garaje(s)`,
    `Antigüedad: ${p.antiguedadAnios === 0 ? 'obra nueva' : `${p.antiguedadAnios} años`}`,
    `Características: ${p.caracteristicas.join(', ')}`,
    `Precio: $${(p.precio.valor / 1_000_000).toFixed(0)}M ${p.precio.moneda}${p.precio.negociable ? ', precio negociable' : ''}`,
    `Operación: ${p.operacion}`,
  ];

  if (p.amoblado) parts.push('Amoblado: sí, entrega con muebles incluidos');
  if (p.esVIS) parts.push('Vivienda de Interés Social (VIS), aplica subsidios primer vivienda');
  if (p.esVIP) parts.push('Vivienda de Interés Prioritario (VIP)');
  if (p.subsidiosAplicables?.length) parts.push(`Subsidios: ${p.subsidiosAplicables.join(', ')}`);
  if (p.piso) parts.push(`Piso ${p.piso} de ${p.pisosTotalesEdificio ?? '?'}`);

  return parts.join('. ');
}

async function main(): Promise<void> {
  console.log('PropIA — seeding ChromaDB');
  console.log('---------------------------------');

  console.log('1. Verificando conexión a ChromaDB...');
  try {
    await heartbeat();
    console.log('   ChromaDB OK');
  } catch (err) {
    console.error('   No se pudo conectar a ChromaDB.');
    console.error('   ¿Está corriendo? Ejecuta: docker compose up -d');
    console.error('   Error:', (err as Error).message);
    process.exit(1);
  }

  console.log(`2. Leyendo seeds desde ${SEED_PATH}`);
  const raw = readFileSync(SEED_PATH, 'utf-8');
  const propiedades = JSON.parse(raw) as Propiedad[];
  console.log(`   ${propiedades.length} propiedades cargadas`);

  console.log('3. Obteniendo colección "propiedades"...');
  const collection = await getOrCreateCollection(COLECCION_PROPIEDADES);

  console.log('4. Calculando embeddings (puede tardar 30-60s la primera vez, descarga el modelo)...');
  const ids: string[] = [];
  const documents: string[] = [];
  const embeddings: number[][] = [];
  const metadatas: Record<string, string | number | boolean>[] = [];

  for (const p of propiedades) {
    const doc = buildDocument(p);
    const vector = await embed(doc);

    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Embedding tiene ${vector.length} dims, esperado ${EMBEDDING_DIMENSIONS}`,
      );
    }

    ids.push(p.id);
    documents.push(doc);
    embeddings.push(vector);
    metadatas.push({
      ciudad: p.ubicacion.ciudad,
      barrio: p.ubicacion.barrio,
      estrato: p.estrato,
      tipo: p.tipo,
      operacion: p.operacion,
      precio: p.precio.valor,
      areaM2: p.areaM2,
      habitaciones: p.habitaciones,
      estado: p.estado,
    });

    process.stdout.write(`   [${ids.length}/${propiedades.length}] ${p.id}\r`);
  }
  console.log(`\n   ${ids.length} embeddings calculados (${EMBEDDING_DIMENSIONS} dims c/u)`);

  console.log('5. Upserting a ChromaDB...');
  await collection.upsert({ ids, documents, embeddings, metadatas });

  const count = await collection.count();
  console.log(`   Colección "${COLECCION_PROPIEDADES}" ahora tiene ${count} documentos`);
  console.log('---------------------------------');
  console.log('Seed completo.');
}

main().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
