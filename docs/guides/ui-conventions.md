# UI Conventions — Trans Comarapa (frontend-react/)

Mandatory guide for all new or refactored code in `frontend-react/src/`. Key rules are automated via ESLint (`frontend-react/eslint.config.js`).

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

- Use tokens from `src/styles/globals.css` (Comarapa brand colors, shadcn/ui tokens).
- Do not hardcode colors (`#123456`) or arbitrary measurements if a token exists.
- Combine classes with `cn()` from `@/lib/utils` for Tailwind.
- Do not introduce new global CSS outside of `globals.css` without consensus.

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

## 10. References

- Active plan: `docs/implementation-plans/ui-standardization.plan.md`
- ESLint config: `frontend-react/eslint.config.js`
- Tokens: `frontend-react/src/styles/globals.css`
