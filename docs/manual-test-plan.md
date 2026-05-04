# Manual Test Plan — Frontend Clean Architecture

> Verificacion manual de todos los cambios realizados en el plan de Clean Architecture.
> Cada seccion corresponde a una fase del plan y lista los pasos para validar manualmente.

## Preparacion

1. Levantar el entorno: `make up`
2. Seedear la BD: `make seed`
3. Acceder a http://localhost:3000
4. Usuarios de prueba: `[role]1@transcomarapa.com` / `123456`

---

## Fase 1: Tipos Centralizados

**Objetivo:** Verificar que las paginas que usan los tipos centralizados renderizan correctamente sin errores de runtime.

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 1.1 | `/admin/buses` | admin | Listar buses | Tabla muestra buses con plate_number, model, capacity |
| 1.2 | `/admin/buses` | admin | Crear un bus nuevo | Formulario crea bus, aparece en tabla |
| 1.3 | `/admin/routes` | admin | Listar rutas | Tabla muestra rutas con origen, destino, precio |
| 1.4 | `/admin/drivers` | admin | Listar conductores | Tabla muestra drivers con nombre, licencia, estado |
| 1.5 | `/admin/assistants` | admin | Listar asistentes | Tabla muestra asistentes con nombre, telefono |
| 1.6 | `/admin/secretaries` | admin | Listar secretarias | Tabla muestra secretarias con nombre, oficina |
| 1.7 | `/admin/owners` | admin | Listar socios | Tabla muestra owners con nombre, CI |
| 1.8 | `/admin/offices` | admin | Listar oficinas | Tabla muestra oficinas con nombre, ubicacion |
| 1.9 | `/clients` | secretary | Listar clientes | Tabla muestra clientes con nombre, CI, telefono |
| 1.10 | `/trips` | secretary | Buscar viajes | Resultados muestran origen, destino, fecha, precio |

---

## Fase 2: package.service Limpio

**Objetivo:** Verificar que las constantes de paquetes (estados, colores, labels) funcionan correctamente desde `lib/package-constants.ts`.

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 2.1 | `/packages` | secretary | Ver lista de paquetes | Badges de estado con colores correctos (amarillo=registrado, azul=asignado, naranja=transito, verde=entregado) |
| 2.2 | `/packages` | secretary | Ver labels de estados | Textos en espanol correctos: "En oficina", "Asignada a viaje", etc. |
| 2.3 | `/packages` | secretary | Ver metodos de pago | Labels "Efectivo" / "QR" correctos |
| 2.4 | `/packages/new` | secretary | Crear paquete nuevo | Formulario funciona, se crea correctamente |
| 2.5 | `/packages/:id` | secretary | Ver detalle de paquete | Muestra estado, items, precios con formato correcto |

---

## Fase 3: Store Slices Tipados

**Objetivo:** Verificar que las operaciones del store (fetch, create, update, delete) funcionan sin errores con los tipos correctos.

### 3A. Trip Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.1 | `/trips` | secretary | Cargar lista de viajes | Trips cargan con route (origen/destino), bus, driver, assistant |
| 3.2 | `/trips/:id` | secretary | Ver detalle de viaje | Trip detail muestra todos los campos correctamente tipados |

### 3B. Ticket Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.3 | `/tickets` | secretary | Listar tickets | Tickets cargan con state, price, payment_method |
| 3.4 | `/tickets/:id` | secretary | Ver detalle ticket | Detalle muestra client, seat, trip, secretary |

### 3C. Client Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.5 | `/clients` | secretary | Listar clientes | Clients cargan con firstname, lastname, document_id, phone |
| 3.6 | `/clients` | secretary | Crear cliente | Formulario crea cliente correctamente |

### 3D. Bus Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.7 | `/admin/buses` | admin | Crear bus con asientos | Bus se crea con asientos tipados, sin errores |
| 3.8 | `/admin/buses` | admin | Editar asientos de bus | Asientos se actualizan correctamente |

### 3E. Route Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.9 | `/admin/routes` | admin | Crear ruta | Ruta se crea con origin, destination, base_price |
| 3.10 | `/admin/routes` | admin | Gestionar horarios | Schedules se muestran y pueden crear/editar |

### 3F. Location / Driver / Assistant Slices

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.11 | `/admin/routes` (dropdowns) | admin | Ver origins/destinos | Dropdowns muestran locations correctamente |
| 3.12 | `/admin/drivers` | admin | Crear conductor | Driver se crea sin errores de tipo |
| 3.13 | `/admin/assistants` | admin | Crear asistente | Assistant se crea sin errores de tipo |

