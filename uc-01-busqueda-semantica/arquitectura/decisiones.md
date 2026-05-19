# ADRs — UC-01 Búsqueda Semántica

> **Architecture Decision Records** — registro de las decisiones tomadas durante la implementación y evaluación del motor de búsqueda semántica de PropIA.
> Cada ADR sigue el formato: Contexto → Decisión → Alternativas consideradas → Consecuencias.

---

## ADR-001 — Enriquecimiento de `buildDocument()` con campos opcionales de `Propiedad`

**Estado:** Aceptado  
**Fecha:** 2026-05-19  
**Autora:** QA — Mariana Alzate

### Contexto

La función `buildDocument()` original en `scripts/seed-chromadb.ts` construía el texto a indexar usando solo los campos obligatorios de la interface `Propiedad`: `titulo`, `descripcion`, `tipo`, `ubicacion`, `estrato`, `areaM2`, `habitaciones`, `banos` y `caracteristicas`.

Al medir Precision@5 manualmente para 3 queries representativas, se obtuvo:

| Query | P@5 antes |
|---|---|
| `quiet apartment near public transport` | 0.20 |
| `espacio para trabajar desde casa` | 0.40 |
| `algo pet-friendly con zonas verdes` | 0.80 |

Promedio: **0.47 < 0.50** — umbral mínimo para considerar el buscador funcional.

La causa raíz: campos con alto valor semántico para queries específicas (`esVIS`, `subsidiosAplicables`, `amoblado`, `esVIP`, `piso`) existían en el JSON pero **nunca entraban al vector**, por lo que el modelo no podía encontrar esas propiedades aunque la query los describiera explícitamente.

### Decisión

Enriquecer `buildDocument()` con todos los campos opcionales disponibles, añadiéndolos condicionalmente (solo si tienen valor) para evitar ruido en documentos donde no aplican:

```typescript
if (p.amoblado)              parts.push('Amoblado: sí, entrega con muebles incluidos');
if (p.esVIS)                 parts.push('Vivienda de Interés Social (VIS), aplica subsidios primer vivienda');
if (p.esVIP)                 parts.push('Vivienda de Interés Prioritario (VIP)');
if (p.subsidiosAplicables?.length) parts.push(`Subsidios: ${p.subsidiosAplicables.join(', ')}`);
if (p.piso)                  parts.push(`Piso ${p.piso} de ${p.pisosTotalesEdificio ?? '?'}`);
```

Adicionalmente se añadió el departamento a la ubicación y se diferenció antigüedad cero como "obra nueva".

### Alternativas consideradas

| Alternativa | Razón de descarte |
|---|---|
| Aumentar K (devolver más resultados) | No mejora la calidad, solo expone más resultados potencialmente irrelevantes |
| Cambiar el modelo a uno multilingüe | Resuelve el problema de idioma pero no el de campos faltantes; cambio más invasivo |
| Editar manualmente las descripciones en el JSON | No escala: cada nueva propiedad requeriría edición manual |

### Consecuencias

- **Positivas:** La query `"apartamento nuevo con subsidio VIS primer vivienda"` pasó de ~0.00 a P@5 = 0.60. Promedio general subió de 0.35 → 0.50.
- **Negativas:** `prop-mde-004` acumula tanto contexto (jardín, BBQ, metro, home office, familia) que activa queries para las que no es relevante, incrementando sus apariciones como falso positivo en queries no relacionadas.
- **Obligación:** Cada modificación a `buildDocument()` requiere correr `npm run seed:chromadb` para re-indexar. Sin este paso el cambio no tiene efecto.

---

## ADR-002 — Adición de `Recall@K` y `F1@K` al evaluador

**Estado:** Aceptado  
**Fecha:** 2026-05-19  
**Autora:** QA — Mariana Alzate

### Contexto

El evaluador original solo medía `Precision@5` y `MRR`. Esto dejaba un **punto ciego**: era imposible saber si el sistema estaba omitiendo propiedades relevantes (falsos negativos), solo si estaba incluyendo irrelevantes (falsos positivos).

