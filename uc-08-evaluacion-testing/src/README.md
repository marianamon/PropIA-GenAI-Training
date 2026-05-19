# Implementación — UC-08

Aquí implementas el código del UC siguiendo los pasos del [README principal](../README.md). El monorepo ya provee la infraestructura (`@propia/shared`, `@propia/embeddings`, `@propia/db`) — tú construyes la lógica específica de **LLM Evaluation + Security**.

## Estructura objetivo

```
src/
├── evaluation/ragas_eval.py
├── evaluation/security_tests.py
├── evaluation/promptfoo.yaml
```

## Antes de empezar

```bash
# Desde la raíz del repo
npm run verify    # Confirma que el setup global está OK
```

Si falla, **revisa [`SETUP.md`](../../SETUP.md) antes de tocar nada en este folder**.

## No hagas `npm init` aquí

El monorepo usa npm workspaces. Las dependencias se instalan desde la **raíz** (`/Users/.../PropIA-GenAI-Training-/`), no dentro de este folder. Hacer `npm init -y` aquí rompe la resolución de `@propia/*`.
