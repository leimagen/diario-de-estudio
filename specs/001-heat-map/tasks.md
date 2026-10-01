# Tareas 001 — Mapa de calor

Spec: `spec.md` (aprobada) · Plan: `plan.md` (aprobado). Una tarea cada vez: tests primero (en rojo), código, `node --test` en verde, marcar y parar.

## Lógica (tests con `node --test`)

- [x] **T1. Validar fechas y minutos: `isValidDateKey` y `validMinutes` en `logic.js`.** RF-12, RF-13
  - Hecho cuando: `tests/heatmap.test.js` cubre los casos del plan (bisiesto, "2026-02-30", "2026-13-45", vacío, `undefined`; "45", 12.5, "abc", 0, -30, `null`) y `node --test` está en verde.

- [x] **T2. Niveles de intensidad: `heatLevel`.** RF-3
  - Hecho cuando: hay tests para 0, 0.5, 29, 29.5, 30, 59, 60, 119 y 120 que devuelven los niveles de la spec, y `node --test` está en verde.

- [x] **T3. Lunes de la semana: `startOfWeek`, y `calculateWeekMinutes` pasa a usarla.** RF-2
  - Hecho cuando: hay tests de `startOfWeek` (jueves, lunes, domingo, cruce de año) en verde y los tests de "semana" de `tests/logic.test.js` siguen en verde sin haberlos tocado.

- [x] **T4. Días del mapa: `buildHeatMap`.** RF-2, RF-7, RF-8, RF-9, RF-10, RF-11, RF-12, RF-13
  - Hecho cuando: hay tests en verde de longitud (78 si hoy es lunes, 81 si es jueves, 84 si es domingo), primer día lunes y último hoy, sin sesiones (todo a nivel 0), suma del mismo día (20 + 20 → nivel 2), futuras y anteriores al rango excluidas, datos inválidos ignorados y cambio de hora de octubre sin días repetidos ni perdidos.

## Interfaz (verificación con Chrome DevTools)

- [x] **T5. Sección del mapa y leyenda en `index.html`.** RF-1, RF-4, RF-14
  - Hecho cuando: en el navegador aparece la sección "Últimas 12 semanas" entre la racha y "Nueva sesión", con el contenedor `role="group"` y el nombre "Mapa de calor de las últimas 12 semanas", y una leyenda "Menos … Más" con 5 muestras cuyo texto accesible es su tramo de minutos.

- [x] **T6. Pintar el mapa: `renderHeatMap` en `app.js`, llamada desde `render()`.** RF-5, RF-6
  - Hecho cuando: el mapa tiene una casilla por día (81 el jueves 2026-10-01) con clase `level-N`, y `aria-label` y `title` del tipo "mié, 30 sept 2026: 45 min" ("0 min" si no hubo estudio). Al guardar una sesión, su casilla cambia sin recargar.

- [x] **T7. Estilos del mapa en `styles.css`.** RF-2, RF-3, RF-10, RNF
  - Hecho cuando: las casillas de 20 px con hueco de 4 px forman columnas de lunes (arriba) a domingo (abajo), la última columna termina en hoy, los 5 colores del plan se aplican por nivel, el nivel 0 tiene contorno `--ink-soft`, y a 375 px no hay scroll horizontal.

- [x] **T8. Lista de sesiones robusta ante fechas inválidas en `app.js`.** RF-13
  - Hecho cuando: con una sesión guardada sin `date` y otra con "2026-13-45", la página carga sin errores en consola, el mapa y la racha se ven bien y esas sesiones aparecen en la lista con "Fecha no válida".

Después de T8: `/sdd-validate 001-heat-map` (validación RF por RF).
