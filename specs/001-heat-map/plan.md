# Plan 001 — Mapa de calor

Spec: `specs/001-heat-map/spec.md` (aprobada). Cumple la constitución: sin dependencias, lógica pura en `logic.js` con "hoy" como parámetro, tests con `node --test`, datos sin cambiar de formato.

## Archivos y responsabilidades

| Archivo | Cambio | RF |
|---|---|---|
| `logic.js` | Funciones puras nuevas: `isValidDateKey`, `validMinutes`, `heatLevel`, `startOfWeek`, `buildHeatMap`. `calculateWeekMinutes` pasa a usar `startOfWeek` (mismo resultado). | RF-2, RF-3, RF-7 a RF-13 |
| `tests/heatmap.test.js` (nuevo) | Tests de las funciones nuevas. Los de `tests/logic.test.js` no cambian. | RF-2, RF-3, RF-7 a RF-13 |
| `index.html` | Sección nueva después de la racha: título, contenedor del mapa y leyenda. | RF-1, RF-4, RF-14 |
| `app.js` | `renderHeatMap(sessions, today)`, llamada desde `render()`. La lista de sesiones aguanta fechas inválidas sin romperse. | RF-5, RF-6, RF-13 |
| `styles.css` | Rejilla del mapa, 5 colores de nivel, contorno, leyenda y vista móvil. | RF-2, RF-3, RF-4, RF-10, RNF |

## Funciones puras (`logic.js`)

- `isValidDateKey(dateKey)` → `true` si es texto "AAAA-MM-DD" y es un día real. RF-13
- `validMinutes(value)` → el número si `Number(value)` es finito y mayor que 0; si no, 0. RF-12
- `heatLevel(minutes)` → 0 a 4 según los tramos de la spec. RF-3
- `startOfWeek(today)` → "AAAA-MM-DD" del lunes de la semana de `today`. RF-2
- `buildHeatMap(sessions, today)` → lista de días, del primero del rango a hoy: `[{ date, minutes, level }, ...]`. RF-2, RF-7 a RF-13

## Algoritmo en pseudocódigo

```
isValidDateKey(dateKey):
  si no es texto o no encaja con /^\d{4}-\d{2}-\d{2}$/ → false
  devolver toDateKey(fromDateKey(dateKey)) === dateKey     // "2026-02-30" se convierte en "2026-03-02" → false

heatLevel(minutes):
  si minutes <= 0 → 0;  si < 30 → 1;  si < 60 → 2;  si < 120 → 3;  si no → 4

buildHeatMap(sessions, today):
  inicio = startOfWeek(today) menos 77 días (11 semanas)          // RF-2
  minutosPorDía = {}
  para cada sesión:
    si no isValidDateKey(sesión.date) → saltar                    // RF-13
    si sesión.date < inicio o sesión.date > today → saltar        // RF-9, RF-8 (comparar como texto, ya validado)
    minutosPorDía[sesión.date] += validMinutes(sesión.minutes)    // RF-7, RF-12
  días = []
  día = fromDateKey(inicio)
  mientras toDateKey(día) <= today:                               // RF-10: termina en hoy
    clave = toDateKey(día)
    minutos = minutosPorDía[clave] o 0                            // RF-11
    añadir { date: clave, minutes: minutos, level: heatLevel(minutos) }
    día.setDate(día.getDate() + 1)                                // setDate: sin saltos con el cambio de hora
  devolver días                                                   // 78 a 84 días
```

## Interfaz

- **HTML** (RF-1, RF-14): nueva `<section class="row">` entre la racha y "Nueva sesión":
  - `<h2 class="section-title">Últimas 12 semanas</h2>`
  - `<div id="heatmap" class="heatmap" role="group" aria-label="Mapa de calor de las últimas 12 semanas"></div>`
  - Leyenda (RF-4): `<p class="heatmap-legend">Menos [5 muestras] Más</p>`. Cada muestra es `<span class="heat-cell level-N" role="img" aria-label="30-59 min">`. Es fija: va escrita en el HTML.
