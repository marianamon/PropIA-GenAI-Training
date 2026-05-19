# Wireframes — UC-07: MCP Server para Brokers

> 5 pantallas mostrando la experiencia de Federico usando PropIA desde Claude Desktop con MCP

---

## Pantalla 1 — Claude Desktop: PropIA conectado como MCP Server

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Desktop                                            ─ □     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ │                                             │
│  │  Nueva conv.   │ │    Claude · claude-sonnet-4-6            │
│  │                  │ │   ════════════════════════════════════      │
│  │  Mis chats     │ │                                             │
│  │  › Leads hoy     │ │                                             │
│  │  › Ficha Poblado │ │   Hola Federico. Hoy tienes:             │
│  │  › Valoración    │ │   • 8 leads NUEVO (3 con > 24h sin resp.)  │
│  │                  │ │   • 1 visita programada a las 4:00pm        │
│  │  MCP Servers   │ │   • 2 fichas pendientes de publicar         │
│  │   propIA       │ │                                             │
│  │     6 tools      │ │   ¿En qué quieres enfocarte hoy?            │
│  │                  │ │                                             │
│  │                  │ │                                             │
│  │                  │ │                                             │
│  │                  │ │                                             │
│  │                  │ │                                             │
│  │                  │ │   ┌─────────────────────────────────────┐  │
│  │                  │ │   │ Escribe un mensaje...     [Enviar ▶] │  │
│  └──────────────────┘ │   └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Claude invocando get_leads desde conversación natural

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Desktop                                            ─ □     │
├───────────────────────┬─────────────────────────────────────────────┤
│   MCP: propIA     │                                             │
│                       │    Federico                             │
│                       │   ¿Cuántos leads nuevos tengo y cuáles      │
│                       │   llevan más de 24 horas sin respuesta?     │
│                       │                                             │
│                       │    Claude                                  │
│                       │   ┌───────────────────────────────────┐     │
│                       │   │  Usando herramienta PropIA:     │     │
│                       │   │    get_leads({                    │     │
│                       │   │      agenteId: "juanfe-001",      │     │
│                       │   │      estado: "NUEVO",             │     │
│                       │   │      diasSinContacto: 1           │     │
│                       │   │    })                             │     │
│                       │   └───────────────────────────────────┘     │
│                       │                                             │
│                       │   Tienes **8 leads NUEVO** en total.        │
│                       │   Los que llevan más de 24h sin respuesta:  │
│                       │                                             │
│                       │   1.  María García — **3 días** sin resp.  │
│                       │      Interesada en Apto Laureles $285M      │
│                       │                                             │
│                       │   2.  Pedro Ruiz — **2 días** sin resp.    │
│                       │      Preguntó por cuota de administración   │
│                       │                                             │
│                       │   3.  Sofía Torres — **26 horas** sin resp.│
│                       │      Solicitud de visita Apto El Poblado    │
│                       │                                             │
│                       │   ¿Quieres que redacte un mensaje de        │
│                       │   seguimiento para enviarles?               │
│                       │                                             │
│                       │   ┌─────────────────────────────────────┐  │
│                       │   │ Escribe un mensaje...     [Enviar ▶] │  │
│                       │   └─────────────────────────────────────┘  │
└───────────────────────┴─────────────────────────────────────────────┘
```

---

## Pantalla 3 — Claude generando ficha con generate_listing

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Desktop                                            ─ □     │
├───────────────────────┬─────────────────────────────────────────────┤
│   MCP: propIA     │                                             │
│                       │    Federico                             │
│                       │   Genera la ficha del apartamento           │
│                       │   prop-mde-041 en tono de lujo              │
│                       │                                             │
│                       │    Claude                                  │
│                       │   ┌───────────────────────────────────┐     │
│                       │   │  Usando herramienta PropIA:     │     │
│                       │   │    generate_listing({             │     │
│                       │   │      propiedadId: "prop-mde-041", │     │
│                       │   │      tone: "lujo"                 │     │
│                       │   │    })                             │     │
│                       │   └───────────────────────────────────┘     │
│                       │                                             │
│                       │   Aquí está la ficha generada:              │
│                       │                                             │
│                       │   **Título:**                               │
│                       │   Penthouse exclusivo con vista panorámica  │
│                       │   · El Poblado · Estrato 5 · 95m²           │
│                       │                                             │
│                       │   **Descripción:**                          │
│                       │   Viva en el corazón de El Poblado con una │
│                       │   vista despejada al Valle de Aburrá desde  │
│                       │   el piso 14. Este apartamento de 95m²...   │
│                       │   [Texto completo expandido]                │
│                       │                                             │
│                       │   **Características:**                      │
│                       │    Vista panorámica · Piso 14             │
│                       │    Piscina + gimnasio                      │
│                       │    Vigilancia 24h                          │
│                       │    2 garajes cubiertos                     │
│                       │                                             │
│                       │   ¿Quieres publicarla directamente o        │
│                       │   ajustar algún detalle?                    │
│                       │                                             │
│                       │   ┌─────────────────────────────────────┐  │
│                       │   │ Escribe un mensaje...     [Enviar ▶] │  │
│                       │   └─────────────────────────────────────┘  │
└───────────────────────┴─────────────────────────────────────────────┘
```

