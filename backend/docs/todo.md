# Lista de Tareas para Implementación

## Definir Clases y Modelos
- [x] Implementar la clase `Client`.  <!-- Completado como Passenger -->
- [x] Implementar la clase `Ticket`.  <!-- Completado -->
- [x] Implementar la clase `Trip`.  <!-- Completado -->
- [x] Implementar la clase `Route`.  <!-- Completado -->
- [x] Implementar la clase `Location`.  <!-- Completado -->
- [x] Implementar la clase `Bus`.  <!-- Completado -->
- [ ] Implementar las clases `SingleDeckBus` y `DoubleDeckBus`.  <!-- Pendiente -->
- [ ] Implementar la clase `Reservation`.  <!-- Pendiente -->
- [x] Implementar la clase `Package`.  <!-- Completado -->
- [ ] Implementar la clase `Office`.  <!-- Pendiente -->
- [ ] Implementar la clase `Secretary`.  <!-- Pendiente -->
- [x] Implementar la clase `Driver`.  <!-- Completado -->
- [x] Implementar la clase `Assistant`.  <!-- Completado -->
- [ ] Implementar la clase `PaymentMethod`.  <!-- Pendiente -->
- [ ] Implementar la clase `Transaction`.  <!-- Pendiente -->
- [x] Implementar la clase `Seat`.  <!-- Completado -->

