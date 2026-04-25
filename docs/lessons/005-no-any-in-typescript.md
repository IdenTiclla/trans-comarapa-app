# 005 — Nunca uses `any` en TypeScript (frontend)

## Contexto

Durante la Fase 3.1 del plan `ui-standardization.plan.md` purgamos ~200 violaciones de `@typescript-eslint/no-explicit-any` que se habían acumulado en la migración Nuxt→React. Los `any` ocultaban bugs reales: campos mal nombrados, errores no narrow, casts que silenciaban diferencias de forma entre el backend y el frontend.

ESLint ahora bloquea `any` como **error**. Esta lección resume los patrones que reemplazan los usos típicos — si estás tentado de escribir `any`, primero revisa aquí.

## Patrones (canónicos en `docs/guides/ui-conventions.md §7`)

### Respuestas API / entidades de dominio
```ts
interface PackageLike {
  id: number
  tracking_number?: string
  items?: PackageItem[]
  [k: string]: unknown   // campos extra del backend no tipados
}
```
El `[k: string]: unknown` es el escape hatch: admite cualquier campo adicional pero obliga a narrow antes de usarlo.

### Selectores Redux
```ts
// ❌ const trips = useAppSelector(selectTrips) as any[]
const trips = useAppSelector(selectTrips) as Trip[]

// ❌ useAppSelector((s: any) => s.route.x)
useAppSelector((s) => (s as unknown as { route: RouteState }).route.x)
```

### Narrowing de errores
```ts
// ❌ catch (err: any) { setError(err.message) }
catch (err) {
  setError(err instanceof Error ? err.message : 'Fallback legible')
}
```

### Respuestas con múltiples formas
```ts
// ❌ as any
const data = (await apiFetch('/x')) as { items?: T[] } | T[]
```

## Cuándo `unknown` sí está permitido

- Dentro del `[k: string]: unknown` de una interfaz de dominio parcial.
- Como parámetro de helpers que hacen narrowing (`errMsg(e: unknown, fallback: string)`).
- En casts intermedios (`as unknown as Target`) cuando TypeScript no puede inferir la forma pero tú la conoces con certeza.

## Señal de que estás tipando mal

Si tu interfaz tiene más de 3 `[k: string]: unknown` distintos, probablemente necesitas:
1. Un tipo dominio centralizado en `src/types/` o cerca del service.
2. Ajustar el schema de Pydantic para que el frontend obtenga una forma estable.

## Referencias

- `docs/guides/ui-conventions.md` §7 — patrones completos
- `frontend/eslint.config.js` — regla `@typescript-eslint/no-explicit-any: error`
- Commit de la purga: revisar git log alrededor de 2026-04-20