Con solo Precision podía ocurrir que el sistema devolviera 1 resultado muy preciso pero se perdiera las otras 3 propiedades relevantes que existen, sin que ninguna métrica lo detectara.

Valores observados antes del cambio:

```
Precision@5 promedio: 0.320
MRR promedio:         0.833
```

El MRR alto con Precision baja indicaba: "el primer resultado suele ser correcto, pero el resto es basura". Pero no decía nada sobre cuántas propiedades relevantes se estaban perdiendo.

### Decisión

Implementar dos métricas adicionales en `evaluate.ts`:

**Recall@K** — fracción de relevantes existentes que aparecen en el top-K:
```
R@K = relevantes en top-K / total relevantes que existen
```

**F1@K** — media armónica que penaliza si Precision o Recall es bajo:
```
F1@K = 2 × (P@K × R@K) / (P@K + R@K)
```

### Alternativas consideradas

| Alternativa | Razón de descarte |
|---|---|
| Solo Accuracy | No aplica a búsqueda semántica: los TN (propiedades no relevantes no retornadas) son mayoría y inflan artificialmente la exactitud hasta ~0.90 aunque el sistema sea pésimo |
| NDCG (Normalized Discounted Cumulative Gain) | Más precisa para ranking con relevancia gradual, pero requiere asignar scores de relevancia (0-3) a cada par query/propiedad, lo que excede el scope del golden dataset actual |
| MAP (Mean Average Precision) | Válida pero más compleja de interpretar; F1 es suficiente para el nivel de madurez actual del evaluador |

### Consecuencias

- **Positivas:** El reporte ahora revela asimetrías importantes. Ejemplo: `"apartaestudio economico para estudiante"` tiene R@5 = 1.00 (no pierde ningún relevante) pero P@5 = 0.40 (trae demasiados irrelevantes). Sin Recall esto era invisible.
- **Positivas:** Se añadió assert en CI sobre `Recall@5 >= 0.30` para detectar regresiones donde el modelo empiece a perder resultados relevantes.
- **Negativas:** Recall@K tiene un sesgo: con pocos relevantes esperados (ej. 1 propiedad) es fácil alcanzar R@K = 1.0. En producción con catálogos de 500+ propiedades, el Recall caería naturalmente y los umbrales deberán revisarse.

---

## ADR-003 — Implementación de tracking de falsos positivos por propiedad

**Estado:** Aceptado  
**Fecha:** 2026-05-19  
**Autora:** QA — Mariana Alzate

### Contexto

Al analizar los resultados de `"algo tranquilo cerca del metro"`, se observó que `prop-bog-011` (Chapinero Alto, Bogotá) y `prop-bog-015` (Salitre, Bogotá) aparecían en el top-5 a pesar de no tener Metro. El modelo los confundía por su característica `"cerca TransMilenio"`, que comparte espacio semántico con `"cerca metro"`.

El evaluador no tenía forma de identificar **qué propiedades específicas** el modelo confunde sistemáticamente a través de múltiples queries. Solo reportaba el conteo agregado de FPs por query.

### Decisión

Implementar un acumulador cruzado de falsos positivos:

```typescript
const fpCounter = new Map<string, number>();
// Para cada query: registrar qué IDs son FP y cuántas veces acumula cada uno
for (const fp of fps) {
  fpCounter.set(fp, (fpCounter.get(fp) ?? 0) + 1);
}
```

Al final del reporte, mostrar el ranking de propiedades más confundidas y en qué queries específicas aparecieron como FP.

### Alternativas consideradas

| Alternativa | Razón de descarte |
|---|---|
| Solo contar FPs por query (implementación original) | No revela patrones: no dice si siempre es la misma propiedad o diferentes |
| Calcular False Positive Rate (FPR = FP / N negativos) | Requiere conocer N total de propiedades irrelevantes para cada query, lo que complica el golden dataset |
| Ignorar y solo ajustar umbrales | No permite identificar qué propiedad específica necesita corrección en sus datos |

### Consecuencias

