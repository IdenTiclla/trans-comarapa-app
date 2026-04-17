# UI Component Standardization Plan

## Context

El proyecto tiene componentes de formulario personalizados (`FormInput`, `FormSelect`, etc.) en `frontend-react/src/components/forms/`, pero en varios archivos se usan elementos HTML nativos (`<input>`, `<select>`, `<textarea>`, `<input type="checkbox">`) directamente, saltándose estos wrappers. Además, el toggle lista/cards/tabla está implementado de 3 maneras distintas en 4 lugares diferentes. El objetivo es unificar ambos patrones para que el código sea consistente y mantenible.

---

## Parte 1: Reemplazar inputs nativos con componentes propios

### Archivos afectados

| Archivo | Elementos nativos a reemplazar |
|---|---|
| `frontend-react/src/components/clients/ClientFilters.tsx` | `<input type="text">` (búsqueda), `<input type="checkbox">` (autoApply), `<input type="date">` ×2, `<select>` ×5 |

### Cambios en ClientFilters.tsx

1. **Search input** (línea 193): reemplazar `<input type="text">` con `<FormInput>` usando `leftIcon` con el ícono de búsqueda.

2. **Checkbox autoApply** (línea 166): reemplazar `<input type="checkbox">` + `<label>` manual con `<FormCheckbox>`.

3. **Selects de filtros** (líneas 207, 226, 246, 298, 308): reemplazar cada `<select>` nativo con `<FormSelect>`. Pasar las opciones como array. Notar que estos selects tienen un botón "limpiar" adosado — mantener ese botón fuera de FormSelect o agregar prop `clearable` / `onClear` al componente.

4. **Date inputs** (líneas 276, 285): reemplazar con `<FormInput type="date">`.

### Consideración: clearable en selects

`FormSelect` actual no tiene prop `onClear`. Dado que 3 selects tienen un botón de limpieza en ClientFilters, hay dos opciones:
- **Opción A** (preferida): agregar props `clearable` y `onClear` a `FormSelect`, similar a como `FormInput` ya las tiene.
- Opción B: dejar el botón externo y envolver el `FormSelect` en un `<div className="relative">`.

→ Implementar Opción A: extender `FormSelect` con `clearable?: boolean` y `onClear?: () => void`.

---

## Parte 2: Crear componente `ViewToggle` reutilizable

### Problema actual

El toggle lista/grid/tabla está duplicado en 4 lugares con implementaciones inconsistentes:

| Archivo | Opciones | Implementación toggle |
|---|---|---|
| `TripPackagesSection.tsx` (línea 59-86) | `list` / `cards` | `<button>` custom con `cn()`, incluye texto |
| `PackagesIndexPage.tsx` (línea 351-368) | `grid` / `table` | `<Button variant>` de shadcn, solo íconos |
| `ClientsIndexPage.tsx` (línea 251-256) | `grid` / `table` | `<button>` nativo con clases inline |
| `BookingsPage.tsx` (línea 540-555) | `cards` / `table` | `<button>` nativo con clases inline distintas |

### Solución: componente `ViewToggle`

**Crear:** `frontend-react/src/components/ui/view-toggle.tsx`

```tsx
interface ViewOption<T extends string> {
  value: T
  icon: ReactNode
  label?: string  // si se provee, se muestra el label junto al ícono
  ariaLabel: string
}

interface ViewToggleProps<T extends string> {
  value: T
  options: ViewOption<T>[]
  onChange: (value: T) => void
}
```

El componente renderiza el patrón `bg-muted/50 rounded-lg p-0.5` con botones que aplican `bg-background shadow-sm` al activo (patrón de TripPackagesSection, el más limpio visualmente).

### Actualizar los 4 lugares

