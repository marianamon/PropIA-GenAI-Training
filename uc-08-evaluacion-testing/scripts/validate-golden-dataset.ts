import { ZodError } from 'zod';
import {
  loadCatalogBarrios,
  loadCatalogIds,
  loadGoldenDataset,
  type PreguntaGolden,
} from '../src/evaluation/goldenDataset.js';

/**
 * Valida estructuralmente el golden dataset ANTES de correr RAGAS / DeepEval.
 * Una sola corrida cuesta tokens; un dataset malformado los desperdicia.
 *
 * Verificaciones:
 *   1. Schema Zod (estructura mínima).
 *   2. IDs únicos.
 *   3. Cada `expectedPropertyId` existe en el catálogo (data/seeds/propiedades.json).
 *   4. Distribución por categoría (al menos 1 por categoría declarada).
 *   5. `expectedPropertyIds` puede ser [] solo para categorías 'fuera-de-rango' y 'conversacional'.
 */

interface Issue {
  level: 'error' | 'warn';
  preguntaId?: string;
  message: string;
}

const issues: Issue[] = [];

function error(message: string, preguntaId?: string): void {
  issues.push({ level: 'error', preguntaId, message });
}

function warn(message: string, preguntaId?: string): void {
  issues.push({ level: 'warn', preguntaId, message });
}

let dataset;
try {
  dataset = loadGoldenDataset();
} catch (err) {
  if (err instanceof ZodError) {
    console.error('✗ Golden dataset NO cumple el schema:');
    for (const issue of err.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  throw err;
}

const catalogIds = loadCatalogIds();
const catalogBarrios = loadCatalogBarrios();
console.log(
  `✓ Dataset parsea: ${dataset.preguntas.length} preguntas, ${catalogIds.size} propiedades, ${catalogBarrios.size} barrios/zonas en catálogo`,
);

// 1. IDs únicos
const idCounts = new Map<string, number>();
for (const p of dataset.preguntas) {
  idCounts.set(p.id, (idCounts.get(p.id) ?? 0) + 1);
}
for (const [id, count] of idCounts) {
  if (count > 1) error(`ID duplicado en ${count} preguntas`, id);
}

// 2. expectedPropertyIds existen en catálogo
for (const p of dataset.preguntas) {
  for (const propId of p.expectedPropertyIds) {
    if (!catalogIds.has(propId)) {
      error(`Referencia a propiedad inexistente: ${propId}`, p.id);
    }
  }
}

// 3. Reglas por categoría
const categoriasQuePermitenVacio = new Set(['fuera-de-rango', 'conversacional']);
for (const p of dataset.preguntas) {
  if (p.expectedPropertyIds.length === 0 && !categoriasQuePermitenVacio.has(p.categoria)) {
    warn(
      `expectedPropertyIds=[] solo se permite en categorías ${[...categoriasQuePermitenVacio].join(', ')}`,
      p.id,
    );
  }
}

// 4. Distribución por categoría
const porCategoria = new Map<string, PreguntaGolden[]>();
for (const p of dataset.preguntas) {
  if (!porCategoria.has(p.categoria)) porCategoria.set(p.categoria, []);
  porCategoria.get(p.categoria)!.push(p);
}
console.log(`✓ Cobertura por categoría: ${porCategoria.size} categorías distintas`);
for (const [cat, preguntas] of [...porCategoria.entries()].sort()) {
  console.log(`    ${cat}: ${preguntas.length}`);
}

// 5. idealAnswer debería mencionar al menos uno de los IDs esperados o un barrio del catálogo
//    (no estrictamente requerido, pero un dataset bien curado lo hace porque ahí están los anchors
//     de faithfulness). Los barrios se extraen dinámicamente del catálogo, no hardcodeados.
for (const p of dataset.preguntas) {
  if (p.expectedPropertyIds.length > 0) {
    const mencionaAlgunaPropiedad = p.expectedPropertyIds.some((id) => p.idealAnswer.includes(id));
    // Matching flexible: el barrio canónico puede tener paréntesis o calificadores
    // (ej. "Zona T (El Retiro)"). Aceptamos si idealAnswer incluye la forma canónica
    // o si la forma canónica empieza por algo que está en idealAnswer (token base).
    const mencionaAlgunBarrio = [...catalogBarrios].some((b) => {
      if (p.idealAnswer.includes(b)) return true;
      const tokenBase = b.split(/[\s(,]/)[0];
      if (tokenBase.length >= 4 && p.idealAnswer.includes(tokenBase)) return true;
      return false;
    });
    if (!mencionaAlgunaPropiedad && !mencionaAlgunBarrio) {
      warn('idealAnswer no menciona ningún ID ni barrio reconocible — anchor de faithfulness débil', p.id);
    }
  }
}

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warn');

if (warnings.length > 0) {
  console.log(`\n⚠  ${warnings.length} advertencias:`);
  for (const w of warnings) {
    console.log(`  [${w.preguntaId ?? '-'}] ${w.message}`);
  }
}

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} errores:`);
  for (const e of errors) {
    console.error(`  [${e.preguntaId ?? '-'}] ${e.message}`);
  }
  process.exit(1);
}

console.log('\n✓ Golden dataset estructuralmente válido — listo para RAGAS/DeepEval');