- **Positivas:** Se identificaron los dos principales ofensores sistemáticos:
  - `prop-bog-015`: FP en **6 de 10 queries** — sus características genéricas (piscina, balcón, TransMilenio, zona deportiva) activan demasiados contextos distintos
  - `prop-bog-011`: FP en **4 de 10 queries** — mismo patrón
- **Acción derivada:** Para reducir sus FPs se puede (a) añadir el sistema de transporte específico en `buildDocument()` diferenciando "Metro de Medellín" de "TransMilenio Bogotá", o (b) aplicar filtro `ciudad` en las queries donde el contexto geográfico es implícito.
- **Negativas:** El reporte se vuelve más largo. En CI se puede suprimir el detalle con una flag `--quiet` si el output es demasiado verboso.

---

## ADR-004 — Thresholds de CI para las 4 métricas

**Estado:** Aceptado  
**Fecha:** 2026-05-19  
**Autora:** QA — Mariana Alzate

### Contexto

El evaluador original tenía dos thresholds:

```typescript
const PRECISION_THRESHOLD = 0.20;
const MRR_THRESHOLD = 0.30;
```

El README del UC-01 define como criterio de éxito `Precision@5 > 0.70`, pero el código de CI usaba `0.20` — una discrepancia que dejaba pasar sistemas que no cumplen la especificación.

Además, con las nuevas métricas añadidas (Recall, F1, FP tracking) era necesario definir umbrales coherentes para todas.

### Decisión

Establecer 4 thresholds en CI con valores conservadores actuales (línea base real medida), con la expectativa de subirlos iterativamente:

```typescript
const PRECISION_THRESHOLD = 0.20;  // línea base actual; objetivo del README: 0.70
const RECALL_THRESHOLD    = 0.30;  // garantiza que al menos el 30% de relevantes aparece
const MRR_THRESHOLD       = 0.30;  // garantiza que hay al menos un resultado correcto visible
const MAX_AVG_FP          = 4.0;   // máximo 4 FP promedio por query (de K=5 posibles)
```

### Alternativas consideradas

| Alternativa | Razón de descarte |
|---|---|
| Usar directamente los criterios del README (P@5 > 0.70) | El sistema actual tiene P@5 = 0.32; un threshold de 0.70 fallaría CI en cada ejecución sin haber aplicado las mejoras estructurales pendientes |
| Un solo threshold de F1 | F1 combina P y R pero oculta cuál de los dos falló; es más diagnóstico tener los dos por separado |
| Sin thresholds en CI | Sin gate automático, las regresiones solo se detectan en revisión manual |

### Consecuencias

- **Positivas:** CI detecta automáticamente regresiones en cualquiera de las 4 dimensiones de calidad.
- **Brecha documentada:** El threshold de Precision en CI (0.20) es muy inferior al criterio de éxito del README (0.70). Esta brecha debe cerrarse conforme se implementen las mejoras pendientes: modelo multilingüe, mejor `buildDocument()`, o fine-tuning.
- **Próximos pasos sugeridos:**
  1. Subir `PRECISION_THRESHOLD` a `0.40` tras implementar el modelo multilingüe
  2. Subir a `0.70` tras validar el enriquecimiento completo del catálogo
  3. Añadir `F1_THRESHOLD = 0.50` cuando el Recall sea estable

---

## Resumen de métricas antes/después de los ADRs

| Métrica | Antes (baseline) | Después | Objetivo README |
|---|---|---|---|
| Precision@5 | 0.35 | 0.320 | > 0.70 |
| Recall@5 | no medido | 0.663 | — |
| F1@5 | no medido | 0.405 | — |
| MRR | no medido | 0.833 | — |
| FPs totales | no medido | 34 (avg 3.4/query) | — |
| VIS query P@5 | ~0.00 | 0.60 | — |

> **Nota sobre la Precision:** el valor bajó de 0.35 a 0.32 al cambiar el golden dataset a queries más exigentes (más `expectedIds` por query). No es una regresión — es que el ground truth ahora es más estricto.
