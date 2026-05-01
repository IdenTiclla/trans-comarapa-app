# Lesson 004: Import from react-router instead of react-router-dom

**Date:** 2026-03-13
**Context:** Working on QuickSearch.tsx to add navigation to trips

## Error

```tsx
// WRONG
import { useNavigate } from 'react-router-dom'
```

**Result:**
```
[plugin:vite:import-analysis] Failed to resolve import "react-router-dom" from "src/components/dashboard/QuickSearch.tsx". Does the file exist?
```

## Root Cause

The project uses `react-router` v7 (not `react-router-dom`). In modern versions of react-router v7, all hooks and components are exported from the `react-router` package directly. `react-router-dom` is a separate package that is not installed in this project.

## Solution

```tsx
// GOOD
import { useNavigate } from 'react-router'
```

## Rule

Always check which routing package is installed in `package.json` before importing. If the project has `react-router` v7+, import from `'react-router'`, not from `'react-router-dom'`.