## Establecer Relaciones
- [x] Definir las relaciones entre `Client` y `Ticket`.  <!-- Completado -->
- [ ] Definir las relaciones entre `Client` y `Reservation`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Client` y `Package`.  <!-- Completado -->
- [ ] Definir las relaciones entre `Client` y `Transaction`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Ticket` y `Trip`.  <!-- Completado -->
- [ ] Definir las relaciones entre `Reservation` y `Trip`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Trip` y `Route`.  <!-- Completado -->
- [x] Definir las relaciones entre `Trip` y `Bus`.  <!-- Completado -->
- [x] Definir las relaciones entre `Trip` y `Driver`.  <!-- Completado -->
- [x] Definir las relaciones entre `Trip` y `Assistant`.  <!-- Completado -->
- [ ] Definir las relaciones entre `Trip` y `Secretary`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Route` y `Location`.  <!-- Completado -->
- [x] Definir las relaciones entre `Package` y `Trip`.  <!-- Completado -->
- [ ] Definir las relaciones entre `Secretary` y `Ticket`.  <!-- Pendiente -->
- [ ] Definir las relaciones entre `Secretary` y `Package`.  <!-- Pendiente -->
- [ ] Definir las relaciones entre `Secretary` y `Trip`.  <!-- Pendiente -->
- [ ] Definir las relaciones entre `Secretary` y `Office`.  <!-- Pendiente -->
- [ ] Definir las relaciones entre `Transaction` y `PaymentMethod`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Ticket` y `Seat`.  <!-- Completado -->
- [x] Definir las relaciones entre `Seat` y `Bus`.  <!-- Completado -->

## Implementar Funcionalidades Básicas (CRUD)
- [x] Implementar CRUD completo para Passenger:
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
- [x] Implementar CRUD completo para Driver  <!-- Completado -->
- [x] Implementar CRUD básico para Bus  <!-- Completado -->
- [x] Implementar CRUD completo para Bus:
  - [x] Create  <!-- Completado -->
  - [x] Read  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
- [x] Implementar CRUD completo para Route:
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Búsqueda por origen/destino  <!-- Completado -->
- [x] Implementar CRUD completo para Location:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Validación de coordenadas  <!-- Completado -->
- [ ] Implementar CRUD completo para Office:
  - [ ] Modelo y esquema  <!-- Pendiente -->
  - [ ] Create  <!-- Pendiente -->
  - [ ] Read (list & get by id)  <!-- Pendiente -->
  - [ ] Update (patch)  <!-- Pendiente -->
  - [ ] Delete  <!-- Pendiente -->
  - [ ] Relación con Location  <!-- Pendiente -->
- [ ] Implementar CRUD completo para Secretary:
  - [ ] Modelo y esquema  <!-- Pendiente -->
  - [ ] Create con validación de Office  <!-- Pendiente -->
  - [ ] Read (list & get by id)  <!-- Pendiente -->
  - [ ] Update (patch)  <!-- Pendiente -->
  - [ ] Delete  <!-- Pendiente -->
  - [ ] Asignación a Office  <!-- Pendiente -->
- [x] Implementar CRUD completo para Seats:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
- [x] Implementar CRUD completo para Tickets:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (put)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->

## Lista de Endpoints por Implementar

### Endpoints de Autenticación y Usuarios
- [ ] `POST /auth/login` - Autenticación de usuarios
- [ ] `POST /auth/refresh` - Refrescar token JWT
- [ ] `POST /auth/logout` - Cerrar sesión
- [ ] `GET /users/me` - Obtener información del usuario actual
- [ ] `PUT /users/me` - Actualizar información del usuario actual
- [ ] `POST /users` - Crear nuevo usuario (admin)
- [ ] `GET /users` - Listar usuarios (admin)
- [ ] `GET /users/{id}` - Obtener usuario por ID (admin)
- [ ] `PUT /users/{id}` - Actualizar usuario por ID (admin)
- [ ] `DELETE /users/{id}` - Eliminar usuario (admin)
- [ ] `PATCH /users/{id}/role` - Cambiar rol de usuario (admin)

### Endpoints de Clientes
- [x] `POST /clients` - Crear cliente <!-- Completado -->
- [x] `GET /clients` - Listar clientes <!-- Completado -->
- [x] `GET /clients/{id}` - Obtener cliente por ID <!-- Completado -->
- [x] `PUT /clients/{id}` - Actualizar cliente <!-- Completado -->
- [x] `DELETE /clients/{id}` - Eliminar cliente <!-- Completado -->
- [x] `GET /clients/{id}/tickets` - Listar tickets de un cliente <!-- Completado -->
- [ ] `GET /clients/{id}/transactions` - Listar transacciones de un cliente <!-- Pendiente -->
- [ ] `GET /clients/{id}/packages/sent` - Listar paquetes enviados por un cliente <!-- Pendiente, pero el modelo ya tiene la relación -->
- [ ] `GET /clients/{id}/packages/received` - Listar paquetes recibidos por un cliente <!-- Pendiente, pero el modelo ya tiene la relación -->
- [ ] `GET /clients/{id}/reservations` - Listar reservas de un cliente

### Endpoints de Conductores
- [x] `POST /drivers` - Crear conductor <!-- Completado -->
- [x] `GET /drivers` - Listar conductores <!-- Completado -->
- [x] `GET /drivers/{id}` - Obtener conductor por ID <!-- Completado -->
- [x] `PUT /drivers/{id}` - Actualizar conductor <!-- Completado -->
- [x] `DELETE /drivers/{id}` - Eliminar conductor <!-- Completado -->
- [ ] `GET /drivers/{id}/trips` - Listar viajes asignados a un conductor
- [ ] `GET /drivers/available` - Listar conductores disponibles en una fecha

### Endpoints de Asistentes
- [x] `POST /assistants` - Crear asistente <!-- Completado -->
- [x] `GET /assistants` - Listar asistentes <!-- Completado -->
- [x] `GET /assistants/{id}` - Obtener asistente por ID <!-- Completado -->
- [x] `PUT /assistants/{id}` - Actualizar asistente <!-- Completado -->
- [x] `DELETE /assistants/{id}` - Eliminar asistente <!-- Completado -->
- [ ] `GET /assistants/{id}/trips` - Listar viajes asignados a un asistente
- [ ] `GET /assistants/available` - Listar asistentes disponibles en una fecha

### Endpoints de Buses
- [x] `POST /buses` - Crear bus <!-- Completado -->
- [x] `GET /buses` - Listar buses <!-- Completado -->
- [x] `GET /buses/{id}` - Obtener bus por ID <!-- Completado -->
- [x] `PUT /buses/{id}` - Actualizar bus <!-- Completado -->
- [x] `DELETE /buses/{id}` - Eliminar bus <!-- Completado -->
- [x] `GET /buses/{id}/seats` - Listar asientos de un bus <!-- Completado -->
- [ ] `POST /buses/{id}/seats/bulk` - Crear múltiples asientos para un bus
- [ ] `GET /buses/available` - Listar buses disponibles en una fecha

### Endpoints de Asientos
- [x] `POST /seats` - Crear asiento <!-- Completado -->
- [x] `GET /seats` - Listar asientos <!-- Completado -->
- [x] `GET /seats/{id}` - Obtener asiento por ID <!-- Completado -->
- [x] `PUT /seats/{id}` - Actualizar asiento <!-- Completado -->
- [x] `DELETE /seats/{id}` - Eliminar asiento <!-- Completado -->
- [ ] `GET /seats/trip/{trip_id}` - Listar asientos disponibles para un viaje
- [x] `GET /seats/{id}/tickets` - Listar tickets asociados a un asiento <!-- Completado via /tickets/seat/{seat_id} -->

### Endpoints de Ubicaciones
- [x] `POST /locations` - Crear ubicación <!-- Completado -->
- [x] `GET /locations` - Listar ubicaciones <!-- Completado -->
- [x] `GET /locations/{id}` - Obtener ubicación por ID <!-- Completado -->
- [x] `PUT /locations/{id}` - Actualizar ubicación <!-- Completado -->
- [x] `DELETE /locations/{id}` - Eliminar ubicación <!-- Completado -->
- [ ] `GET /locations/search` - Buscar ubicaciones por nombre o coordenadas

### Endpoints de Rutas
- [x] `POST /routes` - Crear ruta <!-- Completado -->
- [x] `GET /routes` - Listar rutas <!-- Completado -->
- [x] `GET /routes/{id}` - Obtener ruta por ID <!-- Completado -->
- [x] `PUT /routes/{id}` - Actualizar ruta <!-- Completado -->
- [x] `DELETE /routes/{id}` - Eliminar ruta <!-- Completado -->
- [x] `GET /routes/search` - Buscar rutas por origen/destino <!-- Completado -->
- [ ] `GET /routes/{id}/trips` - Listar viajes para una ruta
- [ ] `POST /routes/{id}/stops` - Añadir parada a una ruta
- [ ] `GET /routes/{id}/stops` - Listar paradas de una ruta
- [ ] `DELETE /routes/{id}/stops/{stop_id}` - Eliminar parada de una ruta

### Endpoints de Viajes
- [x] `POST /trips` - Crear viaje <!-- Completado -->
- [x] `GET /trips` - Listar viajes <!-- Completado -->
- [x] `GET /trips/{id}` - Obtener viaje por ID <!-- Completado -->
- [x] `PUT /trips/{id}` - Actualizar viaje <!-- Completado -->
- [x] `DELETE /trips/{id}` - Eliminar viaje <!-- Completado -->
- [ ] `GET /trips/search` - Buscar viajes por origen/destino/fecha <!-- Pendiente, pero ya existe la funcionalidad similar en routes -->
- [x] `GET /tickets/trip/{trip_id}` - Listar tickets para un viaje <!-- Completado en /tickets/trip/{trip_id} -->
- [x] `GET /seats/trip/{trip_id}` - Listar asientos para un viaje <!-- Completado en /seats/trip/{trip_id} -->
- [ ] `GET /trips/{id}/availability` - Verificar disponibilidad de asientos
- [ ] `GET /trips/upcoming` - Listar próximos viajes
- [ ] `PATCH /trips/{id}/status` - Actualizar estado de un viaje

### Endpoints de Tickets
- [x] `POST /tickets` - Crear ticket <!-- Completado -->
- [x] `GET /tickets` - Listar tickets <!-- Completado -->
- [x] `GET /tickets/{id}` - Obtener ticket por ID <!-- Completado -->
- [x] `PUT /tickets/{id}` - Actualizar ticket <!-- Completado -->
- [x] `DELETE /tickets/{id}` - Eliminar ticket <!-- Completado -->
- [x] `GET /tickets/trip/{trip_id}` - Listar tickets por viaje <!-- Completado -->
- [x] `GET /tickets/client/{client_id}` - Listar tickets por cliente <!-- Completado -->
- [x] `GET /tickets/seat/{seat_id}` - Listar tickets por asiento <!-- Completado -->
- [x] `POST /clients/{id}/tickets` - Crear ticket para un cliente <!-- Completado -->
- [x] `GET /clients/{id}/tickets/{ticket_id}` - Obtener ticket específico de un cliente <!-- Completado -->
- [ ] `PATCH /tickets/{id}/status` - Actualizar estado de un ticket

### Endpoints de Reservas
- [ ] `POST /reservations` - Crear reserva
- [ ] `GET /reservations` - Listar reservas
- [ ] `GET /reservations/{id}` - Obtener reserva por ID
- [ ] `DELETE /reservations/{id}` - Cancelar reserva
- [ ] `GET /reservations/trip/{trip_id}` - Listar reservas por viaje
- [ ] `GET /reservations/client/{client_id}` - Listar reservas por cliente
- [ ] `PATCH /reservations/{id}/status` - Actualizar estado de una reserva
- [ ] `POST /reservations/{id}/confirm` - Confirmar una reserva

### Endpoints de Oficinas
- [ ] `POST /offices` - Crear oficina
- [ ] `GET /offices` - Listar oficinas
- [ ] `GET /offices/{id}` - Obtener oficina por ID
- [ ] `PUT /offices/{id}` - Actualizar oficina
- [ ] `DELETE /offices/{id}` - Eliminar oficina
- [ ] `GET /offices/{id}/secretaries` - Listar secretarios de una oficina
- [ ] `GET /offices/location/{location_id}` - Buscar oficinas por ubicación

### Endpoints de Secretarios
- [ ] `POST /secretaries` - Crear secretario
- [ ] `GET /secretaries` - Listar secretarios
- [ ] `GET /secretaries/{id}` - Obtener secretario por ID
- [ ] `PUT /secretaries/{id}` - Actualizar secretario
- [ ] `DELETE /secretaries/{id}` - Eliminar secretario
- [ ] `GET /secretaries/{id}/tickets` - Listar tickets vendidos por un secretario
- [ ] `GET /secretaries/{id}/trips` - Listar viajes despachados por un secretario

### Endpoints de Paquetes
- [x] `POST /packages` - Crear paquete <!-- Completado -->
- [x] `GET /packages` - Listar paquetes <!-- Completado -->
- [x] `GET /packages/{id}` - Obtener paquete por ID <!-- Completado -->
- [x] `PUT /packages/{id}` - Actualizar paquete <!-- Completado -->
- [x] `DELETE /packages/{id}` - Eliminar paquete <!-- Completado -->
- [ ] `GET /packages/sender/{client_id}` - Listar paquetes por remitente <!-- Pendiente, pero el modelo ya tiene la relación -->
- [ ] `GET /packages/recipient/{client_id}` - Listar paquetes por destinatario <!-- Pendiente, pero el modelo ya tiene la relación -->
- [ ] `GET /packages/trip/{trip_id}` - Listar paquetes por viaje <!-- Pendiente, pero el modelo ya tiene la relación -->
- [ ] `PATCH /packages/{id}/status` - Actualizar estado de un paquete

### Endpoints de Métodos de Pago
- [ ] `POST /payment-methods` - Crear método de pago
- [ ] `GET /payment-methods` - Listar métodos de pago
- [ ] `GET /payment-methods/{id}` - Obtener método de pago por ID
- [ ] `PUT /payment-methods/{id}` - Actualizar método de pago
- [ ] `DELETE /payment-methods/{id}` - Eliminar método de pago
- [ ] `PATCH /payment-methods/{id}/status` - Activar/desactivar método de pago

### Endpoints de Transacciones
- [ ] `POST /transactions` - Crear transacción
- [ ] `GET /transactions` - Listar transacciones
- [ ] `GET /transactions/{id}` - Obtener transacción por ID
- [ ] `GET /transactions/client/{client_id}` - Listar transacciones por cliente
- [ ] `GET /transactions/payment-method/{method_id}` - Listar transacciones por método de pago
- [ ] `PATCH /transactions/{id}/status` - Actualizar estado de una transacción
- [ ] `POST /transactions/{id}/refund` - Procesar reembolso de una transacción

### Endpoints de Reportes
- [ ] `GET /reports/sales/daily` - Reporte de ventas diarias
- [ ] `GET /reports/sales/monthly` - Reporte de ventas mensuales
- [ ] `GET /reports/trips/upcoming` - Reporte de próximos viajes
- [ ] `GET /reports/trips/popularity` - Reporte de popularidad de rutas
- [ ] `GET /reports/clients/top` - Reporte de clientes más frecuentes
- [ ] `GET /reports/occupancy/trip/{trip_id}` - Reporte de ocupación por viaje

## Implementar Funcionalidades de Negocio
- [ ] Gestión de Rutas y Ubicaciones:
  - [ ] Crear rutas con múltiples paradas
  - [ ] Calcular duración total de ruta
  - [ ] Validar coherencia de paradas
  - [ ] Gestionar precios por tramo
  - [ ] Manejar horarios y frecuencias
  - [ ] Implementar búsqueda avanzada de rutas

- [ ] Gestión de Buses:
  - [ ] Implementar herencia SingleDeckBus/DoubleDeckBus
  - [x] Gestionar layout de asientos <!-- Completado -->
  - [ ] Control de mantenimiento
  - [ ] Registro de kilometraje
  - [ ] Asignación inteligente a rutas

- [ ] Gestión de Personal:
  - [x] Asignación de conductores a rutas <!-- Completado -->
  - [ ] Control de horarios y turnos
  - [ ] Gestión de licencias y documentos
  - [ ] Sistema de rotación de personal
  - [ ] Registro de incidencias

- [ ] Gestión de Oficinas:
  - [ ] Asignación de personal
  - [ ] Control de ventas por oficina
  - [ ] Gestión de inventario
  - [ ] Reportes por sucursal
  - [ ] Métricas de rendimiento

## Implementar Sistema de Reservas
- [x] Modelo de Asientos:
  - [x] Diseño flexible por tipo de bus <!-- Completado -->
  - [x] Estado de asientos (libre/ocupado/reservado) <!-- Implementado a través de tickets -->
  - [x] Numeración automática <!-- Completado -->
  - [ ] Precios diferenciados por ubicación
  - [ ] Bloqueo temporal durante reserva

- [ ] Proceso de Reserva:
  - [ ] Validación de disponibilidad en tiempo real
  - [ ] Gestión de timeouts
  - [ ] Confirmación por correo/SMS
  - [ ] Cancelación automática
  - [ ] Políticas de reembolso

## Validaciones y Reglas de Negocio
- [ ] Validaciones de Rutas:
  - [ ] Evitar rutas duplicadas
  - [ ] Validar coherencia origen-destino
  - [ ] Verificar distancias y tiempos
  - [ ] Controlar frecuencias

- [ ] Validaciones de Personal:
  - [ ] Verificar disponibilidad
  - [ ] Controlar horas de trabajo
  - [ ] Validar documentación
  - [ ] Gestionar permisos y vacaciones

- [ ] Validaciones de Buses:
  - [ ] Control de capacidad
  - [ ] Verificación de mantenimiento
  - [ ] Validación de documentos
  - [ ] Control de kilometraje

## Integraciones
- [ ] Sistema de Pagos:
  - [ ] Integrar múltiples pasarelas
  - [ ] Manejo de transacciones
  - [ ] Control de reembolsos
  - [ ] Reportes financieros

- [ ] Notificaciones:
  - [ ] Configurar servidor de correo
  - [ ] Integrar servicio SMS
  - [ ] Notificaciones push
  - [ ] Alertas de sistema

- [ ] Geolocalización:
  - [ ] Integrar servicios de mapas
  - [ ] Calcular rutas óptimas
  - [ ] Tracking de buses
  - [ ] Estimación de llegada

## Reportes y Análisis
- [ ] Reportes Operativos:
  - [ ] Ocupación por ruta
  - [ ] Rendimiento de personal
  - [ ] Estado de flota
  - [ ] Incidencias

- [ ] Reportes Financieros:
  - [ ] Ventas por ruta
  - [ ] Ingresos por oficina
  - [ ] Análisis de costos
  - [ ] Proyecciones

- [ ] Reportes de Rendimiento:
  - [ ] Tiempos de viaje
  - [ ] Puntualidad
  - [ ] Satisfacción cliente
  - [ ] Eficiencia operativa

## Seguridad y Autenticación
- [ ] Implementar sistema de autenticación JWT <!-- Pendiente, pero ya están configuradas las variables de entorno -->
- [ ] Crear modelo y esquemas para usuarios del sistema <!-- Pendiente, pero ya está definido en el diagrama de clases -->
- [ ] Implementar roles y permisos (admin, secretario, etc.) <!-- Pendiente -->
- [ ] Agregar middleware de autenticación <!-- Pendiente -->
- [ ] Implementar endpoints para login/logout <!-- Pendiente -->
- [ ] Agregar protección CORS <!-- Pendiente -->
- [ ] Implementar rate limiting para endpoints públicos <!-- Pendiente -->
- [ ] Agregar validación de tokens <!-- Pendiente -->

## Manejo de Asientos
- [x] Implementar modelo `Seat` para gestión de asientos <!-- Completado -->
- [x] Crear endpoints para gestionar asientos por bus <!-- Completado -->
- [x] Implementar lógica de reserva de asientos a través de tickets <!-- Completado parcialmente -->
- [x] Agregar validación de disponibilidad de asientos <!-- Completado -->
- [ ] Implementar bloqueo temporal de asientos durante reserva

## Gestión de Pagos
- [ ] Integrar pasarela de pagos
- [ ] Implementar webhooks para confirmación de pagos
- [ ] Agregar manejo de transacciones fallidas
- [ ] Implementar sistema de reembolsos
- [ ] Crear endpoints para consulta de estado de pagos

## Validación y Manejo de Errores
- [x] Implementar validación avanzada de datos con Pydantic <!-- Completado -->
- [ ] Crear manejadores de excepciones personalizados
- [ ] Agregar logging de errores
- [ ] Implementar sistema de notificaciones de errores
- [ ] Mejorar mensajes de error para el cliente

## Optimización y Monitoreo
- [ ] Implementar caché para rutas frecuentes
- [ ] Agregar paginación en endpoints que retornan listas
- [ ] Implementar sistema de métricas
- [ ] Optimizar consultas a la base de datos
- [ ] Agregar health checks
- [ ] Implementar sistema de logs centralizado

## Pruebas
- [ ] Escribir pruebas unitarias para cada clase y sus métodos.  <!-- Pendiente -->
- [x] Asegurarse de que las relaciones básicas funcionen correctamente.  <!-- Completado parcialmente -->
- [ ] Implementar tests de integración
- [ ] Agregar tests de rendimiento
- [ ] Crear tests para casos de error
- [ ] Implementar tests de seguridad
- [ ] Configurar CI/CD con Github Actions

## Documentación
- [x] Documentar cada clase y método en el código.  <!-- Completado -->
- [x] Actualizar el archivo `todo.md` con el progreso.  <!-- Completado -->
- [ ] Documentar proceso de despliegue
- [ ] Crear documentación de la API con ejemplos
- [ ] Documentar flujos de negocio principales
- [ ] Agregar diagramas de arquitectura
- [ ] Crear guía de troubleshooting

## DevOps y Despliegue
- [x] Configurar Docker y docker-compose <!-- Completado -->
- [ ] Implementar pipeline de CI/CD
- [ ] Crear scripts de backup de base de datos
- [ ] Configurar monitoreo y alertas
- [ ] Implementar sistema de logs
- [x] Crear scripts de migración de datos <!-- Completado via scripts/db -->
- [ ] Documentar proceso de despliegue
- [x] Configurar variables de entorno para producción <!-- Completado via .env.docker -->

## Funcionalidades Adicionales
- [ ] Implementar sistema de notificaciones
- [ ] Agregar envío de correos electrónicos
- [ ] Implementar sistema de reportes
- [ ] Crear endpoints para estadísticas
- [ ] Agregar búsqueda y filtrado avanzado
- [ ] Implementar sistema de cupones y descuentos
- [ ] Agregar manejo de múltiples monedas

## Próximos Pasos Recomendados

### Prioridad Alta
- [ ] Implementar sistema de autenticación y autorización (JWT)
- [ ] Completar endpoints para paquetes (sender/recipient/trip)
- [ ] Implementar endpoints para buscar viajes por origen/destino/fecha
- [x] Agregar paginación a algunos endpoints que devuelven listas (routes, locations) <!-- Parcialmente completado -->
- [ ] Extender paginación a todos los endpoints restantes
- [ ] Implementar pruebas unitarias para los modelos y endpoints principales

### Prioridad Media
- [ ] Implementar sistema de reservas
- [ ] Agregar endpoints para verificar disponibilidad de asientos
- [ ] Implementar sistema de notificaciones para confirmación de tickets
- [ ] Mejorar validaciones de negocio (conflictos, disponibilidad)
- [ ] Crear documentación detallada de la API

### Prioridad Baja
- [ ] Implementar sistema de pagos
- [ ] Agregar funcionalidades de reportes
- [ ] Implementar sistema de oficinas y secretarios
- [ ] Mejorar la estructura de la base de datos (indices, optimizaciones)
- [ ] Configurar CI/CD para despliegue automático

## Mejoras Recientes Completadas

### Mejoras de Configuración
- [x] Agregar archivo `.python-version` para especificar la versión de Python para uv <!-- Completado -->
- [x] Mejorar el archivo README.md con instrucciones detalladas de instalación y ejecución <!-- Completado -->
- [x] Crear archivo CONTRIBUTING.md con guías para desarrolladores <!-- Completado -->
- [x] Solucionar problemas de importación al clonar el repositorio <!-- Completado -->
- [x] Crear script run.py para facilitar la ejecución del proyecto <!-- Completado -->
- [x] Actualizar archivo todo.md con el estado actual del proyecto <!-- Completado -->

### Mejoras de Arquitectura
- [x] Implementar versionado de API (API Versioning) <!-- Completado -->
- [x] Reorganizar estructura de carpetas para soportar versionado <!-- Completado -->
- [x] Actualizar documentación para reflejar el versionado de la API <!-- Completado -->