# Plan: Implementar Single Responsibility Principle (SRP)

## Contexto

El codebase tiene violaciones de SRP en ambos lados (backend y frontend). Los routes del backend contienen lógica de negocio que debería estar en services. El frontend tiene un "god component" (TripDetailPage.tsx, 676 líneas, 22+ useState, 8+ responsabilidades) y hooks que mezclan concerns no relacionados. Este plan aplica SRP de forma incremental, dejando la app funcional después de cada fase.

---

## Fase 1: Backend — Extraer lógica de negocio de Routes a Services

### 1A. Crear `backend/services/bus_service.py`

Extraer de `backend/routes/bus.py` (335 líneas):

- `_validate_seat_layout(seats, floors)` — validación de: seat numbers únicos, posiciones únicas por deck, consistencia de pisos. Actualmente duplicada en `create_bus_with_seats` (líneas 91-125) y `update_bus_seats` (líneas 247-281).
- `create_bus(data)` — verificación de license plate + creación
- `create_bus_with_seats(data)` — validación + creación atómica de bus + seats
- `update_bus_seats(bus_id, seats)` — verificar tickets existentes + reemplazar seats
- `delete_bus(bus_id)` — verificar dependencias (trips, tickets) + eliminar

**Patrón a seguir:** `backend/services/package_service.py` — constructor con `db: Session`, usa domain exceptions de `core/exceptions.py`, el route se vuelve un delegador delgado.

**Archivos:**
- Crear: `backend/services/bus_service.py`
- Modificar: `backend/routes/bus.py` — reducir a ~50 líneas de delegación

### 1B. Crear `backend/services/route_service.py`

Extraer de `backend/routes/route.py` (352 líneas):

- `_validate_locations(origin_id, destination_id)` — verificación de existencia de locations (duplicada en create líneas 24-36 y update líneas 137-151)
- `create_route(data)` — validación de unicidad + creación
- `update_route(route_id, data)` — validación + actualización
- `create_schedule(route_id, data)` — verificar duplicados + crear
- `delete_route(route_id)` / `delete_schedule(schedule_id)` — verificar dependencias

**Archivos:**
- Crear: `backend/services/route_service.py`
- Modificar: `backend/routes/route.py`

### 1C. Crear `backend/services/person_service.py`

Extraer el patrón duplicado de creación usuario+persona de:
- `backend/routes/secretary.py` (líneas 25-118)
- `backend/routes/administrator.py` (líneas 17-108)

Ambos hacen exactamente lo mismo: verificar email/username únicos, hashear password, crear User, crear entidad rol, commit transacción.

- `create_person_with_user(person_data, user_data, role, PersonModel)` — método genérico que unifica la lógica

**Archivos:**
- Crear: `backend/services/person_service.py`
- Modificar: `backend/routes/secretary.py` — `create_secretary_with_user` pasa a ~5 líneas
- Modificar: `backend/routes/administrator.py` — `create_administrator_with_user` pasa a ~5 líneas

### Verificación Fase 1
```bash
cd backend && pytest -v --cov=.
# Probar manualmente en Swagger:
# POST /api/v1/buses/with-seats
# POST /api/v1/secretaries
# POST /api/v1/routes
# PUT /api/v1/buses/{id}/seats
```

---

## Fase 2: Frontend — Descomponer TripDetailPage (676 líneas → ~200)

### 2A. Crear `hooks/use-trip-detail-page.ts`

Extraer TODA la lógica stateful de `pages/trips/TripDetailPage.tsx`:

- Los 22+ `useState` (líneas 48-91)
- Todas las funciones async: `executeDispatch`, `executeFinish`, `saveDriver`, `saveAssistant`, `handleUnassignPackage`, `handleCancelReservation`, `executeConfirmSale`, `confirmSeatChange`
- Los `useEffect` de data fetching (líneas 109-122)
- El `useMemo` de `ticketStats` (líneas 349-354)
- Los handlers de seat map: `handleSellTicket`, `handleReserveSeat`, `handleClearSelection`, etc.

