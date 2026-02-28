# Plan: Funcionalidad Completa de Paquetes (Encomiendas)

## Contexto

La funcionalidad de paquetes está parcialmente implementada. Existen inconsistencias en la UI (el dashboard usa una página diferente al modal que funciona bien en `/packages`), no hay forma de crear paquetes directamente desde un viaje, no existe UI para entregar encomiendas, y no se maneja el concepto de forma de pago (al enviar vs por cobrar) ni método de pago (efectivo/QR).

**Objetivo**: Paquetes funcionando al 100% con flujo consistente de registro, asignación a viajes, entrega con cobro, y soporte para pagos al enviar o por cobrar.

---

## Feature 1: Campo `payment_status` y `payment_method` en Backend

### 1.1 Nuevo enum de pago
**Archivo**: `backend/core/enums.py`
- Agregar `PackagePaymentStatus` enum: `PAID_ON_SEND = "paid_on_send"`, `COLLECT_ON_DELIVERY = "collect_on_delivery"`
- Agregar `PaymentMethod` enum: `CASH = "cash"`, `QR = "qr"`

### 1.2 Modelo Package
**Archivo**: `backend/models/package.py`
- Agregar columna `payment_status` (String(50), nullable=False, default="paid_on_send")
- Agregar columna `payment_method` (String(50), nullable=True) — se llena al registrar si es "paid_on_send", o al entregar si es "collect_on_delivery"

### 1.3 Schemas
**Archivo**: `backend/schemas/package.py`
- `PackageBase`: agregar `payment_status` (default "paid_on_send") con validator
- `PackageBase`: agregar `payment_method` (Optional, default None)
- `PackageUpdate`: agregar `payment_status` y `payment_method` opcionales
- `PackageSummary`: agregar `payment_status` y `payment_method`
- Nuevo schema `PackageDeliverRequest`: `payment_method` (required, "cash" | "qr")

### 1.4 Servicio y Repositorio
**Archivo**: `backend/services/package_service.py`
- Actualizar `to_summary()` para incluir `payment_status` y `payment_method`
- Agregar método `deliver_package(package_id, payment_method, changed_by_user_id)`:
  - Valida transición `arrived_at_destination → delivered`
  - Si `payment_status == "collect_on_delivery"`: registra `payment_method`
  - Si `payment_status == "paid_on_send"`: el `payment_method` ya existe, solo actualiza estado
  - Loguea cambio en `PackageStateHistory`

### 1.5 Ruta de entrega
**Archivo**: `backend/routes/package.py`
- Agregar endpoint `PUT /{package_id}/deliver` que recibe `PackageDeliverRequest`
- Llama a `package_service.deliver_package()`
- Retorna `PackageResponse`

### 1.6 Migración
```bash
cd backend
alembic revision --autogenerate -m "Add payment_status and payment_method to packages"
alembic upgrade head
```
- `payment_status`: NOT NULL, server_default="paid_on_send"
- `payment_method`: nullable (se llena según flujo)

---

## Feature 2: Modal Consistente en Todas Partes

### 2.1 Dashboard de Secretaria
**Archivo**: `frontend/pages/dashboards/dashboard-secretary.vue`
- Importar `PackageRegistrationModal` y `PackageReceiptModal`
- Agregar estado reactivo `showPackageRegistrationModal`
- Cambiar caso `'new-package'` (línea 442) de `router.push('/packages/new')` → `showPackageRegistrationModal.value = true`
- Agregar componentes modal al template con handlers para `@close` y `@package-registered`
- En `handlePackageRegistered`: cerrar modal, opcionalmente refrescar stats

### 2.2 Agregar `tripId` prop al PackageRegistrationModal
**Archivo**: `frontend/components/packages/PackageRegistrationModal.vue`
- Agregar prop `tripId` (Number/String, default null) al `defineProps`
- Después de crear paquete exitosamente (~línea 715), si `props.tripId` existe:
  - Llamar `packageStore.assignToTrip(response.id, Number(props.tripId))`
  - El paquete queda creado Y asignado al viaje en un solo flujo

