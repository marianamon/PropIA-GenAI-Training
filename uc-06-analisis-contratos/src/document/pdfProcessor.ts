import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface DocumentChunk {
  text: string;
  chunkIndex: number;
  pageNumberAprox: number;
}

export async function loadAndChunkPDF(filePath: string): Promise<DocumentChunk[]> {
  const loader = new PDFLoader(filePath);
  const pages = await loader.load();
  const fullText = pages.map((p) => p.pageContent).join('\n');

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500, // ~1000 tokens — deja espacio para el system prompt
    chunkOverlap: 200, // overlap para no perder contexto entre cláusulas
    separators: [
      '\nCLAUSULA', // separadores específicos de contratos colombianos
      '\nCLÁUSULA',
      '\nARTÍCULO',
      '\nARTICULO',
      '\nPÁRRAFO',
      '\nPARRAFO',
      '\n\n',
      '\n',
      ' ',
      '',
    ],
  });

  const chunks = await splitter.createDocuments([fullText]);
  const chunksPerPage = Math.max(1, Math.ceil(chunks.length / pages.length));

  return chunks.map((chunk, i) => ({
    text: chunk.pageContent,
    chunkIndex: i,
    pageNumberAprox: Math.floor(i / chunksPerPage) + 1,
  }));
}
