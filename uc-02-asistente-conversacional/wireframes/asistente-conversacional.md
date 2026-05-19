# Wireframes — UC-02: Asistente Conversacional

> 5 pantallas del flujo de chat de PropIA con el asistente RAG

---

## Pantalla 1 — Estado inicial del asistente

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA                                    [Valentina ▼]  [···]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                      Hola, Valentina                        │  │
│  │                                                               │  │
│  │           Soy tu asistente inmobiliario de PropIA.            │  │
│  │      Puedo ayudarte a encontrar la propiedad ideal,           │  │
│  │   responder preguntas sobre ubicaciones, precios y más.       │  │
│  │                                                               │  │
│  │                 ¿En qué puedo ayudarte hoy?                   │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   Sugerencias de inicio:                                           │
│  ┌────────────────────────┐  ┌─────────────────────────────────┐    │
│  │  Buscar propiedades  │  │  ¿Cuánto vale un apto en El   │    │
│  │    cerca del metro     │  │    Poblado?                     │    │
│  └────────────────────────┘  └─────────────────────────────────┘    │
│  ┌────────────────────────┐  ┌─────────────────────────────────┐    │
│  │  ¿Qué es el estrato  │  │  Ver mis resultados de        │    │
│  │    y cómo me afecta?   │  │    la última búsqueda           │    │
│  └────────────────────────┘  └─────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Escribe tu pregunta...                          [Enviar ▶]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Conversación activa: RAG respondiendo con datos reales

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Asistente                         [Nueva sesión]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                           ▲ scroll  │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    Valentina                          hace 2 min          ║  │
│  ║                                                               ║  │
│  ║  Quiero algo tranquilo cerca del metro con buena vista        ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    PropIA                               hace 1 min          ║  │
│  ║                                                               ║  │
│  ║  Encontré 3 propiedades que coinciden con lo que buscas:      ║  │
│  ║                                                               ║  │
│  ║   1. Apto piso 8 · Barrio Colombia · $290M COP              ║  │
│  ║       Vista al Valle de Aburrá · 72m² · 2 hab                 ║  │
│  ║        Cerca Estación Colombia Metro                          ║  │
│  ║        Pet-friendly · Vigilancia 24h                          ║  │
│  ║                                                               ║  │
│  ║   2. Apartaestudio · Laureles · $185M COP                   ║  │
│  ║       Vista a la montaña · 42m² · 1 hab                       ║  │
│  ║        A 400m Estación Suramericana                          ║  │
│  ║                                                               ║  │
│  ║   3. Apto · Envigado · $320M COP                            ║  │
│  ║       Vista panorámica · 89m² · 3 hab                         ║  │
│  ║        Metro Cable Envigado a 5 min                          ║  │
│  ║                                                               ║  │
│  ║  ¿Te gustaría saber más sobre alguna en particular?           ║  │
│  ║                                                               ║  │
│  ║   Fuentes: 3 propiedades de ChromaDB                        ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    Valentina                          ahora               ║  │
│  ║                                                               ║  │
│  ║  ¿Cuál acepta mascotas y tiene parqueadero?                   ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ┌──  PropIA está escribiendo... ──────────────────────────────┐  │
│  │   ●●●                                                         │  │
│  └────────────────────────────────────────────────────────────── ┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ¿Cuál acepta mascotas y tiene parqueadero?       [Enviar ▶] │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 3 — Respuesta con contexto de conversación previa (query rewriting)

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Asistente                     [Sesión: 5 mensajes]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    Valentina                                               ║  │
│  ║                                                               ║  │
│  ║  ¿Y cuánto sería la cuota mensual de la primera?             ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    PropIA                                                   ║  │
│  ║                                                               ║  │
│  ║  Para el apartamento en Barrio Colombia ($290M COP):          ║  │
│  ║                                                               ║  │
│  ║   Estimación de crédito hipotecario:                        ║  │
│  ║                                                               ║  │
│  ║  Con cuota inicial del 30% ($87M COP):                        ║  │
│  ║  Monto a financiar: $203M COP                                 ║  │
│  ║                                                               ║  │
│  ║  Plazo 15 años · Tasa ~12% E.A.:   ~$2.400.000/mes            ║  │
│  ║  Plazo 20 años · Tasa ~12% E.A.:   ~$2.100.000/mes            ║  │
│  ║                                                               ║  │
│  ║    Esta es una estimación orientativa. El banco hará        ║  │
│  ║  un estudio de crédito con tus ingresos reales.               ║  │
│  ║                                                               ║  │
│  ║  ¿Quieres que te explique el proceso de crédito hipotecario   ║  │
│  ║  en Colombia o agendar una visita?                            ║  │
│  ║                                                               ║  │
│  ║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║  │
│  ║   Query reescrita: "cuota mensual crédito Apto              ║  │
│  ║  Barrio Colombia $290M a 15 años"                             ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Escribe tu pregunta...                          [Enviar ▶]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 4 — Límite de conocimiento: sin datos suficientes

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Asistente                    [Sesión: 8 mensajes]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    Valentina                                               ║  │
│  ║                                                               ║  │
│  ║  ¿Hay algo disponible en Sabaneta por menos de $200M?         ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ╔═══════════════════════════════════════════════════════════════╗  │
│  ║    PropIA                                                   ║  │
│  ║                                                               ║  │
│  ║    No encontré propiedades en Sabaneta con ese presupuesto  ║  │
│  ║  en nuestro catálogo actual.                                  ║  │
│  ║                                                               ║  │
│  ║  Lo que sí tengo disponible:                                  ║  │
│  ║  • Envigado bajo $250M: 2 opciones                            ║  │
│  ║  • Itagüí bajo $200M: 1 opción                                ║  │
│  ║  • Robledo bajo $200M: 1 opción                               ║  │
│  ║                                                               ║  │
│  ║  ¿Quieres que te muestre alguna de estas alternativas         ║  │
│  ║  o prefieres ampliar el presupuesto para Sabaneta?            ║  │
│  ╚═══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Escribe tu pregunta...                          [Enviar ▶]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Vista de historial y control de sesión

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Mis conversaciones                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │    HOY                                                       │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │    Sesión activa · 12 mensajes                       │   │  │
│  │  │  "Quiero algo tranquilo cerca del metro..."           │   │  │
│  │  │  Hace 5 minutos                     [Continuar →]    │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │    AYER                                                      │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │    Sesión completada · 6 mensajes                    │   │  │
│  │  │  "¿Qué documentos necesito para comprar..."           │   │  │
│  │  │  Ayer 3:45pm                          [Ver →]         │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  │                                                               │  │
│  │    HACE 3 DÍAS                                              │  │
│  │                                                               │  │
│  │  ┌───────────────────────────────────────────────────────┐   │  │
│  │  │    Sesión completada · 4 mensajes                    │   │  │
│  │  │  "¿Cuánto cuesta vivir en El Poblado..."              │   │  │
│  │  │  Hace 3 días                          [Ver →]         │   │  │
│  │  └───────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [ + Nueva conversación ]                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
