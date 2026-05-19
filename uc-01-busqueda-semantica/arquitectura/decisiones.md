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

### Nota de mejora — Diferenciación semántica Metro vs TransMilenio

**Problema raíz identificado:**  
El modelo `all-MiniLM-L6-v2` fue entrenado con texto general de internet, donde "metro", "TransMilenio", "subte", "MIO" y "transporte masivo" comparten contextos similares y quedan cerca en el espacio vectorial de 384 dimensiones. Para el modelo son sinónimos conceptuales; no sabe que son sistemas distintos en ciudades distintas.

Esto genera que una query como `"algo tranquilo cerca del metro"` active propiedades bogotanas con TransMilenio aunque el usuario implícitamente busque en Medellín.

**Mejoras propuestas en orden de impacto y costo:**

**Mejora 1 — Enriquecer `buildDocument()` con el nombre explícito del sistema (bajo costo, sin re-entrenar)**

Modificar `scripts/seed-chromadb.ts` para incluir la ciudad junto al sistema de transporte, forzando que el texto indexado diferencie explícitamente:

```typescript
// En buildDocument(), añadir línea de transporte si existe en características
const transporteMDE = p.caracteristicas.some(c => c.includes('metro'))
  && p.ubicacion.ciudad === 'Medellín' || p.ubicacion.ciudad === 'Envigado'
  || p.ubicacion.ciudad === 'Sabaneta';

const transporteBOG = p.caracteristicas.some(c =>
  c.toLowerCase().includes('transmilenio') || c.toLowerCase().includes('sitp')
) && p.ubicacion.ciudad === 'Bogotá';

if (transporteMDE) parts.push('Transporte: Metro de Medellín (sistema de metro subterráneo y elevado)');
if (transporteBOG) parts.push('Transporte: TransMilenio Bogotá (sistema de buses de tránsito rápido BRT)');
```

Tras re-indexar con `npm run seed:chromadb`, el modelo tendría texto diferente para cada sistema y sus vectores se alejarían entre sí.

**Mejora 2 — Filtro de metadata por ciudad en `search.ts` (bajo costo, sin re-indexar)**

Cuando la query no especifica ciudad, inferirla del contexto si menciona "metro" (→ Medellín/área metropolitana) o "TransMilenio" (→ Bogotá):

```typescript
// En semanticSearch(), inferir ciudad si la query menciona el sistema
function inferCiudad(query: string): string | undefined {
  const q = query.toLowerCase();
  if (q.includes('metro') && !q.includes('transmilenio')) return 'Medellín';
  if (q.includes('transmilenio') || q.includes('sitp')) return 'Bogotá';
  return undefined;
}

// Aplicar como filtro automático si el usuario no lo especificó
const ciudadInferida = filters?.ciudad ?? inferCiudad(query);
if (ciudadInferida) conditions.push({ ciudad: ciudadInferida });
```

**Mejora 3 — Cambiar a modelo multilingüe con mayor contexto geográfico (costo medio)**

Reemplazar `all-MiniLM-L6-v2` por `paraphrase-multilingual-MiniLM-L12-v2` en `packages/embeddings/src/embed.ts`. Este modelo fue entrenado con pares de frases en 50 idiomas y tiene mayor sensibilidad a entidades geográficas y nombres propios. Requiere re-indexar toda la colección.

**Mejora 4 — Fine-tuning con datos de PropIA (alto costo, máximo impacto)**

Entrenar el modelo con pares `(query PropIA, propiedad relevante)` usando los datos del golden dataset y búsquedas reales de usuarios. El modelo aprendería que en el contexto de PropIA "metro" = sistema Metro del Valle de Aburrá, no cualquier transporte masivo. Requiere infraestructura de entrenamiento y un dataset etiquetado más amplio (mínimo 500-1000 pares).

**Orden de implementación recomendado:**

```
Mejora 1 (buildDocument)  →  Mejora 2 (inferCiudad)  →  Mejora 3 (modelo)  →  Mejora 4 (fine-tuning)
    1-2 horas                    1 hora                    2-4 horas              semanas
    sin infra extra              sin infra extra            re-indexar             infra ML
```

> Aplicar Mejora 1 + Mejora 2 debería eliminar `prop-bog-011` y `prop-bog-015` como FPs en la query `"algo tranquilo cerca del metro"` y reducir el total de FPs de 34 a ~26, subiendo P@5 promedio de 0.32 a ~0.45 sin cambiar el modelo.

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

---

## ADR-005 — Implementación de 5 suites de pruebas específicas de IA

**Estado:** Aceptado  
**Fecha:** 2026-05-19  
**Autora:** QA — Mariana Alzate

### Contexto

Las métricas del golden dataset (P@5, R@5, F1, MRR, FPs) evalúan la calidad de los resultados contra un ground truth fijo. Sin embargo, no cubren aspectos exclusivos del comportamiento de un modelo de IA:

- ¿El espacio vectorial tiene sentido semántico para el dominio inmobiliario colombiano?
- ¿El modelo es robusto ante variaciones naturales de escritura del usuario?
- ¿Qué pasa cuando el usuario busca algo completamente fuera de dominio?
- ¿Los resultados son reproducibles o cambian entre ejecuciones?
- ¿El sistema responde dentro del SLA definido en el README (< 2s)?

Ninguna de estas preguntas se responde con métricas de ranking. Son propiedades del modelo y el pipeline que requieren pruebas dedicadas.

### Decisión

Implementar 5 suites de pruebas en `evaluate.ts` que se ejecutan después del golden dataset, usando la misma función `embed()` y `semanticSearch()` del sistema real. Las suites corren en paralelo con `Promise.allSettled()` para maximizar velocidad, y cualquier falla hace `process.exit(1)` en CI igual que las métricas.

---

### Suite 1 — Calidad de embeddings

**Qué hace:** calcula la similitud coseno entre pares de textos para verificar que el espacio vectorial de 384 dimensiones captura relaciones semánticas correctas dentro del dominio.

**Fórmula utilizada:**
```
coseno(A, B) = (A · B) / (|A| × |B|)
```
Como `embed()` usa `normalize: true`, los vectores tienen magnitud 1 y el coseno es igual al producto punto.

**Pares evaluados y thresholds:**

| Par de textos | Threshold | Justificación |
|---|---|---|
| "apartamento tranquilo cerca al metro" vs "propiedad en zona silencio con acceso a transporte" | coseno > 0.5 | Frases semánticamente equivalentes |
| "penthouse de lujo El Poblado" vs "VIS estrato 2 subsidio primer vivienda" | coseno < 0.5 | Conceptos opuestos en el dominio |
| "parqueadero" vs "garaje cubierto para vehiculo" | coseno > 0.5 | Sinónimos del dominio colombiano |
| "pet-friendly mascotas permitidas" vs "se aceptan perros y gatos" | coseno > 0.5 | Anglicismo vs descripción en español |
| "home office espacio de trabajo" vs "cancha de futbol estadio" | coseno < 0.4 | Conceptos sin relación alguna |

**Resultado de la primera ejecución:**

| Test | Coseno | Estado | Hallazgo |
|---|---|---|---|
| Frases equivalentes | 0.554 | PASS | El modelo entiende paráfrasis |
| Lujo vs VIS | 0.360 | PASS | Los opuestos quedan alejados |
| Parqueadero vs garaje | **0.297** | **FAIL** | El modelo no reconoce este sinónimo colombiano |
| Pet-friendly vs descripción | **0.113** | **FAIL** | Anglicismo y español están en espacios muy distintos |
| Home office vs deporte | 0.298 | PASS | Sin relación, correctamente alejados |

---

### Suite 2 — Robustez de queries

**Qué hace:** verifica que variaciones naturales de la misma intención (sinónimos, cambio de case, siglas vs descripción completa, anglicismos) retornan el mismo `top-1` o al menos 2/3 de overlap en el top-3.

**Pares evaluados:**

| Query base | Query variante | Criterio |
|---|---|---|
| `"apartamento cerca al metro"` | `"apto cerca a la estacion de metro"` | Mismo top-1 |
| `"algo pet-friendly"` | `"propiedad donde se permiten mascotas"` | Mismo top-1 |
| `"apartamento nuevo con subsidio VIS primer vivienda"` | `"vivienda social subsidiada para comprar por primera vez"` | Mismo top-1 |
| `"oficina moderna en zona empresarial"` | `"OFICINA MODERNA EN ZONA EMPRESARIAL"` | Mismo top-1 (case-insensitive) |

**Resultado:** PASS en los 4 casos. El modelo es robusto ante variaciones de escritura cotidianas.

---

### Suite 3 — Queries fuera de dominio

**Qué hace:** verifica que el sistema no retorna resultados con score alto ante queries sin relación con propiedades inmobiliarias. Define un umbral `SCORE_MAX_OUT_OF_DOMAIN = 0.10`.

**Queries evaluadas:**

| Query | Score obtenido | Estado |
|---|---|---|
| "recetas de cocina colombiana con ajiaco" | **0.131** | **FAIL** — supera umbral |
| "presidente de Colombia historia politica" | -0.091 | PASS |
| "iPhone 15 pro max precio colombia" | -0.289 | PASS |
| "partido de futbol atletico nacional" | -0.182 | PASS |

**Hallazgo:** "recetas de cocina" obtuvo score 0.131 porque el modelo encuentra similitud superficial entre palabras como "colombiana" y los textos del catálogo. El umbral de 0.10 es demasiado estricto para este modelo — necesita ajuste o la pantalla de fallback no se activará correctamente.

---