---

## Pantalla 4 — Panel de herramientas MCP disponibles

```
┌─────────────────────────────────────────────────────────────────────┐
│  Claude Desktop  ·  MCP Servers                            ─ □     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Servidores MCP conectados                                        │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   propIA-broker-server  v1.0.0                              │   │
│  │  PropIA — Plataforma Inmobiliaria Colombiana                 │   │
│  │                                                              │   │
│  │   Herramientas disponibles (6):                             │   │
│  │                                                              │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │ search_properties — Búsqueda semántica de propiedades  │ │   │
│  │  │ get_leads — Consultar leads por agente y estado        │ │   │
│  │  │ update_lead_status — Actualizar estado de un lead      │ │   │
│  │  │ generate_listing — Generar ficha de propiedad con IA   │ │   │
│  │  │ get_valuation — Valoración asistida de mercado         │ │   │
│  │  │ analyze_contract — Análisis de riesgo de contratos     │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  │                                                              │   │
│  │   Recursos disponibles (2):                                │   │
│  │  • leads://juanfe-001/activos                               │   │
│  │  • propiedades://catalogo                                   │   │
│  │                                                              │   │
│  │  Estado: ● Conectado  ·  Latencia: 45ms                    │   │
│  │                                   [ Config]  [ Descon.] │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [+ Agregar servidor MCP]                                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Configuración del MCP Server en claude_desktop_config.json

```
┌─────────────────────────────────────────────────────────────────────┐
│  Terminal / Configuración                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  # Archivo de configuración de Claude Desktop                        │
│  # ~/Library/Application Support/Claude/claude_desktop_config.json  │
│                                                                      │
│  {                                                                   │
│    "mcpServers": {                                                   │
│      "propIA": {                                                     │
│        "command": "node",                                            │
│        "args": [                                                     │
│          "/Users/ivanhidalgo/repo/PropIA/uc-07.../server.js"        │
│        ],                                                            │
│        "env": {                                                      │
│          "ANTHROPIC_API_KEY": "sk-ant-...",                          │
│          "CHROMA_HOST": "localhost",                                 │
│          "CHROMA_PORT": "8000"                                       │
│        }                                                             │
│      }                                                               │
│    }                                                                 │
│  }                                                                   │
│                                                                      │
│  ─────────────────────────────────────────────────────────────      │
│                                                                      │
│  $ node src/server.js                                                │
│  PropIA MCP Server corriendo en stdio                                │
│                                                                      │
│  ─────────────────────────────────────────────────────────────      │
│                                                                      │
│  # Verificar que Claude Desktop detecta el servidor:                 │
│  # 1. Cerrar Claude Desktop                                          │
│  # 2. Editar claude_desktop_config.json                              │
│  # 3. Abrir Claude Desktop                                           │
│  # 4. Ícono  aparece en la barra lateral =  conectado           │
│                                                                      │
│  # Si no aparece, revisar:                                           │
│  # - Ruta del archivo server.js correcta                             │
│  # - ANTHROPIC_API_KEY configurada                                   │
│  # - ChromaDB corriendo en localhost:8000                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
