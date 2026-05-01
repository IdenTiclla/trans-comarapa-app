# UI Component Standardization Plan

## Context

The project has custom form components (`FormInput`, `FormSelect`, etc.) in `frontend-react/src/components/forms/`, but several files use native HTML elements (`<input>`, `<select>`, `<textarea>`, `<input type="checkbox">`) directly, bypassing these wrappers. Additionally, the list/cards/table toggle is implemented in 3 different ways in 4 different places. The goal is to unify both patterns to make the code consistent and maintainable.

---

## Part 1: Replace Native Inputs with Custom Components

### Affected Files

| File | Native Elements to Replace |
|---|---|
| `frontend-react/src/components/clients/ClientFilters.tsx` | `<input type="text">` (search), `<input type="checkbox">` (autoApply), `<input type="date">` ×2, `<select>` ×5 |

### Changes in ClientFilters.tsx

1. **Search input** (line 193): Replace `<input type="text">` with `<FormInput>` using `leftIcon` with the search icon.

2. **autoApply checkbox** (line 166): Replace manual `<input type="checkbox">` + `<label>` with `<FormCheckbox>`.

3. **Filter selects** (lines 207, 226, 246, 298, 308): Replace each native `<select>` with `<FormSelect>`. Pass options as an array. Note that these selects have an attached "clear" button — keep that button outside `FormSelect` or add a `clearable` / `onClear` prop to the component.

4. **Date inputs** (lines 276, 285): Replace with `<FormInput type="date">`.

### Consideration: clearable in selects

The current `FormSelect` does not have an `onClear` prop. Given that 3 selects have a clear button in `ClientFilters`, there are two options:
- **Option A** (preferred): Add `clearable` and `onClear` props to `FormSelect`, similar to how `FormInput` already has them.
- Option B: Leave the external button and wrap the `FormSelect` in a `<div className="relative">`.

→ Implement Option A: Extend `FormSelect` with `clearable?: boolean` and `onClear?: () => void`.

---

## Part 2: Create Reusable `ViewToggle` Component

### Current Problem

The list/grid/table toggle is duplicated in 4 places with inconsistent implementations:

| File | Options | Toggle Implementation |
|---|---|---|
| `TripPackagesSection.tsx` (line 59-86) | `list` / `cards` | Custom `<button>` with `cn()`, includes text |
| `PackagesIndexPage.tsx` (line 351-368) | `grid` / `table` | shadcn `<Button variant>`, icons only |
| `ClientsIndexPage.tsx` (line 251-256) | `grid` / `table` | Native `<button>` with inline classes |
| `BookingsPage.tsx` (line 540-555) | `cards` / `table` | Native `<button>` with different inline classes |

### Solution: `ViewToggle` Component

**Create:** `frontend-react/src/components/ui/view-toggle.tsx`

```tsx
interface ViewOption<T extends string> {
  value: T
  icon: ReactNode
  label?: string  // if provided, the label is shown next to the icon
  ariaLabel: string
}

interface ViewToggleProps<T extends string> {
  value: T
  options: ViewOption<T>[]
  onChange: (value: T) => void
}
```

The component renders the `bg-muted/50 rounded-lg p-0.5` pattern with buttons that apply `bg-background shadow-sm` to the active one (pattern from `TripPackagesSection`, the cleanest visually).

### Update the 4 Locations

1. **`TripPackagesSection.tsx`**: Replace block lines 59-86 with `<ViewToggle>`.
2. **`PackagesIndexPage.tsx`**: Replace block lines 351-368 with `<ViewToggle>`.
3. **`ClientsIndexPage.tsx`**: Replace block lines 251-256 with `<ViewToggle>`.
4. **`BookingsPage.tsx`**: Replace block lines 540-555 with `<ViewToggle>`.

---

## Files to Modify

```
frontend-react/src/components/forms/FormSelect.tsx        ← add clearable/onClear
frontend-react/src/components/clients/ClientFilters.tsx   ← replace all native elements
frontend-react/src/components/ui/view-toggle.tsx          ← NEW
frontend-react/src/components/trips/TripPackagesSection.tsx
frontend-react/src/pages/packages/PackagesIndexPage.tsx
frontend-react/src/pages/clients/ClientsIndexPage.tsx
frontend-react/src/pages/BookingsPage.tsx
```

---

## Implementation Order

1. Extend `FormSelect` with `clearable` and `onClear` props.
2. Update `ClientFilters.tsx` replacing all native elements.
3. Create `ViewToggle` in `components/ui/view-toggle.tsx`.
4. Replace the 4 existing toggles with the new component.

---

## Verification

- Navigate to `/clients` → Filters should work as before (search, selects, dates, autoApply checkbox).
- Navigate to `/packages` → Grid/table toggle should work.
- Navigate to `/trips/:id` → List/cards toggle in packages section should work.
- Navigate to `/bookings` → Cards/table toggle should work.
- No broken styles or visual regressions should appear on any of those pages.

---

## Part 3: Extended Form Standardization

Several components throughout the system have been identified that still use native input elements (`<input>`, `<select>`) instead of the project's standard wrappers (`FormInput`, `FormSelect`, `FormCheckbox`, etc.).

### Files identified for refactoring:

1. **Admin views and main pages:**
   - `frontend-react/src/pages/admin/OfficesPage.tsx` (replace native selects)
   - `frontend-react/src/pages/admin/DriversPage.tsx` (replace native selects)
   - `frontend-react/src/pages/admin/RoutesPage.tsx` (replace native selects)
   - `frontend-react/src/pages/ProfilePage.tsx` (replace text and email inputs)
   - `frontend-react/src/pages/BookingsPage.tsx` (replace various native inputs)
   - `frontend-react/src/pages/LoginPage.tsx` (replace authentication inputs)
   - `frontend-react/src/pages/dashboards/AssistantDashboard.tsx`

2. **Components and modals:**
   - `frontend-react/src/components/packages/PackageAssignModal.tsx`
   - `frontend-react/src/components/packages/PackageRegistrationModal.tsx` (multiple inputs and radio inputs)
   - `frontend-react/src/components/admin/UserForm.tsx`
   - `frontend-react/src/components/tickets/TicketSaleModal.tsx`
   - `frontend-react/src/components/admin/SeatLayoutEditor.tsx`
   - `frontend-react/src/components/admin/RouteForm.tsx`
   - `frontend-react/src/components/admin/BusForm.tsx`
   - `frontend-react/src/components/admin/RouteScheduleManager.tsx`
   - `frontend-react/src/components/admin/settlements/WithdrawModal.tsx`

### Necessary Actions
- Exchange all use of `<input type="text|email|number|date">` in forms for `<FormInput>` maintaining equivalent functionality.
- Exchange all use of `<select>` options for `<FormSelect>` cleanly passing the `options` convention.
- Correctly map checkboxes and radio inputs to styled UI library components or `FormCheckbox`.
