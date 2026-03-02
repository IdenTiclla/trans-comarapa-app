# Plan: Mejoras en Encomiendas, Selección de Asientos y Modernización de UI

## Contexto

Actualmente el sistema tiene varios problemas de UX e inconsistencias:
1. Los paquetes usan identificadores inconsistentes (`#id` vs `#tracking_number` de 9 dígitos)
2. La búsqueda de paquetes solo funciona por tracking number, no por remitente/destinatario/descripción
3. El formulario de registro de encomiendas usa inputs HTML básicos en vez de los componentes `FormInput`/`FormSelect` que ya existen en `frontend/components/forms/`
4. La selección de asientos (`BusSeatGrid`) no soporta visualización por pisos para buses de 2 plantas
5. Existen componentes de formulario reutilizables (`FormInput`, `FormSelect`, `FormTextarea`, etc.) que **no se usan en ningún archivo** del proyecto

---

## Parte 1: Unificar Identificador de Paquetes

**Problema:** Los paquetes muestran `#tracking_number` (9 dígitos aleatorios) y en algunos lugares hacen fallback a `#id`. Se necesita un solo identificador visible.

**Solución:** Usar `tracking_number` como único identificador visible con formato `ENC-XXXXXX` basado en el `id` auto-incremental (ej: `ENC-000001`, `ENC-000042`).

### Archivos a modificar:
- **`backend/models/package.py`**: Generar `tracking_number` como `ENC-{id:06d}` después de crear el registro
- **`backend/schemas/package.py`**: Ajustar validación del tracking_number
- **`backend/routes/package.py`**: Ajustar endpoint de búsqueda por tracking
- **`frontend/components/packages/PackageCard.vue:5`**: Mostrar solo `pkg.tracking_number`
- **`frontend/components/packages/PackageDeliveryModal.vue:50`**: Unificar display
- **`frontend/components/packages/PackageRegistrationModal.vue`**: Remover generación manual de tracking_number
- **`frontend/pages/packages/[id].vue:14`**: Unificar display

---

## Parte 2: Búsqueda Avanzada de Paquetes

**Problema:** Solo se puede buscar por tracking number.

**Solución:** Agregar endpoint de búsqueda que soporte múltiples criterios.

### Backend:
- **`backend/routes/package.py`**: Nuevo endpoint `GET /api/v1/packages/search?q=term` que busque en:
  - `tracking_number`
  - Nombre del remitente (sender)
  - Nombre del destinatario (recipient)
  - Descripción de items (`package_items.description`)
- **`backend/services/package_service.py`**: Método `search_packages(term)` con query JOIN

### Frontend:
- **`frontend/services/packageService.js`**: Actualizar `searchPackages()` para usar nuevo endpoint
- **`frontend/pages/packages/index.vue`**: Mejorar la barra de búsqueda con placeholder descriptivo

---

## Parte 3: Modernizar Formulario de Registro de Encomiendas

**Problema:** El `PackageRegistrationModal.vue` usa `<input>` y `<select>` HTML básicos cuando existen componentes reutilizables en `frontend/components/forms/`.

**Solución:** Reemplazar todos los inputs básicos con los componentes existentes.

### Archivo principal: `frontend/components/packages/PackageRegistrationModal.vue`
- Reemplazar `<input>` → `<FormInput>` (con props: label, placeholder, error, icon)
- Reemplazar `<select>` → `<FormSelect>` (con props: options, label)
- Reemplazar `<textarea>` → `<FormTextarea>`
- Usar `<FormSearchSelect>` para búsqueda de clientes (si aplica)

### Selector de clientes (remitente/destinatario):
- Verificar que el patrón actual de buscar/crear cliente inline funcione con los componentes modernos
- Mantener la funcionalidad de "buscar cliente existente o crear nuevo" que ya existe

---

## Parte 4: Selección de Asientos Multi-Piso

**Problema:** `BusSeatGrid.vue` no separa visualmente los asientos por piso. Los buses de 2 plantas muestran todos los asientos juntos.

**Solución:** Agregar tabs/pestañas para cambiar entre Piso 1 y Piso 2.

### Archivos a modificar:
- **`frontend/components/seats/BusSeatGrid.vue`**:
  - Agregar tabs de selección de piso (similar a `SeatLayoutEditor.vue` del admin)
  - Filtrar asientos por `seat.deck` ('FIRST' o 'SECOND')
  - Mostrar indicador de cuántos asientos disponibles hay por piso
- **`frontend/components/seats/DeckSelector.vue`**: Reutilizar este componente existente
- **`frontend/components/tickets/TicketSaleModal.vue`**: Asegurar que los asientos seleccionados de ambos pisos se envíen correctamente

---

## Parte 5: Modernizar TODOS los Inputs Básicos del Sistema

**Problema:** Múltiples archivos usan `<input>` y `<select>` HTML básicos sin estilos consistentes.

**Archivos con inputs básicos identificados:**

| Archivo | Tipo de inputs |
|---------|---------------|
| `frontend/pages/packages/index.vue` | `<input>`, `<select>` |
| `frontend/pages/packages/new.vue` | `<input>`, `<select>` |
| `frontend/pages/packages/[id]/edit.vue` | `<input>`, `<select>` |
| `frontend/pages/trips/new.vue` | `<input>`, `<select>` |
| `frontend/pages/trips/[id]/edit.vue` | `<input>`, `<select>` |
| `frontend/pages/bookings.vue` | `<select>` |
| `frontend/components/packages/PackageAssignModal.vue` | `<input>` |
| `frontend/components/packages/PackageRegistrationModal.vue` | `<select>` |
| `frontend/components/tickets/TicketSaleModal.vue` | `<select>` |
| `frontend/components/admin/UserTable.vue` | `<input>`, `<select>` |
| `frontend/components/admin/UserForm.vue` | `<input>`, `<select>` |
| `frontend/components/clients/ClientModal.vue` | `<input>` |
| `frontend/components/clients/ClientSelector.vue` | `<input>` |
| `frontend/components/seats/BusTripHeader.vue` | `<select>` |
| `frontend/components/dashboard/QuickSearch.vue` | `<select>` |

### Solución:
Para cada archivo, reemplazar:
- `<input type="text/number/email/tel/etc">` → `<FormInput>`
- `<select>` → `<FormSelect>`
- `<textarea>` → `<FormTextarea>`
- Checkboxes → `<FormCheckbox>`

---

## Orden de Implementación

1. **Parte 5** - Modernizar inputs globalmente (base para todo lo demás)
2. **Parte 1** - Unificar identificador de paquetes
3. **Parte 2** - Búsqueda avanzada de paquetes
4. **Parte 3** - Modernizar formulario de encomiendas (ya cubierto por Parte 5, pero agregar funcionalidad de selector de clientes)
5. **Parte 4** - Selección de asientos multi-piso

---

## Verificación

- Registrar una encomienda → verificar que usa el nuevo tracking number unificado `ENC-XXXXXX`
- Buscar paquetes por nombre de remitente, destinatario y descripción de item
- Verificar que todos los formularios usan componentes `FormInput`/`FormSelect`
- Crear un viaje con bus de 2 pisos → vender boletos seleccionando asientos de ambos pisos
- Revisar visualmente que no queden inputs HTML básicos sin estilos
