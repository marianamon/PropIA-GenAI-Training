# UC-02 — Diagrama de Secuencia: Asistente Conversacional RAG

## Flujo completo: RAG con memoria de conversación

```mermaid
sequenceDiagram
    actor Valentina as Valentina
    participant UI as PropIA Chat UI
    participant API as PropIA API
    participant MEM as Memory Store<br/>(historial sesión)
    participant VDB as ChromaDB
    participant EMB as Embedding<br/>(Claude API)
    participant LLM as Claude<br/>(generation)

    Note over Valentina,LLM: Turno 1 — Pregunta inicial

    Valentina->>UI: "Busco apartamento en Medellín,\npresupuesto 300M COP,\nquiero piscina"
    UI->>API: POST /api/chat\n{ sessionId, message }

    API->>EMB: embed(message)
    EMB-->>API: queryVector

    API->>VDB: similaritySearch(queryVector, k=5)
    VDB-->>API: [propiedades relevantes]

    API->>MEM: getHistory(sessionId)
    MEM-->>API: [] (primera vez, vacío)

    API->>LLM: invoke(systemPrompt + context + history + message)
    Note over LLM: systemPrompt = "Eres Lia, asesora\ninmobiliaria de PropIA..."<br/>context = propiedades recuperadas<br/>history = []<br/>message = pregunta de Valentina

    LLM-->>API: "Encontré 3 opciones con piscina\nen Medellín dentro de tu presupuesto..."

    API->>MEM: saveMessage(sessionId, user: message)
    API->>MEM: saveMessage(sessionId, assistant: response)

    API-->>UI: { response, sources: [prop1, prop2, prop3] }
    UI-->>Valentina: Respuesta + cards de propiedades

    Note over Valentina,LLM: Turno 2 — Pregunta de seguimiento (usa memoria)

    Valentina->>UI: "¿Cuál de esas tres tiene\nmejor transporte público?"
    UI->>API: POST /api/chat\n{ sessionId, message: "¿Cuál de esas tres...?" }

    API->>EMB: embed("¿Cuál de esas tres tiene mejor transporte público?")
    EMB-->>API: queryVector

    API->>VDB: similaritySearch(queryVector, k=3)
    VDB-->>API: [propiedades con metro/transporte]

    API->>MEM: getHistory(sessionId)
    MEM-->>API: [turno 1 completo]

    API->>LLM: invoke(systemPrompt + context + history + message)
    Note over LLM: history ahora incluye el turno 1<br/>LLM "recuerda" las 3 propiedades<br/>mencionadas antes

    LLM-->>API: "De las tres opciones, la del\nBarrio Colombia está a 500m\ndel Metro de Medellín..."

    API->>MEM: saveMessage(sessionId, ...)
    API-->>UI: { response, sources }
    UI-->>Valentina: Respuesta contextualizada
```

---

## Gestión del contexto: ventana y resumen

```mermaid
flowchart TD
    MSG["Nuevo mensaje del usuario"]
    CHECK{"¿Historial > N tokens?"}
    FULL["Historial completo\ncabe en contexto"]
    SUMMARIZE["Resumir turnos\nmás antiguos con LLM"]
    BUILD["Construir prompt\nsystemPrompt + context\n+ history + message"]
    INVOKE["Invocar Claude"]

    MSG --> CHECK
    CHECK -->|No| FULL
    CHECK -->|Sí| SUMMARIZE
    FULL --> BUILD
    SUMMARIZE --> BUILD
    BUILD --> INVOKE
```

---

## Arquitectura de componentes RAG

```mermaid
flowchart LR
    subgraph INPUT["Input"]
        Q[" Pregunta usuario\n+ session_id"]
    end

    subgraph RETRIEVAL["Retrieval"]
        EMBED["Embedding\ndel query"]
        VECTOR_SEARCH["Vector search\nk=5 chunks"]
        RERANK["Re-ranking\npor relevancia"]
    end

    subgraph AUGMENTATION["Augmentation"]
        HISTORY["Historial\nde sesión"]
        CONTEXT["Contexto\nensamblado"]
        SYSTEM["System prompt\n(Lia, asesora PropIA)"]
    end

    subgraph GENERATION["Generation"]
        CLAUDE["Claude API\nclaude-sonnet-4-5"]
        RESPONSE["Respuesta\n+ fuentes citadas"]
    end

    Q --> EMBED
    EMBED --> VECTOR_SEARCH
    VECTOR_SEARCH --> RERANK
    RERANK --> CONTEXT
    HISTORY --> CONTEXT
    SYSTEM --> CONTEXT
    CONTEXT --> CLAUDE
    CLAUDE --> RESPONSE
```
