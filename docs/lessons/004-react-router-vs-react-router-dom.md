# Lesson 004: Importar desde react-router-dom en lugar de react-router

**Fecha:** 2026-03-13
**Contexto:** Trabajando en QuickSearch.tsx para agregar navegación a viajes

## Error

```tsx
// MAL
import { useNavigate } from 'react-router-dom'
```

**Resultado:**
```
[plugin:vite:import-analysis] Failed to resolve import "react-router-dom" from "src/components/dashboard/QuickSearch.tsx". Does the file exist?
```

## Causa raíz

El proyecto usa `react-router` v7 (no `react-router-dom`). En versiones modernas de react-router v7, todos los hooks y componentes se exportan desde el paquete `react-router` directamente. `react-router-dom` es un paquete separado que no está instalado en este proyecto.

## Solución

```tsx
// BIEN
import { useNavigate } from 'react-router'
```

## Regla

Siempre verificar qué paquete de routing está instalado en `package.json` antes de importar. Si el proyecto tiene `react-router` v7+, importar desde `'react-router'`, no desde `'react-router-dom'`.
