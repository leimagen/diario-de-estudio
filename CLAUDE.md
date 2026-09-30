# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Las instrucciones del proyecto viven en `AGENTS.md` (compartidas con otros agentes) y se importan aquí para no duplicarlas:

@AGENTS.md

## Notas específicas para Claude Code

- `MEMORY.md` (raíz del repo) es la memoria **del proyecto**, compartida con otros agentes: léela al empezar y actualízala al terminar cada tarea, como indica `AGENTS.md`. Es independiente de la memoria personal de Claude Code; lo que afecte al proyecto va en `MEMORY.md`.
- No hay comandos de build, lint ni tests. Para comprobar un cambio, abrir `index.html` directamente en el navegador (`file://`), p. ej. `start index.html` en Windows.
- Se usan las convenciones de Claude Code: comandos en `.claude/commands/<nombre>.md` (p. ej. `/feature`) y skills en `.claude/skills/`. Nada de `.opencode/`. Para planificar se usa el plan mode de Claude Code, no un agente "plan".
- Las skills del proyecto son carpetas normales dentro de `.claude/skills/` (p. ej. `web-design-guidelines/SKILL.md`), versionadas con el repo. No hay enlaces simbólicos ni `skills-lock.json`.
