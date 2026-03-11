# Plan: Trans Comarapa - MVP Phase 1 (Primera versión funcional)

## Contexto

Trans Comarapa opera manualmente con papel y cuadernos. El sistema ya tiene ~85% de los flujos transaccionales construidos (venta de boletos con mapa de asientos, registro de encomiendas, gestión de viajes). Lo que falta para tener una **versión usable en producción** son: gestión de oficinas, caja diaria, bloqueo de asientos con Redis, dashboards de conductor/asistente, y reportes básicos.

## Estado Actual

### Ya construido (Backend + Frontend):
- Auth + RBAC (JWT, 5 roles) ✅
- Gestión de rutas (CRUD + horarios) ✅
- Gestión de buses y asientos (CRUD + layout editor) ✅
- Programación de viajes (CRUD + estados) ✅
- Venta de boletos (mapa de asientos, estados, recibos) ✅
- Encomiendas (registro, items, entrega, "por cobrar") ✅
- Gestión de usuarios y clientes ✅
- Dashboard admin y secretaria (estadísticas, viajes próximos) ✅
- Log de actividad/auditoría ✅

### Falta para MVP:
1. ❌ CRUD de oficinas (modelo existe, sin rutas/servicio)
2. ❌ Sistema de caja registradora (sin modelos, sin nada)
3. ❌ Bloqueo de asientos con Redis (cliente existe, sin lógica)
4. ❌ Dashboards conductor/asistente (solo skeletons)
5. ❌ Reportes mensuales con exportación

---

## Plan de Implementación (5 Milestones)

### Milestone 1: Gestión de Oficinas
**Complejidad:** Pequeña | **Dependencias:** Ninguna

**Backend (4 nuevos, 2 modificar):**
- Crear `backend/schemas/office.py` — `OfficeCreate`, `OfficeUpdate`, `OfficeResponse`
- Crear `backend/repositories/office_repository.py` — extiende `BaseRepository[Office]`
- Crear `backend/services/office_service.py` — CRUD con validación de `location_id`
- Crear `backend/routes/office.py` — `GET/POST/PUT/DELETE /api/v1/offices`
- Modificar `backend/api/v1/api.py` — registrar router
- Modificar `backend/db/seed.py` — crear oficinas por defecto (Santa Cruz, Los Negros, San Isidro, Comarapa)

**Frontend (4 nuevos, 2 modificar):**
- Crear `frontend-react/src/services/office.service.ts`
- Crear `frontend-react/src/store/office.slice.ts`
- Crear `frontend-react/src/pages/admin/OfficesPage.tsx` — seguir patrón de `RoutesPage.tsx`
- Modificar `frontend-react/src/router/index.tsx` — agregar ruta `/admin/offices`
- Modificar `frontend-react/src/components/layout/AdminHeader.tsx` — agregar link "Oficinas"

---

### Milestone 2: Sistema de Caja Registradora
**Complejidad:** Grande | **Depende de:** M1 (office_id)

**Backend (7 nuevos, 3 modificar):**
- Crear `backend/models/cash_register.py` — `CashRegister` (office_id, date, opened_by, initial_balance, closed_by, final_balance, status)
- Crear `backend/models/cash_transaction.py` — `CashTransaction` (cash_register_id, type, amount, payment_method, reference_id, reference_type)
- Agregar enums en `backend/core/enums.py` — `CashRegisterStatus` (OPEN/CLOSED), `CashTransactionType` (TICKET_SALE, PACKAGE_PAYMENT, POR_COBRAR_COLLECTION, WITHDRAWAL, ADJUSTMENT)
- Crear `backend/schemas/cash_register.py`
- Crear `backend/repositories/cash_register_repository.py` — consultas: registro abierto por oficina, transacciones por registro, resumen diario
- Crear `backend/services/cash_register_service.py`:
  - `open_register()` — validar que no haya registro abierto
  - `close_register()` — calcular esperado vs real
  - `record_transaction()` — llamado automáticamente al vender boletos/encomiendas
  - `get_current_register()` / `get_daily_summary()`
- Crear `backend/routes/cash_register.py` — `POST /open`, `POST /{id}/close`, `GET /current/{office_id}`, `GET /{id}`, `GET /history`
- Modificar `backend/services/ticket_service.py` — **bloquear venta si no hay caja abierta** + auto-crear CashTransaction al vender
- Modificar `backend/services/package_service.py` — **bloquear registro si no hay caja abierta** + auto-crear CashTransaction al registrar pago
- Migración Alembic para tablas `cash_registers` y `cash_transactions`

**Frontend (5 nuevos, 2 modificar):**
- Crear `frontend-react/src/services/cash-register.service.ts`
- Crear `frontend-react/src/store/cash-register.slice.ts`
- Crear `frontend-react/src/pages/CashRegisterPage.tsx`:
  - Abrir/cerrar caja con balance
  - Banner de estado (abierta/cerrada)
  - Lista de transacciones con filtros
  - Totales por método de pago
  - Resumen diario
- Crear componentes en `frontend-react/src/components/cash-register/`:
  - `OpenRegisterModal.tsx`, `CloseRegisterModal.tsx`, `TransactionList.tsx`
- Modificar router y navegación — ruta `/cash-register`, link "Caja" en nav secretaria

---

### Milestone 3: Bloqueo de Asientos con Redis
**Complejidad:** Media | **Dependencias:** Ninguna (paralelo a M2)

