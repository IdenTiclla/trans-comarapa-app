# Lista de Tareas para Implementación

## Introducción

Este documento detalla las tareas pendientes, mejoras y recomendaciones para el desarrollo del backend de la aplicación Trans Comarapa, una plataforma de gestión de transporte de pasajeros y paquetes. El backend está desarrollado con FastAPI y SQLAlchemy.

La aplicación tiene como objetivo principal facilitar la gestión de viajes, venta de boletos, seguimiento de paquetes y generación de reportes para la empresa de transporte. Este documento servirá como guía para el desarrollo y mantenimiento del proyecto.

## Estado Actual del Proyecto

El proyecto ha avanzado significativamente en la implementación de los modelos principales y sus endpoints correspondientes. Se ha implementado la estructura base de la API con versionado (v1) y se han creado los CRUD básicos para la mayoría de las entidades principales.

Se ha completado:
- Modelos y endpoints para clientes, conductores, asistentes, buses, asientos, ubicaciones, rutas, viajes, boletos y paquetes
- Relaciones entre las entidades principales
- Estructura de carpetas organizada para modelos, rutas, esquemas y utilidades
- Configuración de Docker y entorno de desarrollo

Pendiente de implementar:
- Gestión de oficinas y secretarios
- Sistema de reservas
- Gestión de pagos y transacciones
- Reportes y estadísticas

Parcialmente implementado:
- Sistema de autenticación y autorización (JWT implementado con lista negra de tokens)

## Definir Clases y Modelos
- [x] Implementar la clase `Client`.  <!-- Completado -->
- [x] Implementar la clase `Ticket`.  <!-- Completado -->
- [x] Implementar la clase `Trip`.  <!-- Completado -->
- [x] Implementar la clase `Route`.  <!-- Completado -->
- [x] Implementar la clase `Location`.  <!-- Completado -->
- [x] Implementar la clase `Bus`.  <!-- Completado -->
- [ ] Implementar las clases `SingleDeckBus` y `DoubleDeckBus`.  <!-- Pendiente -->
- [ ] Implementar la clase `Reservation`.  <!-- Pendiente -->
- [x] Implementar la clase `Package`.  <!-- Completado -->
- [ ] Implementar la clase `Office`.  <!-- Pendiente -->
- [x] Implementar la clase `Secretary`.  <!-- Completado pero sin endpoints funcionales -->
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
- [x] Definir las relaciones entre `Trip` y `Secretary`.  <!-- Completado en el modelo -->
- [x] Definir las relaciones entre `Route` y `Location`.  <!-- Completado -->
- [x] Definir las relaciones entre `Package` y `Trip`.  <!-- Completado -->
- [x] Definir las relaciones entre `Secretary` y `Ticket`.  <!-- Completado en el modelo -->
- [x] Definir las relaciones entre `Secretary` y `Package`.  <!-- Completado en el modelo -->
- [x] Definir las relaciones entre `Secretary` y `Trip`.  <!-- Completado en el modelo -->
- [ ] Definir las relaciones entre `Secretary` y `Office`.  <!-- Pendiente -->
- [ ] Definir las relaciones entre `Transaction` y `PaymentMethod`.  <!-- Pendiente -->
- [x] Definir las relaciones entre `Ticket` y `Seat`.  <!-- Completado -->
- [x] Definir las relaciones entre `Seat` y `Bus`.  <!-- Completado -->

## Implementar Funcionalidades Básicas (CRUD)
- [x] Implementar CRUD completo para Client (Passenger):
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Endpoints adicionales (tickets por cliente)  <!-- Completado -->
- [x] Implementar CRUD completo para Driver:
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
- [x] Implementar CRUD completo para Assistant:
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
- [x] Implementar CRUD completo para Bus:
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Endpoints adicionales (asientos por bus)  <!-- Completado -->
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
- [x] Implementar CRUD completo para Secretary:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Implementado pero sin validación de Office -->
  - [x] Read (list & get by id)  <!-- Implementado pero sin funcionalidad completa -->
  - [x] Update (patch)  <!-- Implementado pero sin validación completa -->
  - [x] Delete  <!-- Implementado pero sin validación completa -->
  - [ ] Asignación a Office  <!-- Pendiente -->
- [x] Implementar CRUD completo para Seats:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Endpoints adicionales (asientos por viaje)  <!-- Completado -->
- [x] Implementar CRUD completo para Tickets:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (put)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
  - [x] Endpoints adicionales (tickets por viaje, cliente, asiento)  <!-- Completado -->
