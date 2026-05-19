# Wireframes — UC-01: Búsqueda Semántica

## Pantalla 1: Home con búsqueda semántica

```
╔══════════════════════════════════════════════════════════════════════════════╗
║   PropIA                                    Iniciar sesión   Publicar      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║              Encuentra tu próximo hogar en Colombia                          ║
║              con búsqueda inteligente                                        ║
║                                                                              ║
║   ╔═══════════════════════════════════════════════════════════════════╗      ║
║   ║    Describe lo que buscas en tus propias palabras...            ║      ║
║   ║                                                                   ║      ║
║   ║  Ej: "algo tranquilo cerca del metro, buena vista, no muy grande" ║      ║
║   ╚═══════════════════════════════════════════════════════════════════╝      ║
║                                                                              ║
║   [ Medellín ▾ ]  [ Cualquier precio ▾ ]  [ Cualquier tipo ▾ ]             ║
║                                                    [  Buscar ] ←── CTA    ║
║                                                                              ║
║    Prueba: "cerca del parque, barrio familiar, con patio"                  ║
║              "apto moderno en zona rosa con parqueadero"                     ║
║              "casa campestre para fin de semana"                             ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  BÚSQUEDAS RECIENTES                                                         ║
║   "apartamento en El Poblado con piscina"     ×                           ║
║   "casa familiar en Envigado, cerca colegios" ×                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Pantalla 2: Resultados de búsqueda semántica

```
╔══════════════════════════════════════════════════════════════════════════════╗
║   PropIA                                    Iniciar sesión   Publicar      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ← Volver  │   "algo tranquilo cerca del metro, buena vista, no grande"   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   12 propiedades encontradas  •  Ordenadas por relevancia semántica        ║
║                                                                              ║
║  [  Ver mapa ]    [ ≡ Lista ]  [ ⊞ Cuadrícula ]    Ordenar: Relevancia ▾  ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  FILTROS              │ RESULTADOS                                           ║
║  ──────────────────   │ ─────────────────────────────────────────────────── ║
║   Ciudad            │                                                      ║
║  [●] Medellín         │  ╔═════════════════════════════════════════════════╗ ║
║  [ ] Bogotá           │  ║  ██████████   Apto Barrio Colombia            ║ ║
║  [ ] Cali             │  ║  ██ FOTO ███   Metro Suramericana — 400m       ║ ║
║                        │  ║  ████████   Est. 4  •  72m²  •  2 hab         ║ ║
║   Precio (COP)      │  ║             $290.000.000                      ║ ║
║  Min [$200M    ]      │  ║             96% relevante  ← score semántico   ║ ║
║  Max [$400M    ]      │  ║            [ Consultar]  [ Guardar]          ║ ║
║                        │  ╚═════════════════════════════════════════════════╝ ║
║   Tipo              │                                                      ║
║  [] Apartamento      │  ╔═════════════════════════════════════════════════╗ ║
║  [ ] Casa             │  ║  ██████████   Apto Laureles                   ║ ║
║  [ ] Oficina          │  ║  ██ FOTO ███   Metro Estadio — 600m            ║ ║
║                        │  ║  ████████   Est. 4  •  68m²  •  2 hab         ║ ║
║   Estrato            │  ║             $315.000.000                      ║ ║
║  [ ] 3  [] 4  [] 5 │  ║             91% relevante                      ║ ║
║                        │  ║            [ Consultar]  [ Guardar]          ║ ║
║   Área              │  ╚═════════════════════════════════════════════════╝ ║
║  Min [50   ] m²       │                                                      ║
║  Max [120  ] m²       │  ╔═════════════════════════════════════════════════╗ ║
║                        │  ║  ██████████   Apto Envigado                   ║ ║
║   Habitaciones      │  ║  ██ FOTO ███   Metro Itagüí — 800m             ║ ║
║  [ ] 1  [] 2  [] 3 │  ║  ████████   Est. 5  •  85m²  •  3 hab         ║ ║
║                        │  ║             $345.000.000                      ║ ║
║                        │  ║             88% relevante                      ║ ║
║  [  Limpiar ]       │  ║            [ Consultar]  [ Guardar]          ║ ║
║  [  Aplicar  ]      │  ╚═════════════════════════════════════════════════╝ ║
║                        │                                                      ║
║                        │  [ Cargar más resultados... ]                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Pantalla 3: Detalle de propiedad

