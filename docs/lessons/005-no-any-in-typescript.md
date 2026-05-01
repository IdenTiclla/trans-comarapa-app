# 005 — Never use `any` in TypeScript (frontend)

## Context

During Phase 3.1 of the `ui-standardization.plan.md` plan, we purged ~200 violations of `@typescript-eslint/no-explicit-any` that had accumulated during the Nuxt→React migration. The `any`s hid real bugs: misspelled fields, un-narrowed errors, casts that silenced shape differences between backend and frontend.

ESLint now blocks `any` as an **error**. This lesson summarizes the patterns that replace typical uses — if you are tempted to write `any`, check here first.

## Patterns (canonical in `docs/guides/ui-conventions.md §7`)

### API Responses / Domain Entities
```ts
interface PackageLike {
  id: number
  tracking_number?: string
  items?: PackageItem[]
  [k: string]: unknown   // extra untyped backend fields
}
```
The `[k: string]: unknown` is the escape hatch: it accepts any additional field but forces narrowing before using it.

### Redux Selectors
```ts
// ❌ const trips = useAppSelector(selectTrips) as any[]
const trips = useAppSelector(selectTrips) as Trip[]

// ❌ useAppSelector((s: any) => s.route.x)
useAppSelector((s) => (s as unknown as { route: RouteState }).route.x)
```

### Error Narrowing
```ts
// ❌ catch (err: any) { setError(err.message) }
catch (err) {
  setError(err instanceof Error ? err.message : 'Readable fallback')
}
```

### Responses with Multiple Shapes
```ts
// ❌ as any
const data = (await apiFetch('/x')) as { items?: T[] } | T[]
```

## When `unknown` IS Allowed

- Inside the `[k: string]: unknown` of a partial domain interface.
- As a parameter of helpers that do narrowing (`errMsg(e: unknown, fallback: string)`).
- In intermediate casts (`as unknown as Target`) when TypeScript cannot infer the shape but you know it for sure.

## Sign that you are typing wrong

If your interface has more than 3 distinct `[k: string]: unknown`s, you probably need:
1. A centralized domain type in `src/types/` or near the service.
2. Adjust the Pydantic schema so the frontend gets a stable shape.

## References

- `docs/guides/ui-conventions.md` §7 — complete patterns
- `frontend-react/eslint.config.js` — `@typescript-eslint/no-explicit-any: error` rule
- Purge commit: check git log around 2026-04-20