- [x] Implementar CRUD completo para Trip:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->
- [x] Implementar CRUD completo para Package:
  - [x] Modelo y esquema  <!-- Completado -->
  - [x] Create  <!-- Completado -->
  - [x] Read (list & get by id)  <!-- Completado -->
  - [x] Update (patch)  <!-- Completado -->
  - [x] Delete  <!-- Completado -->

## Lista de Endpoints Implementados y Pendientes

### Endpoints de Autenticación y Usuarios
- [x] `POST /api/v1/auth/login` - Autenticación de usuarios <!-- Completado -->
- [x] `POST /api/v1/auth/refresh` - Refrescar token JWT <!-- Completado -->
- [x] `POST /api/v1/auth/logout` - Cerrar sesión <!-- Completado con lista negra de tokens -->
- [x] `GET /api/v1/auth/me` - Obtener información del usuario actual <!-- Completado -->
- [x] `PUT /api/v1/auth/me` - Actualizar información del usuario actual <!-- Completado -->
- [x] `POST /api/v1/auth/register` - Registrar nuevo usuario <!-- Completado -->
- [ ] `POST /api/v1/auth/reset-password` - Solicitar restablecimiento de contraseña <!-- Pendiente -->
- [ ] `POST /api/v1/auth/reset-password/{token}` - Confirmar restablecimiento de contraseña <!-- Pendiente -->
- [x] `POST /api/v1/auth/users` - Crear nuevo usuario (admin) <!-- Completado -->
- [ ] `GET /api/v1/users` - Listar usuarios (admin) <!-- Pendiente -->
- [ ] `GET /api/v1/users/{id}` - Obtener usuario por ID (admin) <!-- Pendiente -->
- [ ] `PUT /api/v1/users/{id}` - Actualizar usuario por ID (admin) <!-- Pendiente -->
- [ ] `DELETE /api/v1/users/{id}` - Eliminar usuario (admin) <!-- Pendiente -->
- [ ] `PATCH /api/v1/users/{id}/role` - Cambiar rol de usuario (admin) <!-- Pendiente -->

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
- [x] `GET /seats/trip/{trip_id}` - Listar asientos para un viaje <!-- Completado -->
- [x] `GET /tickets/seat/{seat_id}` - Listar tickets asociados a un asiento <!-- Completado -->

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
- [x] `GET /tickets/trip/{trip_id}` - Listar tickets para un viaje <!-- Completado -->
- [x] `GET /seats/trip/{trip_id}` - Listar asientos para un viaje <!-- Completado -->
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
- [x] `POST /secretaries` - Crear secretario <!-- Implementado pero sin validación completa -->
- [x] `GET /secretaries` - Listar secretarios <!-- Implementado pero sin funcionalidad completa -->
- [x] `GET /secretaries/{id}` - Obtener secretario por ID <!-- Implementado pero sin funcionalidad completa -->
- [x] `PUT /secretaries/{id}` - Actualizar secretario <!-- Implementado pero sin validación completa -->
- [x] `DELETE /secretaries/{id}` - Eliminar secretario <!-- Implementado pero sin validación completa -->
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
- [x] Implementar sistema de autenticación JWT <!-- Completado -->
- [x] Configurar esquema OAuth2PasswordBearer <!-- Completado -->
- [x] Configurar esquema HTTPBearer para soporte directo de tokens <!-- Completado -->
- [x] Personalizar el esquema OpenAPI para incluir múltiples esquemas de autenticación <!-- Completado -->
- [x] Crear modelo y esquemas para usuarios del sistema <!-- Completado -->
- [x] Implementar roles y permisos básicos (admin, usuario) <!-- Completado -->
- [x] Adaptar función get_current_user para verificar roles <!-- Completado -->
- [ ] Integrar el sistema de autenticación con el modelo Secretary <!-- Pendiente -->
- [ ] Proteger todos los endpoints existentes con autenticación <!-- Pendiente -->
- [ ] Agregar middleware de autenticación <!-- Pendiente -->
- [x] Implementar endpoints para login/logout <!-- Completado -->
- [ ] Agregar protección CORS <!-- Pendiente -->
- [ ] Implementar rate limiting para endpoints públicos <!-- Pendiente -->
- [x] Crear sistema de registro de nuevos usuarios <!-- Completado -->
- [ ] Implementar sistema de recuperación de contraseñas <!-- Pendiente -->
- [x] Agregar validación de tokens <!-- Completado con lista negra de tokens -->
- [x] Implementar refrescado de tokens <!-- Completado -->
- [x] Configurar expiración de tokens apropiada para el contexto de negocio <!-- Completado -->
- [ ] Crear documentación detallada sobre el flujo de autenticación <!-- Pendiente -->
- [ ] Implementar pruebas para el sistema de autenticación <!-- Pendiente -->



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

