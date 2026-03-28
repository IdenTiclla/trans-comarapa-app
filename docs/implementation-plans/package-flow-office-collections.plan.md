# Plan: Mejora del Flujo de Encomiendas y Liquidaciones por Oficina

## Contexto

El sistema actual de encomiendas tiene limitaciones críticas:
1. **Origen/destino no se guardan en BD** — solo texto libre en frontend, nunca enviado al backend
2. **Endpoint `/deliver` no existe** — el frontend llama a `PUT /packages/{id}/deliver` pero la ruta no está definida
3. **Sin vínculo a oficinas** — imposible saber qué oficina debe cobrar encomiendas "por cobrar"
4. **Liquidaciones solo visibles para admin** — oficinas destino no ven cobros pendientes
5. **Sin trazabilidad de quién entregó** — no se registra qué secretaria procesó la entrega

**Objetivo**: Flujo completo de encomiendas con oficinas origen/destino, cobros pendientes visibles por oficina, y custodia total del dinero.

---

## Fase 1: Modelo de Datos — Vincular Encomiendas a Oficinas

### 1.1 Migración Alembic
Crear migración que agregue a tabla `packages`:
- `origin_office_id` (FK → offices.id, nullable) — nullable para datos existentes
- `destination_office_id` (FK → offices.id, nullable)
- `delivered_by_secretary_id` (FK → secretaries.id, nullable) — quién entregó en destino

### 1.2 Actualizar modelo Package
**Archivo**: `backend/models/package.py`
- Agregar 3 columnas + relationships con `foreign_keys=[]` explícito (múltiples FK a misma tabla)

### 1.3 Actualizar schemas Package
**Archivo**: `backend/schemas/package.py`
- `PackageCreate`: agregar `origin_office_id` (required) y `destination_office_id` (required)
- `PackageResponse`: agregar campos de oficina + nombres de oficina

---

## Fase 2: Backend — Endpoints y Lógica de Negocio

### 2.1 Crear endpoint `PUT /packages/{id}/deliver` (BUG FIX)
**Archivo**: `backend/routes/package.py`
- El frontend ya llama este endpoint (`package.service.ts` línea ~155) pero no existe
- Conectar con `PackageService.deliver_package()` que ya existe en el servicio

### 2.2 Crear endpoint `GET /packages/pending-collections`
**Archivo**: `backend/routes/package.py`
- Query params: `office_id` (required)
- Retorna encomiendas donde:
  - `destination_office_id == office_id`
  - `payment_status == 'collect_on_delivery'`
  - `status IN ('arrived_at_destination')` — llegó pero no entregada

### 2.3 Actualizar `PackageService.create_package()`
**Archivo**: `backend/services/package_service.py`
- Persistir `origin_office_id` y `destination_office_id` del payload
- Auto-set `origin_office_id` desde `secretary.office_id` si no viene explícito

### 2.4 Actualizar `PackageService.deliver_package()`
**Archivo**: `backend/services/package_service.py`
- Guardar `delivered_by_secretary_id`
- El cobro `POR_COBRAR_COLLECTION` ya se registra en la caja de la secretaria que entrega (correcto: es la oficina destino)

### 2.5 Agregar method en repository
**Archivo**: `backend/repositories/package_repository.py`
- `get_pending_collections(office_id)` con eager loading de sender, recipient, items, origin_office

---

## Fase 3: Frontend — Rediseño del Registro de Encomiendas

### 3.1 Reemplazar texto libre por selección de oficinas
**Archivo**: `frontend-react/src/components/packages/PackageRegistrationModal.tsx`

Cambios en el estado del form (líneas 41-52):
- `origin: 'Comarapa'` → `origin_office_id: number | null` (auto-set desde oficina del usuario)
- `destination: ''` → `destination_office_id: number | null` (dropdown de oficinas)

Cambios en el payload (líneas 256-273):
- Incluir `origin_office_id` y `destination_office_id`

UI:
- Fetch lista de oficinas al montar (`apiFetch('/offices')`)
- Origin: dropdown pre-seleccionado con oficina del usuario logueado (readonly o editable)
- Destino: dropdown de oficinas disponibles (excluyendo la de origen)
- Mostrar nombre de ciudad de cada oficina para claridad

### 3.2 Actualizar `package.service.ts`
**Archivo**: `frontend-react/src/services/package.service.ts`
- Agregar `getPendingCollections(officeId: number)`
- Verificar que `deliver()` envíe los params correctos al nuevo endpoint

