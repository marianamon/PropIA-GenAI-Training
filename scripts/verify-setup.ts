/**
 * Verifica que el setup global esté completo y funcional.
 *
 * Uso: npm run verify
 */
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import { embed, EMBEDDING_DIMENSIONS } from '../packages/embeddings/src/embed.js';
import { heartbeat, getOrCreateCollection, COLECCION_PROPIEDADES } from '../packages/db/src/chroma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const checks: Array<{ name: string; fn: () => Promise<void> }> = [
  {
    name: 'Archivos de configuración presentes',
    fn: async () => {
      const required = [
        'docker-compose.yml',
        '.env.example',
        'package.json',
        'tsconfig.base.json',
      ];
      for (const f of required) {
        if (!existsSync(resolve(ROOT, f))) throw new Error(`Falta ${f}`);
      }
    },
  },
  {
    name: 'Variable ANTHROPIC_API_KEY definida',
    fn: async () => {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key || key.startsWith('sk-ant-tu-key')) {
        throw new Error('Edita .env y pon tu ANTHROPIC_API_KEY real');
      }
    },
  },
  {
    name: 'Seed data presente',
    fn: async () => {
      const seeds = [
        'data/seeds/propiedades.json',
        'data/seeds/leads.json',
        'data/seeds/golden-dataset.json',
        'data/seeds/contrato-ejemplo.txt',
      ];
      for (const f of seeds) {
        if (!existsSync(resolve(ROOT, f))) throw new Error(`Falta ${f}`);
      }
    },
  },
  {
    name: 'ChromaDB respondiendo',
    fn: async () => {
      await heartbeat();
    },
  },
  {
    name: 'Colección propiedades indexada (20 docs)',
    fn: async () => {
      const col = await getOrCreateCollection(COLECCION_PROPIEDADES);
      const count = await col.count();
      if (count < 20) {
        throw new Error(`Colección tiene ${count} docs, esperado 20. Corre: npm run seed:chromadb`);
      }
    },
  },
  {
    name: 'embed() produce vector de 384 dimensiones',
    fn: async () => {
      const v = await embed('apartamento tranquilo cerca metro');
      if (v.length !== EMBEDDING_DIMENSIONS) {
        throw new Error(`embed() retorna ${v.length} dims, esperado ${EMBEDDING_DIMENSIONS}`);
      }
    },
  },
  {
    name: 'PDF de contrato generado',
    fn: async () => {
      if (!existsSync(resolve(ROOT, 'data/seeds/contrato-ejemplo.pdf'))) {
        throw new Error('Falta data/seeds/contrato-ejemplo.pdf — corre: npm run seed:pdf');
      }
    },
  },
];

async function main(): Promise<void> {
  console.log('PropIA — verificación del setup');
  console.log('---------------------------------');

  let failed = 0;
  for (const { name, fn } of checks) {
    try {
      await fn();
      console.log(`OK    ${name}`);
    } catch (err) {
      failed++;
      console.log(`FAIL  ${name}`);
      console.log(`        ${(err as Error).message}`);
    }
  }

  console.log('---------------------------------');
  if (failed > 0) {
    console.log(`${failed} chequeo(s) fallido(s). Revisa SETUP.md.`);
    process.exit(1);
  }
  console.log('Setup completo y funcional.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
