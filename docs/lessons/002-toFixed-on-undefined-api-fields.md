# Lesson 002: Do not call `.toFixed()` directly on API data

**Date:** 2026-03-10
**Context:** Monthly reports page with data from the backend

## Error

`.toFixed(2)` was called directly on numerical fields from the API response without validating that they existed:

```tsx
// WRONG - if r.amount is undefined/null, it crashes
`Bs ${r.amount.toFixed(2)}`

// WRONG - if d.by_status is null, Object.entries crashes
Object.entries(d.by_status).map(...)
```

**Result:** `TypeError: Cannot read properties of undefined (reading 'toFixed')` and `TypeError: Cannot convert undefined or null to object` when opening report tabs without data.

## Root Cause

The backend returns fields as `null` or omits them when there is no data (e.g., no packages → `by_status` is `null`, `amount` of a row could be `undefined`). The frontend assumed they would always come with values.

## Solution

Use a helper function with a fallback to 0 and `?? {}` for objects:

```tsx
// Helper
function fmt(value: number | undefined | null, decimals = 2): string {
  return (value ?? 0).toFixed(decimals)
}

// GOOD - never crashes
`Bs ${fmt(r.amount)}`

// GOOD - Object.entries receives {} if it is null
const byStatus = (data.by_status as Record<string, Info>) ?? {}
Object.entries(byStatus).map(...)
```

## Rule

Never call `.toFixed()`, `.toString()`, or iterate with `Object.entries()`/`Object.keys()` directly on API data without a default. Fields can be `null`/`undefined` when there is no data. Always use `?? 0` for numbers and `?? {}` for objects before operating.
