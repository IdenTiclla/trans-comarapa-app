---
name: Frontend Development conventions
description: Core conventions and architecture rules for React/TypeScript frontend development in this project.
---

# Frontend Architecture & Conventions (React)

This skill defines the strict architectural rules for the React frontend of `trans-comarapa-app`.

## 1. Architecture Layers

```
Pages (pages/)              <- Route-level components, lazy-loaded
  |
Components (components/)    <- Reusable UI blocks
  |
Hooks (hooks/)              <- Stateful logic extraction
  |
Lib (lib/)                  <- Pure stateless functions (formatters, constants)
  |
Store (store/)              <- Redux slices with async thunks
  |
Services (services/)        <- Stateless HTTP wrappers using apiFetch
  |
apiFetch (lib/api.ts)       <- Centralized HTTP client with auth + 401 refresh
```

## 2. Communication & Services

- **Services Layer**: API calls live in `services/[entity].service.ts` using `apiFetch`.
- **Store**: Redux slices import services to trigger API calls and manage global state.
- **Direct Calls**: Do NOT call `apiFetch` or `fetch` directly from components or hooks. Route through services/store.

## 3. State Management (Redux Toolkit)

- Use `createSlice` + `createAsyncThunk` for all entity state.
- Every slice tracks `loading` and `error`. Clear errors at the start of new async operations.
- **Redux** = shared/global state (auth, entity lists, cached data).
- **`useState`** = local UI state (modal open, form input, tooltip visibility).
- Don't over-store: if only one component uses it, keep it local.

## 4. UI & Styling

- **Tailwind CSS**: Use utility classes. Avoid `<style>` tags.
- **shadcn/ui**: Use existing primitives (Button, Card, Dialog, etc.) from `components/ui/`. Do NOT create custom base components that duplicate shadcn.
- **Notifications**: Use `sonner` toasts. All UI text in Spanish.

## 5. Routing & Guards

- All pages are lazy-loaded via `React.lazy()` in `router/index.tsx`.
- Use `ProtectedRoute` and `RoleGuard` from `router/guards.tsx` for access control.
- Guards are UI safeguards only — real enforcement is on the backend.

## 6. Code Reusability & Best Practices

- **DRY (Don't Repeat Yourself)**:
  - **Stateful logic & API calls**: Extract to custom hooks (`hooks/use-[name].ts`).
  - **Stateless formatting/logic**: Extract to pure functions in `lib/utils.ts`.
  - **UI Elements**: Extract repeated UI patterns into components in `components/common/`.
- **Early Returns**: Flatten code by returning early when conditions are not met.
- **Descriptive Naming**: Boolean variables start with `is`, `has`, `should`, `can` (e.g., `isSubmitting`, `hasPermission`).
- **Props Typing**: Always define `interface Props` explicitly. No inline types, no `any`.
- **No Magic Strings**: Import status values, roles, and constants from `lib/constants.ts`.

### File Size Limits

If a file exceeds its limit, split it (extract hooks, sub-components, or utility functions).

| File type | Max lines |
|-----------|-----------|
| Component / Page | ~250 |
| Hook | ~200 |
| Store slice | ~200 |
| Service | ~150 |
| Lib / utils | ~150 |

## 7. Testing Conventions

### 7.1 MSW (Mock Service Worker)
Use MSW to mock API calls at the network level. This tests the full service→API integration:

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const clientHandlers = [
  http.get('http://localhost:8000/api/v1/clients/search', ({ request }) => {
    const url = new URL(request.url)
    const term = url.searchParams.get('q')
    return HttpResponse.json({
      clients: term ? [{ id: 1, firstname: 'Juan' }] : []
    })
  }),
]
```

### 7.2 Per-test Handler Overrides
Use `server.use()` to override handlers for specific tests:

```typescript
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

it('handles empty results', async () => {
  server.use(
    http.get('http://localhost:8000/api/v1/clients/search', () => {
      return HttpResponse.json({ clients: [] })
    })
  )
  // ... test code
})
```

### 7.3 renderWithProviders Utility
Use `renderWithProviders` from `@/test/test-utils` to wrap components with Redux and Router:

```tsx
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'

it('renders and interacts', async () => {
  const user = userEvent.setup()
  const { store } = renderWithProviders(<MyComponent />, {
    preloadedState: { auth: { user: { id: 1 } } },
    route: '/some-path',
  })
  
  await user.click(screen.getByText('Submit'))
  expect(store.getState().auth.user).toBeDefined()
})
```

### 7.4 Testing Hooks
Use `renderHook` with the provider wrapper:

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'

it('fetches data on mount', async () => {
  const wrapper = ({ children }) => {
    const { store } = renderWithProviders(children)
    return store
  }
  const { result } = renderHook(() => useTripDetailPage('1'), { wrapper })
  await waitFor(() => expect(result.current.trip).toBeDefined())
})
```
