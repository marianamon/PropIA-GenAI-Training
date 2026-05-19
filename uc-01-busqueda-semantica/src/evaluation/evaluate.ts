import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { semanticSearch, type SearchResult } from '../search.js';
import { embed } from '@propia/embeddings';
import type { Propiedad } from '@propia/shared/propiedad';

// -----------------------------------------------------------------------
// Golden dataset: 10 queries con las propiedades que DEBERIAN aparecer.
// Los expectedIds se basan en las 20 propiedades de data/seeds/propiedades.json.
// -----------------------------------------------------------------------
interface EvalPair {
  query: string;
  expectedIds: string[];
  description: string;
}

const GOLDEN: EvalPair[] = [
  {
    query: 'algo tranquilo cerca del metro',
    expectedIds: ['prop-mde-001', 'prop-mde-004', 'prop-mde-005'],
    description: 'Propiedades en zona tranquila, cerca a estaciones de metro/transporte',
  },
  {
    query: 'espacio para trabajar desde casa con buena luz',
    expectedIds: ['prop-mde-003', 'prop-mde-007', 'prop-bog-014', 'prop-bog-018'],
    description: 'Propiedades con home office / espacio para trabajar / coworking',
  },
  {
    query: 'apartamento familiar estrato alto con parqueadero',
    expectedIds: ['prop-mde-002', 'prop-mde-005', 'prop-bog-012'],
    description: 'Apartamentos estrato 5-6 para familias',
  },
  {
    query: 'local comercial en zona de alto trafico',
    expectedIds: ['prop-bog-020', 'prop-mde-010'],
    description: 'Locales comerciales u oficinas en zonas de flujo',
  },
  {
    query: 'apartaestudio economico para estudiante',
    expectedIds: ['prop-mde-003', 'prop-bog-013'],
    description: 'Apartaestudios ideales para estudiantes, precio bajo',
  },
  {
    query: 'casa campestre con vista a montanas y naturaleza',
    expectedIds: ['prop-mde-008'],
    description: 'Casas campestres con vista a montanas, zonas verdes',
  },
  {
    query: 'oficina moderna en zona empresarial',
    expectedIds: ['prop-mde-010'],
    description: 'Oficinas en zonas corporativas',
  },
  {
    query: 'algo pet-friendly con zonas verdes',
    expectedIds: ['prop-mde-001', 'prop-mde-004', 'prop-mde-007', 'prop-bog-014', 'prop-bog-018'],
    description: 'Propiedades pet-friendly con areas verdes',
  },
  {
    query: 'apartamento nuevo con subsidio VIS primer vivienda',
    expectedIds: ['prop-mde-006', 'prop-bog-017', 'prop-bog-019'],
    description: 'VIS con subsidio Mi Casa Ya, primera vivienda',
  },
  {
    query: 'penthouse de lujo con piscina y vista',
    expectedIds: ['prop-mde-002', 'prop-bog-016'],
    description: 'Propiedades de lujo, penthouse, terraza, piscina',
  },
];

// -----------------------------------------------------------------------
// Metricas: Precision@k, Recall@k, F1@k, MRR y False Positives
// -----------------------------------------------------------------------
function precisionAtK(retrieved: string[], expected: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  const hits = topK.filter(id => expected.includes(id)).length;
  return hits / k;
}

// De los relevantes que EXISTEN, cuántos aparecen en el top-K.
function recallAtK(retrieved: string[], expected: string[], k: number): number {
  if (expected.length === 0) return 1;
  const topK = retrieved.slice(0, k);
  const hits = topK.filter(id => expected.includes(id)).length;
  return hits / expected.length;
}

// Media armónica de Precision y Recall: penaliza si cualquiera de los dos es bajo.
function f1AtK(retrieved: string[], expected: string[], k: number): number {
  const p = precisionAtK(retrieved, expected, k);
  const r = recallAtK(retrieved, expected, k);
  if (p + r === 0) return 0;
  return (2 * p * r) / (p + r);
}

function reciprocalRank(retrieved: string[], expected: string[]): number {
  for (let i = 0; i < retrieved.length; i++) {
    if (expected.includes(retrieved[i])) {
      return 1 / (i + 1);
    }
  }
  return 0;
}

