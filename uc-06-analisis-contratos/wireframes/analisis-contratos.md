# Wireframes — UC-06: Análisis Inteligente de Contratos

> 5 pantallas del flujo de análisis de contratos para Federico y Valentina

---

## Pantalla 1 — Upload del contrato

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Análisis de contratos           [Federico A. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Análisis inteligente de contratos                                │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  Sube tu promesa de compraventa, contrato de arrendamiento u otro   │
│  documento inmobiliario y nuestro motor de IA identificará las      │
│  cláusulas de riesgo en segundos.                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │                Arrastra tu PDF aquí                        │   │
│  │                                                              │   │
│  │              o                                               │   │
│  │                                                              │   │
│  │         [  Seleccionar archivo PDF ]                       │   │
│  │                                                              │   │
│  │         Formatos aceptados: PDF · Máx. 50 páginas           │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Tipo de contrato (ayuda a mejorar la precisión):                   │
│  ○ Promesa de compraventa                                            │
│  ○ Compraventa definitiva                                            │
│  ○ Contrato de arrendamiento                                         │
│  ○ Opción de compra                                                  │
│  ● Detectar automáticamente                                          │
│                                                                      │
│    IMPORTANTE: Este análisis es orientativo. No reemplaza el      │
│  concepto de un abogado. Siempre consulta con un profesional legal  │
│  antes de firmar.                                                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │               Analizar contrato                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Procesando: análisis en curso

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Analizando contrato...                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Analizando: "promesa-compraventa-Ivancho-maria.pdf"                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │   Cargando PDF (28 páginas)                                │   │
│  │   Dividiendo en fragmentos manejables (8 chunks)           │   │
│  │   Analizando cláusulas 1–5 ...                              │   │
│  │   Analizando cláusulas 6–12 ...                             │   │
│  │   Analizando cláusulas 13–20 ...                            │   │
│  │   Consolidando resultados ...                               │   │
│  │   Calculando score de riesgo general ...                    │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ████████████████░░░░░░░░░░░░░░░  45%                               │
│  Analizando fragmento 4 de 8 · Estimado: 12 segundos más           │
│                                                                      │
│                                                                      │
│               PropIA está leyendo tu contrato...                   │
│                    Esto puede tomar hasta 30 segundos               │
│                                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 3 — Reporte de análisis: vista general

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Análisis completado             [ Descargar PDF]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Promesa de Compraventa                     Riesgo:  ALTO      │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  PARTES DEL CONTRATO                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Vendedor: Ivan Hidalgo                               │   │
│  │  Comprador: Valentina Alzate                          │   │
│  │  Notaría: Notaría 12 de Medellín                            │   │
│  │  Valor: $290.000.000 COP   Arras: $29.000.000 COP (10%)     │   │
│  │  Fecha de firma: 20 de mayo de 2026                         │   │
│  │  Fecha de entrega: 15 de julio de 2026                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Resumen ejecutivo:                                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  El contrato presenta 2 cláusulas de riesgo ALTO que        │   │
│  │  deben ser revisadas con un abogado antes de firmar.        │   │
│  │  La cláusula de penalidades (§8) establece condiciones      │   │
│  │  desequilibradas que favorecen al vendedor...               │   │
│  │  [Ver resumen completo ▼]                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   CLÁUSULAS DE RIESGO (5 encontradas)                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   §8 — Penalidades por incumplimiento         [Ver ▼]      │   │
│  │   §12 — Condición resolutoria                 [Ver ▼]      │   │
│  │   §5 — Fecha de entrega condicionada          [Ver ▼]      │   │
│  │   §15 — Obligaciones de saneamiento           [Ver ▼]      │   │
│  │   §3 — Precio y forma de pago                 [Ver ▼]      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Recomendaciones del análisis:                                    │
│  • Negociar §8: las penalidades deben ser simétricas para ambas    │
│    partes — actualmente solo penalizan al comprador                 │
│  • Clarificar §12: la condición resolutoria no tiene plazo máximo  │
│  • Solicitar certificado de tradición y libertad actualizado        │
│                                                                      │
│    Este análisis es orientativo y no reemplaza el concepto        │
│  de un abogado. Fecha del análisis: 15 may 2026                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 4 — Detalle de cláusula de riesgo

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Cláusula §8 — Penalidades        [◀ Volver]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   RIESGO ALTO                                                      │
│  CLÁUSULA 8 — Penalidades por incumplimiento                        │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│   Texto original del contrato:                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  "En caso de incumplimiento por parte del COMPRADOR en       │   │
│  │  cualquiera de sus obligaciones, el VENDEDOR podrá retener  │   │
│  │  el valor de las arras a título de pena, sin perjuicio de   │   │
│  │  la acción de cumplimiento o resolución del contrato..."    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Análisis IA:                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  PROBLEMA IDENTIFICADO:                                      │   │
│  │  Esta cláusula establece penalidades ASIMÉTRICAS:           │   │
│  │  • Si el comprador incumple: pierde $29M de arras            │   │
│  │  • Si el vendedor incumple: no se especifica ninguna        │   │
│  │    penalidad equivalente                                    │   │
│  │                                                              │   │
│  │  REFERENCIA LEGAL:                                          │   │
│  │  El artículo 1604 del Código Civil colombiano establece     │   │
│  │  que las arras son bilaterales: si el comprador desiste,    │   │
│  │  pierde las arras; si el vendedor desiste, debe devolver    │   │
│  │  el doble. Esta cláusula omite la obligación del vendedor.  │   │
│  │                                                              │   │
│  │  RECOMENDACIÓN:                                             │   │
│  │  Solicitar modificación que incluya: "Si el VENDEDOR        │   │
│  │  incumple, deberá restituir el doble de las arras           │   │
│  │  recibidas al COMPRADOR."                                   │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│    Consulta con un abogado antes de tomar decisiones basadas      │
│  en este análisis.                                                   │
│                                                                      │
│  [◀ Anterior cláusula]  [▶ Siguiente cláusula]  [ Guardar nota]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Historial de análisis

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Mis análisis de contratos       [Federico A. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Contratos analizados (12 en total)                               │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   MAYO 2026                                                 │   │
│  │                                                              │   │
│  │   promesa-compraventa-Ivancho-maria.pdf                     │   │
│  │      ALTO riesgo · 28 págs · 5 cláusulas críticas         │   │
│  │     15 may 2026                              [Ver →]         │   │
│  │                                                              │   │
│  │   arriendo-apto-laureles-ruiz.pdf                          │   │
│  │      MEDIO riesgo · 12 págs · 2 cláusulas críticas        │   │
│  │     10 may 2026                              [Ver →]         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   ABRIL 2026                                                │   │
│  │                                                              │   │
│  │   promesa-venta-envigado-garcia.pdf                        │   │
│  │      BAJO riesgo · 20 págs · 0 cláusulas críticas         │   │
│  │     28 abr 2026                              [Ver →]         │   │
│  │                                                              │   │
│  │   compraventa-casa-belen-martinez.pdf                      │   │
│  │      MEDIO riesgo · 35 págs · 3 cláusulas críticas        │   │
│  │     15 abr 2026                              [Ver →]         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [+ Analizar nuevo contrato]                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
