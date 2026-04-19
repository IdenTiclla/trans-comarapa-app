# Convenciones UI — Trans Comarapa (frontend/)

Guía obligatoria para todo código nuevo o refactorizado en `frontend/src/`. Las reglas clave están automatizadas vía ESLint (`frontend/eslint.config.js`).

## 1. Componentes permitidos

Usa siempre los componentes de `src/components/ui/` antes de escribir markup nativo:

| Caso de uso | Componente | Import |
|---|---|---|
| Botones (acciones) | `Button` | `@/components/ui/button` |
| Texto input | `Input` | `@/components/ui/input` |
| Textarea | `Textarea` | `@/components/ui/textarea` |
| Select | `Select` | `@/components/ui/select` |
| Checkbox / Radio | `Checkbox`, `RadioGroup` | `@/components/ui/checkbox`, `@/components/ui/radio-group` |
| Label de formulario | `Label` | `@/components/ui/label` |
| Tablas | `Table` | `@/components/ui/table` |
| Modales | `Dialog`, `AlertDialog`, `Sheet` | `@/components/ui/*` |
| Menús / dropdowns | `DropdownMenu`, `Popover`, `Command` | `@/components/ui/*` |
| Tabs | `Tabs` | `@/components/ui/tabs` |
| Tooltip | `Tooltip` | `@/components/ui/tooltip` |
| Card informativo | `Card` | `@/components/ui/card` |
| Card clickeable | `ClickableCard` | `@/components/ui/clickable-card` |
| Estado loading | `Skeleton` | `@/components/ui/skeleton` |
| Feedback inline | `Alert` | `@/components/ui/alert` |
| Etiquetas de estado | `Badge` | `@/components/ui/badge` |
| Notificaciones toast | `toast` de `sonner` | `sonner` |

## 2. Elementos HTML nativos prohibidos

Fuera de `src/components/ui/**` está prohibido usar:

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`

ESLint bloquea su uso con un mensaje que indica el reemplazo correcto. Las primitivas viven sólo en `src/components/ui/`.

## 3. Elementos clickeables y accesibilidad

- **Nunca** `<div>` u otro no-interactivo con `onClick`. Usa `Button` o `ClickableCard`.
- Todo botón sin texto visible (iconos) requiere `aria-label`.
- `ClickableCard` obliga a pasar `ariaLabel` por props (no opcional).
- Navegación por teclado: Tab debe alcanzar todo control interactivo; Enter/Space debe activarlo. Los componentes `ui/` ya lo cubren, no lo rompas con `tabIndex={-1}`.
- Focus visible: no quites `focus-visible:*` de los componentes ui.
- Formularios: cada input lleva su `Label` asociado (usa `htmlFor` + `id`).

`eslint-plugin-jsx-a11y` aplica las reglas `recommended` (warning por ahora, error al final de Fase 3).

## 4. Tamaño de archivos

- Límite objetivo: **300 líneas** por archivo `.tsx`/`.ts` (warning).
- Archivos más grandes deben dividirse extrayendo:
  - Subcomponentes a `components/<feature>/`.
  - Hooks de estado/datos a `hooks/use-<name>.ts`.
  - Helpers puros a `lib/` o `<feature>/utils.ts`.
- Excepción: `src/components/ui/**` (las primitivas pueden superar el límite).

## 5. Estados de UI obligatorios

Toda vista que consume datos debe manejar explícitamente:

- **Loading** → `Skeleton` (no spinners hechos a mano).
- **Empty** → componente/texto descriptivo con CTA si aplica.
- **Error** → `Alert` con mensaje legible. Nunca mostrar un objeto de error crudo.

Rutina mínima: revisar `useSelector` status (`idle | loading | succeeded | failed`) y renderizar cada rama.

## 6. Estilos

- Usa tokens de `src/styles/globals.css` (colores brand Comarapa, tokens shadcn/ui).
- No hardcodees colores (`#123456`) ni medidas arbitrarias si existe el token.
- Clases con `cn()` de `@/lib/utils` para combinar Tailwind.
- No introduzcas CSS global nuevo fuera de `globals.css` sin consenso.

## 7. Cómo añadir un nuevo componente primitivo

1. Vive en `src/components/ui/<name>.tsx`.
2. Debe aceptar `className` y forwardear `...props` del elemento base.
3. Si es interactivo: soporta teclado, focus ring, estados `disabled`/`aria-*`.
4. Documenta en esta guía (tabla sección 1) y añade al `index` si existe.

## 8. Referencias

- Plan activo: `docs/implementation-plans/ui-standardization.plan.md`
- Config ESLint: `frontend/eslint.config.js`
- Tokens: `frontend/src/styles/globals.css`
