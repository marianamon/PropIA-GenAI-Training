# PropIA — GenAI Training Path para Test Architects

> Tu experiencia tiene algo que la mayoría de ingenieros de IA no tienen: **sabes cómo romper sistemas y muy bien**. 
> Este path te enseña a construirlos — y a destruirlos correctamente que es lo más importante hehehe.

<p align="center">
  <img src="docs/testbot.svg" alt="PropIA Test Bot" width="260"/>
</p>

---

## ¿Por qué pensé este path para ti?

El mercado de GenAI está lleno de desarrolladores que saben construir chatbots, agents, mcp servers, etc. 
Sin embargo, lo que escasea son mentes brillantes como la tuya que sepan **evaluar, testear y garantizar la calidad de sistemas de IA**.

Tú ya tienes la mitad del camino recorrida (eres la mejor). Este repositorio lo creé simplmente para darte una mano y cubre la otra mitad.

```mermaid
flowchart LR
    A["Tu hoy\nThe best Test Lead ever · QA\nTypeScript expert\nSabes romper sistemas"]

    B["Tu al terminar\nTest Architect\nDiseña estrategias de testing IA\nConstruye y evalúa sistemas GenAI"]

    A -->|"Este path"| B

    style A fill:#FF6B35,color:#fff
    style B fill:#2196F3,color:#fff
```

---

## El caso de uso: PropIA (el mejor agente inteligente del sector inmobiliario)

En lugar de estudiar GenAI con ejemplos abstractos y sin rumbo, cada concepto se aprende implementando una funcionalidad real de **PropIA** — una plataforma inmobiliaria colombiana ficticia pero técnicamente realista (la idea es después intentar un start-up).

```mermaid
flowchart TD
    subgraph PROPIA["PropIA — Plataforma Inmobiliaria Colombiana"]
        V["Valentina\nComprador"]
        C["Ivancho\nVendedor"]
        J["Federico\nAgente / Broker"]
        B["BIENES DE ROBLEDO\nConstructora"]
    end

    subgraph IA["Capacidades GenAI que construyes"]
        UC1["UC-01\nBusqueda semantica"]
        UC2["UC-02\nAsistente conversacional"]
        UC3["UC-03\nGenerador de fichas"]
        UC4["UC-04\nValoracion asistida"]
        UC5["UC-05\nAgente de leads"]
        UC6["UC-06\nAnalisis de contratos"]
        UC7["UC-07\nMCP Server"]
        UC8["UC-08\nEvaluacion y testing"]
    end

    V --> UC1
    V --> UC2
    C --> UC3
    C --> UC4
    J --> UC5
    J --> UC6
    J --> UC7
    B --> UC5
    UC1 --> UC8
    UC2 --> UC8
    UC3 --> UC8
    UC4 --> UC8
    UC5 --> UC8
    UC6 --> UC8
    UC7 --> UC8

    style UC8 fill:#795548,color:#fff
    style UC1 fill:#FF9800,color:#fff
    style UC2 fill:#FF9800,color:#fff
    style UC3 fill:#9C27B0,color:#fff
    style UC4 fill:#9C27B0,color:#fff
    style UC5 fill:#F44336,color:#fff
    style UC6 fill:#F44336,color:#fff
    style UC7 fill:#607D8B,color:#fff
```

---

## Los 8 Use Cases — de menor a mayor complejidad GenAI

```mermaid
flowchart LR
    subgraph N1["NIVEL 1 — Fundamentos"]
        UC01["UC-01\nEmbeddings\n+ Vector DB"]
        UC02["UC-02\nRAG + Memoria\nconversacional"]
    end

    subgraph N2["NIVEL 2 — Generación"]
        UC03["UC-03\nPrompt Engineering\navanzado"]
        UC04["UC-04\nStructured Outputs\n+ Análisis"]
    end

    subgraph N3["NIVEL 3 — Agentes"]
        UC05["UC-05\nAI Agents\n+ Tool Calling"]
        UC06["UC-06\nDocument\nProcessing"]
    end

    subgraph N4["NIVEL 4 — Integración y Calidad"]
        UC07["UC-07\nMCP Protocol"]
        UC08["UC-08\nLLM Evaluation\n+ Security Testing"]
    end

    N1 --> N2 --> N3 --> N4

    style N1 fill:#E3F2FD
    style N2 fill:#F3E5F5
    style N3 fill:#FFEBEE
    style N4 fill:#E8F5E9
```

