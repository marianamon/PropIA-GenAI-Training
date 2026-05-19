# UC-01 — Diagrama de Secuencia: Búsqueda Semántica

## Flujo completo: consulta en lenguaje natural → resultados rankeados

```mermaid
sequenceDiagram
    actor Valentina as Valentina
    participant UI as PropIA UI
    participant API as PropIA API<br/>(Node.js)
    participant EMB as Embedding Service<br/>(Claude API)
    participant VDB as ChromaDB<br/>(Vector DB)

    Note over Valentina,VDB: FASE 1 — Indexación (se hace una sola vez al iniciar)

    API->>EMB: embed("Apartamento en El Poblado,<br/>estrato 5, 3 habitaciones...")
    EMB-->>API: vector[1536] = [0.12, -0.87, ...]
    API->>VDB: collection.add(id, vector, metadata)
    Note over VDB: Repite para cada propiedad del catálogo

    Note over Valentina,VDB: FASE 2 — Consulta en tiempo real

    Valentina->>UI: "quiero algo tranquilo cerca<br/>del metro, buena vista,<br/>que no sea muy grande"
    UI->>API: POST /api/search<br/>{ query: "algo tranquilo cerca del metro..." }

    API->>EMB: embed(query)
    Note over EMB: Claude convierte el texto<br/>a vector de 1536 dimensiones
    EMB-->>API: queryVector[1536]

    API->>VDB: collection.query(queryVector, nResults=10)
    Note over VDB: Calcula distancia coseno<br/>entre queryVector y todos<br/>los vectores indexados
    VDB-->>API: [{id, distance, metadata}] × 10

    API->>API: rankResults(results)<br/>+ filterByBudget(280M-350M COP)<br/>+ enrichWithDetails()

    API-->>UI: { results: Propiedad[], total: 10, query: "..." }
    UI-->>Valentina: Lista de propiedades<br/>ordenadas por relevancia semántica
```

---

## Flujo de indexación batch (carga inicial del catálogo)

```mermaid
sequenceDiagram
    participant SCRIPT as seed-script.ts
    participant DB as Data Source<br/>(JSON / DB)
    participant API as PropIA API
    participant EMB as Claude API
    participant VDB as ChromaDB

    SCRIPT->>DB: loadProperties()
    DB-->>SCRIPT: Propiedad[] (ej. 500 propiedades)

    loop Para cada propiedad
        SCRIPT->>SCRIPT: buildDocument(propiedad)<br/>= titulo + descripcion + ubicacion<br/>+ caracteristicas (texto enriquecido)
        SCRIPT->>EMB: embed(document)
        EMB-->>SCRIPT: vector[1536]
        SCRIPT->>VDB: upsert(id, vector, metadata)
    end

    SCRIPT-->>SCRIPT: console.log(" 500 propiedades indexadas")
```

---

## Flujo de error y fallback

```mermaid
sequenceDiagram
    actor Valentina as Valentina
    participant API as PropIA API
    participant EMB as Claude API
    participant VDB as ChromaDB

    Valentina->>API: POST /api/search { query: "..." }

    alt Claude API no disponible
        API->>EMB: embed(query)
        EMB-->>API: Error 503 / timeout
        API->>API: fallback: búsqueda por texto (LIKE)
        API-->>Valentina: Resultados básicos<br/>+ banner "búsqueda avanzada no disponible"
    else ChromaDB no disponible
        API->>EMB: embed(query)
        EMB-->>API: vector[1536]
        API->>VDB: query(vector)
        VDB-->>API: Connection refused
        API-->>Valentina: 503 Service Unavailable<br/>{ error: "Vector DB no disponible" }
    else Flujo exitoso
        API->>EMB: embed(query)
        EMB-->>API: vector[1536]
        API->>VDB: query(vector)
        VDB-->>API: resultados
        API-->>Valentina: Propiedades rankeadas
    end
```