### Suite 4 — Determinismo

**Qué hace:** ejecuta la misma query dos veces en paralelo y verifica que los IDs y scores sean bit a bit idénticos.

**Queries evaluadas:** `"algo tranquilo cerca del metro"`, `"penthouse de lujo con piscina y vista"`, `"apartaestudio economico para estudiante"`.

**Resultado:** PASS en los 3 casos. El modelo `all-MiniLM-L6-v2` con `normalize: true` y `pooling: mean` es completamente determinista — dada la misma entrada, siempre produce el mismo vector.

**Por qué importa:** sistemas con sampling aleatorio (como LLMs con `temperature > 0`) no son deterministas. Verificar esto explícitamente es crítico antes de comparar resultados entre ejecuciones de CI.

---

### Suite 5 — Latencia

**Qué hace:** tras un warm-up (primera llamada para cargar el modelo en memoria), mide el tiempo de respuesta de 3 queries y verifica que ninguna supere los 2000ms definidos en los criterios de éxito del README.

**Estrategia de warm-up:** la primera carga de `all-MiniLM-L6-v2` tarda 30-60s (descarga + carga en RAM). Las suites de latencia se ejecutan al final del evaluador, cuando el modelo ya está en memoria desde las suites anteriores. El warm-up explícito garantiza que medimos el tiempo real de inferencia, no el de carga.

**Resultados:**

| Query | Tiempo | Estado |
|---|---|---|
| `"algo tranquilo cerca del metro"` | 75ms | PASS |
| `"espacio para trabajar desde casa"` | 43ms | PASS |
| `"penthouse de lujo con piscina y vista"` | 29ms | PASS |

El sistema responde en **29-75ms** post-warm-up — 27x por debajo del SLA de 2s.

---

### Alternativas consideradas

| Alternativa | Razón de descarte |
|---|---|
| Archivo separado `model-tests.ts` | Fragmenta la visibilidad; un solo archivo ejecutable es más simple para CI |
| Usar framework de testing (Jest, Vitest) | Añade dependencias y configuración; `tsx` directo es suficiente para el scope actual |
| Thresholds de coseno fijos sin justificación | Cada threshold tiene una razón semántica documentada; no son números arbitrarios |
| Ejecutar suites secuencialmente | `Promise.allSettled()` las paraleliza y reduce el tiempo total de evaluación |

### Tabla de hallazgos, impacto y acción

| Hallazgo | Impacto en el sistema | Acción recomendada |
|---|---|---|
| `parqueadero` ≠ `garaje` (coseno 0.297) | Queries con "garaje" no encuentran propiedades que usan "parqueadero" en el catálogo | Añadir en `buildDocument()`: `Estacionamiento/garaje/parqueadero: N` para indexar los sinónimos juntos |
| `pet-friendly` ≠ descripción en español (coseno 0.113) | Búsquedas en español ("se aceptan mascotas") no encuentran propiedades etiquetadas en inglés | Normalizar en `buildDocument()`: añadir "mascotas permitidas, apto para animales" cuando `caracteristicas` incluye "pet-friendly" |
| `"recetas de cocina"` score 0.131 > umbral 0.10 | El umbral de fallback para la pantalla "sin resultados" es demasiado estricto para este modelo | Ajustar `SCORE_MAX_OUT_OF_DOMAIN` a `0.15` o redefinir el criterio de fallback como `score < 0.05 EN EL TOP-1 de los resultados filtrados` |
| Robustez: PASS en 4/4 variaciones | El modelo maneja correctamente sinónimos, siglas y mayúsculas | Sin acción requerida — documentar como fortaleza del modelo |
| Determinismo: PASS en 3/3 queries | Los resultados de CI son reproducibles y comparables entre ejecuciones | Sin acción requerida |
| Latencia: 29-75ms post-warm-up | El SLA de 2s se cumple con margen de 27x | Monitorear si el catálogo crece a 500+ propiedades; re-evaluar latencia con k=20 |

### Consecuencias

- **Positivas:** el evaluador ahora cubre tanto la calidad de resultados (golden dataset) como propiedades del modelo (suites de IA). Un solo comando `npx tsx evaluate.ts` ejecuta ambos grupos y falla CI si cualquiera regresa.
- **Positivas:** los hallazgos de Suite 1 (sinónimos no reconocidos) son accionables directamente en `buildDocument()` sin cambiar el modelo.
- **Negativas:** el tiempo total de evaluación aumentó porque las suites de IA generan embeddings adicionales. Con el catálogo actual (20 propiedades) el impacto es mínimo; con catálogos más grandes puede necesitar caché de embeddings entre suites.
- **Deuda técnica:** el umbral `SCORE_MAX_OUT_OF_DOMAIN` (Suite 3) debe calibrarse empíricamente con más queries fuera de dominio antes de usarse como gate de CI definitivo.
