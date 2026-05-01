# Plan: Integrate BusForm with Seat Wizard in BusesPage

## Context

`BusesPage.tsx` has a simplified inline form that only creates buses without seats (using `POST /buses`). However, `BusForm.tsx` already exists — a full component with a 2-step wizard (basic data + seat layout via `SeatLayoutEditor`) that is not integrated into the page. The goal is to replace the inline form with `BusForm` so that bus creation and editing include the seat layout, just like it works in Nuxt.

## Files to Modify

1. **`frontend-react/src/pages/admin/BusesPage.tsx`** — Main change.
2. **`frontend-react/src/store/bus.slice.ts`** — Add `createBusWithSeats` and `updateBusSeats` thunks.

## Existing Reused Files (no modification)

- `frontend-react/src/components/admin/BusForm.tsx` — 2-step wizard.
- `frontend-react/src/components/admin/SeatLayoutEditor.tsx` — Layout editor.
- `frontend-react/src/services/bus.service.ts` — Already has `createWithSeats()` and `updateSeats()`.

## Detailed Changes

### 1. `bus.slice.ts` — Add Missing Thunks

Add two new thunks:

```ts
export const createBusWithSeats = createAsyncThunk(
  'bus/createWithSeats',
  async (data: Record<string, unknown>, { dispatch, rejectWithValue }) => {
    try {
      const r = await busService.createWithSeats(data)
      dispatch(fetchBuses({}))
      return r
    } catch (e) { return rejectWithValue((e as Error).message) }
  }
)

export const updateBusSeats = createAsyncThunk(
  'bus/updateSeats',
  async ({ busId, seats }: { busId: number; seats: unknown[] }, { dispatch, rejectWithValue }) => {
    try {
      const r = await busService.updateSeats(busId, seats)
      dispatch(fetchBuses({}))
      return r
    } catch (e) { return rejectWithValue((e as Error).message) }
  }
)
```

Add `rejected` cases in `extraReducers`.

### 2. `BusesPage.tsx` — Replace Inline Form with BusForm

**Remove:**
- Local `Bus` interface (use generic type or backend type).
- `formData` state and all inline form logic.
- JSX modal block with the inline `<form>` (lines 170-217).

**Add:**
- `BusForm` and new thunks import.
- `busService.getSeats()` import to load existing seats when editing.
- `existingSeats` state to store seats when opening edit mode.

**Creation Flow (new):**
1. Click "New Bus" → `setShowForm(true)`, `setEditingBus(null)`.
2. Render `<BusForm onSubmit={handleFormSubmit} onCancel={...} />`.
3. `handleFormSubmit(busData)`:
   - If `busData.seats` exists → dispatch `createBusWithSeats(busData)`.
   - If no seats → dispatch `createBus(busData)` (edge case, shouldn't happen with the wizard).
4. Success/error toast, close modal.

**Editing Flow (edit):**
1. Click "Edit" → load existing seats with `busService.getSeats(bus.id)`, then `setShowForm(true)`.
2. Render `<BusForm bus={editingBus} isEditing existingSeats={existingSeats} onSubmit={handleFormSubmit} onCancel={...} />`.
3. `handleFormSubmit(busData)`:
   - If from Step 1 (no `seats`): dispatch `updateBus({ id, data: busData })`.
   - If from Step 2 (`busData.seatsModified === true`): dispatch `updateBus` + dispatch `updateBusSeats`.
4. Success/error toast, close modal.

**Keep Unchanged:**
- Bus table (lines 118-168).
- Delete logic with `confirm()`.
- Owner loading (for table, not form — note: current `BusForm` has no owner field).

**Note on owner_id:** Current `BusForm.tsx` does not include an `owner_id` field. If required, it can be added to `BusForm` in Step 1, but this is optional and can be done in a later iteration.

### Modal Structure

Replace current modal div with:

```tsx
{showForm && (
  <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
    <BusForm
      bus={editingBus}
      isEditing={!!editingBus}
      existingSeats={existingSeats}
      loading={saving}
      onSubmit={handleFormSubmit}
      onCancel={() => setShowForm(false)}
    />
  </div>
)}
```

`BusForm` already handles its own width (`max-w-md` in step 1, `max-w-4xl` in step 2).

## Verification

1. **Create new bus**: Click "New Bus" → fill Step 1 → design layout in Step 2 → "Create Bus" → verify it appears in table with correct capacity.
2. **Edit basic data**: Click "Edit" → modify plate/model → "Update" → verify changes in table.
3. **Edit layout**: Click "Edit" → "Edit Layout" → modify seats → "Save Changes" → verify updated capacity.
4. **Validation**: Attempt to advance to Step 2 without plate/model → should show errors.
5. **Delete**: Verify delete still works the same.
6. **Double-decker bus**: Create 2-deck bus → verify Floor 1/Floor 2 tabs in Step 2.
