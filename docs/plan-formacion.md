# Plan de Formación — PropIA GenAI Training Path


## Quién eres y a dónde vas

**Punto de partida:** La mejor QA del mundo. Dominas TypeScript, Node.js, Playwright. Python: nivel básico.

**Punto de llegada:** La mejor Test Architect que diseña estrategias de testing para sistemas de IA y usa GenAI como herramienta en su práctica diaria.

**Principio de diseño:** Cada UC implementa una funcionalidad real de PropIA. No hay ejercicios abstractos. Cuando termines UC-01, habrás construido búsqueda semántica real. Cuando termines UC-08, sabrás testear el sistema completo (esto creeme, vale oro y no hay tester en COL preparado para ello).

---

## Mapa conceptual: qué aprendo en cada UC

```
NIVEL 1 — FUNDAMENTOS
├─ UC-01  Embeddings + Vector DB          ← Cómo los LLMs "entienden" texto
└─ UC-02  RAG + Memoria conversacional    ← Cómo los LLMs "recuerdan" contexto

NIVEL 2 — GENERACIÓN Y ANÁLISIS
├─ UC-03  Prompt Engineering avanzado     ← Cómo darle instrucciones precisas al LLM
└─ UC-04  Structured Outputs + Análisis   ← Cómo extraer datos estructurados del LLM

NIVEL 3 — AGENTES Y AUTOMATIZACIÓN
├─ UC-05  AI Agents + Tool Calling        ← Cómo el LLM toma decisiones y ejecuta acciones
└─ UC-06  Document Processing + RAG       ← Cómo el LLM lee y razona sobre documentos largos

NIVEL 4 — INTEGRACIÓN Y CALIDAD
├─ UC-07  MCP Protocol                    ← Cómo conectar herramientas externas al LLM
└─ UC-08  LLM Evaluation + Security       ← Cómo testear sistemas de IA
```

---

## Antes de empezar cualquier UC — prerrequisitos comunes

Estos checks aplican a **todos** los UCs. Confirma que están OK antes de tocar el primer UC:

```bash
# 1. Setup global completo
npm run verify
# → debe pasar los 7 chequeos (Archivos · API key · Seed data · ChromaDB
#   · Colección 20 docs · embed() 384 dims · PDF generado)

# 2. Tu API key de Anthropic funciona
curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-haiku-4-5-20251001","max_tokens":10,"messages":[{"role":"user","content":"hola"}]}' \
  | jq -r '.content[0].text // .error.message'
# → debe imprimir una respuesta de Claude, no un error

# 3. Node >= 20 y npm >= 10
node --version && npm --version
```

Si alguno falla, **detente** y revisa [`SETUP.md`](../SETUP.md) antes de avanzar. No vale la pena empezar un UC con el setup roto — vas a perder tiempo persiguiendo errores que no son del UC.

**Lo que ya tienes de fábrica** (no lo construyes en ningún UC):
- ChromaDB corriendo + 20 propiedades indexadas
- `@propia/shared` con `Propiedad`, `Lead`, `Contrato`, `Valuacion`, etc.
- `@propia/embeddings` con `embed(text)`
- `@propia/db` con `getOrCreateCollection`
- `data/seeds/` con propiedades, leads, contrato PDF y golden dataset

---

## Los 8 Use Cases