Retorna un objeto estructurado agrupando state relacionado:
```typescript
return {
  trip, loading, error, ticketStats,
  dispatch: { show, executing, execute, canDispatch, setShow },
  finish: { show, executing, execute, setShow },
  staff: { editing, selected, saving, save, setEditing, setSelected },
  seatChange: { mode, ticket, newSeat, showConfirm, loading, confirm, cancel },
  ticketSale: { show, actionType, seats, open, close, onCreated },
  ticketView: { show, ticket, open, close },
  seatMap: { key, selectedSeats, controlledIds, onSelectionChange },
  packages: { items, loading, unassign },
  refreshTrip,
}
```

### 2B. Crear `hooks/use-keyboard-shortcuts.ts`

Extraer líneas 318-346. Hook genérico reutilizable:
```typescript
function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean
): void
```

TripDetailPage lo usa con las teclas V, R, C, Escape, Enter.

### 2C. Crear `components/trips/TripStaffEditor.tsx`

Extraer líneas 468-509 — el UI de edición inline de conductor/asistente con select dropdowns.

Props: `drivers`, `assistants`, `staff` state del hook.

### 2D. Crear `components/trips/TripInfoCard.tsx`

Extraer líneas 452-525 — card de info del viaje con status badge, grid fecha/hora/bus/precio, y widget de ocupación.

Props: `trip`, `ticketStats`, `formatTimeAmPm`, `staffEditor` component.

### 2E. Crear `components/trips/TripConfirmationModals.tsx`

Extraer los 4 modales inline (líneas 569-672): Dispatch, Finish, Confirm Sale, Seat Change. Comparten el mismo patrón de modal de confirmación.

Props: los objetos `dispatch`, `finish`, `seatChange`, `ticketSale` del hook.

**Archivos:**
- Crear: `frontend-react/src/hooks/use-trip-detail-page.ts`
- Crear: `frontend-react/src/hooks/use-keyboard-shortcuts.ts`
- Crear: `frontend-react/src/components/trips/TripStaffEditor.tsx`
- Crear: `frontend-react/src/components/trips/TripInfoCard.tsx`
- Crear: `frontend-react/src/components/trips/TripConfirmationModals.tsx`
- Modificar: `frontend-react/src/pages/trips/TripDetailPage.tsx` — queda ~150-200 líneas de composición JSX

### Verificación Fase 2
```bash
cd frontend-react && npm run build  # 0 errores TypeScript
```
Probar manualmente en el navegador:
- Navegar a detalle de un viaje
- Vender boleto, reservar, confirmar venta, cancelar reserva
- Cambiar asiento
- Despachar/terminar viaje
- Editar conductor/asistente
- Atajos de teclado: V (vender), R (reservar), C (limpiar), Escape

---

## Fase 3: Frontend — Limpiar hooks y extraer presentación

### 3A. Convertir `use-package-status.ts` → `lib/package-status.ts`

El hook actual (66 líneas) NO es un hook real — tiene 0 useState/useEffect. Son funciones puras de mapeo. Además `package.service.ts` (líneas 7-52) duplica las mismas constantes.

- Crear `lib/package-status.ts` con exports: `getPackageStatusLabel`, `getPackageStatusColor`, `getPaymentStatusLabel`, `getPaymentStatusVariant`
- Actualizar todos los consumidores (buscar `usePackageStatus` con Grep)
- Eliminar `hooks/use-package-status.ts`
- Remover constantes duplicadas de `services/package.service.ts`

### 3B. Crear `lib/trip-formatters.ts`

Extraer de `hooks/use-trip-details.ts` (líneas 44-85): `formatDate`, `formatTime`, `getStatusClass`, `getStatusText`.

También consolidar con los duplicados en `TripDetailPage.tsx` (líneas 18-32): `STATUS_MAP`, `STATUS_BADGE`, `formatTimeAmPm`.

