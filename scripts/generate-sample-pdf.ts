/**
 * Genera data/seeds/contrato-ejemplo.pdf a partir de contrato-ejemplo.txt.
 *
 * Uso: npm run seed:pdf
 */
import { readFileSync, createWriteStream } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TXT_PATH = resolve(__dirname, '../data/seeds/contrato-ejemplo.txt');
const PDF_PATH = resolve(__dirname, '../data/seeds/contrato-ejemplo.pdf');

function main(): void {
  console.log('PropIA — generando contrato PDF');
  console.log(`Input:  ${TXT_PATH}`);
  console.log(`Output: ${PDF_PATH}`);

  const text = readFileSync(TXT_PATH, 'utf-8');

  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    info: {
      Title: 'Promesa de Compraventa — Apartamento El Poblado',
      Author: 'PropIA Sample Data',
      Subject: 'Contrato de muestra para UC-06 (análisis de contratos)',
    },
  });

  const stream = createWriteStream(PDF_PATH);
  doc.pipe(stream);

  doc.font('Times-Roman').fontSize(11);

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('CLAUSULA') || line === 'PROMESA DE COMPRAVENTA DE BIEN INMUEBLE') {
      doc.font('Times-Bold').fontSize(12).text(line, { paragraphGap: 8 });
      doc.font('Times-Roman').fontSize(11);
    } else if (line.trim() === '') {
      doc.moveDown(0.5);
    } else {
      doc.text(line, { align: 'justify', paragraphGap: 4 });
    }
  }

  doc.end();

  stream.on('finish', () => {
    console.log('PDF generado correctamente.');
  });
  stream.on('error', (err) => {
    console.error('Error escribiendo PDF:', err);
    process.exit(1);
  });
}

main();