### UC-01 — Búsqueda semántica de propiedades
| Campo | Detalle |
|---|---|
| **Problema** | Valentina escribe "algo tranquilo cerca del metro con buena vista" y el buscador retorna cero resultados |
| **Solución** | Pipeline: texto → embedding → ChromaDB → ranking semántico → resultados |
| **Concepto GenAI** | Embeddings + Vector DB (ChromaDB local, Azure AI Search en prod) |
| **Stack** | TypeScript, `@xenova/transformers` (embeddings locales), ChromaDB |
| **Rol beneficiado** | Comprador |
| **Prerrequisito** | Ninguno — es el punto de partida |
| **Entregable** | API de búsqueda semántica funcional con datos de propiedades colombianas |
| **Carpeta** | [uc-01-busqueda-semantica/](../uc-01-busqueda-semantica/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| ChromaDB con 20 propiedades | incluido en `verify` | `Colección propiedades indexada (20 docs)` |
| `@propia/embeddings` funciona | incluido en `verify` | `embed() produce vector de 384 dimensiones` |
| Entiendes embeddings conceptualmente | Ver el video de StatQuest (16 min) abajo | Puedes explicar por qué "rey" y "monarca" tienen vectores cercanos |

> Este UC **no necesita la API key de Claude** — todo el cómputo de embeddings es local. Puedes hacerlo sin gastar un solo token.

**Conceptos que enseña:**
- Qué es un embedding y cómo se genera
- Por qué las distancias vectoriales capturan significado
- Cómo indexar documentos en ChromaDB
- Cómo medir calidad: precision@k, recall semántico

---

### UC-02 — Asistente conversacional de PropIA
| Campo | Detalle |
|---|---|
| **Problema** | Valentina quiere hacerle preguntas al sistema como si fuera un agente inmobiliario experto |
| **Solución** | RAG: recuperar propiedades relevantes y pasarlas como contexto al LLM en cada turno |
| **Concepto GenAI** | RAG + memoria conversacional (ventana de contexto, resumen) |
| **Stack** | TypeScript, Claude API, ChromaDB, Express |
| **Rol beneficiado** | Comprador / Agente |
| **Prerrequisito** | UC-01 completado (sabes hacer búsqueda semántica) |
| **Entregable** | Chatbot con memoria de conversación y grounding en datos reales |
| **Carpeta** | [uc-02-asistente-conversacional/](../uc-02-asistente-conversacional/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-01 terminado | `ls uc-01-busqueda-semantica/src/search.ts` | Archivo existe |
| `semanticSearch()` funciona | `curl localhost:3000/api/search -d '{"query":"metro"}'` (con UC-01 corriendo) | Retorna resultados JSON |
| `ANTHROPIC_API_KEY` válida | `curl` de prueba en "Antes de empezar cualquier UC" | Respuesta de Claude, no error |
| Entiendes RAG conceptualmente | Ver "RAG From Scratch — LangChain" (20 min) | Puedes explicar por qué inyectar contexto al prompt previene alucinaciones |

> **Primer UC que gasta tokens de Claude API**. Cada turno son ~1500-3000 tokens — con la cuota gratuita de Anthropic ($5) sobran para 1000+ turnos de prueba.

**Conceptos que enseña:**
- Qué es RAG y por qué previene alucinaciones
- Cómo gestionar el historial de conversación
- Chunking de documentos: tamaño y solapamiento óptimos
- Evaluación de calidad de respuestas RAG (faithfulness, relevance)

---

### UC-03 — Generador de fichas de inmuebles
| Campo | Detalle |
|---|---|
| **Problema** | Ivancho necesita publicar su apartamento pero no sabe cómo escribir una ficha atractiva |
| **Solución** | Generar descripciones profesionales a partir de los campos estructurados del inmueble |
| **Concepto GenAI** | Prompt engineering avanzado: few-shot, personas, chain-of-thought |
| **Stack** | TypeScript, Claude API, plantillas de prompt |
| **Rol beneficiado** | Vendedor / Agente |
| **Prerrequisito** | Ninguno (independiente — no necesita UC-01 ni ChromaDB) |
| **Entregable** | Generador que produce fichas en español colombiano a partir de un objeto Propiedad |
| **Carpeta** | [uc-03-generador-fichas/](../uc-03-generador-fichas/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| `@propia/shared` tiene `Propiedad` | `npx tsx -e "import('@propia/shared').then(m => console.log('Propiedad' in m ? 'OK' : 'FALTA'))"` | `OK` |
| Tienes una propiedad de input | `cat data/seeds/propiedades.json \| jq '.[1]'` | Imprime el penthouse de El Poblado |
| `ANTHROPIC_API_KEY` válida | `curl` de prueba en "Antes de empezar cualquier UC" | Respuesta de Claude |
| Has leído la guía de prompt engineering de Anthropic | [Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) | Entiendes role, few-shot, CoT, XML structuring |

> Puedes hacer este UC **antes o después de UC-02** — es totalmente independiente. No usa ChromaDB ni embeddings.

**Conceptos que enseña:**
- Anatomía de un prompt: rol, contexto, tarea, formato, restricciones
- Few-shot prompting con ejemplos reales
- Chain-of-thought para generación estructurada
- Evaluación de calidad de texto generado

---

### UC-04 — Valoración asistida de propiedades
| Campo | Detalle |
|---|---|
| **Problema** | Ivancho y Valentina necesitan saber si el precio del apartamento es justo para el mercado |
| **Solución** | El LLM analiza comparables, ubica la propiedad en el mercado y genera un rango de valor justificado |
| **Concepto GenAI** | Structured outputs: respuestas JSON tipadas, análisis con razonamiento |
| **Stack** | TypeScript, Claude API (tool_use), Zod, ChromaDB |
| **Rol beneficiado** | Comprador / Vendedor |
| **Prerrequisito** | UC-01 (búsqueda semántica para comparables) |
| **Entregable** | Endpoint que retorna valoración estructurada con justificación y rango de confianza |
| **Carpeta** | [uc-04-valoracion-asistida/](../uc-04-valoracion-asistida/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-01 terminado | `ls uc-01-busqueda-semantica/src/search.ts` | Existe (este UC reusa `semanticSearch`) |
| `@propia/shared` tiene `Valuacion`, `Comparable` | `npx tsx -e "import('@propia/shared').then(m => console.log(['Valuacion' in m, 'Comparable' in m].join(', ')))"` | `true, true` |
| `ANTHROPIC_API_KEY` válida | `curl` de prueba en "Antes de empezar cualquier UC" | Respuesta de Claude |
| Has leído la guía de tool use de Anthropic | [Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) | Entiendes `tool_use`, `input_schema`, `tool_choice` |
| Conoces Zod básico | [`zod.dev`](https://zod.dev) | Sabes la diferencia entre `.parse()` y `.safeParse()` |

> No depende de UC-02 ni de UC-03 — puedes hacerlo en paralelo si quieres.

**Conceptos que enseña:**
- Cómo forzar al LLM a responder en JSON tipado
- Validación de outputs con Zod (TypeScript)
- Razonamiento analítico: comparables y variables de mercado
- Calibración de confianza en estimaciones LLM

---

### UC-05 — Agente de seguimiento de leads
| Campo | Detalle |
|---|---|
| **Problema** | Federico tiene 40 propiedades activas y no puede hacer seguimiento manual a cada prospecto |
| **Solución** | Un agente que revisa el estado de los leads, decide la próxima acción y la ejecuta (email, nota, cambio de estado) |
| **Concepto GenAI** | AI Agents + Tool Calling: el LLM decide qué herramienta usar y cuándo |
| **Stack** | TypeScript, Claude API (tool_use loop), LangGraph (opcional) |
| **Rol beneficiado** | Agente / Broker |
| **Prerrequisito** | UC-04 (entiendes `tool_use` con Anthropic SDK) |
| **Entregable** | Agente autónomo con loop de decisión observable y herramientas de CRM |
| **Carpeta** | [uc-05-agente-leads/](../uc-05-agente-leads/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-04 terminado | Saber implementar `tool_use` con Anthropic SDK | Tu UC-04 retorna JSON validado por Zod |
| Seed de leads disponible | `cat data/seeds/leads.json \| jq 'length'` | `10` |
| `@propia/shared` tiene `Lead`, `EstadoLead` | `npx tsx -e "import('@propia/shared').then(m => console.log('Lead' in m))"` | `true` |
| Entiendes ReAct conceptualmente | Ver "LangGraph Tutorial" abajo | Puedes explicar el loop Thought → Action → Observation |

> **Atención al costo**: cada iteración del agente cuesta tokens. Un run típico son 5-15 iteraciones × 2000 tokens = ~$0.05-0.15 USD con Sonnet. Para pruebas masivas usa `claude-haiku-4-5-20251001`.

**Conceptos que enseña:**
- Arquitectura ReAct: Reason → Act → Observe
- Tool calling: definir herramientas que el LLM puede invocar
- Grafos de estados con LangGraph
- Testing de agentes: trazabilidad y reproducibilidad

---

### UC-06 — Análisis inteligente de contratos
| Campo | Detalle |
|---|---|
| **Problema** | Federico recibe una promesa de compraventa de 30 páginas y necesita identificar cláusulas de riesgo |
| **Solución** | Pipeline que procesa el PDF, extrae cláusulas relevantes y genera un resumen de riesgos |
| **Concepto GenAI** | Document processing: chunking de PDFs, RAG sobre documentos largos, extracción de entidades |
| **Stack** | TypeScript, Claude API (haiku para chunks + sonnet para consolidación), LangChain document loaders |
| **Rol beneficiado** | Agente / Comprador |
| **Prerrequisito** | UC-04 (structured outputs con tool_use + Zod) |
| **Entregable** | Analizador de contratos con extracción de cláusulas críticas y reporte de riesgos |
| **Carpeta** | [uc-06-analisis-contratos/](../uc-06-analisis-contratos/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-04 terminado | Sabes hacer structured outputs con `tool_use` + Zod | Tu UC-04 funciona |
| Contrato PDF disponible | `ls -lh data/seeds/contrato-ejemplo.pdf` | Archivo de 9-25 KB existe |
| Inspeccionaste el contrato | `cat data/seeds/contrato-ejemplo.txt \| head -40` | Lees cláusulas 1-3 (objeto, precio, entrega) |
| Identificas las cláusulas problemáticas | Lee el `.txt` completo | Marcas las cláusulas **séptima** (lesión enorme) y **novena** (vicios ocultos) como riesgosas |
| Has leído sobre long context | [Long Context Tips de Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips) | Conoces cuándo usar contexto completo vs map-reduce |

> **Disclaimer legal**: este UC es educativo. Las cláusulas marcadas como `ALTO` en el seed son **intencionalmente problemáticas** para que tu sistema las detecte. En producción, cualquier análisis legal debe ser revisado por un abogado real.

**Conceptos que enseña:**
- Estrategias de chunking para documentos legales
- Map-reduce sobre documentos largos
- Extracción de información estructurada desde texto libre
- Consideraciones legales y limitaciones del LLM en contexto jurídico

---

### UC-07 — MCP Server para brokers
| Campo | Detalle |
|---|---|
| **Problema** | Federico quiere consultar PropIA desde su asistente de IA favorito sin cambiar de herramienta |
| **Solución** | Servidor MCP que expone las capacidades de PropIA como herramientas consumibles por cualquier cliente MCP |
| **Concepto GenAI** | Model Context Protocol: estándar abierto de Anthropic para integración de herramientas |
| **Stack** | TypeScript, `@modelcontextprotocol/sdk`, Claude Desktop |
| **Rol beneficiado** | Agente / Broker |
| **Prerrequisito** | UC-01 (search), UC-03 (generador), UC-04 (valoración), UC-05 (leads) — este UC los integra |
| **Entregable** | MCP Server funcional con herramientas: buscar propiedades, consultar leads, generar fichas |
| **Carpeta** | [uc-07-mcp-server-brokers/](../uc-07-mcp-server-brokers/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-01 implementado | `ls uc-01-busqueda-semantica/src/search.ts` | Existe |
| UC-03 implementado | `ls uc-03-generador-fichas/src/generator/fichaGenerator.ts` | Existe |
| UC-04 implementado | `ls uc-04-valoracion-asistida/src/valuation/valuationEngine.ts` | Existe |
| UC-05 implementado | `ls uc-05-agente-leads/src/tools/toolExecutors.ts` | Existe |
| Tienes Claude Desktop instalado | `ls "/Applications/Claude.app" 2>/dev/null \|\| echo NO` | Imprime la ruta, no "NO" |
| Has hecho el curso oficial de MCP | [Intro to MCP — Anthropic Academy](https://anthropic.skilljar.com/introduction-to-model-context-protocol) | Entiendes hosts, clients, servers, tools, resources |

> Este es el UC que **más fricciones operativas tiene** — configuración de Claude Desktop, rutas absolutas, debugging via `stderr` (no `stdout`). Reserva 2-3 horas. Si fallas configurando Claude Desktop, prueba primero con `npx @modelcontextprotocol/inspector` antes de tocar el config real.

**Conceptos que enseña:**
- Arquitectura MCP: hosts, clients, servers, resources, tools, prompts
- Implementar un MCP Server en TypeScript
- Integración con Claude Desktop como cliente MCP
- Debugging de servidores MCP

---

### UC-08 — Evaluación y testing del sistema
| Campo | Detalle |
|---|---|
| **Problema** | ¿Cómo sabemos que el sistema funciona correctamente? ¿Cómo lo testeamos de forma sistemática? |
| **Solución** | Suite de evaluación completa: métricas de RAG, evaluación de agentes, tests de adversariales, monitoring |
| **Concepto GenAI** | LLM evaluation: RAGAS, DeepEval, Promptfoo + security testing de sistemas AI |
| **Stack** | Python (RAGAS, DeepEval), TypeScript (Promptfoo), Playwright para e2e |
| **Rol beneficiado** | QA / Test Architect (**este UC es donde tu experiencia se vuelve diferencial**) |
| **Prerrequisito** | UC-01 al UC-07 (al menos UC-01, UC-02, UC-03 funcionando para evaluación mínima viable) |
| **Entregable** | Framework de evaluación completo con pipeline CI/CD para monitoreo continuo |
| **Carpeta** | [uc-08-evaluacion-testing/](../uc-08-evaluacion-testing/README.md) |

**Prerrequisitos verificables — confirma esto antes de empezar:**

| Check | Comando | Esperado |
|---|---|---|
| Setup global OK | `npm run verify` | 7/7 chequeos pasan |
| UC-01 y UC-02 corriendo | API de UC-02 en localhost:3000 | RAGAS necesita llamar tu chat endpoint |
| Golden dataset disponible | `cat data/seeds/golden-dataset.json \| jq '.preguntas \| length'` | `20` |
| Python 3.11 disponible | `python3 --version` | `3.11.x` (3.13 puede tener problemas con torch) |
| Espacio para descargar torch | `df -h ~ \| tail -1` | Al menos 5GB libres (torch + dependencias ML) |
| Has leído sobre RAGAS | [RAGAS Docs](https://docs.ragas.io/en/stable/) | Entiendes faithfulness, answer_relevancy, context_precision |

> **Path realista** si no has terminado todos los UCs: empieza UC-08 con solo UC-01 y UC-02 implementados. RAGAS sobre el chat de UC-02 ya te da el 70% del valor. Luego agregas tests de UC-03, UC-05 conforme los completes.
>
> **No esperes a "tener todo terminado"** — el testing es parte del desarrollo, no algo posterior. De hecho, hacer UC-08 mientras desarrollas los demás UCs es el orden recomendado para tu perfil de Test Architect.

**Conceptos que enseña:**
- Métricas de evaluación RAG: faithfulness, answer relevancy, context precision
- Evaluación de agentes: task completion rate, tool selection accuracy
- Adversarial testing: prompt injection, jailbreaking, data exfiltration
- LLM-as-judge: usar un LLM para evaluar otro LLM
- Testing de sistemas no-determinísticos

---

### Fundamentos GenAI — leer/ver antes de UC-01

| Recurso | Tipo | Por qué verlo primero |
|---|---|---|
| [Neural Networks — 3Blue1Brown](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi)  | YouTube · Gratuito · 4 videos | Intuición visual de cómo funcionan las redes neuronales. No requiere matemática avanzada. Es la base conceptual de todo lo que sigue. |
| [Word Embedding and Word2Vec, Clearly Explained — StatQuest](https://www.youtube.com/watch?v=viZrOnJclY0)  | YouTube · Gratuito · ~16 min | Explica cómo el texto se convierte en números con significado. Directamente aplicable a UC-01. |
| [Anthropic Docs — Intro to Claude](https://docs.anthropic.com/en/docs/intro-to-claude)  | Docs oficiales · Gratuito | Panorama del API: modelos, capacidades, límites. Leer antes de escribir la primera línea de código. |

---

### UC-01 — Embeddings y Vector DB

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [ChromaDB — Introducción](https://docs.trychroma.com/docs/overview/introduction)  | Docs oficiales · Gratuito | Getting started oficial de ChromaDB: instalación, colecciones, upsert y query. Es el punto de partida del UC-01. |
| [Mastering Vector Databases & Embedding Models in 2025 — Udemy](https://www.udemy.com/course/mastering-vector-databases-embedding-models-in-2025/)  | Udemy | Cubre embeddings + vector DBs (ChromaDB, Pinecone, Weaviate) de principio a fin con código. Ideal si quieres profundidad más allá de la documentación. |
| [LangChain.js — Documentación oficial](https://docs.langchain.com/oss/javascript/langchain/overview)  | Docs oficiales · Gratuito | Documentación principal de LangChain en TypeScript. Integrations, chains y retrieval — todo lo que se usa en UC-01 y UC-02. |

---

### UC-02 — RAG y memoria conversacional

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [LangChain.js — RAG Tutorial](https://docs.langchain.com/oss/javascript/langchain/overview)  | Docs oficiales · Gratuito | Implementación de RAG en TypeScript paso a paso. El punto de entrada oficial para UC-02. |
| [LangChain Framework for Beginners – Build AI Systems + RAG — Udemy](https://www.udemy.com/course/langchain-framework-for-beginners-build-ai-systems-rag/)  | Udemy | Curso práctico de LangChain con RAG: chains, memory, retrieval, agents. TypeScript-friendly. Recomendado si quieres un camino guiado por UC-01 y UC-02. |

---

### UC-03 — Prompt Engineering avanzado

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [Anthropic — Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)  | Docs oficiales · Gratuito | Guía oficial de Anthropic: roles, few-shot, chain-of-thought, XML structuring. El estándar de referencia para trabajar con Claude. |
| [The Complete Prompt Engineering for AI Bootcamp — Udemy](https://www.udemy.com/course/prompt-engineering-for-ai/)  | Udemy | Bootcamp actualizado a 2026: zero-shot, few-shot, CoT, personas, agentes. El más completo disponible en Udemy. |

---

### UC-04 — Structured Outputs

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [Anthropic — Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview)  | Docs oficiales · Gratuito | Cómo usar `tool_use` para forzar respuestas JSON estructuradas desde Claude. Base técnica del UC-04. |
| [Zod — Documentación oficial](https://zod.dev)  | Docs oficiales · Gratuito | Schema validation en TypeScript. Usado para validar en runtime que el JSON que devuelve el LLM cumple el tipo esperado. |

---

### UC-05 — AI Agents y Tool Calling

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [LangGraph.js — Documentación oficial](https://docs.langchain.com/oss/javascript/langgraph/overview)  | Docs oficiales · Gratuito | Framework para grafos de agentes en TypeScript: states, edges, checkpoints. El núcleo técnico del UC-05. |
| [LangGraph Tutorial — How to Build Advanced AI Agent Systems](https://www.youtube.com/watch?v=1w5cCXlh7JQ)  | YouTube · Gratuito | Tutorial práctico de LangGraph con código. Muestra el loop ReAct completo y cómo orquestar herramientas. |
| [Anthropic — Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview)  | Docs oficiales · Gratuito | Cómo Claude decide qué tool invocar y con qué parámetros. Base del tool calling del agente. |

---

### UC-06 — Document Processing

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [LangChain.js — Document Loaders](https://docs.langchain.com/oss/javascript/langchain/overview)  | Docs oficiales · Gratuito | Loaders para PDF, HTML, CSV, etc. en TypeScript. Punto de partida para procesar contratos en UC-06. |
| [Anthropic — Long Context Tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips)  | Docs oficiales · Gratuito | Cómo sacar el máximo al contexto de 200K tokens de Claude: posicionamiento de documentos, chunking, needle-in-a-haystack. |

---

### UC-07 — MCP Protocol

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [Introduction to Model Context Protocol — Anthropic Academy](https://anthropic.skilljar.com/introduction-to-model-context-protocol)  | Curso gratuito · Anthropic | Curso oficial gratuito de Anthropic: construye MCP servers y clients desde cero en Python. Cubre tools, resources y prompts. |
| [Model Context Protocol: Advanced Topics — Anthropic Academy](https://anthropic.skilljar.com/model-context-protocol-advanced-topics)  | Curso gratuito · Anthropic | Continúa el anterior: sampling, notifications, STDIO y StreamableHTTP transport, configuración para producción. |
| [MCP TypeScript SDK — GitHub](https://github.com/modelcontextprotocol/typescript-sdk)  | Repo oficial · Gratuito | SDK oficial en TypeScript para construir MCP servers. Es exactamente lo que se usa en UC-07. |

---

### UC-08 — LLM Evaluation y Security Testing

| Recurso | Tipo | Qué aporta |
|---|---|---|
| [RAGAS — Documentación oficial](https://docs.ragas.io/en/stable/)  | Docs oficiales · Gratuito | Framework de evaluación RAG en Python: faithfulness, answer relevancy, context precision y recall. El estándar del sector para UC-08. |
| [DeepEval — Getting Started](https://deepeval.com/docs/getting-started)  | Docs oficiales · Gratuito | Quickstart de DeepEval: evaluación de LLMs con métricas de hallucination, bias, toxicity, prompt injection. Integra con LangChain y LangGraph. |
| [Promptfoo — Documentación oficial](https://www.promptfoo.dev/docs/intro/)  | Docs oficiales · Gratuito | CLI y librería TypeScript para evaluar y hacer red teaming de LLMs. Tu stack natural — se integra en CI/CD. |
| [Masterclass Software Quality Engineering and AI Testing — Udemy](https://www.udemy.com/course/modern-principles-of-software-quality-testing-engineering/) | Udemy | Framework completo de quality engineering con IA: estrategias de testing, metricas, CI/CD. Ideal para tu perfil de QA / Test Architect. |

---

## Diagrama de dependencias entre UCs

Ver [docs/diagrams/02-learning-path.md](diagrams/02-learning-path.md) para el diagrama de flujo completo.

```
UC-01 ──────────────────────────────────────────► UC-08
  │                                                  ▲
  └──► UC-02 ──► UC-05 ──────────────────────────── │
         │         │                                 │
         │         └──► UC-06 ─────────────────────► │
         │                                           │
         └──► UC-04 ─────────────────────────────── │

UC-03 ──────────────────────────────────────────► UC-08
  (independiente, pero alimenta UC-05 y UC-07)

UC-07 depende de UC-05 (herramientas definidas)
UC-08 requiere todos los UCs anteriores
```

---

## Checklist de progreso personal

### Fase 1 — Fundamentos
- [ ] Leer y entender qué es un transformer (intuición, no matemática profunda)
- [ ] Configurar entorno: Node.js 20+, TypeScript, Claude API key
- [ ] **UC-01:** Implementar búsqueda semántica funcional
- [ ] **UC-02:** Implementar asistente conversacional con RAG

### Fase 2 — Generación y análisis
- [ ] **UC-03:** Implementar generador de fichas con prompt engineering avanzado
- [ ] **UC-04:** Implementar valoración asistida con structured outputs

### Fase 3 — Agentes
- [ ] **UC-05:** Implementar agente de seguimiento de leads
- [ ] **UC-06:** Implementar análisis de contratos

### Fase 4 — Integración y calidad
- [ ] **UC-07:** Publicar MCP Server funcional
- [ ] **UC-08:** Suite de evaluación completa con CI/CD

---