### 3G. Package Slice

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.14 | `/packages` | secretary | Listar paquetes | Packages cargan con status, items, precios |
| 3.15 | `/packages` | secretary | Cambiar estado de paquete | Transicion de estado funciona sin errores |

### 3H. Selectores (RootState)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 3.16 | Navegacion general | admin | Navegar entre todas las paginas | Sin errores en consola, sin "Cannot read property of undefined" |
| 3.17 | `/dashboards/dashboard-admin` | admin | Ver dashboard | Estadisticas cargan correctamente desde store |

---

## Fase 4: apiFetch Eliminado de Hooks

**Objetivo:** Verificar que los hooks que antes llamaban `apiFetch` directamente ahora usan services correctamente.

### 4A. Busqueda de clientes

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.1 | `/tickets` (venta) | secretary | Buscar cliente existente | Autocompletado funciona, muestra resultados |
| 4.2 | `/tickets` (venta) | secretary | Crear cliente nuevo desde modal | Cliente se crea y se selecciona automaticamente |

### 4B. Trip Staff Editor

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.3 | `/trips/:id` | admin | Asignar driver/assistant | `tripService.update` funciona, se asigna correctamente |

### 4C. Trip Detail Page (acciones de tickets)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.4 | `/trips/:id` | secretary | Cambiar asiento de ticket | `ticketService.changeSeat` funciona |
| 4.5 | `/trips/:id` | secretary | Confirmar venta de ticket | `ticketService.confirmSale` funciona |
| 4.6 | `/trips/:id` | secretary | Cancelar ticket | `ticketService.cancel` funciona |

### 4D. Trip Details (tickets por viaje)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.7 | `/trips/:id` | secretary | Ver tickets del viaje | `ticketService.getByTripId` carga tickets correctamente |

### 4E. Trip Packages Panel

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.8 | `/trips/:id` | secretary | Ver paquetes del viaje | `packageService.getByTrip` funciona |
| 4.9 | `/trips/:id` | secretary | Cambiar estado de paquete | `packageService.updateStatus` funciona |

### 4F. Package Registration

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.10 | `/packages/new` | secretary | Cargar formulario | Oficinas cargan via `officeService.getAll()` |
| 4.11 | `/packages/new` | secretary | Registrar paquete | Paquete se crea correctamente |

### 4G. Ticket Sale (componente)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.12 | `/trips/:id` | secretary | Vender ticket (crear cliente + ticket) | Flujo completo: crear cliente -> crear ticket -> asignar asiento |

### 4H. Trip Manifest

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.13 | `/trips/:id/passengers-manifest` | secretary | Ver manifiesto de pasajeros | Imprime correctly con datos de tickets |
| 4.14 | `/trips/:id/packages-manifest` | secretary | Ver manifiesto de paquetes | Imprime correctly con datos de packages |

### 4I. Trip Sheet

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 4.15 | `/trips/:id` (hoja de viaje) | secretary | Ver hoja de viaje | `ticketService.getTicketsByTrip` carga datos |

---

## Fase 5: Hooks Extraidos de Paginas

**Objetivo:** Verificar que cada pagina refactorizada funciona identico a antes — la UI no debe cambiar.

### 5A. Tickets Index

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.1 | `/tickets` | secretary | Cargar pagina | Lista de tickets se muestra |
| 5.2 | `/tickets` | secretary | Filtrar tickets | Filtros funcionan |
| 5.3 | `/tickets` | secretary | Paginar | Paginacion funciona |

### 5B. Users Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.4 | `/admin/users` | admin | Listar usuarios | Tabla con usuarios |
| 5.5 | `/admin/users` | admin | Crear usuario | Modal funciona, usuario se crea |
| 5.6 | `/admin/users` | admin | Editar usuario | Edicion funciona |

### 5C. Secretaries Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.7 | `/admin/secretaries` | admin | Listar secretarias | Tabla correcta |
| 5.8 | `/admin/secretaries` | admin | Crear secretaria | Funciona |

### 5D. Driver Dashboard

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.9 | `/dashboards/dashboard-driver` | driver | Ver dashboard | Viajes asignados, transiciones de estado |
| 5.10 | `/dashboards/dashboard-driver` | driver | Cambiar estado viaje | Botones de transicion funcionan |

### 5E. Owners Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.11 | `/admin/owners` | admin | Listar socios | Tabla correcta |
| 5.12 | `/admin/owners` | admin | Crear socio | Formulario funciona |

