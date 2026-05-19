# Wireframes — UC-03: Generador de Fichas de Inmuebles

> 5 pantallas del flujo de generación de fichas para Ivancho (vendedor) y Federico (agente)

---

## Pantalla 1 — Formulario de datos del inmueble

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Publicar inmueble                    [Ivancho M. ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Paso 1 de 3: Datos del inmueble                                 │
│  ════════════════════════════════════════════════════════════════    │
│                                                                      │
│  Tipo de inmueble *                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [Apartamento ▼]                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Ubicación *                                                         │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐    │
│  │  Ciudad: [Medellín ▼]   │    │  Barrio: El Poblado          │    │
│  └─────────────────────────┘    └──────────────────────────────┘    │
│                                                                      │
│  Características físicas                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Área: 95m² │  │ Estrato: 5 │  │ Hab: 3     │  │ Baños: 2   │    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│  ┌────────────┐  ┌────────────┐                                     │
│  │ Garajes: 2 │  │ Piso: 14   │                                     │
│  └────────────┘  └────────────┘                                     │
│                                                                      │
│  Características adicionales (selecciona todas las que apliquen)    │
│   Piscina           Gimnasio          Salón comunal              │
│   Vigilancia 24h    Zonas verdes      Pet-friendly               │
│   Cuarto servicio   Depósito          Vista panorámica           │
│   Amoblado          Zona de ropas     Cocina integral            │
│                                                                      │
│  Precio de venta *                                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  $ 420.000.000 COP                     Precio negociable    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Antigüedad del inmueble                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  8 años                                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Tono de la ficha *                                                  │
│  ○ Familiar  ● Lujo  ○ Inversor                                      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   Generar ficha con IA                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 2 — Generando ficha (estado de carga)

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Generando tu ficha...                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                                                                      │
│                    ┌─────────────────────────┐                      │
│                    │                         │                      │
│                    │      PropIA IA         │                      │
│                    │    está escribiendo...  │                      │
│                    │                         │                      │
│                    └─────────────────────────┘                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   Analizando puntos fuertes del inmueble                   │   │
│  │   Identificando buyer persona para Estrato 5               │   │
│  │   Redactando título y descripción...                        │   │
│  │   Generando bullets de características                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ████████████████████████░░░░░░░░░  65%                             │
│                                                                      │
│  Esto toma entre 3 y 8 segundos según la complejidad del inmueble   │
│                                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 3 — Resultado: ficha generada lista para revisar

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Tu ficha está lista                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TÍTULO GENERADO                           [ Editar] [ Regenerar]│
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Penthouse con vista al Valle · El Poblado · Estrato 5 ·    │   │
│  │  95m² · Piscina y gym incluidos                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  DESCRIPCIÓN GENERADA                      [ Editar] [ Regenerar]│
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Viva en el corazón de El Poblado con una vista despejada   │   │
│  │  al Valle de Aburrá desde el piso 14. Este apartamento de   │   │
│  │  95m² combina elegancia y funcionalidad: cocina integral con │   │
│  │  acabados de primera y sala-comedor con luz natural todo el  │   │
│  │  día.                                                        │   │
│  │                                                              │   │
│  │  El edificio ofrece piscina, gimnasio equipado y vigilancia  │   │
│  │  24 horas con portería. Incluye cuarto de servicio con baño │   │
│  │  independiente y dos garajes cubiertos.                      │   │
│  │                                                              │   │
│  │  Ubicado a pasos de Provenza, los mejores restaurantes y    │   │
│  │  centros comerciales de Medellín. Acceso rápido al Centro   │   │
│  │  Financiero y a las principales vías de la ciudad.          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  CARACTERÍSTICAS                           [ Editar] [ Regenerar]│
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │   Vista panorámica al Valle de Aburrá · Piso 14           │   │
│  │   Piscina y gimnasio en áreas comunes                      │   │
│  │   Vigilancia 24h con portería                              │   │
│  │   Cuarto de servicio con baño independiente                │   │
│  │   2 garajes cubiertos incluidos                            │   │
│  │   A pasos de Provenza · El Poblado                         │   │
│  │   Estrato 5 · 8 años de antigüedad                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Calidad IA:   4.8/5   [Ver criterios de calidad]            │
│                                                                      │
│  [◀ Cambiar datos]  [ Ver variantes de tono]  [ Publicar]        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 4 — Comparador de variantes de tono

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  Elige el tono de tu ficha                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Generamos 3 versiones de tu ficha. Escoge la que mejor representa  │
│  el inmueble y el comprador que buscas atraer.                      │
│                                                                      │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────┐ │
│  │   FAMILIAR         │ │   LUJO             │ │   INVERSOR│ │
│  │                      │ │                      │ │             │ │
│  │  "Hogar espacioso    │ │  "Penthouse exclu-   │ │  "Activo de │ │
│  │  para tu familia     │ │  sivo con vistas     │ │  alto rendi-│ │
│  │  en El Poblado..."   │ │  panorámicas al      │ │  miento en  │ │
│  │                      │ │  Valle de Aburrá..." │ │  zona prime"│ │
│  │  Ideal para:         │ │                      │ │             │ │
│  │  Familias con hijos  │ │  Ideal para:         │ │  Ideal para:│ │
│  │  que buscan comodid. │ │  Compradores premium │ │  Inversores │ │
│  │  y zonas comunes     │ │  y ejecutivos        │ │  y fondos   │ │
│  │                      │ │                      │ │             │ │
│  │  [ Seleccionar ]     │ │   Seleccionado      │ │  [Seleccio.]│ │
│  └──────────────────────┘ └──────────────────────┘ └─────────────┘ │
│                                                                      │
│  [ ◀ Atrás ]                              [ Usar esta versión ▶ ]   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Ficha publicada: confirmación

```
┌─────────────────────────────────────────────────────────────────────┐
│   PropIA  ·  ¡Inmueble publicado!                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                 ┌──────────────────────────────────┐                │
│                 │                                  │                │
│                 │      Publicación exitosa        │                │
│                 │                                  │                │
│                 │   Tu inmueble ya está visible     │                │
│                 │   para compradores en PropIA      │                │
│                 │                                  │                │
│                 └──────────────────────────────────┘                │
│                                                                      │
│   Resumen de tu publicación:                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ID: prop-mde-Ivancho-001                                     │   │
│  │  Título: "Penthouse con vista al Valle · El Poblado..."     │   │
│  │  Precio: $420.000.000 COP                                   │   │
│  │  Estado: PUBLICADA                                         │   │
│  │  Publicado: hace 30 segundos                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   Próximos pasos:                                                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  ○ Agrega fotos del inmueble para aumentar visitas +40%      │   │
│  │  ○ Activa notificaciones de leads por WhatsApp               │   │
│  │  ○ Revisa la valoración de mercado con UC-04                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [ Agregar fotos]  [ Ver publicación]  [ Ir al dashboard]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
