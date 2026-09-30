# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 creada (2026-09-30): `index.html`, `styles.css`, `app.js`. Registrar sesiones (fecha, tema, minutos), racha actual y lista de sesiones (más recientes primero).
- Lógica de racha probada con Node (hoy, solo ayer, huecos, duplicados, futuras).
- Prueba E2E con Chrome DevTools MCP (2026-09-30): 3 sesiones (hoy, ayer, anteayer) → racha 3, mejor racha 3, 95 min, datos bien guardados; consola limpia; a 375px sin scroll horizontal.
- Herramientas de Claude Code: comando `/feature` (planifica una funcionalidad antes de tocar código) y skill `web-design-guidelines` (revisión de UI), ambos en `.claude/`.
- Diseño "cuaderno cuadriculado" (2026-09-30): fondo de cuadrícula, línea de margen roja, tinta azul, número de racha grande con trazo de fluorescente (única animación, respeta reduced-motion). Fechas de sesiones en la columna del margen; en móvil (≤600px) van encima del tema.
- Minutos de esta semana (2026-09-30): línea "X min esta semana" bajo la racha, `calculateWeekMinutes()` en `app.js`. Probada con Node (vacío, futuras, domingo, cambio de año) y en el navegador.
- Mejor racha (2026-09-30): línea "Mejor racha: N días" entre la racha y los minutos, `calculateBestStreak()` en `app.js`. Probada con Node (vacío, futuras, duplicados, desorden, racha antigua mayor, cambio de mes/año, bisiesto, cambio de hora) y revisada en el navegador (2026-09-30).
- MCP Chrome DevTools (2026-09-30): en `.mcp.json` (equivale al `opencode.json` del instructor), creado con `claude mcp add --scope project`. Permite al agente abrir `index.html` en Chrome y revisar consola, DOM y capturas.
- MCP Context7 (2026-09-30): también en `.mcp.json`, servidor remoto HTTP (`https://mcp.context7.com/mcp`), sin API key. Da documentación actualizada; `AGENTS.md` pide consultarla al empezar cada sesión.
## Decisiones (y por qué)
- Mejor racha calculada desde las sesiones, no guardada: no cambia el formato de los datos, funciona con lo ya registrado y nunca se desincroniza. Línea discreta (mismo estilo que los minutos), sin mensaje especial al igualarla (no se pidió).
- Sin emojis ni iconos decorativos, aunque el build del instructor los use (copas, medallas…): preferencia del usuario. Ya es regla en `AGENTS.md`.
- Semana = lunes a hoy: semana natural en España; las futuras no suman, igual que en la racha. Se muestra solo en minutos, como la lista.
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario (por defecto hoy): permite registrar días pasados y ver la racha crecer.
- Se permiten fechas futuras en el formulario, pero no suman a la racha (la racha se cuenta hacia atrás desde hoy/ayer).
- Tras guardar se conserva la fecha elegida, para registrar varias sesiones del mismo día.
- Solo fuentes del sistema (Bahnschrift/DIN para rótulos y números, Iowan/Charter/Cambria/Georgia para texto): Google Fonts sería una dependencia externa y fallaría sin conexión.
- Espaciados en múltiplos de `--unit` (24px, el tamaño del cuadro) para que todo encaje en la cuadrícula.
- `CLAUDE.md` solo importa `AGENTS.md` (+ notas propias de Claude Code): una única fuente de reglas. Se mantiene `AGENTS.md` en este build para ir alineado con el curso.
## Aprendizajes y errores a evitar
- Fechas: usar `toDateKey()` / `fromDateKey()` de `app.js`, nunca `toISOString()` ni `new Date("AAAA-MM-DD")`.
- Pintar textos del usuario con `textContent`, no con `innerHTML`.
- En el grid del formulario, el campo que ocupa toda la fila (Tema) debe ir primero en el HTML; si no, deja un hueco vacío.
- Skills: son carpetas normales en `.claude/skills/`; no existen `.agents/` ni `skills-lock.json` (la documentación anterior decía lo contrario y no era cierto). Mejor así para GitHub: los enlaces simbólicos dan problemas en Git en Windows.
- MCP en Windows: los servidores con `npx` van con `cmd /c npx ...`; en Mac/Linux sobra el `cmd /c`. El formato de `.mcp.json` (`mcpServers`) no es el de `opencode.json` (`mcp`): no copiar uno en el otro. Los MCP remotos (`--transport http`, como Context7) no necesitan `cmd /c` y valen en cualquier sistema.
- Si algún MCP pide API key, nunca escribirla en `.mcp.json` (se sube a GitHub): usar variable de entorno o configuración personal (sin `--scope project`).
- Capturas y pruebas en navegador: usar el MCP de Chrome DevTools (`new_page` con `isolatedContext` para empezar sin datos, `emulate` con viewport 375x812 para móvil). Ya no hace falta el truco del iframe con Edge headless.
- Al abrir `file://` con el MCP en un contexto aislado sale una vez "Unsafe attempt to load URL file:///…": es del propio Chrome, no de la app (tras recargar desaparece).
## Próximos pasos
- Repo público en GitHub (2026-09-30): `leimagen/diario-de-estudio`, rama `main`. `.gitignore` excluye `.claude/settings.local.json` (permisos y rutas personales). Antes de cada push, revisar que no se cuelan datos sensibles.