### 5F. Drivers Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.13 | `/admin/drivers` | admin | Listar conductores | Tabla correcta |
| 5.14 | `/admin/drivers` | admin | Crear conductor | Formulario funciona |

### 5G. Ticket Confirmation

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.15 | `/tickets/confirmation` | secretary | Ver confirmacion | Muestra datos del ticket vendido |

### 5H. Cash Register

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.16 | `/admin/cash-register` | admin | Ver caja actual | Estado de caja, resumen diario |
| 5.17 | `/admin/cash-register` | secretary | Abrir caja | Apertura funciona |
| 5.18 | `/admin/cash-register` | secretary | Cerrar caja | Cierre funciona |
| 5.19 | `/admin/cash-register` | secretary | Ver historial | Historial carga correctamente |

### 5I. Admin Dashboard

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.20 | `/dashboards/dashboard-admin` | admin | Ver dashboard | KPIs, graficos, tabs funcionan |

### 5J. Assistant Dashboard

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.21 | `/dashboards/dashboard-assistant` | assistant | Ver dashboard | Viajes asignados, tabs pasajeros/paquetes |
| 5.22 | `/dashboards/dashboard-assistant` | assistant | Cambiar estado viaje | Transiciones funcionan |

### 5K. Financial Dashboard

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.23 | `/admin/financial` | admin | Ver dashboard financiero | Resumen por oficinas, totales |
| 5.24 | `/admin/financial` | admin | Cambiar fecha | Datos se actualizan |

### 5L. Reports Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.25 | `/reports` | admin | Ver reportes | Tablas de reportes cargan |

### 5M. Withdrawal History

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.26 | `/admin/withdrawals` | admin | Ver historial retiros | Lista de retiros |
| 5.27 | `/admin/withdrawals` | admin | Filtrar por fechas | Filtros funcionan |

### 5N. Buses Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.28 | `/admin/buses` | admin | Listar buses | Tabla con buses |
| 5.29 | `/admin/buses` | admin | Crear bus | Formulario funciona |

### 5O. Assistants Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.30 | `/admin/assistants` | admin | Listar asistentes | Tabla correcta |

### 5P. Profile Page

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.31 | `/profile` | cualquier rol | Ver perfil | Datos del usuario |
| 5.32 | `/profile` | cualquier rol | Editar perfil | Guardado funciona |

### 5Q. Owner Settlements

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 5.33 | `/admin/owner-settlements` | admin | Ver liquidaciones | Selector de socio, buses, tabla financiera |
| 5.34 | `/admin/owner-settlements` | admin | Cambiar socio | Datos se actualizan |
| 5.35 | `/admin/owner-settlements` | admin | Filtrar por bus | Filtro funciona |

---

## Fase 6: Eliminacion de `any`

**Objetivo:** Verificar que `useAppDispatch` y `useAppSelector` funcionan correctamente sin `any`.

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 6.1 | `/packages` | secretary | Crear/editar paquete | Dispatch funciona sin errores de tipo |
| 6.2 | `/packages` | secretary | Cambiar estado | Acciones del store dispatchean correctamente |
| 6.3 | `/tickets` (venta) | secretary | Vender ticket | useDispatch y useSelector tipados funcionan |
| 6.4 | Cualquier pagina | cualquier rol | Navegar y usar store | Sin errores en consola relacionados con Redux |

---

## Fase 7: Componentes sin Services Directos

**Objetivo:** Verificar que los componentes que antes importaban services directamente ahora funcionan via hooks.

### 7A. Sidebar

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.1 | Cualquier pagina | secretary | Ver sidebar | Nombre de oficina muestra correctamente |

### 7B. Package Assign Modal

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.2 | `/packages` | secretary | Asignar paquete a viaje | Modal funciona, lista viajes, asigna correctamente |

### 7C. Pending Collections

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.3 | `/packages/pending-collections` | secretary | Ver pendientes de cobro | Lista carga, se puede entregar paquete |

### 7D. Package Delivery Modal

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.4 | `/packages/pending-collections` | secretary | Entregar paquete | Modal de entrega funciona, cobra y registra |

### 7E. Recent Sales (Dashboard)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.5 | `/dashboards/dashboard-secretary` | secretary | Ver ventas recientes | Widget muestra ultimas ventas |

### 7F. Upcoming Trips (Dashboard)

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 7.6 | `/dashboards/dashboard-secretary` | secretary | Ver proximos viajes | Widget muestra viajes del dia |