```
╔══════════════════════════════════════════════════════════════════════════════╗
║   PropIA                                    Iniciar sesión   Publicar      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  ← Volver a resultados                           96% relevante a tu búsqueda║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌──────────────────────────────────┐   ┌──────────────────────────────┐    ║
║  │                                  │   │                              │    ║
║  │          FOTO PRINCIPAL        │   │       FOTO 2               │    ║
║  │                                  │   │                              │    ║
║  └──────────────────────────────────┘   ├──────────────────────────────┤    ║
║                                         │       FOTO 3               │    ║
║  [← ] [ 1 / 8 ] [ →]    + 5 fotos más  │                              │    ║
║                                         └──────────────────────────────┘    ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   ║
║                                                                              ║
║  Apartamento tranquilo con vista panorámica — Barrio Colombia, Medellín      ║
║                                                                              ║
║   $290.000.000 COP     Estrato 4    Barrio Colombia, Medellín          ║
║                                                                              ║
║  ┌────────────────────────────────────────────────────────────────────┐     ║
║  │   72 m²  │   2 hab  │   1 baño  │   1 garaje  │   Piso 8  │ ║
║  └────────────────────────────────────────────────────────────────────┘     ║
║                                                                              ║
║   Por qué coincide con tu búsqueda:                                        ║
║  ────────────────────────────────────────────────────────────────────────   ║
║   Tranquilo: zona residencial, baja densidad vehicular                     ║
║   Cerca del metro: Estación Suramericana a 400m caminando                  ║
║   Buena vista: piso 8, vista despejada hacia el valle                      ║
║   Tamaño moderado: 72m², ideal para persona sola o pareja                  ║
║                                                                              ║
║  Descripción                                                                 ║
║  ────────────────────────────────────────────────────────────────────────   ║
║  Hermoso apartamento en Barrio Colombia, zona tranquila con excelente        ║
║  acceso al Metro de Medellín. El inmueble cuenta con vista despejada         ║
║  al Valle de Aburrá desde el piso 8...                                       ║
║                                                                              ║
║  Características                                                             ║
║  ────────────────────────────────────────────────────────────────────────   ║
║   Zonas verdes     Fibra óptica     Vigilancia 24h     Pet-friendly  ║
║                                                                              ║
║  Ubicación                               ┌───────────────────────────┐      ║
║  ─────────────────────                   │                           │      ║
║   Cra. 70 #44B-15                     │        MAPA             │      ║
║  Barrio Colombia, Medellín               │                           │      ║
║  Antioquia, Colombia                     │    Propiedad            │      ║
║                                          │       Metro 400m        │      ║
║   Metro Suramericana — 400m            │                           │      ║
║   Bus colectivo — 50m                  └───────────────────────────┘      ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  CONTACTAR AGENTE                                                            ║
║  ─────────────────                                                           ║
║   Federico Alzate    4.8 (127 reseñas)                               ║
║                                                                              ║
║  [ Chat con PropIA]   [ WhatsApp]   [ Agendar visita]                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Pantalla 4: Estado de carga — búsqueda en proceso

```
╔══════════════════════════════════════════════════════════════════════════════╗
║   PropIA                                    Iniciar sesión   Publicar      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║    "algo tranquilo cerca del metro, buena vista, no muy grande"            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                            Buscando con IA...                              ║
║                                                                              ║
║                Entendiendo tu búsqueda...                                  ║
║                Generando representación vectorial...                       ║
║                Buscando propiedades similares...                           ║
║              ◯  Ordenando por relevancia...                                  ║
║                                                                              ║
║              ━━━━━━━━━━━━━━━━━━━━━━━━   60%                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Pantalla 5: Sin resultados / fallback

```
╔══════════════════════════════════════════════════════════════════════════════╗
║   PropIA                                    Iniciar sesión   Publicar      ║
╠══════════════════════════════════════════════════════════════════════════════╣
║    "finca con lago privado en Bogotá menos de 100M"                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                       Sin resultados exactos                               ║
║                                                                              ║
║     Tu búsqueda es muy específica. Prueba estas alternativas:                ║
║                                                                              ║
║      Amplía el presupuesto a $200M–$300M                                  ║
║      Considera otras ciudades: Cundinamarca, Chía, Cajicá                 ║
║      Busca "finca en arriendo" en lugar de compra                          ║
║                                                                              ║
║     ─────────────────────────────────────────────────────                   ║
║     ¿Quieres que te avisemos cuando aparezca algo similar?                   ║
║                                                                              ║
║      Tu email:  [________________________]  [  Crear alerta ]            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