| # | Use Case | Concepto GenAI | Rol | Estado |
|---|---|---|---|---|
| [UC-01](uc-01-busqueda-semantica/README.md) | Búsqueda semántica de propiedades | Embeddings + Vector DB | Comprador | - |
| [UC-02](uc-02-asistente-conversacional/README.md) | Asistente conversacional | RAG + memoria conversacional | Comprador / Agente | - |
| [UC-03](uc-03-generador-fichas/README.md) | Generador de fichas de inmuebles | Prompt engineering avanzado | Vendedor / Agente | - |
| [UC-04](uc-04-valoracion-asistida/README.md) | Valoración asistida | Structured outputs + análisis | Comprador / Vendedor | - |
| [UC-05](uc-05-agente-leads/README.md) | Agente de seguimiento de leads | AI Agents + tool calling | Agente / Broker | - |
| [UC-06](uc-06-analisis-contratos/README.md) | Análisis inteligente de contratos | Document processing + RAG | Agente / Comprador | - |
| [UC-07](uc-07-mcp-server-brokers/README.md) | MCP Server para brokers | MCP protocol | Agente / Broker | - |
| [UC-08](uc-08-evaluacion-testing/README.md) | Evaluación y testing del sistema | LLM evaluation + security testing | **QA / Test Architect** | - |

---

## Stack tecnológico

```mermaid
flowchart TB
    subgraph LANG["Lenguajes"]
        TS["TypeScript / Node.js\n(tu terreno natural)"]
        PY["Python\n(testing: RAGAS, DeepEval)"]
    end

    subgraph LLM["LLM y Orquestacion"]
        CLAUDE["Claude API\nAnthropic\nclaude-sonnet-4-6"]
        LC["LangChain.js\n+ LangGraph"]
        MCP_S["MCP TypeScript SDK"]
    end

    subgraph VDB["Vector DB"]
        CHROMA["ChromaDB\ndesarrollo local"]
        AZURE["Azure AI Search\nproduccion"]
    end

    subgraph TESTING["Testing y Evaluacion"]
        RAGAS["RAGAS\nmetricas RAG"]
        DEEP["DeepEval\nhallucination, injection"]
        PF["Promptfoo\nred teaming TypeScript"]
        PW["Playwright\nE2E tests"]
    end

    TS --> CLAUDE
    TS --> LC
    TS --> MCP_S
    LC --> CLAUDE
    LC --> CHROMA
    LC --> AZURE
    PY --> RAGAS
    PY --> DEEP
    TS --> PF
    TS --> PW
```

---

## Por qué UC-08 es el más importante para ti

```mermaid
mindmap
  root((Test Architect + GenAI))
    Lo que ya tienes
      anos de experiencia QA
      Mentalidad de adversario
      TypeScript y Playwright
      Automatizacion de pruebas
    Lo que aprenderas aqui
      Evaluar sistemas no-deterministicos
      LLM-as-judge
      Prompt injection y jailbreaking
      Metricas RAG cuantitativas
      Red teaming de LLMs
    El resultado
      Perfil unico en el mercado
      Disenha estrategias de QA para IA
      Evalua lo que otros solo construyen
      Posicionamiento interno y externo
```

> **Los equipos de IA contratan desarrolladores fácilmente.** 
> **Un Test Architect que entiende GenAI es mucho más difícil de encontrar.**

---

## Estructura del repositorio

