# Plan: Integrar Carga de Encomiendas en TripDetail + Overlay Bokeh en Modales

## Contexto

La página TripDetailPage en React ya tiene el componente `TripPackagesSection` que muestra encomiendas y tiene botones de acción (Cargar, Quitar, Entregar, Recibir), pero solo el handler `onUnassignPackage` está conectado. Los modales de paquetes (`PackageAssignModal`, `PackageDeliveryModal`, `PackageReceptionModal`, `PackageRegistrationModal`) ya existen pero no están integrados en la página de viaje. Necesitamos replicar el flujo completo que tiene Nuxt.

Además, todos los modales usan overlays con fondo negro sólido (`bg-black/50` o `bg-gray-500 opacity-75`). El usuario quiere un efecto degradado tipo bokeh.

---

## Parte 1: Overlay Bokeh para Modales

### Paso 1: Definir clase CSS global
**Archivo:** `frontend-react/src/styles/globals.css`

Agregar clase `.modal-overlay-bokeh` con múltiples `radial-gradient` en tonos indigo/purple/blue sobre fondo oscuro semi-transparente.

### Paso 2: Actualizar componentes shadcn/ui (3 archivos)
Reemplazar `bg-black/50` por `modal-overlay-bokeh`:
- `frontend-react/src/components/ui/dialog.tsx` (DialogOverlay, línea 40)
- `frontend-react/src/components/ui/sheet.tsx` (SheetOverlay, línea 37)
- `frontend-react/src/components/ui/alert-dialog.tsx` (AlertDialogOverlay, línea 37)

### Paso 3: Actualizar modales custom de Trip (4 ocurrencias)
**Archivo:** `frontend-react/src/components/trips/TripConfirmationModals.tsx`
Reemplazar `bg-black/50` en líneas 65, 81, 118, 142.

### Paso 4: Actualizar modales de paquetes (3 archivos)
Reemplazar el patrón anidado `bg-gray-500 opacity-75` por un solo div con `modal-overlay-bokeh`:
- `frontend-react/src/components/packages/PackageAssignModal.tsx` (líneas 98-99)
- `frontend-react/src/components/packages/PackageDeliveryModal.tsx` (líneas 85-86)
- `frontend-react/src/components/packages/PackageReceptionModal.tsx` (líneas 56-57)

---

## Parte 2: Integrar Gestión de Encomiendas en TripDetailPage

### Paso 5: Agregar estado y handlers al hook
**Archivo:** `frontend-react/src/hooks/use-trip-detail-page.ts`

Nuevo estado:
- `showPackageAssignModal`, `showPackageDeliveryModal`, `showPackageReceptionModal`, `showPackageRegistrationModal`
- `selectedPackageForDelivery`, `selectedPackageForReception`

Nuevos handlers:
- `handleDeliverPackage(id)` — busca paquete en `tripPackages`, abre modal entrega
- `handleReceivePackage(id)` — busca paquete en `tripPackages`, abre modal recepción
- `handlePackagesAssigned()` — refresca `fetchPackages(tripId)`, toast éxito
- `handleDeliveryConfirm()` — cierra modal, refresca, toast éxito
- `handleReceptionConfirm(packageId)` — llama `packageService.updateStatus(id, 'arrived_at_destination')`, cierra modal, refresca, toast éxito
- `handlePackageRegistered()` — cierra modal registro, refresca

Ampliar el return `packages: { ... }` con los modales y handlers.

### Paso 6: Conectar en TripDetailPage
**Archivo:** `frontend-react/src/pages/trips/TripDetailPage.tsx`

1. Importar los 4 modales de paquetes
2. Pasar `onOpenAssignModal`, `onDeliverPackage`, `onReceivePackage` a `TripPackagesSection`
3. Renderizar los 4 modales después de `TripConfirmationModals`

### Flujo completo (igual a Nuxt):
```
"Cargar Encomienda" → PackageAssignModal (selección múltiple)
  └─ "Registrar Nueva" → cierra Assign, abre PackageRegistrationModal
      └─ Al registrar → cierra, refresca
  └─ Al asignar → refresca paquetes del viaje
"Quitar del viaje" → unassign (ya funciona)
"Marcar Recibido" → PackageReceptionModal → status → arrived_at_destination
"Entregar" → PackageDeliveryModal → deliver con método de pago
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `frontend-react/src/styles/globals.css` | Agregar `.modal-overlay-bokeh` |
| `frontend-react/src/components/ui/dialog.tsx` | Overlay bokeh |
| `frontend-react/src/components/ui/sheet.tsx` | Overlay bokeh |
| `frontend-react/src/components/ui/alert-dialog.tsx` | Overlay bokeh |
| `frontend-react/src/components/trips/TripConfirmationModals.tsx` | Overlay bokeh (x4) |
| `frontend-react/src/components/packages/PackageAssignModal.tsx` | Overlay bokeh |
| `frontend-react/src/components/packages/PackageDeliveryModal.tsx` | Overlay bokeh |
| `frontend-react/src/components/packages/PackageReceptionModal.tsx` | Overlay bokeh |
| `frontend-react/src/hooks/use-trip-detail-page.ts` | Estado + handlers paquetes |
| `frontend-react/src/pages/trips/TripDetailPage.tsx` | Props + render modales |

## Funciones existentes a reutilizar
- `packageService.updateStatus()` — `frontend-react/src/services/package.service.ts`
- `packageService.deliver()` — `frontend-react/src/services/package.service.ts`
- `fetchPackages()` — ya existe en el hook (línea ~400)
- `showNotification()` — ya existe en el hook

## Verificación
1. Abrir un viaje en estado `scheduled` → verificar botón "Cargar Encomienda" abre PackageAssignModal
2. Seleccionar encomiendas y asignar → verificar que aparecen en la lista
3. Registrar nueva encomienda desde el modal de asignar
4. Quitar encomienda del viaje
5. Con viaje `arrived`: verificar "Marcar Recibido" abre PackageReceptionModal
6. Con encomienda `arrived_at_destination`: verificar "Entregar" abre PackageDeliveryModal con selección de pago
7. Verificar que TODOS los modales (dialog, sheet, alert-dialog, custom) muestran el overlay bokeh degradado