// Retorna los IDs del top-k que NO son relevantes (falsos positivos).
function falsePositives(retrieved: string[], expected: string[], k: number): string[] {
  return retrieved.slice(0, k).filter(id => !expected.includes(id));
}

// -----------------------------------------------------------------------
// Baseline SQL simulado (ILIKE): busca substring en los documentos.
// -----------------------------------------------------------------------
function sqlBaseline(query: string, documents: Map<string, string>): string[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const scored: { id: string; hits: number }[] = [];

  for (const [id, doc] of documents) {
    const docLower = doc.toLowerCase();
    const hits = keywords.filter(kw => docLower.includes(kw)).length;
    if (hits > 0) scored.push({ id, hits });
  }

  return scored.sort((a, b) => b.hits - a.hits).map(s => s.id);
}

// -----------------------------------------------------------------------
// Runner principal
// -----------------------------------------------------------------------
async function runEvaluation() {
  const K = 5;
  let totalPrecision = 0;
  let totalRecall = 0;
  let totalF1 = 0;
  let totalMRR = 0;
  let semanticWins = 0;

  const allDocs = new Map<string, string>();

  // Acumulador de falsos positivos: id → cuántas veces apareció sin ser relevante
  const fpCounter = new Map<string, number>();
  // Detalle por query: qué FPs aparecieron y en qué query
  const fpDetail: { query: string; fps: string[] }[] = [];

  console.log(`Evaluacion de busqueda semantica -- ${GOLDEN.length} queries, k=${K}\n`);
  console.log('Query'.padEnd(50), 'P@5'.padEnd(8), 'R@5'.padEnd(8), 'F1'.padEnd(8), 'RR'.padEnd(8), 'FP'.padEnd(6), 'vs SQL');
  console.log('-'.repeat(104));

  for (const pair of GOLDEN) {
    const results: SearchResult[] = await semanticSearch(pair.query, undefined, K);
    const retrievedIds = results.map(r => r.propiedadId);

    for (const r of results) {
      if (!allDocs.has(r.propiedadId)) {
        allDocs.set(r.propiedadId, r.documento);
      }
    }

    const p5 = precisionAtK(retrievedIds, pair.expectedIds, K);
    const r5 = recallAtK(retrievedIds, pair.expectedIds, K);
    const f1 = f1AtK(retrievedIds, pair.expectedIds, K);
    const rr = reciprocalRank(retrievedIds, pair.expectedIds);
    totalPrecision += p5;
    totalRecall += r5;
    totalF1 += f1;
    totalMRR += rr;

    // Calcular falsos positivos de esta query
    const fps = falsePositives(retrievedIds, pair.expectedIds, K);
    for (const fp of fps) {
      fpCounter.set(fp, (fpCounter.get(fp) ?? 0) + 1);
    }
    fpDetail.push({ query: pair.query, fps });

    const sqlResults = sqlBaseline(pair.query, allDocs);
    const sqlP5 = precisionAtK(sqlResults, pair.expectedIds, K);
    const comparison = p5 > sqlP5 ? 'SEMANTIC' : p5 === sqlP5 ? 'EMPATE' : 'SQL';
    if (p5 > sqlP5) semanticWins++;

    console.log(
      pair.query.substring(0, 48).padEnd(50),
      p5.toFixed(2).padEnd(8),
      r5.toFixed(2).padEnd(8),
      f1.toFixed(2).padEnd(8),
      rr.toFixed(2).padEnd(8),
      String(fps.length).padEnd(6),
      comparison,
    );
  }

  const avgPrecision = totalPrecision / GOLDEN.length;
  const avgRecall = totalRecall / GOLDEN.length;
  const avgF1 = totalF1 / GOLDEN.length;
  const avgMRR = totalMRR / GOLDEN.length;
  const totalFPs = [...fpCounter.values()].reduce((a, b) => a + b, 0);
  const avgFPsPerQuery = totalFPs / GOLDEN.length;

  console.log('-'.repeat(104));
  console.log(`\nResultados globales:`);
  console.log(`  Precision@${K} promedio:       ${avgPrecision.toFixed(3)}  (¿qué tan limpio es lo que retorna?)`);
  console.log(`  Recall@${K} promedio:          ${avgRecall.toFixed(3)}  (¿cuántos relevantes NO se perdieron?)`);
  console.log(`  F1@${K} promedio:              ${avgF1.toFixed(3)}  (balance entre P y R)`);
  console.log(`  MRR promedio:                ${avgMRR.toFixed(3)}  (¿qué tan rápido aparece el 1er correcto?)`);
  console.log(`  Semantic wins vs SQL:        ${semanticWins}/${GOLDEN.length}`);
  console.log(`  Total falsos positivos:      ${totalFPs} (avg ${avgFPsPerQuery.toFixed(1)}/query)`);

  // Top propiedades que más aparecen como falso positivo
  const topFPs = [...fpCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topFPs.length > 0) {
    console.log(`\nPropiedades con mas apariciones como falso positivo:`);
    for (const [id, count] of topFPs) {
      // Mostrar en qué queries apareció este FP
      const queries = fpDetail
        .filter(d => d.fps.includes(id))
        .map(d => `"${d.query.substring(0, 35)}"`)
        .join(', ');
      console.log(`  ${id.padEnd(18)} x${count}  ← ${queries}`);
    }
  }

  // Detalle de FPs por query (solo las que tienen FPs)
  console.log(`\nDetalle de falsos positivos por query:`);
  for (const { query, fps } of fpDetail) {
    if (fps.length === 0) {
      console.log(`  "${query.substring(0, 45).padEnd(45)}"  → sin FPs`);
    } else {
      console.log(`  "${query.substring(0, 45).padEnd(45)}"  → ${fps.join(', ')}`);
    }
  }

  // --- Assertions para CI ---
  const PRECISION_THRESHOLD = 0.20;
  const RECALL_THRESHOLD    = 0.30;
  const MRR_THRESHOLD       = 0.30;
  const MAX_AVG_FP          = 4.0;

  if (avgPrecision < PRECISION_THRESHOLD) {
    console.error(`\nFAIL: Precision@${K} ${avgPrecision.toFixed(3)} < ${PRECISION_THRESHOLD} — demasiados FP en el top-${K}`);
    process.exit(1);
  }

  if (avgRecall < RECALL_THRESHOLD) {
    console.error(`\nFAIL: Recall@${K} ${avgRecall.toFixed(3)} < ${RECALL_THRESHOLD} — demasiados relevantes fuera del top-${K}`);
    console.error('  Considera aumentar k o enriquecer buildDocument().');
    process.exit(1);
  }

  if (avgMRR < MRR_THRESHOLD) {
    console.error(`\nFAIL: MRR ${avgMRR.toFixed(3)} < ${MRR_THRESHOLD}`);
    process.exit(1);
  }

  if (avgFPsPerQuery > MAX_AVG_FP) {
    console.error(`\nFAIL: Avg FPs/query ${avgFPsPerQuery.toFixed(1)} > ${MAX_AVG_FP}`);
    console.error('  Revisa buildDocument() o ajusta el golden dataset.');
    process.exit(1);
  }

  console.log(`\nPASS: Busqueda semantica supera los umbrales.`);
}