```
PropIA-GenAI-Training/
│
├── README.md                          ← Estás aquí
├── SETUP.md                           ← Bootstrap detallado y troubleshooting
├── docker-compose.yml                 ← ChromaDB en localhost:8000
├── .env.example                       ← Variables de entorno (copiar a .env)
├── package.json                       ← npm workspaces + scripts setup/seed/verify
├── tsconfig.base.json                 ← Paths para @propia/*
│
├── packages/                          ← Código compartido entre UCs
│   ├── shared/                        ← @propia/shared — tipos del dominio (Propiedad, Lead, ...)
│   ├── embeddings/                    ← @propia/embeddings — embed() con Xenova local
│   └── db/                            ← @propia/db — cliente ChromaDB centralizado
│
├── data/seeds/                        ← Datos de ejemplo (ver data/seeds/README.md)
│   ├── propiedades.json               ← 20 propiedades Medellín/Bogotá
│   ├── leads.json                     ← 10 leads para UC-05
│   ├── golden-dataset.json            ← 20 Q&A para UC-08
│   └── contrato-ejemplo.{txt,pdf}     ← Contrato muestra para UC-06
│
├── scripts/                           ← Scripts de bootstrap
│   ├── seed-chromadb.ts               ← Indexa data/seeds/propiedades.json
│   ├── generate-sample-pdf.ts         ← Genera contrato-ejemplo.pdf
│   └── verify-setup.ts                ← 7 chequeos del setup
│
├── docs/
│   ├── plan-formacion.md              ← Documento maestro con recursos verificados
│   └── diagrams/                      ← 11 diagramas UML (Mermaid)
│
├── dominio/                           ← Contexto del negocio
│   ├── roles-y-personas.md            ← Los 4 perfiles de PropIA
│   ├── glosario-colombia.md           ← Vocabulario inmobiliario colombiano real
│   └── modelo-de-datos.md             ← Entidades y tipos TypeScript
│
└── uc-01-busqueda-semantica/  …  uc-08-evaluacion-testing/
    └── README.md  ·  wireframes/  ·  arquitectura/  ·  prompts/  ·  src/
```

---

## Cómo empezar

**Paso 0 — Setup del entorno** (10 min)

> Detalle completo y troubleshooting en [`SETUP.md`](SETUP.md).

```bash
cp .env.example .env             # Edita ANTHROPIC_API_KEY
docker compose up -d             # Levanta ChromaDB en localhost:8000
npm install                      # Instala workspaces (packages/shared, embeddings, db)
npm run seed                     # Genera PDF + indexa 20 propiedades en ChromaDB
npm run verify                   # Confirma que todo está OK
```

Lo que queda corriendo:
- **ChromaDB** en `localhost:8000` con la colección `propiedades` (20 docs, 384 dims).
- **20 propiedades** indexadas en `data/seeds/propiedades.json`.
- **10 leads** de muestra en `data/seeds/leads.json` (UC-05).
- **20 pares Q&A** del golden dataset en `data/seeds/golden-dataset.json` (UC-08).
- **PDF de contrato** en `data/seeds/contrato-ejemplo.pdf` (UC-06).
- **Tipos TypeScript** importables como `@propia/shared` desde cualquier UC.
- **`embed()`** importable como `@propia/embeddings` (modelo local, sin API key).

**Paso 1 — Lee el dominio** (30 min)

> [`dominio/roles-y-personas.md`](dominio/roles-y-personas.md) → [`dominio/glosario-colombia.md`](dominio/glosario-colombia.md) → [`dominio/modelo-de-datos.md`](dominio/modelo-de-datos.md)

Antes de tocar código, entiende el negocio. Los LLMs responden mejor cuando tú también entiendes el contexto.

**Paso 2 — Lee el plan de formación**

> [`docs/plan-formacion.md`](docs/plan-formacion.md)

Tiene los recursos de estudio verificados (YouTube, Udemy, docs oficiales) organizados por UC.

**Paso 3 — Empieza por UC-01**

> [`uc-01-busqueda-semantica/README.md`](uc-01-busqueda-semantica/README.md)

El primer UC no tiene prerrequisitos. Construyes búsqueda semántica real en TypeScript desde cero.
# PropIA-GenAI-Training