**Backend (2 nuevos, 2 modificar):**
- Crear `backend/services/seat_lock_service.py`:
  - `lock_seat(trip_id, seat_id, user_id, ttl=300)` — Redis SET NX EX
  - `unlock_seat()` — solo si es el holder actual
  - `is_locked()` / `get_locked_seats()` / `get_lock_holder()`
  - Fallback graceful si Redis no está disponible
- Crear `backend/routes/seat_lock.py` — `POST /seats/lock`, `DELETE /seats/lock`, `GET /seats/locks/{trip_id}`
- Modificar `backend/services/ticket_service.py` — verificar lock antes de crear ticket, liberar lock después
- Modificar respuesta de asientos disponibles para incluir estado de lock

**Frontend (0 nuevos, 2 modificar):**
- Modificar componente de mapa de asientos — llamar API de lock al seleccionar, mostrar asientos bloqueados por otros (estado visual distinto)
- Agregar métodos lock/unlock a `frontend-react/src/services/seat.service.ts`

---

### Milestone 4: Dashboards Conductor y Asistente
**Complejidad:** Pequeña | **Dependencias:** Ninguna (paralelo a M2/M3)

**Backend (0 nuevos, 1 modificar):**
- Agregar `GET /api/v1/trips/my-trips` en `backend/routes/trip.py` — viajes asignados al usuario actual (por driver_id o assistant_id)

**Frontend (0 nuevos, 3 modificar):**
- Reemplazar skeleton en `DriverDashboard.tsx`:
  - Viajes asignados hoy (cards con ruta, hora, bus, estado)
  - Manifiesto de pasajeros (tabla: nombre, asiento, destino)
  - Lista de encomiendas del viaje
- Reemplazar skeleton en `AssistantDashboard.tsx`:
  - Misma vista de viajes que conductor
  - Enfoque en gestión de encomiendas
  - Lista de verificación de abordaje
- Agregar links de navegación para conductor/asistente en `AdminHeader.tsx`

---

### Milestone 5: Reportes Básicos
**Complejidad:** Media | **Depende de:** M2 (datos de caja)

**Backend (2 nuevos, 1 modificar):**
- Crear `backend/services/report_service.py`:
  - `monthly_ticket_report(year, month, office_id)` — total boletos, ingresos por método de pago, por ruta
  - `monthly_package_report(year, month, office_id)` — total encomiendas, ingresos, por estado
  - `monthly_cash_report(year, month, office_id)` — resumen de caja
- Crear `backend/routes/report.py`:
  - `GET /reports/monthly/tickets`, `/packages`, `/cash` (con filtros year, month, office_id)
  - `GET /reports/monthly/*/csv` — exportación CSV (StreamingResponse)
  - Admin ve todas las oficinas; secretaria solo la suya
- Registrar en `backend/api/v1/api.py`

**Frontend (3 nuevos, 2 modificar):**
- Crear `frontend-react/src/services/report.service.ts`
- Crear `frontend-react/src/pages/ReportsPage.tsx`:
  - Selector de mes/año
  - Filtro de oficina (solo admin)
  - Tabs: Boletos, Encomiendas, Caja
  - Cards de resumen + tablas de datos
  - Botón "Descargar CSV"
- Modificar router y navegación — ruta `/reports`, link "Reportes" en nav admin y secretaria

---

## Diferido (Post-MVP)

| Feature | Razón |
|---------|-------|
| Gestión de retiros / FleetOwner | Puede rastrearse manualmente al inicio |
| Exportación PDF | CSV cubre la necesidad inmediata |
| Ocupación por segmento (TIX-04/05) | La mayoría viaja la ruta completa; requiere cambios significativos al modelo |
| Portal de clientes | Fuera de scope Phase 1 |
| Notificaciones SMS/WhatsApp | Phase 2 |

---

## Decisiones de Negocio

- **Venta sin caja abierta: BLOQUEADA.** Si la secretaria no tiene caja abierta, no puede vender boletos ni registrar encomiendas. Debe abrir caja antes de operar.

## Orden de Ejecución

```
M1 (Oficinas) → M2 (Caja) → M3 (Redis Locks) → M4 (Dashboards) → M5 (Reportes)
```

Orden lineal, un milestone a la vez.

---

## Verificación

- **M1:** Crear/editar/eliminar oficinas desde UI admin. Verificar que secretarias se pueden asignar a oficinas.
- **M2:** Abrir caja → vender boleto → verificar transacción registrada → cerrar caja con balance. Probar "por cobrar" con encomiendas.
- **M3:** Abrir 2 sesiones de secretaria → seleccionar mismo asiento → verificar que solo una puede bloquear. Verificar expiración automática (5 min).
- **M4:** Login como conductor → ver viajes asignados → ver manifiesto de pasajeros. Igual para asistente.
- **M5:** Generar reporte mensual → verificar totales → descargar CSV → abrir en Excel.

---

## Archivos Críticos (Referencia)

- `backend/api/v1/api.py` — registro central de routers
- `backend/repositories/base.py` — patrón base para repositorios
- `backend/services/ticket_service.py` — modificar para M2 y M3
- `backend/services/package_service.py` — modificar para M2
- `backend/core/enums.py` — agregar enums de caja
- `backend/core/redis.py` — cliente Redis existente para M3
- `frontend-react/src/components/layout/AdminHeader.tsx` — navegación
- `frontend-react/src/router/index.tsx` — registro de rutas
- `frontend-react/src/pages/admin/RoutesPage.tsx` — patrón de referencia para páginas CRUD
