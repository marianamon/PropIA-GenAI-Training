import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export interface ChunkAnalysis {
  clausulas: Array<{
    numero?: number;
    titulo: string;
    contenido: string;
    riesgo: 'ALTO' | 'MEDIO' | 'BAJO' | 'INFORMATIVO';
    nota?: string;
  }>;
  entidades: {
    partes?: string[];
    valores?: string[];
    fechas?: string[];
    penalidades?: string[];
  };
}

const MAP_SYSTEM_PROMPT = `Eres un asistente de análisis de contratos inmobiliarios colombianos.
Analizas un fragmento del contrato (no el contrato completo) y extraes:
1. Cláusulas presentes en este fragmento, cada una con su nivel de riesgo:
   - ALTO: cláusulas que pueden perjudicar gravemente al comprador o arrendatario
     (renuncia a derechos, cláusulas penales excesivas > 25%, renuncia a vicios ocultos,
      renuncia a lesión enorme, jurisdicción inusual, etc.)
   - MEDIO: cláusulas que merecen atención y negociación
   - BAJO: cláusulas estándar sin riesgo especial
   - INFORMATIVO: datos del contrato sin implicación de riesgo
2. Entidades mencionadas: partes (nombres), valores en COP, fechas, penalidades

Retorna SOLO JSON válido con la estructura:
{
  "clausulas": [{ "numero": N, "titulo": "...", "contenido": "...", "riesgo": "ALTO|MEDIO|BAJO|INFORMATIVO", "nota": "..." }],
  "entidades": { "partes": [], "valores": [], "fechas": [], "penalidades": [] }
}

Sin texto antes ni después del JSON, sin code fences.`;

export async function analyzeChunk(chunkText: string, chunkIndex: number): Promise<ChunkAnalysis> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // modelo rápido y económico para chunks individuales
    max_tokens: 1500,
    temperature: 0.1, // baja temperatura para extracción de datos
    system: MAP_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analiza este fragmento (chunk ${chunkIndex + 1}) del contrato:\n\n---\n${chunkText}\n---\n\nRetorna el JSON con clausulas y entidades.`,
      },
    ],
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '{}';

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { clausulas: [], entidades: {} };

  try {
    return JSON.parse(match[0]) as ChunkAnalysis;
  } catch {
    return { clausulas: [], entidades: {} };
  }
}
