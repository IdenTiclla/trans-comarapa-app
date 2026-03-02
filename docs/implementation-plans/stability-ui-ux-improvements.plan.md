# Plan: Estabilidad, Manejo de Errores, UI Responsiva y UX Mejorada

## Contexto

La app Trans Comarapa tiene problemas de crashes por accesos a propiedades nulas, manejo de errores inconsistente, una página de error con un bug crítico, y componentes UI que no se adaptan bien a móviles. Este plan aborda todo en 4 fases priorizadas.

---

## Fase 1: Estabilidad y Crashes (Crítico)

### 1.1 Fix `error.vue` - clearError crash
**Archivo:** `frontend/error.vue`
- Verificar que `clearError` se resuelve correctamente (auto-import de Nuxt 3)
- Agregar fallback con `navigateTo('/')` si `clearError` no existe
- Agregar manejo de más tipos de error: 401 (redirigir a login), 408/timeout, offline, 5xx genéricos
- Agregar detección offline con `navigator.onLine` + event listeners

### 1.2 Null guards en páginas de detalle
**Archivos:**
- `frontend/pages/packages/[id].vue` - Asegurar optional chaining completo en accesos anidados (`trip?.route?.origin_location?.name`, `trip?.departure_date`)
- `frontend/pages/trips/[id].vue` - Agregar guard de `isLoading` en el header (línea ~20), no solo en el contenido
- `frontend/pages/trips/new.vue` - Guards en `trip.route.origin`, `selectedRoute.distance`, `driver.license_number`
- `frontend/pages/bookings.vue` - Inicializar `stats` con valores por defecto

### 1.3 Fix race conditions en `pages/trips/[id].vue`
- Eliminar fetch duplicado entre `onMounted` y el watcher de `displayedTrip`
- Agregar ref `isMounted` para prevenir actualizaciones en componente desmontado

### 1.4 Timeout en API
**Archivo:** `frontend/utils/api.js`
- Agregar timeout de 15s por defecto en `apiFetch`
- Asegurar que `isRefreshing`/`refreshPromise` siempre se limpien con `finally`

### 1.5 Error Boundary component
**Nuevo:** `frontend/components/common/ErrorBoundary.vue`
- Usa `onErrorCaptured` para capturar errores de renderizado
- Muestra UI de fallback con botón "Reintentar"
- Envolver secciones críticas de páginas de detalle

---

## Fase 2: Manejo de Errores Mejorado

### 2.1 Plugin global de errores
**Nuevo:** `frontend/plugins/error-handler.client.js`
- `vueApp.config.errorHandler` para errores de Vue no capturados
- `window.addEventListener('unhandledrejection')` para promesas no manejadas
- Ignorar `SessionExpiredError` (ya se maneja)

### 2.2 Sistema de toasts
**Nuevos archivos:**
- `frontend/composables/useToast.js` - Composable con `success()`, `error()`, `info()`, auto-dismiss en 4s
- `frontend/components/common/ToastContainer.vue` - Renderiza toasts, posición fixed top-right, con transiciones

**Modificar:** `frontend/app.vue` - Agregar `<ToastContainer />` global

### 2.3 Reemplazar `alert()` con toasts
- `frontend/pages/packages/[id].vue` - Reemplazar `alert(error.response?.data?.detail...)` con `toast.error()`
- Buscar y reemplazar todos los `alert()` restantes en el frontend

### 2.4 Consistencia en stores
- Asegurar que todas las operaciones CRUD en stores sigan el patrón: setear `error.value` + throw para que el caller pueda reaccionar
- Verificar `frontend/stores/packageStore.js` - agregar null checks en computed properties

---

## Fase 3: UI Responsiva

### 3.1 UserTable mobile - vista de cards
**Archivo:** `frontend/components/admin/UserTable.vue`
- Agregar vista de cards para `<md` (con avatar, nombre, email, rol, acciones)
- Mantener tabla actual para `md+` con `hidden md:block`
- Cambiar filtros de `w-40` a `w-full sm:w-40`

