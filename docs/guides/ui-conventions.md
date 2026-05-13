# UI Conventions — Trans Comarapa (frontend/)

Mandatory guide for all new or refactored code in `frontend/src/`. Key rules are automated via ESLint (`frontend/eslint.config.js`).

## 1. Allowed Components

Always use components from `src/components/ui/` before writing native markup:

| Use Case | Component | Import |
|---|---|---|
| Buttons (actions) | `Button` | `@/components/ui/button` |
| Text Input | `Input` | `@/components/ui/input` |
| Textarea | `Textarea` | `@/components/ui/textarea` |
| Select | `Select` | `@/components/ui/select` |
| Checkbox / Radio | `Checkbox`, `RadioGroup` | `@/components/ui/checkbox`, `@/components/ui/radio-group` |
| Form Label | `Label` | `@/components/ui/label` |
| Tables | `Table` | `@/components/ui/table` |
| Modals | `Dialog`, `AlertDialog`, `Sheet` | `@/components/ui/*` |
| Menus / Dropdowns | `DropdownMenu`, `Popover`, `Command` | `@/components/ui/*` |
| Tabs | `Tabs` | `@/components/ui/tabs` |
| Tooltip | `Tooltip` | `@/components/ui/tooltip` |
| Information Card | `Card` | `@/components/ui/card` |
| Clickable Card | `ClickableCard` | `@/components/ui/clickable-card` |
| Loading State | `Skeleton` | `@/components/ui/skeleton` |
| Inline Feedback | `Alert` | `@/components/ui/alert` |
| Status Badges | `Badge` | `@/components/ui/badge` |
| Toast Notifications | `toast` from `sonner` | `sonner` |
| Pagination | `Pagination` | `@/components/ui/pagination` |
| Empty State | `EmptyState` | `@/components/common/EmptyState` |
| Stat / KPI Card | `DashboardStatCard` | `@/components/dashboard/DashboardStatCard` |
| Print Window | `openPrintWindow` | `@/lib/print` |

## 2. Forbidden Native HTML Elements

