# Best Practices — Trans Comarapa

> Cross-cutting rules for all AI agents. Stack-specific conventions live in:
> - `.agents/skills/backend-dev/SKILL.md` (Python/FastAPI)
> - `.agents/skills/frontend-dev/SKILL.md` (React/TypeScript)
>
> **Do not duplicate** what those skills already cover. Read them first.

---

## 1. Language Rules

- **Code** (variables, functions, classes, comments, docstrings): always in **English**.
- **UI text** (labels, toasts, error messages, placeholders): always in **Spanish**.

```tsx
// ✅ Correct
const handleCancel = () => toast.success("Boleto cancelado exitosamente")

// ❌ Wrong — UI text in English
const handleCancel = () => toast.success("Ticket cancelled successfully")
```

---

## 2. Layer Boundaries (CRITICAL)

These boundaries apply on top of the architecture defined in each skill:

| ❌ Never do this | ✅ Instead |
|---|---|
| Component calls `apiFetch` directly | Component → hook/thunk → service → `apiFetch` |
| Service imports from `store/` or `hooks/` | Services are stateless HTTP wrappers only |
| Hook imports from `pages/` | Hooks are reusable; pages consume hooks |
| Business logic in a React component | Extract to a custom hook or thunk |
| Business logic in a FastAPI route | Move to the corresponding service |

---

## 3. TypeScript Strictness

- **Never use `any`**. Use `unknown` + type narrowing when the type is truly unknown.
- Define **explicit interfaces** for all API response shapes (in `types/` or co-located with the service).
- Use `as const` objects for string unions (like `ROLES`). Avoid TS `enum`.
- **No magic strings** in components — import from `lib/constants.ts`.

---

## 4. State Management Rules

- **Redux** = shared/global state (auth, entity lists, cached data).
- **`useState`** = local UI state (modal open, form input, tooltip visibility).
- Every slice tracks `loading` and `error`. Clear errors at the start of new async operations.
- Don't over-store: if only one component uses it, it's local state.

---

## 5. Component Guidelines

- Max **~250 lines** per component. Split or extract hooks if it grows.
- Define `interface Props` explicitly — no inline types, no `any`.
- Use `useMemo`/`useCallback` only when there's a measurable re-render problem. Don't memoize everything.
- All pages use React Router `lazy()` for code-splitting (already established).

---

## 6. Error Handling

| Layer | Pattern |
|-------|---------|
| **Backend service** | Throw `NotFoundException`, `ValidationException`, etc. from `core/exceptions.py` |
| **Backend route** | Let the global exception handler map domain exceptions to HTTP codes |
| **Frontend thunk** | Catch error → `toast.error(message)` in Spanish |
| **Frontend component** | Show inline error state or fallback UI |

- Never swallow errors silently. At minimum: `console.error` in dev.

---

## 7. Git Conventions

- **Commit format**: `type: short description` in English.
  - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
  - Example: `feat: add ticket cancellation flow`
- Run `pre-commit run --all-files` before pushing (Ruff + Prettier).

---

## 8. Security Essentials

- JWT auth uses **HTTP-only cookies** — never store tokens in localStorage.
- `ProtectedRoute`/`RoleGuard` are **UI safeguards only** — real enforcement is on the backend.
- Backend: always validate with **Pydantic schemas** before processing.
- Never commit `.env` files or secrets.

---

## 9. Performance Checklist

- [ ] No re-render loops (avoid state updates inside effects that trigger the same effect).
- [ ] No N+1 queries on backend — use `joinedload`/`selectinload`.
- [ ] Pages are lazy-loaded.
- [ ] Filters/pagination via query params — never fetch all records.
- [ ] Don't import entire libraries for a single utility.