---

## Feature 3: Registrar Paquete desde Detalle de Viaje

### 3.1 Botón en PackageAssignModal
**Archivo**: `frontend/components/packages/PackageAssignModal.vue`
- Importar `PackageRegistrationModal`
- Agregar estado `showRegistrationModal = ref(false)`
- Agregar botón "Registrar Nueva Encomienda" en el header o footer del modal
- Agregar `PackageRegistrationModal` al template con `:trip-id="tripId"`
- Handler `handleNewPackageRegistered`: cerrar ambos modales, emitir `packages-assigned` para refrescar lista

### 3.2 Manejo de z-index
- El `PackageRegistrationModal` usa `z-50`, al abrirse desde `PackageAssignModal` (también `z-50`), se debe usar `z-[60]` o cerrar el assign modal temporalmente
- Enfoque recomendado: agregar clase `z-[60]` al registration modal cuando se abre desde el assign modal

---

## Feature 4: Forma de Pago en Frontend

### 4.1 Selector en PackageRegistrationModal
**Archivo**: `frontend/components/packages/PackageRegistrationModal.vue`
- Agregar `payment_status: 'paid_on_send'` y `payment_method: null` al objeto `packageData`
- Agregar sección "Forma de Pago" con radio buttons: "Pagado al enviar" / "Por cobrar"
- Cuando es "paid_on_send": mostrar selector de método de pago (Efectivo / QR) — requerido
- Cuando es "collect_on_delivery": ocultar método de pago (se registra al entregar)
- Incluir `payment_status` y `payment_method` en el payload de creación
- Reset en `resetForm()`

### 4.2 Constantes en servicio
**Archivo**: `frontend/services/packageService.js`
- Agregar constantes `PACKAGE_PAYMENT_STATUSES`, `PAYMENT_METHODS`
- Agregar labels en español y colores para badges

### 4.3 Recibo
**Archivo**: `frontend/components/packages/PackageReceiptModal.vue`
- Mostrar forma de pago: "PAGADO" o "POR COBRAR" con estilo visual claro
- Si pagado: mostrar método (Efectivo/QR)

### 4.4 Badges en listados
**Archivo**: `frontend/components/packages/PackageCardList.vue`
- Mostrar badge "Por cobrar" (amber) junto al estado cuando `payment_status === 'collect_on_delivery'`

**Archivo**: `frontend/components/trips/TripPackagesSection.vue`
- Mostrar indicador "Por cobrar" junto a cada paquete que tenga ese estado

---

## Feature 5: Entrega de Encomiendas

### 5.1 Servicio frontend
**Archivo**: `frontend/services/packageService.js`
- Agregar `deliverPackage(packageId, paymentMethod, changedByUserId)` → `PUT /packages/{id}/deliver`

**Archivo**: `frontend/stores/packageStore.js`
- Agregar action `deliverPackage(packageId, paymentMethod, changedByUserId)`

### 5.2 Botón entregar en TripPackagesSection
**Archivo**: `frontend/components/trips/TripPackagesSection.vue`
- Agregar botón "Entregar" (verde) para paquetes con status `arrived_at_destination`
- Agregar emit `deliver-package`

### 5.3 Botón entregar en PackageCardList
**Archivo**: `frontend/components/packages/PackageCardList.vue`
- Agregar botón/acción "Entregar" en tabla y grid para paquetes `arrived_at_destination`
- Agregar emit `deliver-package`

### 5.4 Modal de entrega con método de pago
**Nuevo archivo**: `frontend/components/packages/PackageDeliveryModal.vue`
- Modal simple que muestra resumen del paquete (tracking, destinatario, monto total)
- Si `payment_status === 'collect_on_delivery'`: selector de método de pago (Efectivo/QR) — obligatorio
- Si `payment_status === 'paid_on_send'`: solo mostrar confirmación (ya está pagado)
- Botón "Confirmar Entrega"
- Emite `delivered` con `{ packageId, paymentMethod }`

