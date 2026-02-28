# Plan: Mejora de UI/UX y Estabilidad del Frontend

## Contexto
La interfaz actual tiene bugs críticos que causan crashes (animaciones globalmente deshabilitadas, links rotos), componentes con errores de estado, inconsistencias visuales, y elementos muertos en la UI. Este plan corrige primero los problemas de estabilidad y luego mejora la experiencia visual y de navegación.

---

## Fase 1: Corregir bugs críticos que causan crashes/mal funcionamiento

### 1.1 Eliminar `transition: none !important` global en `app.vue`
**Archivo:** `frontend/app.vue` (líneas 34-37)
- **Problema:** El CSS `* { transition: none !important; animation: none !important; }` mata TODAS las animaciones de la app: spinners de carga, skeletons `animate-pulse`, efectos hover, transiciones de Vue `<transition>`.
- **Acción:** Eliminar las reglas globales. Si se necesita resetear algo para login, aplicar scope solo a `.nuxt-login-page`.

### 1.2 Corregir links de navegación rotos en `AdminHeader.vue`
**Archivo:** `frontend/components/layout/AdminHeader.vue`
- `/trips/manage` no existe → cambiar a `/trips` (desktop línea 24, mobile línea 88)
- `/reports/secretary` en mobile (línea 92) apunta a página inexistente → eliminar ese link
- `Packages` en inglés → cambiar a `Encomiendas` (líneas 26, 90)
- `Logout` → cambiar a `Cerrar sesión` (líneas 57, 112)

### 1.3 Corregir `onBeforeUnmount` dentro de `onMounted`
**Archivo:** `frontend/pages/dashboards/dashboard-secretary.vue` (líneas 489-501)
- **Problema:** `onBeforeUnmount` registrado dentro de `onMounted` no es un patrón soportado en Vue 3. El interval puede no limpiarse nunca (memory leak).
- **Acción:** Mover `clearInterval` a un `onBeforeUnmount` a nivel de setup (fuera de `onMounted`), guardando el intervalId en una variable del scope.

### 1.4 Corregir `AppButton.vue` - variantes y tamaños faltantes
**Archivo:** `frontend/components/common/AppButton.vue`
- **Problema:** `variant` validator no incluye `'outline'` ni `'danger-outline'`, y no existe prop `size`. Componentes como `PackageCard.vue` usan `variant="outline" size="sm"` → se renderizan como botón gris default sin distinción visual.
- **Acción:**
  - Agregar variantes: `outline`, `danger-outline`, `warning`
  - Agregar prop `size` con opciones: `sm`, `md` (default), `lg`

### 1.5 Corregir `PackageDeliveryModal.vue` - `isSubmitting` nunca se resetea
**Archivo:** `frontend/components/packages/PackageDeliveryModal.vue`
- **Problema:** En `confirmDelivery()`, `isSubmitting = true` nunca vuelve a `false`. El botón queda deshabilitado permanentemente si la entrega falla.
- **Acción:** Agregar `finally { isSubmitting.value = false }` en `confirmDelivery`.

### 1.6 Corregir `packages/[id].vue` - `$fetch` sin auth
**Archivo:** `frontend/pages/packages/[id].vue`
- **Problema:** `markPackageAsReceived()` usa `$fetch` directamente sin token de auth → siempre retorna 401.
- **Acción:** Reemplazar con llamada al servicio/store correspondiente que ya maneja auth.

---

## Fase 2: Limpiar redundancias y código muerto

### 2.1 Eliminar código muerto en `dashboard-secretary.vue`
**Archivo:** `frontend/pages/dashboards/dashboard-secretary.vue`
- Eliminar el objeto `icons` reactive con `markRaw` (líneas 402-445) - nunca se usa en el template
- Eliminar array `quickActions` (líneas 448-453) - las tarjetas están hardcodeadas en HTML
- Eliminar botones sin funcionalidad del header del dashboard (download/settings, líneas 30-41)

### 2.2 Eliminar botones de notificación no funcionales
**Archivo:** `frontend/components/layout/AdminHeader.vue`
- El botón de campanita (líneas 33-39) no tiene `@click` ni funcionalidad → eliminarlo hasta que se implemente notificaciones realmente

