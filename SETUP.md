# SETUP — PropIA GenAI Training

Bootstrap completo del entorno en ~10 minutos. Después de esto puedes empezar cualquiera de los 8 UCs sin gaps de configuración.

---

## Prerrequisitos

| Herramienta | Versión mínima | Cómo verificar |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| Docker + Docker Compose | Cualquiera reciente | `docker --version && docker compose version` |
| Python (solo UC-08) | 3.10+ | `python3 --version` |

> **macOS**: Si no tienes Docker, instala [Docker Desktop](https://www.docker.com/products/docker-desktop/) o [Rancher Desktop](https://rancherdesktop.io/). Ambos exponen el comando `docker compose`.
> **Linux**: `apt install docker.io docker-compose-plugin` o equivalente.
> **Windows**: Docker Desktop con WSL2 habilitado.

Necesitas además una **API key de Anthropic**: obtén una en [console.anthropic.com](https://console.anthropic.com/settings/keys) (los UCs 02–08 la usan).

---

## Bootstrap (5 comandos)

```bash
git clone https://github.com/ivanhidalgo22/PropIA-GenAI-Training-.git
cd PropIA-GenAI-Training-

cp .env.example .env             # 1. Configura variables (edita ANTHROPIC_API_KEY)
docker compose up -d             # 2. Levanta ChromaDB en localhost:8000
npm install                      # 3. Instala dependencias del monorepo
npm run seed                     # 4. Genera PDF + indexa 20 propiedades en ChromaDB
npm run verify                   # 5. Verifica que todo esté correcto
```

`npm run verify` ejecuta una batería de chequeos y falla con un mensaje claro si algo no está bien.

---

## Qué hace cada paso

### 1. `cp .env.example .env`

Crea tu archivo `.env` local (está en `.gitignore`, no se commitea). Editas:

```env
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui    # ← reemplaza con tu key real
CHROMA_HOST=localhost                    # ← deja como está
CHROMA_PORT=8000                         # ← deja como está
EMBEDDINGS_MODEL=Xenova/all-MiniLM-L6-v2 # ← deja como está
```

### 2. `docker compose up -d`

Levanta [ChromaDB](https://www.trychroma.com/) en `localhost:8000`. Es la única infraestructura externa que necesitas. Los datos persisten en un volumen Docker llamado `propia-chromadb-data` (no se pierden al reiniciar el contenedor).

Verifica que responde:
```bash
curl http://localhost:8000/api/v2/heartbeat
# → {"nanosecond heartbeat": 1715804XXXXXXXX}
```

### 3. `npm install`

Instala todas las dependencias del monorepo en un solo `node_modules`. El repo usa **npm workspaces** — los `packages/*` se linkean automáticamente, así que cuando un UC importa `@propia/shared` o `@propia/embeddings`, resuelve a las versiones locales sin publicar nada.

### 4. `npm run seed`

Ejecuta dos pasos:
- **`seed:pdf`**: genera `data/seeds/contrato-ejemplo.pdf` desde el `.txt` (usa `pdfkit`).
- **`seed:chromadb`**: lee `data/seeds/propiedades.json`, calcula embeddings con `@xenova/transformers` y los hace upsert en la colección `propiedades` de ChromaDB.

> **Primera ejecución**: el modelo `Xenova/all-MiniLM-L6-v2` se descarga (~25MB), tarda 30-60 segundos. Las ejecuciones posteriores son inmediatas porque el modelo queda en caché.

### 5. `npm run verify`

Corre 7 chequeos:

```
OK    Archivos de configuración presentes
OK    Variable ANTHROPIC_API_KEY definida
OK    Seed data presente
OK    ChromaDB respondiendo
OK    Colección propiedades indexada (20 docs)
OK    embed() produce vector de 384 dimensiones
OK    PDF de contrato generado
```

Si alguno falla, te dice exactamente qué corregir.

---

## Verificación manual rápida

### ¿ChromaDB tiene 20 propiedades?

```bash
curl -s http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections | jq '.[] | select(.name=="propiedades") | .id'
# → "<some uuid>"
```

Para contar documentos, usa el script de verify o:
```bash
npx tsx -e "import('./packages/db/src/chroma.js').then(async m => { const c = await m.getOrCreateCollection('propiedades'); console.log('Docs:', await c.count()); })"
# → Docs: 20
```

### ¿Los tipos se importan correctamente?

```bash
npx tsx -e "import('./packages/shared/src/index.js').then(m => console.log(Object.keys(m)))"
# → [ 'Propiedad', 'Ubicacion', ..., 'Lead', ..., 'Valuacion' ]
```

### ¿embed() funciona?

```bash
npx tsx -e "import('./packages/embeddings/src/index.js').then(async m => console.log('Dims:', (await m.embed('hola mundo')).length))"
# → Dims: 384
```

---

## Stack del setup

```
┌─────────────────────────────────────────────────────────┐
│  Tu máquina (terminal + IDE)                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ npm workspaces                                  │    │
│  │  ├─ packages/shared      → tipos del dominio    │    │
│  │  ├─ packages/embeddings  → Xenova local         │    │
│  │  └─ packages/db          → cliente ChromaDB     │    │
│  └────────────┬────────────────────────────────────┘    │
│               │                                         │
│               │ HTTP                                    │
│               ▼                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Docker — ChromaDB :8000  (chromadb/chroma)      │    │
│  │   colección "propiedades" (20 docs)             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ data/seeds/                                     │    │
│  │  propiedades.json    leads.json                 │    │
│  │  golden-dataset.json contrato-ejemplo.{txt,pdf} │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
              │
              │ API HTTPS
              ▼
   api.anthropic.com  (Claude — sonnet, haiku)
```

No hay servicios remotos adicionales. Todo el entrenamiento corre en tu máquina excepto las llamadas a Claude.

---

## Troubleshooting

### `docker compose up` falla con "Cannot connect to the Docker daemon"

Tu Docker Desktop / Rancher Desktop está cerrado. Ábrelo desde Applications y espera ~30s a que el indicador esté verde. Luego reintenta.

### El puerto 8000 ya está en uso

Otro servicio está usando :8000 (común si tienes otra app de IA local). Cambia el mapeo en `docker-compose.yml`:

```yaml
ports:
  - "8100:8000"   # host:contenedor — usa 8100 fuera, sigue siendo 8000 adentro
```

Y actualiza tu `.env`: `CHROMA_PORT=8100`.

### `npm install` falla con errores de native bindings

`pdfkit` y `@xenova/transformers` tienen dependencias nativas. Si falla:
```bash
rm -rf node_modules package-lock.json
npm install
```

### `seed:chromadb` se queda colgado en "Calculando embeddings..."

Primera ejecución: descarga el modelo de Hugging Face (~25MB). Espera. Si pasa 2 minutos sin avanzar, verifica conectividad a internet.

### "Module not found: @propia/shared"

Olvidaste correr `npm install` en la raíz (no en un UC individual). Los workspaces solo se linkean si instalas desde el root.

### Los datos de ChromaDB desaparecen al recrear el contenedor

Síntoma: `npm run verify` da `Colección tiene 0 docs, esperado 20` después de un `docker compose up -d` que recreó el contenedor.

Causa: ChromaDB v2.x persiste en `/data/`, no en `/chroma/chroma/` como hacían versiones anteriores. Si tienes un `docker-compose.yml` viejo apuntando al path antiguo, el volumen se monta pero no recibe escrituras.

Verifica en `docker-compose.yml`:
```yaml
volumes:
  - chromadb-data:/data        # OK
  # - chromadb-data:/chroma/chroma   # ← antiguo, no funciona con v2.x
```

Si lo cambiaste, recrea el contenedor y reindexa:
```bash
docker compose down -v && docker compose up -d
npm run seed:chromadb
```

### Container `propia-chromadb` aparece como "unhealthy" pero responde

Síntoma: `docker ps` muestra `Up X minutes (unhealthy)` pero `curl localhost:8000/api/v2/heartbeat` funciona.

Causa: la imagen `chromadb/chroma` es minimalista — no incluye `curl`, `wget`, ni `python`. Si tu `docker-compose.yml` usa un healthcheck con curl, falla siempre aunque el servicio responda. El healthcheck correcto usa `/dev/tcp` de bash:

```yaml
healthcheck:
  test: ["CMD-SHELL", "bash -c '(echo > /dev/tcp/localhost/8000) 2>/dev/null' || exit 1"]
```

Este chequeo verifica que el puerto 8000 está abierto, lo cual es suficiente.

### Error `Cannot find module 'pdfkit'` o similar

Tu Node es < 20. Verifica `node --version`. Si necesitas tener varias versiones, usa [nvm](https://github.com/nvm-sh/nvm):
```bash
nvm install 20
nvm use 20
```

---

## Resetear todo

Si necesitas borrar todo y empezar de cero:

```bash
docker compose down -v          # Apaga ChromaDB y borra su volumen
rm -rf node_modules              # Borra deps
rm -f data/seeds/contrato-ejemplo.pdf  # PDF generado
npm install
docker compose up -d
npm run seed
```

---

## Cómo seguir

Una vez `npm run verify` pase todos los chequeos:

1. Lee el dominio: [`dominio/roles-y-personas.md`](dominio/roles-y-personas.md) → [`dominio/modelo-de-datos.md`](dominio/modelo-de-datos.md)
2. Lee el plan de formación: [`docs/plan-formacion.md`](docs/plan-formacion.md)
3. Empieza por [UC-01](uc-01-busqueda-semantica/README.md)
