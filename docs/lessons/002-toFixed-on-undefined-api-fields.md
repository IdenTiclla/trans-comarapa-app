# Lesson 002: No llamar `.toFixed()` directamente sobre datos de API

**Fecha:** 2026-03-10
**Contexto:** Página de reportes mensuales con datos del backend

## Error

Se llamó `.toFixed(2)` directamente sobre campos numéricos de la respuesta API sin validar que existieran:

```tsx
// MAL - si r.amount es undefined/null, crashea
`Bs ${r.amount.toFixed(2)}`

// MAL - si d.by_status es null, Object.entries crashea
Object.entries(d.by_status).map(...)
```

**Resultado:** `TypeError: Cannot read properties of undefined (reading 'toFixed')` y `TypeError: Cannot convert undefined or null to object` al abrir tabs de reportes sin datos.

## Causa raíz

El backend retorna campos como `null` o los omite cuando no hay datos (ej: no hay encomiendas → `by_status` es `null`, `amount` de un row puede ser `undefined`). El frontend asumía que siempre vendrían con valores.

## Solución

Usar una función helper con fallback a 0 y `?? {}` para objetos:

```tsx
// Helper
function fmt(value: number | undefined | null, decimals = 2): string {
  return (value ?? 0).toFixed(decimals)
}

// BIEN - nunca crashea
`Bs ${fmt(r.amount)}`

// BIEN - Object.entries recibe {} si es null
const byStatus = (data.by_status as Record<string, Info>) ?? {}
Object.entries(byStatus).map(...)
```

## Regla

Nunca llamar `.toFixed()`, `.toString()`, o iterar con `Object.entries()`/`Object.keys()` directamente sobre datos de API sin default. Los campos pueden ser `null`/`undefined` cuando no hay datos. Siempre usar `?? 0` para números y `?? {}` para objetos antes de operar.
