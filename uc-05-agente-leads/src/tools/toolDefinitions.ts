import type Anthropic from '@anthropic-ai/sdk';

export const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_leads',
    description:
      'Obtiene la lista de leads de un agente con su estado actual y días sin contacto. ' +
      'Úsala SIEMPRE primero para tener un panorama antes de tomar acciones.',
    input_schema: {
      type: 'object',
      properties: {
        agenteId: { type: 'string', description: 'ID del agente (ej: agente-juanfe-001)' },
        estado: {
          type: 'string',
          enum: ['NUEVO', 'CONTACTADO', 'EN_VISITA', 'EN_NEGOCIACION', 'CERRADO_GANADO', 'CERRADO_PERDIDO', 'INACTIVO'],
          description: 'Filtrar por estado (opcional — omitir para todos)',
        },
        diasSinContacto: {
          type: 'number',
          description: 'Solo leads con N o más días sin contacto (opcional)',
        },
      },
      required: ['agenteId'],
    },
  },
  {
    name: 'send_whatsapp',
    description:
      'Envía un mensaje de WhatsApp al prospecto del lead. ' +
      'Úsalo para primer contacto (lead NUEVO) o follow-up (CONTACTADO + días sin respuesta).',
    input_schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        message: {
          type: 'string',
          description: 'Texto del mensaje — claro y conciso, máx 300 chars, en español colombiano',
        },
      },
      required: ['leadId', 'message'],
    },
  },
  {
    name: 'update_lead_status',
    description:
      'Actualiza el estado de un lead y agrega nota de seguimiento. ' +
      'Úsalo SIEMPRE después de una acción para reflejar el cambio.',
    input_schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        estado: {
          type: 'string',
          enum: ['CONTACTADO', 'EN_VISITA', 'EN_NEGOCIACION', 'CERRADO_GANADO', 'CERRADO_PERDIDO', 'INACTIVO'],
        },
        nota: { type: 'string', description: 'Razón del cambio de estado' },
      },
      required: ['leadId', 'estado'],
    },
  },
  {
    name: 'schedule_visit',
    description: 'Agenda una visita a la propiedad del lead.',
    input_schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        fecha: { type: 'string', description: 'Formato YYYY-MM-DD' },
        hora: { type: 'string', description: 'Formato HH:MM en 24h' },
      },
      required: ['leadId', 'fecha', 'hora'],
    },
  },
  {
    name: 'add_note',
    description: 'Agrega una nota de seguimiento al lead sin cambiar su estado.',
    input_schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string' },
        nota: { type: 'string' },
      },
      required: ['leadId', 'nota'],
    },
  },
];
