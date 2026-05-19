import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Lead } from '@propia/shared';

// Carga los leads del seed (data/seeds/leads.json) al iniciar el proceso.
// En producción esto vendría de Postgres / MongoDB / etc.
const SEED_PATH = resolve(process.cwd(), 'data/seeds/leads.json');
const leadsDB: Lead[] = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

// Snapshot del envío de mensajes/visitas para inspección en tests.
const messageLog: Array<{ leadId: string; message: string; sentAt: string }> = [];
const visitsLog: Array<{ leadId: string; fecha: string; hora: string; scheduledAt: string }> = [];

export function getMessageLog(): ReadonlyArray<typeof messageLog[number]> {
  return messageLog;
}
export function getVisitsLog(): ReadonlyArray<typeof visitsLog[number]> {
  return visitsLog;
}

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case 'get_leads': {
      const { agenteId, estado, diasSinContacto } = toolInput as {
        agenteId: string;
        estado?: string;
        diasSinContacto?: number;
      };
      let leads = leadsDB.filter((l) => l.agenteId === agenteId);
      if (estado) leads = leads.filter((l) => l.estado === estado);
      if (diasSinContacto !== undefined) {
        const cutoffMs = Date.now() - diasSinContacto * 86_400_000;
        leads = leads.filter((l) => new Date(l.ultimoContacto).getTime() < cutoffMs);
      }
      return leads.map((l) => ({
        id: l.id,
        estado: l.estado,
        canal: l.canal,
        prospecto: l.nombreProspecto,
        propiedadId: l.propiedadId,
        ultimoContacto: l.ultimoContacto,
        diasSinContacto: Math.floor((Date.now() - new Date(l.ultimoContacto).getTime()) / 86_400_000),
        mensaje: l.mensaje,
        notas: l.notas,
        proximaAccion: l.proximaAccion,
      }));
    }

    case 'send_whatsapp': {
      const { leadId, message } = toolInput as { leadId: string; message: string };
      const sentAt = new Date().toISOString();
      messageLog.push({ leadId, message, sentAt });
      console.log(`[WhatsApp → ${leadId}] ${message}`);
      return { success: true, messageId: `msg-${Date.now()}`, leadId };
    }

    case 'update_lead_status': {
      const { leadId, estado, nota } = toolInput as {
        leadId: string;
        estado: string;
        nota?: string;
      };
      const lead = leadsDB.find((l) => l.id === leadId);
      if (!lead) return { success: false, error: `lead ${leadId} no existe` };
      lead.estado = estado as Lead['estado'];
      lead.ultimoContacto = new Date().toISOString();
      if (nota) lead.notas.push(`[${lead.ultimoContacto}] ${nota}`);
      return { success: true, leadId, nuevoEstado: estado };
    }

    case 'schedule_visit': {
      const { leadId, fecha, hora } = toolInput as {
        leadId: string;
        fecha: string;
        hora: string;
      };
      visitsLog.push({ leadId, fecha, hora, scheduledAt: new Date().toISOString() });
      console.log(`[Visita agendada → ${leadId}] ${fecha} ${hora}`);
      return { success: true, visitId: `visit-${Date.now()}`, leadId, fecha, hora };
    }

    case 'add_note': {
      const { leadId, nota } = toolInput as { leadId: string; nota: string };
      const lead = leadsDB.find((l) => l.id === leadId);
      if (!lead) return { success: false, error: `lead ${leadId} no existe` };
      lead.notas.push(`[${new Date().toISOString()}] ${nota}`);
      return { success: true };
    }

    default:
      throw new Error(`Tool desconocida: ${toolName}`);
  }
}
