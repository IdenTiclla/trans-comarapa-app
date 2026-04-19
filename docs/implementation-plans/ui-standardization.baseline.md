# UI Standardization — Lint Baseline (Fase 0)

Fecha: 2026-04-19
Comando: `cd frontend && npm run lint`

## Totales

- **Errores**: 357 (preexistentes, no generados por las nuevas reglas)
- **Warnings**: 412
- **Total problemas**: 769

## Top reglas (por ocurrencias)

| Regla | Count | Severidad | Notas |
|---|---|---|---|
| `@typescript-eslint/no-explicit-any` | 299 | error | Preexistente. Limpieza fuera de alcance de Fase 0. |
| `no-restricted-syntax` (native elements) | 269 | warning | 202 `<button>`, 34 `<table>`, 23 `<input>`, 9 `<select>`, 1 `<textarea>`. Target de Fase 2. |
| `@typescript-eslint/no-unused-vars` | 39 | error | Preexistente. |
| `jsx-a11y/no-static-element-interactions` | 36 | warning | Cards/divs clickeables. Target de Fase 1/2. |
| `jsx-a11y/click-events-have-key-events` | 36 | warning | Cards/divs clickeables. |
| `jsx-a11y/label-has-associated-control` | 34 | warning | Labels sin htmlFor. Target de Fase 2. |
| `max-lines` (>300) | 20 | warning | 20 archivos superan 300 líneas. Target de Fase 1 (piloto) + Fase 2. |
| `react-hooks/exhaustive-deps` | 13 | warning | Preexistente. |
| `react-hooks/set-state-in-effect` | 11 | warning | Preexistente. |

## Metas

- **Fase 1 (piloto)**: reducir `max-lines` de 20 → ≤17 (split de los 3 archivos piloto) y eliminar violaciones a11y en piloto + `ClientsIndexPage`.
- **Fase 2 (rollout)**: reducir `no-restricted-syntax` de 269 → 0 y `max-lines` → 0.
- **Fase 3 (endurecer)**: subir reglas a `error`, quitar `continue-on-error` del CI, abordar `no-explicit-any` en paralelo o plan aparte.