### 5.5 Integración en páginas
**Archivo**: `frontend/pages/packages/index.vue`
- Importar `PackageDeliveryModal`
- Estado: `showDeliveryModal`, `packageToDeliver`
- Handler: abrir modal al recibir evento `deliver-package`, luego llamar `packageStore.deliverPackage()`
- Refrescar lista después de entrega exitosa

**Archivo**: `frontend/pages/trips/[id].vue`
- Importar `PackageDeliveryModal`
- Handler para `@deliver-package` desde `TripPackagesSection`
- Abrir modal, confirmar entrega, refrescar paquetes del viaje

---

## Orden de Implementación

1. **Backend** (Feature 1): enums → modelo → schemas → servicio → ruta → migración
2. **Frontend servicio/store** (Feature 4.2, 5.1): constantes + deliverPackage
3. **PackageRegistrationModal** (Features 2.2, 4.1): prop tripId + selector de pago
4. **Dashboard** (Feature 2.1): cambiar navegación por modal
5. **PackageAssignModal** (Feature 3): botón registrar nueva con tripId
6. **PackageDeliveryModal** (Feature 5.4): nuevo componente
7. **Listados y secciones** (Features 4.3, 4.4, 5.2, 5.3): badges + botones entregar
8. **Integración en páginas** (Feature 5.5): wiring de modales

---

## Archivos Críticos a Modificar

| Archivo | Cambio |
|---------|--------|
| `backend/core/enums.py` | Nuevos enums de pago |
| `backend/models/package.py` | Campos payment_status, payment_method |
| `backend/schemas/package.py` | Schemas actualizados + PackageDeliverRequest |
| `backend/services/package_service.py` | deliver_package(), to_summary() |
| `backend/routes/package.py` | PUT /{id}/deliver |
| `frontend/services/packageService.js` | Constantes + deliverPackage() |
| `frontend/stores/packageStore.js` | Action deliverPackage() |
| `frontend/components/packages/PackageRegistrationModal.vue` | Prop tripId + forma de pago |
| `frontend/components/packages/PackageAssignModal.vue` | Botón registrar nueva |
| `frontend/components/packages/PackageDeliveryModal.vue` | **Nuevo** - modal de entrega |
| `frontend/components/packages/PackageReceiptModal.vue` | Mostrar forma de pago |
| `frontend/components/packages/PackageCardList.vue` | Badge pago + botón entregar |
| `frontend/components/trips/TripPackagesSection.vue` | Badge pago + botón entregar |
| `frontend/pages/dashboards/dashboard-secretary.vue` | Modal en vez de navegación |
| `frontend/pages/packages/index.vue` | Integrar delivery modal |
| `frontend/pages/trips/[id].vue` | Integrar delivery modal |

---

## Verificación

1. **Dashboard secretaria**: Click "Nuevo Paquete" → debe abrir modal (no navegar)
2. **Página /packages**: Click "Registrar Paquete" → modal con selector de pago funcional
3. **Registrar paquete "pagado al enviar"**: debe pedir método (efectivo/QR), recibo muestra "PAGADO"
4. **Registrar paquete "por cobrar"**: no pide método aún, recibo muestra "POR COBRAR"
5. **Detalle de viaje → Cargar Encomiendas**: modal muestra botón "Registrar Nueva"
6. **Registrar nueva desde viaje**: crea paquete y lo asigna al viaje automáticamente
7. **Paquete con estado `arrived_at_destination`**: aparece botón "Entregar"
8. **Entregar paquete "por cobrar"**: modal pide método de pago → confirmar → estado cambia a delivered
9. **Entregar paquete "pagado"**: modal solo confirma → estado cambia a delivered
10. **Badges**: paquetes "por cobrar" muestran badge amber en listados y en viaje