Outside of `src/components/ui/**`, using the following is prohibited:

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`

ESLint blocks their use with a message indicating the correct replacement. Primitives live only in `src/components/ui/`.

## 3. Clickable Elements and Accessibility

- **Never** use `<div>` or other non-interactive elements with `onClick`. Use `Button` or `ClickableCard`.
- Every button without visible text (icons) requires an `aria-label`.
- `ClickableCard` forces passing `ariaLabel` through props (not optional).
- Keyboard Navigation: Tab must reach every interactive control; Enter/Space must activate it. `ui/` components already cover this; do not break it with `tabIndex={-1}`.
- Visible Focus: Do not remove `focus-visible:*` from UI components.
- Forms: Each input must have an associated `Label` (use `htmlFor` + `id`).

`eslint-plugin-jsx-a11y` applies `recommended` rules as **errors** (blocking CI).

## 4. File Size

- Current limit: **400 lines** per `.tsx`/`.ts` file (ESLint error, blocks CI).
- Ideal goal: 300 lines. If you get close, divide before by extracting:
  - Subcomponents to `components/<feature>/`.
  - State/data hooks to `hooks/use-<name>.ts`.
  - Pure helpers to `lib/` or `<feature>/utils.ts`.
- Exception: `src/components/ui/**` and `src/components/forms/**` (primitives can exceed the limit).

## 5. Mandatory UI States

Every view that consumes data must explicitly handle:

- **Loading** → `Skeleton` (no handmade spinners).
- **Empty** → Descriptive component/text with CTA if applicable.
- **Error** → `Alert` with readable message. Never show a raw error object.

Minimum routine: check `useSelector` status (`idle | loading | succeeded | failed`) and render each branch.

## 6. Styles

### 6.1 Design tokens (mandatory)

Use the design tokens from `src/styles/globals.css`. **Do not hardcode Tailwind color scales** (`text-blue-600`, `bg-indigo-50`, `from-purple-500`, etc.) and **do not use hex** (`#123456`) when a token applies.

| Need | Token (preferred) | Forbidden inline |
|---|---|---|
| Page / surface background | `bg-background`, `bg-card` | `bg-white`, `bg-gray-50` |
| Body text | `text-foreground` | `text-gray-900`, `text-black` |
| Secondary / hint text | `text-muted-foreground` | `text-gray-500/600` |
| Borders / dividers | `border` | `border-gray-200/300` |
| Brand accent (links, active page, primary CTA) | `bg-primary`, `text-primary`, `bg-primary/10` | `bg-blue-600`, `bg-indigo-50` |
| Destructive (delete, errors) | `text-destructive`, `bg-destructive` | `text-red-600`, `bg-red-100` |
| Subtle row hover / muted surface | `bg-muted`, `hover:bg-muted` | `bg-gray-100` |

**No gradients in app chrome** (`bg-gradient-to-*`, `bg-clip-text`). The look is intentionally serious. Gradients are allowed only for **physical print artifacts** (ticket header, receipt header) where they have semantic meaning.

Combine classes with `cn()` from `@/lib/utils`. Do not introduce new global CSS outside of `globals.css` without consensus.

### 6.2 Buttons

Use a **single `Button` component** (`@/components/ui/button`). Do not pass arbitrary `bg-*` / `hover:bg-*` to recolor a button — pick the right `variant`:

- `default` → primary action (submit, save, vender boleto). One per view in the foreground.
- `outline` → secondary actions (cancelar, exportar, filtros).
- `ghost` → tertiary / icon-only actions inside cards/toolbars.
- `destructive` → delete / cancel-with-side-effects. Always paired with a confirm dialog.
- `link` → "Ver todos", inline navigation.

Do **not** use `<Button className="bg-indigo-600 hover:bg-indigo-700">`. If the variant doesn't exist, propose a new one in this guide instead of inlining colors.

### 6.3 Pagination

There is **one** `Pagination` component (`@/components/ui/pagination`). Two variants:

- `variant="compact"` (default) → cards/lists. `Anterior · Página X de Y · Siguiente`.
- `variant="full"` → tables with many rows. Numbered with ellipsis + "Mostrando X a Y de Z resultados".

Never re-implement Anterior/Siguiente buttons inline. If you need a different shape, extend `Pagination`.

### 6.4 Empty / loading / error states

- **Empty:** use `EmptyState` from `@/components/common/EmptyState`. Do not write `<div className="text-center py-12">No hay X</div>` inline.
- **Loading:** use `Skeleton` from `@/components/ui/skeleton`. Spinner divs are forbidden.
- **Error:** use `Alert` from `@/components/ui/alert` + `toast.error` for transient feedback. Never render a raw `Error` object.

### 6.5 Print

Use `openPrintWindow(html, title)` from `@/lib/print` for any "Imprimir X" action. It clones the current document's stylesheets into the print window so the printed output matches the on-screen design (Tailwind classes resolve, colors apply via `print-color-adjust: exact`).

Do **not** open `window.open('', '_blank')` and write a hand-rolled style block — that path always rots. Where a `@media print` rule is needed for layout, add it to `globals.css`.

## 7. TypeScript — Zero `any`

The `@typescript-eslint/no-explicit-any` rule is an **error**. Established patterns:

### 7.1 Typed Redux Selectors

```ts
// ❌ bad
const trips = useAppSelector(selectTrips) as any[]
const auth = useAppSelector((s: any) => s.auth)

// ✅ good — minimum interface + explicit cast
interface Trip { id: number; trip_datetime?: string; [k: string]: unknown }
const trips = useAppSelector(selectTrips) as Trip[]
const auth = useAppSelector((s) => (s as unknown as { auth: AuthState }).auth)
```

### 7.2 Partially Known API Responses

Use minimum interfaces with `[key: string]: unknown` as an escape hatch:

```ts
interface PackageLike {
  id: number
  tracking_number?: string
  items?: PackageItem[]
  [k: string]: unknown   // other backend fields not modeled
}
```

Prefer this over `any` or `Record<string, any>`. The `unknown` index forces narrowing before use.

### 7.3 Error Narrowing in `catch`

```ts
// ❌ bad
} catch (err: any) {
  setError(err.message)
}

// ✅ good
} catch (err) {
  setError(err instanceof Error ? err.message : 'Readable fallback')
}
```

### 7.4 Casts in Union Responses

When an endpoint can return multiple shapes:

```ts
const data = (await apiFetch('/x')) as { items?: Thing[]; total?: number } | Thing[]
```

Do not use `as any` — always declare possible shapes.

### 7.5 Reusable Hooks and Utilities

If a hook exposes types, export the interface (`export interface ClientRecord`) so consumers don't redefine them.

## 8. Error Handling and Toasts

- Network or Redux errors: Narrow with `instanceof Error`, readable string fallback.
- User feedback: `toast.success` / `toast.error` / `toast.info` from `sonner`. Never `alert()` or `console.log`.
- Persistent/blocking errors: `Alert` from `@/components/ui/alert` within the content.

## 9. How to Add a New Primitive Component

1. It lives in `src/components/ui/<name>.tsx`.
2. It must accept `className` and forward `...props` of the base element.
3. If interactive: support keyboard, focus ring, `disabled`/`aria-*` states.
4. Document in this guide (section 1 table) and add to `index` if it exists.

## 10. DRY — When to extract a component

Three concrete rules. If you hit any of them, **stop and extract**:

1. **Rule of three.** If the same JSX block (≥ ~5 lines) appears in 3 different files, extract a component. Two occurrences may still be coincidence; three is a pattern.
2. **Same intent, different markup.** If two screens render the same conceptual element (a "stat card", a "pagination bar", an "empty list message") with cosmetically different markup, that is a bug — converge them on the existing primitive listed in section 1. Do not preserve the divergent style "because it looks different here".
3. **Inline color or layout overrides on a primitive.** If you find yourself writing `<Button className="bg-indigo-600 ...">`, `<Card className="bg-gradient-to-r ...">`, or duplicating an entire toolbar/pagination/empty-state block, the abstraction is wrong. Either the primitive needs a new variant (propose it here) or you are reinventing a component that already exists.

**Where to put extractions:**

- Used by ≥ 2 features, generic shape → `src/components/ui/<name>.tsx` (no business logic).
- Used by 1 feature, multiple files within it → `src/components/<feature>/<name>.tsx`.
- Pure logic (no JSX) → `src/lib/<name>.ts` or co-located `<name>-helpers.ts`.

**Before adding a new component, search first.** Run a grep for similar names (`StatCard`, `Empty*`, `Pagination*`, `*Header*`). If something exists, extend or reuse it; do not create a parallel implementation.

**Before deleting a "duplicate" file**, verify with grep across the whole `src/` tree (basename without extension) — lazy-loaded routes and string references can hide imports.

## 11. References

- Active plan: `docs/implementation-plans/ui-standardization.plan.md`
- ESLint config: `frontend/eslint.config.js`
- Tokens: `frontend/src/styles/globals.css`
- Print helper: `frontend/src/lib/print.ts`
- **Fluid responsive design:** [`fluid-responsive-design.md`](./fluid-responsive-design.md) — obligatorio para cualquier layout/página
