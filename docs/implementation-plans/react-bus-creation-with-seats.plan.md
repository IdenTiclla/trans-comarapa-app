# Plan: Integrar BusForm con wizard de asientos en BusesPage

## Context

`BusesPage.tsx` tiene un formulario inline simplificado que solo crea buses sin asientos (usa `POST /buses`). Sin embargo, ya existe `BusForm.tsx` — un componente completo con wizard de 2 pasos (datos básicos + planilla de asientos via `SeatLayoutEditor`) que no está integrado en la página. El objetivo es reemplazar el formulario inline por `BusForm` para que la creación y edición de buses incluya la planilla de asientos, tal como funciona en Nuxt.

## Archivos a modificar

1. **`frontend-react/src/pages/admin/BusesPage.tsx`** — cambio principal
2. **`frontend-react/src/store/bus.slice.ts`** — agregar thunk `createBusWithSeats` y `updateBusSeats`

## Archivos existentes que se reutilizan (no modificar)

- `frontend-react/src/components/admin/BusForm.tsx` — wizard de 2 pasos
- `frontend-react/src/components/admin/SeatLayoutEditor.tsx` — editor de planilla
- `frontend-react/src/services/bus.service.ts` — ya tiene `createWithSeats()` y `updateSeats()`

## Cambios detallados

### 1. `bus.slice.ts` — Agregar thunks faltantes

Agregar dos thunks nuevos:

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

Agregar los `rejected` cases en `extraReducers`.

### 2. `BusesPage.tsx` — Reemplazar formulario inline por BusForm

**Eliminar:**
- Interface `Bus` local (usar tipo genérico o el que venga del backend)
- Estado `formData` y toda la lógica del formulario inline
- El bloque JSX del modal con el `<form>` inline (líneas 170-217)

**Agregar:**
- Import de `BusForm` y de los nuevos thunks
- Import de `busService.getSeats()` para cargar asientos existentes al editar
- Estado `existingSeats` para almacenar los asientos al abrir edición

**Flujo de creación (nuevo):**
1. Click "Nuevo Bus" → `setShowForm(true)`, `setEditingBus(null)`
2. Renderizar `<BusForm onSubmit={handleFormSubmit} onCancel={...} />`
3. `handleFormSubmit(busData)`:
   - Si `busData.seats` existe → dispatch `createBusWithSeats(busData)`
   - Si no tiene seats → dispatch `createBus(busData)` (caso edge, no debería pasar con el wizard)
4. Toast de éxito/error, cerrar modal

**Flujo de edición (editar):**
1. Click "Editar" → cargar asientos existentes con `busService.getSeats(bus.id)`, luego `setShowForm(true)`
2. Renderizar `<BusForm bus={editingBus} isEditing existingSeats={existingSeats} onSubmit={handleFormSubmit} onCancel={...} />`
3. `handleFormSubmit(busData)`:
   - Si viene de Step 1 (sin `seats`): dispatch `updateBus({ id, data: busData })`
   - Si viene de Step 2 (`busData.seatsModified === true`): dispatch `updateBus` + dispatch `updateBusSeats`
4. Toast de éxito/error, cerrar modal

**Mantener sin cambios:**
- La tabla de buses (líneas 118-168)
- La lógica de delete con `confirm()`
- La carga de owners (para la tabla, no para el form — nota: BusForm actual no tiene campo owner)

**Nota sobre owner_id:** `BusForm.tsx` actual no incluye campo `owner_id`. Si se requiere, se puede agregar al BusForm en Step 1, pero esto es opcional y puede hacerse en una iteración posterior.

### Estructura del modal

Reemplazar el div modal actual por:

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

El `BusForm` ya maneja su propio ancho (`max-w-md` en step 1, `max-w-4xl` en step 2).

## Verificación

1. **Crear bus nuevo**: Click "Nuevo Bus" → llenar Step 1 → diseñar planilla en Step 2 → "Crear Bus" → verificar que aparece en la tabla con la capacidad correcta
2. **Editar datos básicos**: Click "Editar" → modificar placa/modelo → "Actualizar" → verificar cambios en tabla
3. **Editar planilla**: Click "Editar" → "Editar Planilla" → modificar asientos → "Guardar Cambios" → verificar capacidad actualizada
4. **Validación**: Intentar avanzar a Step 2 sin placa/modelo → debe mostrar errores
5. **Eliminar**: Verificar que delete sigue funcionando igual
6. **Bus de 2 pisos**: Crear bus con 2 pisos → verificar tabs de Piso 1/Piso 2 en Step 2
