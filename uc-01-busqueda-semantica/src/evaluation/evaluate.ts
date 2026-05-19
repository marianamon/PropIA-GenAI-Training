import { semanticSearch, type SearchResult } from '../search.js';

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

runEvaluation().catch(err => {
  console.error('Error en evaluacion:', err);
  process.exit(1);
});
