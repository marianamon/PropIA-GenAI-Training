# Seed data — PropIA

Este directorio contiene los datos de ejemplo que alimentan los 8 UCs. **Son datos ficticios generados a propósito** para que el path sea reproducible: cualquiera que clone el repo trabaja con los mismos inputs y puede comparar sus resultados.

---

## Inventario

| Archivo | Tamaño | Consumido por | Qué contiene |
|---|---|---|---|
| `propiedades.json` | 20 entradas | UC-01, UC-02, UC-04, UC-05, UC-07 | 20 propiedades inmobiliarias reales-realistas de Medellín, Envigado, Sabaneta, Rionegro y Bogotá. Mezcla de estratos 3–6, tipos (apartamento, casa, apartaestudio, oficina, local comercial), barrios reales, precios coherentes con mercado 2025. |
| `leads.json` | 10 entradas | UC-05 | 10 leads con estados variados (`NUEVO`, `CONTACTADO`, `EN_VISITA`, `EN_NEGOCIACION`, `CERRADO_GANADO`, `CERRADO_PERDIDO`, `INACTIVO`), distintos canales (`WEB`, `WHATSAPP`, `EMAIL`, `LLAMADA`, `REFERIDO`, `PORTALES_EXTERNOS`), notas de seguimiento del agente. |
| `golden-dataset.json` | 20 pares Q&A | UC-08 | 20 pares pregunta/respuesta ideal con propiedades esperadas y contextos. Diseñados para medir faithfulness, answer_relevancy y context_precision con RAGAS. Incluye preguntas fuera de rango (deben retornar `[]`) para medir comportamiento defensivo. |
| `contrato-ejemplo.txt` | ~6 KB | UC-06 | Texto plano de una promesa de compraventa colombiana realista. Incluye **dos cláusulas con sesgo intencional**: cláusula séptima (renuncia a lesión enorme) y cláusula novena (renuncia a vicios ocultos). Útil para validar que UC-06 las marca como `ALTO` riesgo. |
| `contrato-ejemplo.pdf` | ~25 KB | UC-06 | Versión PDF del contrato anterior. **No se commitea** — se regenera con `npm run seed:pdf` desde el `.txt`. |

---

## Cómo regenerar

```bash
# Desde la raíz del repo
npm run seed              # Genera PDF y reindexea ChromaDB
npm run seed:pdf          # Solo PDF
npm run seed:chromadb     # Solo ChromaDB (idempotente)
```

El paso `seed:chromadb`:
1. Lee `propiedades.json`.
2. Construye un texto descriptivo por propiedad (titulo + descripcion + ubicación + estrato + características).
3. Calcula el embedding con `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`, 384 dims).
4. Hace `upsert` a la colección `propiedades` en ChromaDB.

Es **idempotente**: puedes correrlo N veces sin duplicar datos.

---

## Cómo editar / agregar

- **Agregar una propiedad**: añade una entrada al array de `propiedades.json` respetando la interface `Propiedad` de [`packages/shared/src/propiedad.ts`](../../packages/shared/src/propiedad.ts). Corre `npm run seed:chromadb` para reindexar.
- **Agregar un lead**: añade a `leads.json` respetando la interface `Lead` de [`packages/shared/src/lead.ts`](../../packages/shared/src/lead.ts).
- **Agregar pares al golden dataset**: añade a `golden-dataset.json.preguntas` con la estructura existente. Importante: `expectedPropertyIds` debe ser un array vacío si la pregunta debe retornar "no resultados" (ej. fuera de rango).


