# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- App (2026-09-30): registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos de esta semana y lista de sesiones (más recientes primero). Diseño "cuaderno cuadriculado".
- Refactor a la constitución (2026-10-01): cálculos en `logic.js` (funciones puras que reciben `today`), interfaz y localStorage en `app.js`. 23 tests en `tests/logic.test.js` en verde; verificado con Chrome DevTools (datos ya guardados, alta por formulario, 375px, consola limpia).
- SDD montado (2026-10-01): `docs/constitution.md`, skill `.claude/skills/sdd/` y comandos `/sdd-constitution`, `/sdd-spec`, `/sdd-clarify`, `/sdd-plan`, `/sdd-tasks`, `/sdd-implement`, `/sdd-validate`, `/sdd-change`, `/sdd-status`. Spec activa: `specs/001-heat-map/` (mapa de calor de 12 semanas), spec aprobada y clarificada (14 RF); plan aprobado; `tasks.md` aprobado con 8 tareas (T1-T4 lógica, T5-T8 interfaz). Implementación: 8/8 tareas hechas, 48 tests en verde, validada (14 RF y RNF cumplidos). Spec en estado "implementada" (2026-10-01) (2026-10-01).
- Otras herramientas: skill `web-design-guidelines`, MCP Chrome DevTools y Context7 en `.mcp.json`.
- Repo público: `leimagen/diario-de-estudio` (rama `main`). `.gitignore` excluye `.claude/settings.local.json`.
## Decisiones (y por qué)
- SDD adaptado del curso (opencode) a Claude Code: sin `agent: plan/build` en los comandos (en Claude Code `agent:` lanza un subagente; el "Plan" integrado es de solo lectura y no podría escribir la spec). Argumentos `$0`, `$1` (en Claude Code empiezan en 0; en opencode `$1`, `$2`). `disable-model-invocation: true` para que cada fase la lances tú.
- Tests en `tests/*.test.js`: `node --test` sin argumentos no encuentra archivos sueltos en una carpeta `tests/` (plural) si no terminan en `.test.js`.
- Tareas de interfaz: "tests primero" = escribir antes la comprobación con Chrome DevTools (`evaluate_script` que devuelve los checks del "Hecho cuando"), verla fallar, implementar y repetirla. Sin jsdom ni paquetes (constitución).
- `logic.js` se carga con `<script>` normal (funciona con doble clic) y exporta con `if (typeof module !== "undefined") module.exports = ...` para que Node pueda hacer `require`.
- `/feature` borrado (2026-10-01): los comandos `/sdd-*` lo sustituyen; una sola forma de trabajar, como en el curso.
- Mejor racha calculada desde las sesiones, no guardada: no cambia el formato de los datos y nunca se desincroniza.
- Sin emojis ni iconos decorativos (preferencia del usuario; ya es regla en `AGENTS.md`).
- Semana = lunes a hoy (semana natural en España); las futuras no suman.
- Fecha editable en el formulario (por defecto hoy), se conserva tras guardar; se permiten fechas futuras, pero no suman.
- Solo fuentes del sistema (Google Fonts sería una dependencia externa). Espaciados en múltiplos de `--unit` (24px).
- `CLAUDE.md` solo importa `AGENTS.md`: una única fuente de reglas, alineada con el curso.
## Aprendizajes y errores a evitar
- Fechas: usar `toDateKey()` / `fromDateKey()` de `logic.js`, nunca `toISOString()` ni `new Date("AAAA-MM-DD")`. En los tests, fijar "hoy" (p. ej. `"2026-10-01"`) en vez de usar la fecha real.
- Pintar textos del usuario con `textContent`, no con `innerHTML`.
- Nunca dar por buena la forma de una sesión guardada: una sin `date` rompía la lista entera (`localeCompare` de `undefined`). Validar con `isValidDateKey` / `validMinutes` antes de usar los datos.
- En el grid del formulario, el campo que ocupa toda la fila (Tema) debe ir primero en el HTML.
- Skills y comandos: en `.claude/skills/` y `.claude/commands/` (no `.agents/` ni `.opencode/`). Nada de enlaces simbólicos: dan problemas en Git en Windows.
- MCP: `.mcp.json` usa `mcpServers` (no el `mcp` de `opencode.json`). En Windows, los de `npx` van con `cmd /c`; los remotos HTTP (Context7) valen en cualquier sistema. Nunca escribir API keys en `.mcp.json`.
- Pruebas en navegador con el MCP de Chrome DevTools: `new_page` con `isolatedContext` para empezar sin datos, `emulate` 375x812 para móvil. El aviso "Unsafe attempt to load URL file:///…" al abrir es de Chrome, no de la app.
## Próximos pasos
- 001-heat-map: aprobar la spec → `/sdd-clarify 001-heat-map` → `/sdd-plan` → `/sdd-tasks` → `/sdd-implement` tarea a tarea → `/sdd-validate`.
- Antes de cada push, revisar que no se cuelan datos sensibles.
- Posible spec futura (detectado al validar 001, anterior a ella): la racha cuenta días con minutos no válidos (-30, "abc") que el mapa muestra vacíos; la lista pinta "abc min" / "-30 min"; "minutos de la semana" restaría un negativo (no usa `validMinutes`).
