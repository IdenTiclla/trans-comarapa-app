# Plan: Workflow Completo de Encomiendas

## Contexto

Actualmente los cambios de estado de las encomiendas se hacen manualmente uno por uno desde la página del viaje (botones "Marcar en Tránsito", "Marcar en Destino"). No existe una página de detalle de encomienda, no hay navegación entre encomiendas y viajes, y el servicio de viajes no aplica la máquina de estados. Se necesita un workflow automatizado donde los estados de las encomiendas cambien según el ciclo de vida del viaje (despachar → en tránsito, terminar → en destino), con una página de detalle de encomienda que permita tracking y entrega.

---

## Cambios Backend

### 1. Ciclo de vida del viaje en `backend/services/trip_service.py`

Agregar 3 métodos con validación de máquina de estados + transición masiva de paquetes:

- **`dispatch_trip(trip_id)`**: `scheduled/boarding → departed`
  - Todos los paquetes `assigned_to_trip` → `in_transit`
  - Log de estado por cada paquete via `PackageRepository.log_state_change`

- **`finish_trip(trip_id)`**: `departed → arrived`
  - Todos los paquetes `in_transit` → `arrived_at_destination`

- **`cancel_trip(trip_id)`**: `scheduled/boarding/delayed → cancelled`
  - Todos los paquetes `assigned_to_trip` → `registered_at_office` (desasignar, limpiar `trip_id`)

Helper privado `_bulk_transition_packages(trip_id, from_status, to_status)` que hace query masivo y log por paquete en una sola transacción.

Modificar `update_trip` para aplicar `validate_transition` cuando el payload incluya `status`.

### 2. Nuevas rutas en `backend/routes/trip.py`

```
POST /trips/{trip_id}/dispatch  → service.dispatch_trip()
POST /trips/{trip_id}/finish    → service.finish_trip()
POST /trips/{trip_id}/cancel    → service.cancel_trip()
```

### 3. Historial de estados en respuesta de paquete

- `backend/repositories/package_repository.py`: Agregar `joinedload(Package.state_history)` en `_with_eager_loading`
- `backend/schemas/package.py`: Agregar `state_history: List[PackageStateHistorySchema] = []` a `PackageResponse`

---

## Cambios Frontend

### 4. Servicios y stores para ciclo de vida del viaje

**`frontend/services/tripService.js`** — agregar:
- `dispatchTrip(tripId)` → POST `/trips/{id}/dispatch`
- `finishTrip(tripId)` → POST `/trips/{id}/finish`
- `cancelTrip(tripId)` → POST `/trips/{id}/cancel`

**`frontend/stores/tripStore.js`** — agregar acciones:
- `dispatchTrip`, `finishTrip`, `cancelTrip` que llaman los servicios y actualizan `currentTrip`

### 5. Página de viaje `frontend/pages/trips/[id].vue`

- **Agregar botón "Despachar Viaje"**: visible cuando `status === 'scheduled' || 'boarding'`, con modal de confirmación. Llama `tripStore.dispatchTrip()` y refresca paquetes
- **Modificar "Terminar Viaje"**: visible cuando `status === 'departed'`. Llama `tripStore.finishTrip()` en vez de `updateTrip(id, {status: 'arrived'})`
- **Eliminar** `handleMarkTransit` y `handleMarkDestination`
- **Eliminar** eventos `@mark-transit` y `@mark-destination` del binding de `TripPackagesSection`

### 6. Sección de paquetes `frontend/components/trips/TripPackagesSection.vue`

- **Eliminar** botones manuales "Marcar en Tránsito" y "Marcar en Destino"
- **Eliminar** emits `mark-transit` y `mark-destination`
- **Hacer filas clickeables** → navegar a `/packages/{pkg.id}` con `NuxtLink` o `router.push`
- **Mantener** botón "Entregar" (para `arrived_at_destination`) y "Quitar del viaje" (para `assigned_to_trip`)
- **Actualizar visibilidad** de "Cargar Encomienda": ocultar cuando `departed`, `arrived`, o `cancelled`

### 7. Nueva página de detalle `frontend/pages/packages/[id].vue`

Estructura:
```
┌─ Header: ← Volver | "Encomienda #TRACKING" | Badge estado ─┐
├─ Info Card: remitente, destinatario, peso, items, pago      ─┤
├─ Trip Card: ruta, fecha, estado → link a /trips/{trip_id}   ─┤
├─ Timeline: historial de cambios de estado (state_history)    ─┤
├─ Acción: botón "Entregar" (solo si arrived_at_destination)   ─┤
└──────────────────────────────────────────────────────────────┘
```

- Carga datos con `packageStore.fetchPackageById(id)` que ya incluye `state_history`
- Link al viaje via `NuxtLink` a `/trips/{pkg.trip_id}` (mostrar "Sin viaje asignado" si no tiene)
- Reutiliza `PackageDeliveryModal` existente para la entrega
- Timeline vertical con puntos de color por estado y timestamps

### 8. Corrección de bugs

**`frontend/components/packages/PackageCardList.vue`**:
- Fix `getStatusText()`: agregar `registered_at_office` → "En Oficina" y `arrived_at_destination` → "En Destino"
- Hacer filas de tabla clickeables → navegar a detalle

**`frontend/pages/packages/index.vue`**:
- Fix "Entregas Pendientes": cambiar `statusFilter = 'pending'` → `'arrived_at_destination'`

**`frontend/components/packages/PackageCard.vue`**:
- Hacer header clickeable para navegar al detalle
- Mostrar `tracking_number` en vez de solo `id`

---

## Archivos a Modificar

| Archivo | Tipo |
|---------|------|
| `backend/services/trip_service.py` | Modificar |
| `backend/routes/trip.py` | Modificar |
| `backend/repositories/package_repository.py` | Modificar |
| `backend/schemas/package.py` | Modificar |
| `frontend/services/tripService.js` | Modificar |
| `frontend/stores/tripStore.js` | Modificar |
| `frontend/pages/trips/[id].vue` | Modificar |
| `frontend/components/trips/TripPackagesSection.vue` | Modificar |
| `frontend/components/packages/PackageCardList.vue` | Modificar |
| `frontend/components/packages/PackageCard.vue` | Modificar |
| `frontend/pages/packages/index.vue` | Modificar |
| `frontend/pages/packages/[id].vue` | **Nuevo** |

## Orden de Implementación

1. Backend: trip_service.py (state machine + bulk transitions)
2. Backend: trip routes (dispatch/finish/cancel endpoints)
3. Backend: package response con state_history
4. Frontend: tripService.js + tripStore.js
5. Frontend: trips/[id].vue (botones despachar/terminar)
6. Frontend: TripPackagesSection.vue (eliminar botones manuales, hacer clickeable)
7. Frontend: packages/[id].vue (página nueva de detalle)
8. Frontend: bug fixes (PackageCardList, PackageCard, packages/index)

## Verificación

1. Crear un paquete desde la página de encomiendas
2. Asignarlo a un viaje desde la página del viaje
3. Despachar el viaje → verificar que el paquete pasa a "En tránsito" automáticamente
4. Terminar el viaje → verificar que el paquete pasa a "En destino" automáticamente
5. Navegar al detalle del paquete → verificar timeline de estados y link al viaje
6. Entregar el paquete desde la página de detalle
7. Verificar que la cancelación de viaje desasigna los paquetes correctamente