- **JS** (RF-5, RF-6): `renderHeatMap(sessions, today)` vacía `#heatmap` y crea un `<span class="heat-cell level-N" role="img">` por día, con `aria-label` y `title` iguales a `formatDate(date) + ": " + minutos + " min"`. Va en `render()`, así se actualiza al guardar una sesión.
- **Robustez de la lista** (RF-13, "el resto de la página sigue funcionando"): hoy una sesión sin `date` rompería `renderSessions` (`b.date.localeCompare`). Se ordena con `String(date || "")` y, si la fecha no es válida, se muestra "Fecha no válida" en vez de llamar a `formatDate`.
- **CSS** (RF-2, RF-3, RF-10):
  - `.heatmap { display: grid; grid-template-rows: repeat(7, 20px); grid-auto-flow: column; grid-auto-columns: 20px; gap: 4px; }`: los días entran en orden y llenan las columnas de lunes a domingo. La última columna queda corta sola (RF-10). El primer día siempre es lunes, así que las filas cuadran.
  - Cada casilla ocupa 20 px más 4 px de hueco: 24 px, el tamaño del cuadro del cuaderno (`--unit`). Ancho total: 12 × 24 − 4 = 284 px. En el móvil de 375 px el contenido mide 319 px, así que cabe sin scroll (RNF).
  - Colores, de la tinta azul del diseño (luminancia decreciente, RF-3): nivel 0 `#ffffff`, nivel 1 `#c9d6ea`, nivel 2 `#8fa7cf`, nivel 3 `#4f6fa6`, nivel 4 `var(--ink)` (`#1c2b4b`).
  - Contorno de 1 px `var(--ink-soft)` (`#5b6882`) en el nivel 0. Contraste aproximado de 5.5:1 frente al papel `#f7f9fb`, por encima de 3:1 (RNF).
  - Sin animaciones ni iconos.

## Decisiones técnicas

1. **Rejilla CSS con `grid-auto-flow: column` y una lista plana de días.**
   - **Descartado:** una `<table>` de 7 × 12, o un `<div>` por semana.
   - **Por qué:** con la lista plana el DOM es más simple, el lector de pantalla lee los días en orden cronológico y `buildHeatMap` no tiene que montar semanas.
2. **Casillas con `role="img"` + `aria-label` + `title`.**
   - **Descartado:** texto oculto visualmente dentro de cada casilla.
   - **Por qué:** con un solo atributo se cubren el lector de pantalla (RF-5) y la información emergente del ratón, sin CSS extra.
3. **Niveles calculados en la lógica y colores en clases CSS `level-0` … `level-4`.**
   - **Descartado:** calcular el color en JS y aplicarlo con `style`.
   - **Por qué:** el nivel se puede testear con `node --test` y el diseño se queda en el CSS.
4. **`startOfWeek` compartida con `calculateWeekMinutes`.**
   - **Descartado:** copiar el cálculo del lunes.
   - **Por qué:** una sola definición de "semana", como pide la spec. Los tests que ya existen de la semana lo protegen.
5. **Validar la fecha comprobando la vuelta (`toDateKey(fromDateKey(x)) === x`).**
   - **Descartado:** una expresión regular con los días de cada mes.
   - **Por qué:** es más corta, más fácil de entender y tiene en cuenta los años bisiestos.

## Estrategia de tests (`tests/heatmap.test.js`, `node --test`)

"Hoy" fijo en todos los tests.

- `isValidDateKey`: "2026-10-01" válida; "2026-02-30", "2026-13-45", "", "1-10-2026", `undefined` y `123` no válidas; "2024-02-29" válida y "2026-02-29" no. RF-13
- `validMinutes`: 45, "45", 12.5 → tal cual; "", "abc", 0, -30, `null`, `undefined` → 0. RF-12
- `heatLevel`: 0 → 0; 0.5 → 1; 29 → 1; 29.5 → 1; 30 → 2; 59 → 2; 60 → 3; 119 → 3; 120 → 4. RF-3
- `startOfWeek`: jueves 2026-10-01 → 2026-09-28; lunes → él mismo; domingo 2026-10-04 → 2026-09-28; cruce de año. RF-2
- `buildHeatMap`:
  - Hoy lunes → 78 días; hoy jueves → 81; hoy domingo → 84. El primero siempre es lunes y el último es hoy. RF-2, RF-10
  - Sin sesiones: todos los días con 0 min y nivel 0. RF-11
  - 20 + 20 el mismo día → 40 min, nivel 2. RF-7
  - Fecha futura y fecha anterior al rango → no cuentan. RF-8, RF-9
  - Minutos y fechas inválidos → no rompen y no cuentan. RF-12, RF-13
  - Rango que cruza el cambio de hora de octubre (hoy 2026-11-05): ningún día repetido ni perdido. RF-2
- `tests/logic.test.js` sigue en verde, incluida la semana tras usar `startOfWeek`.
- Interfaz (RF-1, RF-4 a RF-6, RF-10, RF-13, RF-14): se comprueba con el MCP de Chrome DevTools en la fase de validación (escritorio y 375 px, consola sin errores).