---

## Fase 8: DRY Utilidades

**Objetivo:** Verificar que `errMsg()` funciona correctamente en los hooks.

| # | Ruta | Rol | Accion | Resultado esperado |
|---|------|-----|--------|--------------------|
| 8.1 | `/trips/:id` | secretary | Forzar error (ej. cancelar ticket ya cancelado) | Toast muestra mensaje de error legible, no "[object Object]" |
| 8.2 | `/packages` | secretary | Forzar error en paquete | Mensaje de error claro |
| 8.3 | `/admin/cash-register` | secretary | Abrir caja ya abierta | Error manejado con mensaje claro |

---

## Fase 9: API Interceptors

**Objetivo:** Verificar que el manejo de 401 y refresh token funciona.

| # | Escenario | Accion | Resultado esperado |
|---|-----------|--------|--------------------|
| 9.1 | Token expirado | Esperar a que expire el access token, luego hacer una accion | Auto-refresh funciona, no redirige a login |
| 9.2 | Refresh token expirado | Esperar a que expire el refresh token, luego hacer una accion | Redirige a `/login` automaticamente |
| 9.3 | Logout manual | Click en logout | Limpia estado, redirige a login |

---

## Fase 10: ESLint Reglas Estrictas

**Objetivo:** Verificar que las reglas de restricted imports protegen la arquitectura.

| # | Verificacion | Accion | Resultado esperado |
|---|-------------|--------|--------------------|
| 10.1 | Sin apiFetch en pages | `npm run lint` pasa sin errores de restricted-imports en pages/ | OK |
| 10.2 | Sin services en pages | `npm run lint` pasa sin errores de restricted-imports en pages/ | OK |
| 10.3 | Sin apiFetch en components | `npm run lint` pasa sin errores en components/ | OK |
| 10.4 | Sin services en components | `npm run lint` pasa sin errores en components/ | OK |

> Estas verificaciones son automaticas y ya pasan. Solo se listan para completitud.

---

## Verificacion Cruzada Final

Estos tests validan el sistema completo end-to-end:

| # | Flujo | Rol | Pasos | Resultado esperado |
|---|-------|-----|-------|--------------------|
| F.1 | Venta de ticket completa | secretary | 1. Buscar viaje -> 2. Seleccionar asiento -> 3. Crear/buscar cliente -> 4. Vender ticket -> 5. Ver confirmacion | Ticket vendido, asiento ocupado, venta en caja |
| F.2 | Flujo de paquetes completo | secretary | 1. Registrar paquete -> 2. Asignar a viaje -> 3. Cambiar estado (transito) -> 4. Entregar | Paquete entregado, cobro registrado |
| F.3 | Flujo de viaje completo | admin | 1. Crear ruta -> 2. Crear bus -> 3. Asignar driver/assistant -> 4. Cambiar estados (programado -> abordando -> partido -> llego) | Todas las transiciones funcionan |
| F.4 | Dashboard admin | admin | Ver dashboard, navegar a reportes, ver finanzas, ver retiros | Todos los datos cargan sin errores |
| F.5 | Flujo de caja | secretary | 1. Abrir caja -> 2. Vender tickets/paquetes -> 3. Ver resumen -> 4. Hacer retiro -> 5. Cerrar caja | Todo el flujo financiero funciona |
| F.6 | Verificacion de consola | cualquier rol | Abrir DevTools (F12) -> Console -> Navegar todas las paginas | 0 errores, 0 warnings de React |

---

## Checklist Rapido

Marcar cada item al completar:

- [ ] Tipos: 10 paginas de admin renderizan datos correctamente
- [ ] Packages: Badges de estado con colores correctos
- [ ] Store: CRUD en trips, tickets, clients, buses, routes, packages funciona
- [ ] Hooks/apiFetch: Busqueda de clientes, venta de tickets, gestion de paquetes
- [ ] Pages: Todas las 20+ paginas cargan sin errores
- [ ] any: Dispatch/Selector tipados funcionan en packages y tickets
- [ ] Components: Sidebar, modals, dashboards sin services directos
- [ ] Error utils: Mensajes de error legibles en toasts
- [ ] API: Auto-refresh en token expirado, logout limpia estado
- [ ] ESLint: `npm run lint` pasa con 0 errores, 0 warnings
- [ ] Flujo completo de venta de ticket
- [ ] Flujo completo de paquetes
- [ ] Consola sin errores de React