### 3.3 Actualizar PackageDeliveryModal
**Archivo**: `frontend-react/src/components/packages/PackageDeliveryModal.tsx`
- Mostrar oficina origen y destino en la confirmación de entrega
- Pasar `changed_by_user_id` correctamente

### 3.4 Actualizar vistas de lista y detalle
**Archivos**: `PackagesIndexPage.tsx`, `PackageDetailPage.tsx`
- Mostrar origen/destino como nombres de oficina en vez de texto vacío

---

## Fase 4: Frontend — Vista de Cobros Pendientes por Oficina

### 4.1 Crear componente PendingCollections
**Archivo nuevo**: `frontend-react/src/components/packages/PendingCollections.tsx`

Tabla/cards mostrando:
- Nro. seguimiento
- Remitente → Destinatario
- Oficina origen
- Monto total a cobrar
- Botón "Entregar y Cobrar" → abre PackageDeliveryModal

### 4.2 Integrar en Secretary Dashboard
**Archivo**: `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx`

Agregar sección "Cobros Pendientes" con:
- Badge con conteo de pendientes
- Lista de PendingCollections filtrada por `user.office_id`
- Link "Ver todos" a página completa

### 4.3 Página dedicada (opcional)
**Archivo nuevo**: `frontend-react/src/pages/packages/PendingCollectionsPage.tsx`
- Ruta: `/packages/pending-collections`
- Vista completa con filtros y búsqueda
- Agregar a router y navegación de secretaria

---

## Fase 5: Integridad Financiera y Visibilidad Admin

### 5.1 Validación en entrega
**Archivo**: `backend/services/package_service.py`
- Si `destination_office_id` está set, validar que la secretaria que entrega pertenece a esa oficina
- Warning en log si hay mismatch (no bloquear por casos edge)

### 5.2 Actualizar resumen financiero admin
**Archivo**: `frontend-react/src/pages/admin/FinancialDashboardPage.tsx`
- Agregar sección "Cobros por Oficina": desglose de `POR_COBRAR_COLLECTION` por oficina

### 5.3 Actualizar liquidaciones de socios
**Archivo**: `frontend-react/src/pages/admin/OwnerSettlements.tsx`
- Las encomiendas "por cobrar" que ya fueron cobradas en destino deben reflejarse como ingreso
- Mostrar en qué oficina se cobró cada monto

---

## Orden de Implementación

```
Fase 1 (DB/Modelo) → Fase 2 (Backend) → Fase 3 (Frontend Registro) → Fase 4 (Cobros Pendientes) → Fase 5 (Financiero)
```

Fases 3 y 4 pueden hacerse en paralelo una vez completada Fase 2.

---

## Archivos Críticos

| Archivo | Cambio |
|---------|--------|
| `backend/models/package.py` | +3 columnas, +3 relationships |
| `backend/schemas/package.py` | +campos oficina en Create/Response |
| `backend/routes/package.py` | +2 endpoints (deliver, pending-collections) |
| `backend/services/package_service.py` | Actualizar create, deliver, +pending_collections |
| `backend/repositories/package_repository.py` | +get_pending_collections, eager loading |
| `frontend-react/src/components/packages/PackageRegistrationModal.tsx` | Dropdowns oficina reemplazan texto libre |
| `frontend-react/src/components/packages/PackageDeliveryModal.tsx` | Mostrar oficinas, params correctos |
| `frontend-react/src/services/package.service.ts` | +getPendingCollections |
| `frontend-react/src/components/packages/PendingCollections.tsx` | **NUEVO** — tabla cobros pendientes |
| `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx` | +sección cobros pendientes |

---

## Verificación

1. **Registro**: Crear encomienda con oficina origen/destino → verificar en BD que `origin_office_id` y `destination_office_id` se guardan
2. **Cobro pagado al enviar**: Crear encomienda `paid_on_send` → verificar `CashTransaction` tipo `PACKAGE_PAYMENT` en caja de oficina origen
3. **Cobro por cobrar**: Crear encomienda `collect_on_delivery` → asignar a viaje → llega a destino → verificar que aparece en "Cobros Pendientes" de la secretaria destino
4. **Entrega y cobro**: Entregar encomienda "por cobrar" → verificar `CashTransaction` tipo `POR_COBRAR_COLLECTION` en caja de oficina destino
5. **Liquidación socio**: Verificar que el monto cobrado en destino se refleja en las liquidaciones del dueño del bus
6. **Integridad**: Verificar que `caja_origen_ingresos + caja_destino_ingresos == total_encomiendas_del_viaje`