## Próximos Pasos Recomendados (Por Prioridad)

### Prioridad Alta (Inmediata)

1. **Completar Sistema de Autenticación y Autorización**:
   - [x] Configurar JWT para autenticación segura
   - [x] Implementar múltiples esquemas de autenticación (OAuth2 y HTTPBearer)
   - [x] Implementar endpoints de login/logout
   - [x] Implementar lista negra de tokens para logout
   - [x] Definir roles y permisos básicos (admin, usuario)
   - [ ] Adaptar sistema para trabajar con el modelo Secretary
   - [ ] Integrar con el flujo de negocio existente
   - [ ] Proteger los endpoints existentes

2. **Completar Endpoints Relacionales Pendientes**:
   - [ ] Implementar endpoints para paquetes por remitente/destinatario/viaje
   - [ ] Crear endpoints para listar viajes por ruta
   - [x] Implementar endpoints para listar tickets por secretario

3. **Mejorar Validaciones y Manejo de Errores**:
   - [ ] Implementar validaciones de negocio más robustas
   - [ ] Crear manejadores de excepciones personalizados
   - [ ] Mejorar mensajes de error para el cliente

### Prioridad Media (Corto Plazo)

4. **Implementar Sistema de Reservas**:
   - Crear modelo y endpoints para reservas
   - Implementar lógica de bloqueo temporal de asientos
   - Desarrollar proceso de confirmación/cancelación

5. **Optimizar Rendimiento**:
   - Extender paginación a todos los endpoints restantes
   - Implementar caché para consultas frecuentes
   - Optimizar consultas a la base de datos

6. **Implementar Pruebas**:
   - Crear pruebas unitarias para modelos
   - Implementar pruebas de integración para endpoints
   - Configurar CI/CD para ejecución automática de pruebas

### Prioridad Baja (Mediano Plazo)

7. **Implementar Sistema de Pagos**:
   - Crear modelos y endpoints para métodos de pago y transacciones
   - Integrar con pasarelas de pago
   - Implementar sistema de reembolsos

8. **Desarrollar Sistema de Reportes**:
   - Crear endpoints para reportes de ventas
   - Implementar estadísticas de ocupación
   - Desarrollar reportes de rendimiento

9. **Completar Sistema de Oficinas**:
   - Implementar modelo y endpoints para oficinas
   - Mejorar la gestión de secretarios
   - Crear reportes por oficina

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

## Conclusión

Este documento representa una hoja de ruta completa para el desarrollo del backend de Trans Comarapa. Las tareas están organizadas por áreas funcionales y prioridades para facilitar la planificación y ejecución del proyecto.

El proyecto ha avanzado significativamente, con la implementación de los modelos principales y sus endpoints CRUD correspondientes. Las próximas etapas se centrarán en la implementación de autenticación, mejora de las validaciones, y desarrollo de funcionalidades más avanzadas como reservas, pagos y reportes.

Es importante revisar y actualizar este documento regularmente a medida que el proyecto evoluciona. Las prioridades pueden cambiar según los requisitos del negocio y el feedback de los usuarios.

### Próxima Revisión

Fecha: [Definir fecha para la próxima revisión]

### Historial de Actualizaciones

- **07/04/2024**: Actualización completa del documento con el estado actual del proyecto
- **05/04/2024**: Agregadas mejoras de arquitectura (versionado de API)
- **24/03/2024**: Creación inicial del documento

## Resumen de Tareas

### Modelos y Relaciones
- Tareas completadas: 25
- Tareas pendientes: 10

### Funcionalidades CRUD
- Tareas completadas: 48
- Tareas pendientes: 12

### Endpoints
- Tareas completadas: 53
- Tareas pendientes: 111

### Funcionalidades de Negocio
- Tareas completadas: 3
- Tareas pendientes: 42

### Seguridad y Autenticación
- Tareas completadas: 12
- Tareas pendientes: 8

### Mejoras y Configuración
- Tareas completadas: 9
- Tareas pendientes: 0

### Total
- **Tareas completadas: 150**
- **Tareas pendientes: 183**