### 2.3 Eliminar card "Información del Usuario" redundante del dashboard
**Archivo:** `frontend/pages/dashboards/dashboard-secretary.vue` (líneas 274-318)
- **Problema:** Duplica info que ya está en el header del dashboard (nombre) y en el menú de usuario del AdminHeader (email). Ocupa espacio valioso en la sidebar.
- **Acción:** Eliminar esta card.

---

## Fase 3: Crear utilidades compartidas para eliminar duplicación

### 3.1 Crear composable `usePackageStatus`
**Archivo nuevo:** `frontend/composables/usePackageStatus.js`
- Extraer las funciones `getStatusLabel`, `getStatusBg`, `getStatusText`, `getPaymentStatusLabel`, `getPaymentStatusBg` que están duplicadas en 5+ archivos:
  - `frontend/pages/packages/[id].vue`
  - `frontend/components/packages/TripPackagesSection.vue`
  - `frontend/components/packages/PackageCardList.vue`
  - `frontend/components/packages/PackageCard.vue`
- Actualizar todos estos archivos para usar el composable compartido.

### 3.2 Corregir inconsistencias de campo
- `tracking_code` vs `tracking_number` en `PackageCardList.vue` tabla → usar `tracking_number`
- `receiver_name` vs `recipient_name` → unificar a lo que retorna la API

---

## Fase 4: Mejoras visuales de la navegación y layout

### 4.1 Mejorar `AdminHeader.vue`
- Mejor feedback visual para link activo (indicador más claro, no solo color)
- Agregar transición suave al menú mobile (actualmente aparece/desaparece abruptamente)
- Reemplazar avatar placeholder (unsplash URL) con iniciales del usuario en un círculo de color
- Traducir todo a español consistentemente

### 4.2 Agregar `error.vue` global
**Archivo nuevo:** `frontend/error.vue`
- Página de error con diseño limpio para 404 y errores generales
- Botón "Volver al inicio" para que la app no se quede colgada en rutas inexistentes

### 4.3 Mejorar feedback de errores en modales
- `PackageRegistrationModal.vue`: Agregar mensaje de error visible al usuario cuando la creación falla (actualmente solo `console.error`)
- `PackageDeliveryModal.vue`: Mostrar error inline si la entrega falla

---

## Archivos afectados (resumen)

| Archivo | Cambios |
|---------|---------|
| `frontend/app.vue` | Eliminar CSS global de transition:none |
| `frontend/components/layout/AdminHeader.vue` | Corregir links, traducir, mejorar estilos |
| `frontend/components/common/AppButton.vue` | Agregar variantes y prop size |
| `frontend/pages/dashboards/dashboard-secretary.vue` | Corregir lifecycle, eliminar código muerto |
| `frontend/components/packages/PackageDeliveryModal.vue` | Fix isSubmitting reset |
| `frontend/pages/packages/[id].vue` | Fix $fetch sin auth, usar composable |
| `frontend/components/packages/PackageCardList.vue` | Usar composable, fix campos |
| `frontend/components/packages/PackageCard.vue` | Usar composable |
| `frontend/components/packages/TripPackagesSection.vue` | Usar composable |
| `frontend/components/packages/PackageRegistrationModal.vue` | Agregar error feedback |
| `frontend/composables/usePackageStatus.js` | **NUEVO** - composable compartido |
| `frontend/error.vue` | **NUEVO** - página de error |

---

## Verificación

1. `cd frontend && npm run dev` - verificar que la app carga sin errores en consola
2. Verificar que los spinners (`animate-spin`) y skeletons (`animate-pulse`) funcionan
3. Navegar por todos los links del menú secretary y admin - ninguno debe dar 404
4. En `/packages`, verificar que botones de AppButton muestran variantes correctas (outline, danger)
5. Probar registrar y entregar paquetes - verificar feedback de error y que botones no quedan bloqueados
6. Probar en mobile - menú hamburguesa funciona, sin links rotos
7. Navegar a una ruta inexistente - debe mostrar página de error