- Crear `lib/trip-formatters.ts` con todas las funciones de formato y mapeo de estado de viajes
- Modificar `hooks/use-trip-details.ts` — queda solo: `soldTickets`, `reservedSeatNumbers`, `fetchSoldTickets`
- Modificar `pages/trips/TripDetailPage.tsx` — importar desde `lib/trip-formatters.ts`

### 3C. Mover stats de `sales.service.ts` a `stats.service.ts`

`sales.service.ts` mezcla endpoints de `/sales` con endpoints de `/stats/sales/`. Las funciones `getRecentSales` y `getSalesSummary` pertenecen a `stats.service.ts`.

- Modificar `services/sales.service.ts` — remover funciones de stats
- Modificar `services/stats.service.ts` — agregar `getRecentSales`, `getSalesSummary`
- Actualizar consumidores

### 3D. Extraer constantes de `package.service.ts`

Mover `PACKAGE_STATUSES`, `PAYMENT_METHODS`, `calculatePackageTotal`, `calculateItemsCount`, `validatePackageData` (líneas 1-99) fuera del servicio.

- Las constantes van a `lib/package-status.ts` (creado en 3A)
- Las funciones de cálculo/validación van a `lib/package-utils.ts`
- `services/package.service.ts` queda solo con llamadas API

**Archivos:**
- Crear: `frontend-react/src/lib/package-status.ts`
- Crear: `frontend-react/src/lib/trip-formatters.ts`
- Crear: `frontend-react/src/lib/package-utils.ts`
- Eliminar: `frontend-react/src/hooks/use-package-status.ts`
- Modificar: `frontend-react/src/hooks/use-trip-details.ts`
- Modificar: `frontend-react/src/services/package.service.ts`
- Modificar: `frontend-react/src/services/sales.service.ts`
- Modificar: `frontend-react/src/services/stats.service.ts`
- Modificar: consumidores de `usePackageStatus` (Grep para encontrar)

### Verificación Fase 3
```bash
cd frontend-react && npm run build  # 0 errores
```
- Probar página de detalle de paquetes (badges de estado)
- Probar dashboard (estadísticas de ventas recientes)
- Probar flujo de venta de boletos

---

## Fase 4: Backend — Limpieza media/baja prioridad

### 4A. Consolidar endpoints de perfil por rol en `auth.py`

`backend/routes/auth.py` líneas 200-302 tiene 5 endpoints casi idénticos (`/me/secretary`, `/me/driver`, etc.) que repiten el mismo patrón.

- Crear `AuthService.get_role_profile(user, expected_role)` en `services/auth_service.py`
- Cada endpoint en `auth.py` se reduce a 3 líneas delegando al service

### 4B. Extraer password hashing de `models/user.py`

`User` model (líneas 48-77) contiene `verify_password`, `get_password_hash`, y configuración de `passlib`. El modelo ORM no debería poseer infraestructura de hashing.

- Crear `backend/core/security.py` con `verify_password(plain, hashed)` y `hash_password(plain)`
- `User.get_password_hash` y `User.verify_password` delegan al nuevo módulo (mantener como wrappers para compatibilidad)

**Archivos:**
- Crear: `backend/core/security.py`
- Modificar: `backend/models/user.py`
- Modificar: `backend/services/auth_service.py`
- Modificar: `backend/routes/auth.py`

### Verificación Fase 4
```bash
cd backend && pytest -v --cov=.
```
- Probar login/logout
- Probar GET /api/v1/auth/me/secretary, /me/driver, etc.

---

## Fase 5: Actualizar documentación del proyecto

Después de implementar las fases 1-4, actualizar la documentación para que futuros agentes de AI y desarrolladores sigan escribiendo código limpio con SRP.

### 5A. Actualizar `CLAUDE.md`

Agregar sección **SRP Rules** dentro de "Development Patterns" con reglas explícitas:

