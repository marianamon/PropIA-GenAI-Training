# Componentes — UC-01 Búsqueda Semántica

## Diagrama de componentes y dependencias

```mermaid
graph TD
  subgraph UC01["UC-01 — uc-01-busqueda-semantica/src/"]
    API["api.ts\nPOST /api/search\nExpress HTTP layer"]
    SEARCH["search.ts\nsemanticSearch(query, filters, k)\nOrquesta embed + ChromaDB"]
    EVAL["evaluation/evaluate.ts\nPrecision@K · Recall@K · F1@K\nMRR · FP tracking · CI gate"]
  end

  subgraph PKG_EMB["@propia/embeddings\npackages/embeddings/src/"]
    EMBED["embed.ts\nembed(text) → number[384]\nXenova/all-MiniLM-L6-v2\npooling: mean · normalize: true"]
  end

  subgraph PKG_DB["@propia/db\npackages/db/src/"]
    CHROMA["chroma.ts\ngetOrCreateCollection()\ngetChromaClient()\nheartbeat()"]
  end

  subgraph PKG_SHARED["@propia/shared\npackages/shared/src/"]
    PROPIEDAD["propiedad.ts\ninterface Propiedad\nTipoPropiedad · Ubicacion\nPrecio · EstadoPropiedad"]
  end

  subgraph INFRA["Infraestructura externa"]
    CHROMADB[("ChromaDB\nlocalhost:8000\nColección: propiedades\n20 docs indexados")]
    MODEL["all-MiniLM-L6-v2\nHuggingFace Hub\n384 dims · auto-supervisado"]
  end

  subgraph SCRIPTS["scripts/ — indexación"]
    SEED["seed-chromadb.ts\nbuildDocument(p)\nnpm run seed:chromadb"]
  end

  subgraph DATA["data/"]
    JSON[("propiedades.json\n20 propiedades\nMedellín · Bogotá\nEnvigado · Sabaneta")]
  end

  %% Dependencias UC-01
  API -->|"import semanticSearch"| SEARCH
  SEARCH -->|"import embed"| EMBED
  SEARCH -->|"import getOrCreateCollection\nCOLECCION_PROPIEDADES"| CHROMA
  EVAL -->|"import semanticSearch\nSearchResult"| SEARCH

  %% Dependencias packages
  EMBED -->|"pipeline('feature-extraction')"| MODEL
  CHROMA -->|"ChromaClient HTTP"| CHROMADB

  %% Indexación
  SEED -->|"import embed"| EMBED
  SEED -->|"import getOrCreateCollection\nheartbeat"| CHROMA
  SEED -->|"import Propiedad"| PROPIEDAD
  SEED -->|"readFileSync"| JSON
  SEED -->|"collection.upsert(ids, docs, embeddings, metadatas)"| CHROMADB

  %% Tipos
  SEARCH -.->|"type SearchResult"| PROPIEDAD

  %% Estilos
  classDef uc01 fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
  classDef pkg fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef infra fill:#fef9c3,stroke:#ca8a04,color:#713f12
  classDef data fill:#fce7f3,stroke:#db2777,color:#831843
  classDef script fill:#ede9fe,stroke:#7c3aed,color:#3b0764

  class API,SEARCH,EVAL uc01
  class EMBED,CHROMA,PROPIEDAD pkg
  class CHROMADB,MODEL infra
  class JSON data
  class SEED script
```

---

## Responsabilidad de cada componente

### UC-01 (azul)

| Archivo | Responsabilidad | Exporta |
|---|---|---|
| `api.ts` | Recibe `POST /api/search` vía HTTP, valida el body, delega a `semanticSearch` y serializa la respuesta JSON | — (punto de entrada HTTP) |
| `search.ts` | Convierte la query en vector, consulta ChromaDB con filtros opcionales, normaliza el score (`1 - distancia`) | `semanticSearch()`, `SearchResult` |
| `evaluation/evaluate.ts` | Corre el golden dataset de 10 queries, calcula P@K / R@K / F1 / MRR / FPs, y hace `process.exit(1)` si falla un threshold | — (script CI) |

### @propia/embeddings (verde)

| Archivo | Responsabilidad |
|---|---|
| `embed.ts` | Carga `all-MiniLM-L6-v2` una sola vez (singleton con `embedderPromise`), aplica `pooling: mean` + `normalize: true`, devuelve `number[384]` |

### @propia/db (verde)

| Archivo | Responsabilidad |
|---|---|
| `chroma.ts` | Gestiona el singleton del `ChromaClient`, conecta a `localhost:8000`, expone `getOrCreateCollection()` y `heartbeat()` |

### @propia/shared (verde)

| Archivo | Responsabilidad |
|---|---|
| `propiedad.ts` | Interface `Propiedad` y sus tipos auxiliares: `Ubicacion`, `Precio`, `TipoPropiedad`, `EstadoPropiedad`, `Estrato` |

---

## Flujo de datos — búsqueda en tiempo real

```mermaid
sequenceDiagram
  actor U as Usuario
  participant API as api.ts
  participant S as search.ts
  participant E as @propia/embeddings
  participant D as @propia/db
  participant C as ChromaDB

  U->>API: POST /api/search { query, ciudad?, precioMax? }
  API->>S: semanticSearch(query, filters, k=10)
  S->>E: embed(query)
  E-->>S: number[384]
  S->>D: getOrCreateCollection("propiedades")
  D-->>S: Collection
  S->>C: collection.query(queryVector, nResults, where)
  C-->>S: { ids, distances, documents, metadatas }
  S-->>API: SearchResult[]
  API-->>U: { results, total, query }
```

---

## Flujo de datos — indexación (solo al ejecutar seed)

```mermaid
sequenceDiagram
  participant SC as seed-chromadb.ts
  participant J as propiedades.json
  participant E as @propia/embeddings
  participant D as @propia/db
  participant C as ChromaDB

  SC->>J: readFileSync → Propiedad[]
  loop Para cada propiedad (20)
    SC->>SC: buildDocument(p) → string enriquecido
    SC->>E: embed(document)
    E-->>SC: number[384]
  end
  SC->>D: getOrCreateCollection("propiedades")
  SC->>C: collection.upsert(ids, documents, embeddings, metadatas)
  C-->>SC: 20 documentos indexados
```

---

## Decisiones de diseño relevantes

| Decisión | Valor | Alternativa descartada |
|---|---|---|
| Modelo de embeddings | `all-MiniLM-L6-v2` (384 dims, local) | `voyage-3` (1024 dims, requiere API key) |
| Singleton del cliente ChromaDB | `clientSingleton` en `chroma.ts` | Nueva instancia por llamada (overhead de conexión) |
| Singleton del modelo | `embedderPromise` en `embed.ts` | Recargar modelo cada vez (30-60s por carga) |
| Score normalizado | `1 - distancia` | Distancia L2 cruda (menos intuitiva para el frontend) |
| `pooling: mean` | Promedia tokens del texto completo | `pooling: cls` — solo usa el token [CLS], menos representativo para párrafos largos |

> Ver razonamiento extendido de cada decisión en [`decisiones.md`](./decisiones.md).
