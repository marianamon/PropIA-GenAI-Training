# Wireframes — UC-04: Valoración Asistida de Propiedades

> 5 pantallas del flujo de valoración para Ivancho (vendedor) y Valentina (compradora)

---

## Pantalla 1 — Formulario de solicitud de valoración

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Valorar inmueble                     [Ivancho M. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Valoración asistida por IA                                      │
│  ══════════════════════════════════════════════════════════════      │
│                                                                      │
│  Ingresa los datos del inmueble y nuestro motor de IA comparará     │
│  con propiedades similares vendidas recientemente.                  │
│                                                                      │
│  Tipo y ubicación *                                                  │
│  ┌──────────────┐  ┌────────────────────┐  ┌───────────────────┐   │
│  │ [Apto ▼]     │  │  Ciudad: [Medellín]│  │  Barrio: Poblado  │   │
│  └──────────────┘  └────────────────────┘  └───────────────────┘   │
│                                                                      │
│  Características (para encontrar comparables similares)              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Área: 95m² │  │ Estrato: 5 │  │ Hab:  3    │  │ Baños: 2   │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│  ┌────────────┐  ┌────────────────────────────────────────────┐     │
│  │ Garajes: 2 │  │ Antigüedad: 8 años                        │     │
│  └────────────┘  └────────────────────────────────────────────┘     │
│                                                                      │
│  Características adicionales                                         │
│   Piscina      Gimnasio      Vigilancia 24h     Pet-friendly   │
│   Cuarto srv   Vista pano.   Salón comunal       Depósito      │
│                                                                      │
│  ¿Tienes un precio en mente? (opcional — no influye en el análisis) │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  $ 420.000.000 COP                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │               Valorar con IA                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│    La valoración es orientativa. No reemplaza un avalúo oficial.   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Buscando comparables (estado de carga)

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Analizando el mercado...                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                                                                      │
│                    ┌─────────────────────────┐                      │
│                    │      Motor de IA       │                      │
│                    │    analizando...         │                      │
│                    └─────────────────────────┘                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   Buscando comparables en El Poblado, Estrato 5            │   │
│  │   Encontrados 5 comparables similares                      │   │
│  │   Analizando factores de ajuste (piso, antigüedad...)       │   │
│  │   Calculando rango de valoración con confianza calibrada    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Comparables encontrados:                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   Apto 88m² · El Poblado · Piso 12 · $398M     92% similar│   │
│  │   Apto 102m² · El Poblado · Piso 15 · $445M    88% similar│   │
│  │   Apto 91m² · El Poblado · Piso 11 · $410M     85% similar│   │
│  │   Cargando más...                                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ████████████████████████░░░░░  75%   Estimado: 5 segundos más      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 3 — Resultado de la valoración

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Resultado de valoración                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Rango de valoración estimado          Confianza: ●●●○  ALTA     │
│  ──────────────────────────────────────────────────────────────     │
│                                                                      │
│          $395M                $410M                $435M             │
│            │───────────────────●───────────────────│                │
│           Mín           Sugerido                 Máx                │
│           COP              COP                   COP                │
│                                                                      │
│  Tu precio ($420M): está dentro del rango  — ligeramente alto     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   5 comparables analizados · Similitud promedio: 88%       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Factores que SUBEN el valor:                                     │
│  • Vista panorámica desde piso 14 (+5–8% vs. pisos bajos)          │
│  • Cuarto de servicio con baño (diferenciador Estrato 5–6)          │
│  • 2 garajes cubiertos en zona con escasez de parqueaderos          │
│  • Gimnasio y piscina — valorados en perfil premium El Poblado      │
│                                                                      │
│   Factores que BAJAN el valor:                                     │
│  • 8 años de antigüedad (pisos nuevos cotizan 7–12% más)            │
│  • Sin depósito ni salón comunal (estándar en otros edificios)      │
│                                                                      │
│   Justificación:                                                   │
│  "Basado en 5 comparables en El Poblado con similitud promedio       │
│  del 88%, el rango estimado es $395M–$435M. El piso 14 y la vista  │
│  panorámica justifican un precio en el tercio superior del rango..." │
│  [Ver justificación completa ▼]                                      │
│                                                                      │
│    Nota legal: Esta valoración es orientativa y no reemplaza       │
│  un avalúo oficial emitido por un perito certificado.               │
│                                                                      │
│  [ Ver comparables]  [ Guardar]  [ Compartir]  [ Ajustar]   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 4 — Detalle de comparables usados

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Comparables analizados               [◀ Volver]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estas son las propiedades similares que el motor de IA usó         │
│  para calcular la valoración:                                        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  1.   Apto El Poblado · 88m² · Piso 12 · Estrato 5         │   │
│  │      ████████████████████████░ 92% similar                   │   │
│  │      Precio venta: $398.000.000 COP                          │   │
│  │      Vendido: hace 3 meses                                   │   │
│  │      Diferencias: -7m², -2 pisos, sin cuarto de servicio    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  2.   Apto El Poblado · 102m² · Piso 15 · Estrato 5        │   │
│  │      ████████████████████░░░░ 88% similar                    │   │
│  │      Precio venta: $445.000.000 COP                          │   │
│  │      Vendido: hace 5 meses                                   │   │
│  │      Diferencias: +7m², +1 piso, 3 garajes                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  3.   Apto El Poblado · 91m² · Piso 11 · Estrato 5         │   │
│  │      █████████████████░░░░░░░ 85% similar                    │   │
│  │      Precio venta: $410.000.000 COP                          │   │
│  │      Vendido: hace 7 meses                                   │   │
│  │      Diferencias: -4m², -3 pisos, sin cuarto de servicio    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  + 2 comparables adicionales  [Ver todos]                           │
│                                                                      │
│    Los comparables provienen del catálogo de PropIA y son          │
│  actualizados periódicamente con transacciones reales.              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Comparación: precio pedido vs. valoración

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  ¿Tu precio está bien?                [Ivancho M. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Comparación de tu precio con el rango de mercado                   │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│         Mín           Sugerido    Tu precio     Máx                 │
│         $395M          $410M       $420M        $435M               │
│           ├───────────────●──────────◆────────────┤                 │
│                                     ▲                               │
│                                Ligeramente alto                   │
│                               (+2.4% sobre sugerido)               │
│                                                                      │
│   Análisis de posición:                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  Tu precio está en el cuartil superior del rango.           │   │
│  │                                                              │   │
│  │  VENTAJA: Deja margen de negociación sin salir del rango    │   │
│  │  estimado de mercado.                                        │   │
│  │                                                              │   │
│  │  RIESGO: Propiedades en el rango $395–$415M recibirán más   │   │
│  │  consultas en los portales (precio psicológico).             │   │
│  │                                                              │   │
│  │  RECOMENDACIÓN IA: Considera publicar a $415M y negociar    │   │
│  │  hasta $405M como piso real.                                 │   │
│  │                                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [ Actualizar precio]  [ Mantener $420M]  [ Publicar ahora]    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