**Backend:**
- Routes son delegadores delgados: reciben request → llaman service → retornan response. MAX ~10 líneas por endpoint.
- Services contienen TODA la lógica de negocio, validación, y orquestación. Un service por dominio.
- Repositories solo acceso a datos. Sin lógica de negocio.
- Models solo definición ORM. Sin lógica de infraestructura (hashing, etc.).
- Validaciones complejas van en métodos privados del service (`_validate_*`).

**Frontend:**
- Pages son composición de componentes. MAX ~200 líneas. Sin lógica de negocio.
- Hooks encapsulan lógica stateful (useState, useEffect). Un hook por feature/concern.
- Funciones puras de formato/mapeo van en `lib/` (NO en hooks).
- Services solo llamadas API con `apiFetch`. Sin constantes, sin validación, sin cálculos.
- Constantes y mapeos de estado van en `lib/constants.ts` o `lib/[entity]-status.ts`.

### 5B. Actualizar `.agents/rules/best-practices.md`

Agregar sección "Single Responsibility Checklist" que los agentes deben verificar antes de escribir código:

- [ ] ¿El route/page hace más que delegar?
- [ ] ¿El service/hook mezcla concerns no relacionados?
- [ ] ¿Hay lógica de presentación en hooks o services?
- [ ] ¿Hay constantes/mapeos dentro de services o hooks?
- [ ] ¿El componente/archivo supera ~250 líneas?

### 5C. Actualizar `.agents/skills/backend-dev/SKILL.md`

Agregar ejemplos concretos del patrón correcto post-refactoring:
- Ejemplo de route delgado delegando a service (usar `bus.py` refactorizado como referencia)
- Ejemplo de service con validación privada (`_validate_seat_layout`)
- Ejemplo de `person_service.py` como patrón genérico reutilizable

### 5D. Actualizar `.agents/skills/frontend-dev/SKILL.md`

Agregar reglas post-refactoring:
- Ejemplo de page como composición (usar `TripDetailPage.tsx` refactorizado)
- Regla: hooks son para lógica stateful, `lib/` para funciones puras
- Regla: services solo API calls, constantes en `lib/`
- Listar los nuevos archivos `lib/` como referencia: `trip-formatters.ts`, `package-status.ts`, `package-utils.ts`

### 5E. Actualizar `docs/architecture.md`

Agregar en cada capa del diagrama las restricciones SRP:
- Routes: "Thin adapters only. No validation, no business logic, no response formatting."
- Services: "Single domain per service. Owns validation via private methods."
- Lib (frontend): "Pure functions only. Formatters, constants, utility calculations."

### 5F. Actualizar `frontend-react/README.md`

Reflejar los nuevos archivos en `lib/` y `hooks/` creados durante el refactoring. Actualizar el inventario de hooks y la sección de arquitectura.

**Archivos a modificar:**
- `CLAUDE.md`
- `.agents/rules/best-practices.md`
- `.agents/skills/backend-dev/SKILL.md`
- `.agents/skills/frontend-dev/SKILL.md`
- `docs/architecture.md`
- `frontend-react/README.md`

### Verificación Fase 5
- Revisar que cada archivo de documentación refleje la nueva estructura
- Verificar que no haya contradicciones entre CLAUDE.md, best-practices.md y los SKILLs
- Confirmar que los inventarios de archivos (hooks, lib, services) estén actualizados

---

## Resumen

| Fase | Severidad | Archivos nuevos | Archivos modificados | Riesgo |
|------|-----------|-----------------|---------------------|--------|
| 1: Backend routes→services | HIGH | 3 | 4 | Bajo (patrón existente) |
| 2: TripDetailPage decomposition | CRITICAL | 5 | 1 | Medio (UI compleja) |
| 3: Frontend hooks/presentación | HIGH+MEDIUM | 3 | ~7 | Bajo |
| 4: Backend limpieza | MEDIUM+LOW | 1 | 3 | Muy bajo |
| 5: Actualizar documentación | — | 0 | 6 | Ninguno |
