# Wireframes — UC-05: Agente de Seguimiento de Leads

> 5 pantallas del dashboard de leads para Federico y el log del agente autónomo

---

## Pantalla 1 — Dashboard de leads: estado general

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Mis Leads                     [Federico A. ▼]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Resumen · 40 propiedades activas · 25 leads                     │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │   NUEVO    │ │   CONTACTADO│ │   EN VISITA│ │   INACTIV│ │
│  │     8 leads  │ │    11 leads  │ │    4 leads   │ │   2 leads  │ │
│  │   3 > 24h  │ │   2 > 72h  │ │  1 visita hoy│ │            │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                      │
│   Agente IA — Próxima ejecución: en 2 horas                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Última ejecución: hace 2 horas · Acciones tomadas: 7        │   │
│  │   3 WhatsApp enviados    2 estados actualizados            │   │
│  │   1 visita agendada      1 lead marcado INACTIVO           │   │
│  │                                          [▶ Ejecutar ahora]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Lista de leads — Ordenados por urgencia                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   María García · NUEVO · Apto Laureles      3 días sin   │   │
│  │     "Quiero info sobre el parqueadero"       contacto       │   │
│  │                                    [ WhatsApp] [ Editar]  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │   Pedro Ruiz · NUEVO · Casa Envigado         1 día sin   │   │
│  │     "¿Cuánto es la cuota de administración?" contacto       │   │
│  │                                    [ WhatsApp] [ Editar]  │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │   Ana Bermúdez · EN VISITA · Apto Poblado   Hoy 4:00pm  │   │
│  │     "Visita confirmada"                       En 2 horas   │   │
│  │                                    [ Llamar] [ Editar]   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  [Ver todos los 25 leads]                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Agente ejecutando: log en tiempo real

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Agente ejecutándose...         [ Detener]           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Agente de leads — Ejecutando                                     │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   PENSANDO (iteración 1/20)                                │   │
│  │  "Obteniendo todos los leads de Federico para             │   │
│  │   analizar su estado actual..."                              │   │
│  │                                                              │   │
│  │    EJECUTANDO: get_leads({ agenteId: "juanfe-001" })       │   │
│  │   Resultado: 25 leads obtenidos                            │   │
│  │                                                              │   │
│  │   PENSANDO (iteración 2/20)                                │   │
│  │  "Veo 3 leads NUEVO con más de 24 horas sin contacto.       │   │
│  │   María García lleva 3 días — es la más urgente.            │   │
│  │   Voy a enviarle un WhatsApp de presentación..."            │   │
│  │                                                              │   │
│  │    EJECUTANDO: send_whatsapp({                             │   │
│  │       leadId: "lead-maria-001",                              │   │
│  │       message: "Hola María, soy Federico de PropIA..."   │   │
│  │     })                                                       │   │
│  │   Resultado: messageId: msg-1747324801                     │   │
│  │                                                              │   │
│  │    EJECUTANDO: update_lead_status({                        │   │
│  │       leadId: "lead-maria-001",                              │   │
│  │       estado: "CONTACTADO",                                  │   │
│  │       nota: "Enviado WhatsApp de presentación 2026-05-15"   │   │
│  │     })                                                       │   │
│  │   Estado actualizado                                        │   │
│  │                                                              │   │
│  │   PENSANDO (iteración 3/20)                                │   │
│  │  "Siguiente lead urgente: Pedro Ruiz, 1 día sin contacto..." │   │
│  │  ●●●                                                         │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Progreso: 3/25 leads procesados   Acciones tomadas: 3              │
│  ████████░░░░░░░░░░░░░░░░░░░░░░  12%                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 3 — Resumen de ejecución del agente

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Agente completado                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Ejecución completada — 14 may 2026, 3:45pm                      │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│   Resumen de acciones:                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   WhatsApps enviados:        5                             │   │
│  │   Emails enviados:           2                             │   │
│  │   Estados actualizados:      7                             │   │
│  │   Visitas agendadas:         1                             │   │
│  │   Notas agregadas:           9                             │   │
│  │    Tiempo de ejecución:       1 min 42 seg                 │   │
│  │   Iteraciones del loop:      12/20 máx                    │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Leads que requieren tu atención:                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │    Ivancho Hidalgo · EN_NEGOCIACION                        │   │
│  │     El agente no pudo agendar visita (sin disponibilidad)   │   │
│  │     → Requiere contacto manual                              │   │
│  │                                  [ Llamar] [ WhatsApp]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Log completo de acciones:                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  3:43pm  WhatsApp → María García "Hola María, soy Juan..." │   │
│  │  3:43pm  Estado → María García: NUEVO → CONTACTADO         │   │
│  │  3:43pm  WhatsApp → Pedro Ruiz "Hola Pedro, tenemos..."    │   │
│  │  3:44pm  Visita agendada → Ana Bermúdez: 16 may 4:00pm    │   │
│  │  3:44pm  Nota → Ivancho Hidalgo: "Sin respuesta 5 días"  │   │
│  │  [Ver log completo (23 entradas)]                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [◀ Dashboard]  [ Ejecutar de nuevo]  [ Configurar horario]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 4 — Detalle de lead: historial de acciones del agente

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Lead: María García               [◀ Volver]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   María García Rodríguez                                           │
│   +57 310 555 0123  ·   maria.garcia@email.com                  │
│  Estado actual:  CONTACTADO                                        │
│                                                                      │
│   Propiedad de interés:                                            │
│  Apartamento Laureles · 3 hab · $285M COP                           │
│                                                                      │
│   Mensaje inicial:                                                 │
│  "Quiero info sobre el parqueadero y la zona de ropas"              │
│                                                                      │
│   Historial de seguimiento:                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   Agente IA · 15 may 3:43pm                                │   │
│  │  Envió WhatsApp: "Hola María, soy Federico de PropIA.    │   │
│  │  Vi que tienes interés en el apto de Laureles. ¿Cuándo      │   │
│  │  podríamos coordinar una visita?"                            │   │
│  │  → Estado: NUEVO → CONTACTADO                                │   │
│  │                                                              │   │
│  │   Federico · 12 may 10:00am                             │   │
│  │  Nota manual: "Lead llegó por Finca Raíz. Interesada en     │   │
│  │  parqueadero y zona de ropas específicamente."               │   │
│  │                                                              │   │
│  │   Lead creado · 12 may 9:30am · Canal: PORTALES_EXTERNOS  │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Acciones:                                                           │
│  [ Responder WhatsApp]  [ Agendar visita]  [ Cambiar estado]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Configuración del agente: reglas y horario

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Configurar agente de leads       [Federico A. ▼]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Reglas del agente                                                │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  Leads NUEVO — Tiempo máximo sin contacto:                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [24 horas ▼]   → Acción: [Enviar WhatsApp ▼]               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Leads CONTACTADO — Tiempo máximo sin respuesta:                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [72 horas ▼]   → Acción: [Segundo follow-up ▼]             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Máximo de mensajes por lead por día:                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [1 mensaje ▼]                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Horario de ejecución automática:                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   Lunes – Viernes    Sábados    Domingos                 │   │
│  │  Hora: 9:00 AM  y  3:00 PM                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Notificaciones al agente:                                        │
│   WhatsApp cuando el agente toma una acción crítica                │
│   Email con resumen diario de acciones                             │
│   Push notification en app                                          │
│                                                                      │
│  [◀ Cancelar]                              [ Guardar cambios]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