// -----------------------------------------------------------------------
// Utilidad: similitud coseno entre dos vectores.
// Como embed() usa normalize:true, los vectores ya tienen magnitud 1,
// así que coseno = producto punto. Lo calculamos explícitamente igual
// para que funcione aunque se cambie el modelo.
// -----------------------------------------------------------------------
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function pass(msg: string) { console.log(`  ✓  ${msg}`); }
function fail(msg: string) { console.error(`  ✗  ${msg}`); }

// -----------------------------------------------------------------------
// SUITE 1 — Calidad de embeddings
// Verifica que el espacio vectorial tiene sentido para el dominio:
//   - Conceptos similares → coseno alto
//   - Conceptos opuestos → coseno bajo
//   - Sinónimos inmobiliarios → coseno alto
// -----------------------------------------------------------------------
async function testEmbeddingQuality(): Promise<number> {
  console.log('\n━━━ SUITE 1: Calidad de embeddings ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  let failures = 0;

  const cases: { a: string; b: string; minSim?: number; maxSim?: number; label: string }[] = [
    {
      a: 'apartamento tranquilo cerca al metro',
      b: 'propiedad en zona de silencio con acceso a transporte',
      minSim: 0.5,
      label: 'Frases semánticamente equivalentes deben tener coseno > 0.5',
    },
    {
      a: 'penthouse de lujo El Poblado piscina privada',
      b: 'VIS estrato 2 subsidio primer vivienda',
      maxSim: 0.5,
      label: 'Conceptos opuestos (lujo vs VIS) deben tener coseno < 0.5',
    },
    {
      a: 'parqueadero',
      b: 'garaje cubierto para vehiculo',
      minSim: 0.5,
      label: 'Sinónimos del dominio (parqueadero ≈ garaje) deben tener coseno > 0.5',
    },
    {
      a: 'pet-friendly mascotas permitidas',
      b: 'se aceptan perros y gatos en el inmueble',
      minSim: 0.5,
      label: 'Pet-friendly y su descripción deben tener coseno > 0.5',
    },
    {
      a: 'home office espacio de trabajo desde casa',
      b: 'cancha de futbol estadio deportivo',
      maxSim: 0.4,
      label: 'Conceptos sin relación (home office vs deporte) deben tener coseno < 0.4',
    },
  ];

  for (const c of cases) {
    const [vA, vB] = await Promise.all([embed(c.a), embed(c.b)]);
    const sim = cosineSimilarity(vA, vB);
    const simStr = sim.toFixed(3);

    if (c.minSim !== undefined && sim < c.minSim) {
      fail(`${c.label}\n       coseno=${simStr} < ${c.minSim}\n       "${c.a}"  vs  "${c.b}"`);
      failures++;
    } else if (c.maxSim !== undefined && sim > c.maxSim) {
      fail(`${c.label}\n       coseno=${simStr} > ${c.maxSim}\n       "${c.a}"  vs  "${c.b}"`);
      failures++;
    } else {
      pass(`${c.label}  (coseno=${simStr})`);
    }
  }
  return failures;
}

// -----------------------------------------------------------------------
// SUITE 2 — Robustez de queries
// Variaciones de la misma intención deben retornar el mismo top-1
// o al menos compartir resultados en el top-3.
// -----------------------------------------------------------------------
async function testQueryRobustness(): Promise<number> {
  console.log('\n━━━ SUITE 2: Robustez de queries ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  let failures = 0;

  const equivalences: { base: string; variant: string; label: string }[] = [
    {
      base: 'apartamento cerca al metro',
      variant: 'apto cerca a la estacion de metro',
      label: 'Sinónimos "apartamento" vs "apto", "cerca al" vs "cerca a la"',
    },
    {
      base: 'algo pet-friendly',
      variant: 'propiedad donde se permiten mascotas',
      label: 'Anglicismo "pet-friendly" vs descripción en español',
    },
    {
      base: 'apartamento nuevo con subsidio VIS primer vivienda',
      variant: 'vivienda social subsidiada para comprar por primera vez',
      label: 'Sigla "VIS" vs descripción completa',
    },
    {
      base: 'oficina moderna en zona empresarial',
      variant: 'OFICINA MODERNA EN ZONA EMPRESARIAL',
      label: 'Misma query en mayúsculas vs minúsculas (case-insensitivity)',
    },
  ];

  for (const { base, variant, label } of equivalences) {
    const [rBase, rVariant] = await Promise.all([
      semanticSearch(base, undefined, 3),
      semanticSearch(variant, undefined, 3),
    ]);

    const idsBase    = rBase.map(r => r.propiedadId);
    const idsVariant = rVariant.map(r => r.propiedadId);
    const overlap    = idsBase.filter(id => idsVariant.includes(id)).length;
    const sameTop1   = idsBase[0] === idsVariant[0];

    if (sameTop1) {
      pass(`${label}  → mismo top-1: ${idsBase[0]}`);
    } else if (overlap >= 2) {
      pass(`${label}  → top-1 difiere pero overlap top-3: ${overlap}/3  [${idsBase[0]} vs ${idsVariant[0]}]`);
    } else {
      fail(`${label}\n       base:    ${idsBase.join(', ')}\n       variant: ${idsVariant.join(', ')}\n       overlap top-3: ${overlap}/3`);
      failures++;
    }
  }
  return failures;
}

// -----------------------------------------------------------------------
// SUITE 3 — Queries fuera de dominio
// El modelo no debe retornar resultados con score alto cuando la query
// no tiene relación con propiedades inmobiliarias.
// -----------------------------------------------------------------------
async function testOutOfDomain(): Promise<number> {
  console.log('\n━━━ SUITE 3: Queries fuera de dominio ━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  let failures = 0;

  // Umbral: si el mejor score es mayor a este valor, el modelo está siendo
  // demasiado "confiado" con una query que no tiene nada que ver.
  const SCORE_MAX_OUT_OF_DOMAIN = 0.10;

  const outOfDomainQueries = [
    'recetas de cocina colombiana con ajiaco',
    'presidente de Colombia historia politica',
    'iPhone 15 pro max precio colombia',
    'partido de futbol atletico nacional',
  ];

  for (const q of outOfDomainQueries) {
    const results = await semanticSearch(q, undefined, 1);
    const topScore = results[0]?.score ?? -1;

    if (topScore > SCORE_MAX_OUT_OF_DOMAIN) {
      fail(`Query fuera de dominio retornó score alto\n       query="${q}"\n       top score=${topScore.toFixed(3)} > umbral ${SCORE_MAX_OUT_OF_DOMAIN}\n       → el modelo está sobreconfiado`);
      failures++;
    } else {
      pass(`"${q.substring(0, 45)}"  → score=${topScore.toFixed(3)} ≤ ${SCORE_MAX_OUT_OF_DOMAIN}  (bien contenido)`);
    }
  }
  return failures;
}

// -----------------------------------------------------------------------
// SUITE 4 — Determinismo del modelo
// La misma query ejecutada dos veces debe retornar exactamente
// los mismos resultados (IDs y scores).
// -----------------------------------------------------------------------
async function testDeterminism(): Promise<number> {
  console.log('\n━━━ SUITE 4: Determinismo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  let failures = 0;

  const testQueries = [
    'algo tranquilo cerca del metro',
    'penthouse de lujo con piscina y vista',
    'apartaestudio economico para estudiante',
  ];

  for (const q of testQueries) {
    const [r1, r2] = await Promise.all([
      semanticSearch(q, undefined, 5),
      semanticSearch(q, undefined, 5),
    ]);

    const ids1 = r1.map(r => r.propiedadId).join(',');
    const ids2 = r2.map(r => r.propiedadId).join(',');
    const scores1 = r1.map(r => r.score.toFixed(4)).join(',');
    const scores2 = r2.map(r => r.score.toFixed(4)).join(',');

    if (ids1 !== ids2) {
      fail(`IDs no deterministas para "${q}"\n       run1: ${ids1}\n       run2: ${ids2}`);
      failures++;
    } else if (scores1 !== scores2) {
      fail(`Scores no deterministas para "${q}"\n       run1: ${scores1}\n       run2: ${scores2}`);
      failures++;
    } else {
      pass(`"${q.substring(0, 45)}"  → resultados idénticos en 2 ejecuciones`);
    }
  }
  return failures;
}

// -----------------------------------------------------------------------
// SUITE 5 — Latencia
// Cada query debe resolverse en < 2000ms (criterio de éxito del README).
// El primer call puede tardar más (carga del modelo), los siguientes no.
// -----------------------------------------------------------------------
async function testLatency(): Promise<number> {
  console.log('\n━━━ SUITE 5: Latencia (umbral < 2000ms) ━━━━━━━━━━━━━━━━━━━━━━━━');
  let failures = 0;
  const MAX_MS = 2000;

  const queries = [
    'algo tranquilo cerca del metro',
    'espacio para trabajar desde casa con buena luz',
    'penthouse de lujo con piscina y vista',
  ];

  // Warm-up: primera llamada para cargar el modelo en memoria
  console.log('  (warm-up: cargando modelo en memoria...)');
  await semanticSearch(queries[0], undefined, 1);

  for (const q of queries) {
    const start = Date.now();
    await semanticSearch(q, undefined, 5);
    const elapsed = Date.now() - start;

    if (elapsed > MAX_MS) {
      fail(`"${q.substring(0, 40)}"  → ${elapsed}ms > ${MAX_MS}ms  ← supera el SLA`);
      failures++;
    } else {
      pass(`"${q.substring(0, 40)}"  → ${elapsed}ms  ✓`);
    }
  }
  return failures;
}

// -----------------------------------------------------------------------
// SUITE 6 — Valores límite por tokens en DOCUMENTOS de ChromaDB (BVA)
//
// Contexto: all-MiniLM-L6-v2 trunca silenciosamente a 256 tokens.
// El riesgo real NO está en las queries del usuario (< 30 palabras en
// promedio) sino en los DOCUMENTOS que buildDocument() genera y se
// indexan en ChromaDB. Si un documento excede el límite, su embedding
// no representará la parte final del texto — sin error visible.
//
// Umbral seguro: 200 tokens (~77% del límite de 256) para absorber
// futuros enriquecimientos del catálogo sin una regresión silenciosa.
//
// Zonas BVA:
//   SEGURA       ≤ 150 tokens
//   ADVERTENCIA   151–200 tokens   (⚠ próximo al umbral)
//   RIESGO        201–254 tokens   (✗ supera umbral seguro)
//   TRUNCACIÓN   ≥ 255 tokens      (✗ el modelo corta el texto)
//
// La función buildDocumentLocal() es una réplica de buildDocument() de
// scripts/seed-chromadb.ts para que la suite sea autónoma (no requiere
// ChromaDB en ejecución). Ambas DEBEN mantenerse sincronizadas.
// -----------------------------------------------------------------------

const TOKEN_SAFE_LIMIT = 200;
const TOKEN_WARN_LIMIT = 150;
const TOKEN_MODEL_LIMIT = 254; // 256 − [CLS] − [SEP]
// Factor de conversión palabra→token para español con WordPiece (BERT-like).
// Palabras cortas (≤4 chars) ~ 1 token; largas (>8 chars) ~ 1.5-2 tokens.
// Promedio empírico para texto inmobiliario en español: ~1.3.
const WORDS_TO_TOKENS = 1.3;

function approxTokens(text: string): number {
  return Math.round(text.trim().split(/\s+/).length * WORDS_TO_TOKENS);
}

// Réplica local de buildDocument() de scripts/seed-chromadb.ts.
// ⚠ Si se modifica buildDocument() allá, actualizar esta función también.
function buildDocumentLocal(p: Propiedad): string {
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

async function testDocumentTokenLimits(): Promise<number> {
  console.log('\n━━━ SUITE 6: Valores límite por tokens en documentos (BVA) ━━━━━━━━');
  let failures = 0;

  const SEED_PATH = resolve(process.cwd(), 'data/seeds/propiedades.json');
  const propiedades = JSON.parse(readFileSync(SEED_PATH, 'utf-8')) as Propiedad[];

  const tokenCounts: { id: string; tokens: number; chars: number }[] = [];

  for (const p of propiedades) {
    const doc = buildDocumentLocal(p);
    tokenCounts.push({ id: p.id, tokens: approxTokens(doc), chars: doc.length });
  }

  const sorted = [...tokenCounts].sort((a, b) => b.tokens - a.tokens);
  const max = sorted[0].tokens;
  const min = sorted[sorted.length - 1].tokens;
  const avg = Math.round(tokenCounts.reduce((s, x) => s + x.tokens, 0) / tokenCounts.length);
  const p95idx = Math.floor(sorted.length * 0.05);
  const p95 = sorted[p95idx > 0 ? p95idx : 0].tokens;

  console.log(`  Documentos analizados : ${tokenCounts.length}`);
  console.log(`  Tokens — mín: ${min}  promedio: ${avg}  p95: ${p95}  máx: ${max}`);
  console.log(`  Umbral seguro: ${TOKEN_SAFE_LIMIT} t  |  Límite del modelo: ${TOKEN_MODEL_LIMIT} t`);
  console.log('');

  // Verificar cada documento por zona BVA
  for (const { id, tokens } of sorted) {
    if (tokens > TOKEN_MODEL_LIMIT) {
      fail(`${id}  → ${tokens} t  ← TRUNCACIÓN ACTIVA (supera ${TOKEN_MODEL_LIMIT})`);
      failures++;
    } else if (tokens > TOKEN_SAFE_LIMIT) {
      fail(`${id}  → ${tokens} t  ← RIESGO (supera umbral seguro ${TOKEN_SAFE_LIMIT})`);
      failures++;
    } else if (tokens > TOKEN_WARN_LIMIT) {
      console.log(`  ⚠   ${id}  → ${tokens} t  (zona advertencia ${TOKEN_WARN_LIMIT}–${TOKEN_SAFE_LIMIT})`);
    } else {
      pass(`${id}  → ${tokens} t  ✓`);
    }
  }

  // Resumen de zonas BVA
  const zonas = {
    truncacion: tokenCounts.filter(x => x.tokens > TOKEN_MODEL_LIMIT).length,
    riesgo:     tokenCounts.filter(x => x.tokens > TOKEN_SAFE_LIMIT && x.tokens <= TOKEN_MODEL_LIMIT).length,
    advertencia:tokenCounts.filter(x => x.tokens > TOKEN_WARN_LIMIT && x.tokens <= TOKEN_SAFE_LIMIT).length,
    segura:     tokenCounts.filter(x => x.tokens <= TOKEN_WARN_LIMIT).length,
  };

  console.log('\n  Resumen de zonas BVA:');
  console.log(`    TRUNCACIÓN   (>${TOKEN_MODEL_LIMIT} t):    ${zonas.truncacion} docs`);
  console.log(`    RIESGO       (${TOKEN_SAFE_LIMIT}–${TOKEN_MODEL_LIMIT} t): ${zonas.riesgo} docs`);
  console.log(`    ADVERTENCIA  (${TOKEN_WARN_LIMIT}–${TOKEN_SAFE_LIMIT} t): ${zonas.advertencia} docs`);
  console.log(`    SEGURA       (≤${TOKEN_WARN_LIMIT} t):   ${zonas.segura} docs`);

  if (failures === 0) {
    pass(`Todos los documentos están dentro del umbral seguro (≤${TOKEN_SAFE_LIMIT} tokens)`);
  } else {
    console.error(`\n  Acción: revisar buildDocument() en scripts/seed-chromadb.ts y reducir`);
    console.error(`  los campos que generan más tokens, o dividir la descripción en dos campos.`);
  }

  return failures;
}

// -----------------------------------------------------------------------
// Runner de pruebas IA — orquesta todas las suites
// -----------------------------------------------------------------------
async function runModelTests(): Promise<void> {
  console.log('\n\n' + '═'.repeat(72));
  console.log('  PRUEBAS ESPECÍFICAS DE IA — UC-01 Búsqueda Semántica');
  console.log('═'.repeat(72));

  const results = await Promise.allSettled([
    testEmbeddingQuality(),
    testQueryRobustness(),
    testOutOfDomain(),
    testDeterminism(),
    testLatency(),
    testDocumentTokenLimits(),
  ]);

  const failures = results.reduce((total, r) => {
    return total + (r.status === 'fulfilled' ? r.value : 1);
  }, 0);

  console.log('\n' + '─'.repeat(72));
  console.log(`\nResumen pruebas IA:`);
  console.log(`  Suite 1 — Calidad embeddings:    ${results[0].status === 'fulfilled' && results[0].value === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Suite 2 — Robustez de queries:   ${results[1].status === 'fulfilled' && results[1].value === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Suite 3 — Queries fuera dominio: ${results[2].status === 'fulfilled' && results[2].value === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Suite 4 — Determinismo:          ${results[3].status === 'fulfilled' && results[3].value === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Suite 5 — Latencia:              ${results[4].status === 'fulfilled' && results[4].value === 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Suite 6 — Tokens docs ChromaDB:  ${results[5].status === 'fulfilled' && results[5].value === 0 ? 'PASS' : 'FAIL'}`);

  if (failures > 0) {
    console.error(`\nFAIL: ${failures} prueba(s) de IA fallaron.`);
    process.exit(1);
  }

  console.log('\nPASS: Todas las pruebas de IA superadas.');
}

// -----------------------------------------------------------------------
// Entry point — corre evaluación de métricas primero, luego pruebas de IA
// -----------------------------------------------------------------------
async function main() {
  await runEvaluation();
  await runModelTests();
}

main().catch(err => {
  console.error('Error en evaluacion:', err);
  process.exit(1);
});