### 3.2 Fix PackageCard max-width hardcodeado
**Archivo:** `frontend/components/packages/PackageCard.vue`
- Eliminar CSS scoped con `max-width: 250px` del `.truncate`
- Usar `max-w-full` de Tailwind directamente en el template

### 3.3 Fix TicketDisplay CSS conflictivo
**Archivo:** `frontend/components/tickets/TicketDisplay.vue`
- Eliminar redefiniciones de utilidades Tailwind en `<style scoped>` (líneas ~557-581)
- Reemplazar media queries custom (768px, 480px) con clases responsivas de Tailwind en el template
- Aprovechar el prop `previewMode` que ya maneja variaciones de tamaño

### 3.4 Modales responsive
- Auditar modales principales (`PackageRegistrationModal`, `TicketSaleModal`, `PackageAssignModal`) para pantallas 320px+
- Asegurar que forms multi-columna colapsen a 1 columna en móvil
- Padding adecuado en móvil (`p-4` en lugar de `p-6`)

---

## Fase 4: UX Mejorada

### 4.1 Loading skeletons
**Nuevos:**
- `frontend/components/common/SkeletonLoader.vue` - Componente base con `animate-pulse`
- Variantes específicas inline en las páginas de detalle

**Modificar:**
- `frontend/pages/packages/[id].vue` - Reemplazar spinner con skeleton
- `frontend/pages/trips/[id].vue` - Reemplazar spinner con skeleton

### 4.2 Empty states
**Nuevo:** `frontend/components/common/EmptyState.vue`
- Props: `title`, `description`, slot para icono y acción
- Aplicar en: lista de paquetes, lista de viajes, tabla de usuarios

### 4.3 Transiciones
**Modificar:** `frontend/assets/css/main.css`
- Agregar clases de transición Vue: `fade`, `slide-up`
- Aplicar `<Transition>` en modales y cambios de contenido principal

### 4.4 Mejora de feedback en formularios
**Nuevo:** `frontend/composables/useFormValidation.js`
- Validación por campo con mensajes inline
- Estado disabled en botón submit cuando hay errores
- Limpiar errores al escribir
- Aplicar en formularios principales (registro de paquetes, creación de viajes, creación de usuarios)

---

## Archivos nuevos a crear

| Archivo | Propósito |
|---------|-----------|
| `components/common/ErrorBoundary.vue` | Captura errores de renderizado |
| `components/common/ToastContainer.vue` | Notificaciones toast |
| `components/common/SkeletonLoader.vue` | Skeleton de carga genérico |
| `components/common/EmptyState.vue` | Estado vacío para listas |
| `composables/useToast.js` | Lógica de notificaciones |
| `composables/useFormValidation.js` | Validación de formularios |
| `plugins/error-handler.client.js` | Handler global de errores |

## Archivos principales a modificar

| Archivo | Cambios |
|---------|---------|
| `error.vue` | Fix clearError, más tipos de error, offline |
| `utils/api.js` | Timeout, hardening refresh flow |
| `pages/packages/[id].vue` | Optional chaining, skeleton, toasts |
| `pages/trips/[id].vue` | Fix race condition, skeleton, guards |
| `pages/trips/new.vue` | Null guards |
| `components/admin/UserTable.vue` | Vista cards mobile, filtros responsive |
| `components/packages/PackageCard.vue` | Eliminar max-width hardcodeado |
| `components/tickets/TicketDisplay.vue` | Limpiar CSS conflictivo |
| `app.vue` | ToastContainer global |
| `assets/css/main.css` | Clases de transición |

## Verificación

1. **Estabilidad**: Navegar a `/packages/999` (ID inexistente) - no debe crashear. Desconectar red - debe mostrar estado offline.
2. **Error page**: Navegar a ruta inexistente - debe mostrar error.vue sin crash.
3. **Toasts**: Provocar error en API (apagar backend) - debe mostrar toast, no alert().
4. **Responsive**: Probar en Chrome DevTools a 320px, 375px, 768px, 1024px todas las páginas principales.
5. **Skeletons**: Throttlear red a Slow 3G - debe mostrar skeletons mientras carga.
