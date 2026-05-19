# Prompts — UC-08

Aquí mantienes los **prompts canónicos** del UC, separados del código para que sean revisables sin tocar TypeScript.

## Qué agregar aquí

prompts de LLM-as-judge para UC-03, prompts de inyección para red teaming

## Por qué versionar los prompts

Los prompts son **código de comportamiento**: un cambio sutil cambia los outputs. Versionarlos junto al código permite:

- Revisar cambios en PRs (`git diff prompts/` muestra cambios de comportamiento)
- Comparar resultados entre versiones del prompt (relevante para UC-08)
- Tener un registro de qué prompt produjo qué outputs en caso de incidentes