1. **`TripPackagesSection.tsx`**: reemplazar bloque líneas 59-86 con `<ViewToggle>`.
2. **`PackagesIndexPage.tsx`**: reemplazar bloque líneas 351-368 con `<ViewToggle>`.
3. **`ClientsIndexPage.tsx`**: reemplazar bloque líneas 251-256 con `<ViewToggle>`.
4. **`BookingsPage.tsx`**: reemplazar bloque líneas 540-555 con `<ViewToggle>`.

---

## Archivos a modificar

```
frontend-react/src/components/forms/FormSelect.tsx        ← agregar clearable/onClear
frontend-react/src/components/clients/ClientFilters.tsx   ← reemplazar todos los nativos
frontend-react/src/components/ui/view-toggle.tsx          ← NUEVO
frontend-react/src/components/trips/TripPackagesSection.tsx
frontend-react/src/pages/packages/PackagesIndexPage.tsx
frontend-react/src/pages/clients/ClientsIndexPage.tsx
frontend-react/src/pages/BookingsPage.tsx
```

---

## Orden de implementación

1. Extender `FormSelect` con props `clearable` y `onClear`.
2. Actualizar `ClientFilters.tsx` reemplazando todos los elementos nativos.
3. Crear `ViewToggle` en `components/ui/view-toggle.tsx`.
4. Reemplazar los 4 toggles existentes con el nuevo componente.

---

## Verificación

- Navegar a `/clients` → filtros deben funcionar igual (búsqueda, selects, fechas, checkbox autoApply).
- Navegar a `/packages` → toggle grid/tabla debe funcionar.
- Navegar a `/trips/:id` → toggle lista/cards en sección encomiendas debe funcionar.
- Navegar a `/bookings` → toggle cards/tabla debe funcionar.
- No deben aparecer estilos rotos ni regresiones visuales en ninguna de esas páginas.

---

## Parte 3: Estandarización extendida de formularios

Se han identificado múltiples componentes a lo largo del sistema que siguen utilizando elementos inputs nativos (`<input>`, `<select>`) en lugar de los wrappers estándar del proyecto (`FormInput`, `FormSelect`, `FormCheckbox`, etc.).

### Archivos identificados para refactorización:

1. **Vistas de administración y páginas principales:**
   - `frontend-react/src/pages/admin/OfficesPage.tsx` (reemplazar selects nativos)
   - `frontend-react/src/pages/admin/DriversPage.tsx` (reemplazar selects nativos)
   - `frontend-react/src/pages/admin/RoutesPage.tsx` (reemplazar selects nativos)
   - `frontend-react/src/pages/ProfilePage.tsx` (reemplazar inputs de texto y correo)
   - `frontend-react/src/pages/BookingsPage.tsx` (reemplazar inputs nativos varios)
   - `frontend-react/src/pages/LoginPage.tsx` (reemplazar inputs de autenticación)
   - `frontend-react/src/pages/dashboards/AssistantDashboard.tsx`

2. **Componentes y modales:**
   - `frontend-react/src/components/packages/PackageAssignModal.tsx`
   - `frontend-react/src/components/packages/PackageRegistrationModal.tsx` (múltiples inputs e inputs radio)
   - `frontend-react/src/components/admin/UserForm.tsx`
   - `frontend-react/src/components/tickets/TicketSaleModal.tsx`
   - `frontend-react/src/components/admin/SeatLayoutEditor.tsx`
   - `frontend-react/src/components/admin/RouteForm.tsx`
   - `frontend-react/src/components/admin/BusForm.tsx`
   - `frontend-react/src/components/admin/RouteScheduleManager.tsx`
   - `frontend-react/src/components/admin/settlements/WithdrawModal.tsx`

### Acciones necesarias
- Intercambiar todo uso de `<input type="text|email|number|date">` en formularios por `<FormInput>` manteniendo su funcionalidad equivalente.
- Intercambiar todo el uso de opciones `<select>` por `<FormSelect>` pasándole limpiamente la convención de `options`.
- Mapear correctamente checkboxes e inputs de radio por componentes estilizados del UI library o `FormCheckbox`.
