# Diagrama de Casos de Uso del Secretario - Sistema Trans Comarapa

Este diagrama muestra los casos de uso específicos para el rol de Secretario en el sistema Trans Comarapa, que es el rol que se está implementando actualmente en el frontend.

## Diagrama

```mermaid
flowchart TD
    %% Actor principal
    Secretario[Secretario]

    %% Subgrupos de casos de uso por área funcional

    subgraph "Gestión de Viajes"
      V1[Consultar Viajes]
      V2[Crear Viaje]
      V3[Modificar Viaje]
      V4[Cancelar Viaje]
      V5[Despachar Viaje]
      V6[Imprimir Planilla de Asientos Vendidos]
    end

    subgraph "Gestión de Boletos"
      B1[Vender Boleto]
      B2[Reservar Asiento]
      B3[Cancelar Reserva]
      B4[Cambiar Asiento]
      B5[Reembolsar Boleto]
      B6[Imprimir Boleto]
    end

    subgraph "Gestión de Paquetes"
      P1[Registrar Paquete]
      P2[Consultar Paquete]
      P3[Entregar Paquete]
      P4[Imprimir Guía Individual de Paquete]
      P5[Imprimir Guía de Encomiendas del Viaje]
    end

    subgraph "Gestión de Clientes"
      C1[Registrar Cliente]
      C2[Buscar Cliente]
      C3[Actualizar Cliente]
    end

    subgraph "Gestión de Pagos"
      G1[Procesar Pago]
      G2[Generar Factura]
      G3[Anular Factura]
      G4[Registrar Reembolso]
    end

    subgraph "Reportes"
      R1[Reporte de Ventas Diarias]
      R2[Reporte de Viajes]
      R3[Reporte de Paquetes]
      R4[Imprimir Planilla de Asientos Vendidos]
    end

    subgraph "Autenticación"
      A1[Iniciar Sesión]
      A2[Cerrar Sesión]
      A3[Cambiar Contraseña]
    end

    %% Conexiones directas: Secretario a cada caso de uso
    Secretario --> V1
    Secretario --> V2
    Secretario --> V3
    Secretario --> V4
    Secretario --> V5
    Secretario --> V6

    Secretario --> B1
    Secretario --> B2
    Secretario --> B3
    Secretario --> B4
    Secretario --> B5
    Secretario --> B6

    Secretario --> P1
    Secretario --> P2
    Secretario --> P3
    Secretario --> P4
    Secretario --> P5

    Secretario --> C1
    Secretario --> C2
    Secretario --> C3

    Secretario --> G1
    Secretario --> G2
    Secretario --> G3
    Secretario --> G4

    Secretario --> R1
    Secretario --> R2
    Secretario --> R3
    Secretario --> R4

    Secretario --> A1
    Secretario --> A2
    Secretario --> A3

    %% Relaciones entre casos de uso (para aclarar dependencias funcionales)
    B1 --> G1
    B1 --> G2
    B5 --> G4
    P1 --> G1
    P1 --> G2

    note right of B1
      El secretario puede vender boletos a clientes existentes
      o registrar un nuevo cliente durante la venta.
    end note
```

## Descripción de Casos de Uso del Secretario

### Gestión de Viajes
- **Consultar Viajes**: Ver la lista de viajes programados, filtrar por fecha, ruta, etc.
- **Crear Viaje**: Programar un nuevo viaje especificando ruta, fecha, hora, bus, conductor y asistente.
- **Modificar Viaje**: Actualizar información de un viaje existente (cambiar horario, bus, personal, etc.).
- **Cancelar Viaje**: Marcar un viaje como cancelado y gestionar la notificación a pasajeros.
- **Despachar Viaje**: Registrar la salida de un viaje, confirmar pasajeros y paquetes.
- **Imprimir Planilla de Asientos Vendidos**: Generar e imprimir una lista de todos los asientos vendidos para un viaje específico, incluyendo información relevante de los pasajeros.

### Gestión de Boletos
- **Vender Boleto**: Procesar la venta de un boleto a un cliente, asignar asiento y cobrar.
- **Reservar Asiento**: Apartar un asiento para un cliente sin completar el pago.
- **Cancelar Reserva**: Anular una reserva de asiento que no fue confirmada.
- **Cambiar Asiento**: Modificar el asiento asignado en un boleto ya vendido.
- **Reembolsar Boleto**: Procesar la devolución del dinero por un boleto cancelado.
- **Imprimir Boleto**: Generar e imprimir un boleto físico para el cliente.

### Gestión de Paquetes
- **Registrar Paquete**: Ingresar información de un paquete para envío (remitente, destinatario, peso, etc.).
- **Consultar Paquete**: Verificar el estado y ubicación de un paquete en tránsito.
- **Entregar Paquete**: Registrar la entrega de un paquete al destinatario.
- **Imprimir Guía Individual de Paquete**: Generar e imprimir la guía de envío para un paquete específico, tanto al recibirlo como al entregarlo.
- **Imprimir Guía de Encomiendas del Viaje**: Al despachar un viaje, generar e imprimir una guía/listado con todos los paquetes de encomiendas asociados a ese viaje.

### Gestión de Clientes
- **Registrar Cliente**: Crear un nuevo registro de cliente en el sistema.
- **Buscar Cliente**: Localizar información de un cliente existente.
- **Actualizar Cliente**: Modificar datos de contacto u otra información de un cliente.

### Gestión de Pagos
- **Procesar Pago**: Registrar y procesar un pago por boleto o envío de paquete.
- **Generar Factura**: Crear un comprobante fiscal de pago para el cliente.
- **Anular Factura**: Cancelar una factura emitida por error o devolución.
- **Registrar Reembolso**: Procesar la devolución de dinero por cancelación.

### Reportes
- **Reporte de Ventas Diarias**: Generar un informe de las ventas realizadas en el día.
- **Reporte de Viajes**: Crear informes sobre los viajes programados o realizados.
- **Reporte de Paquetes**: Generar informes sobre los paquetes enviados o recibidos.
- **Imprimir Planilla de Asientos Vendidos**: Generar e imprimir una lista de todos los asientos vendidos para un viaje específico, incluyendo información relevante de los pasajeros.

### Autenticación
- **Iniciar Sesión**: Autenticarse en el sistema con credenciales de secretario.
- **Cerrar Sesión**: Finalizar la sesión en el sistema.
- **Cambiar Contraseña**: Actualizar la contraseña de acceso al sistema.

## Estado de Implementación Actual

Actualmente, el frontend está implementando las siguientes funcionalidades para el rol de Secretario:

- ✅ Iniciar Sesión
- ✅ Cerrar Sesión
- ✅ Consultar Viajes
- ✅ Visualizar detalles de Viajes
- ✅ Visualización de asientos
- ⏳ Vender Boleto (en progreso)
- ⏳ Crear Viaje (en progreso)
- ⏳ Modificar Viaje (en progreso)
- ❌ Gestión de Paquetes (pendiente)
- ❌ Reportes (pendiente)

Las próximas iteraciones se centrarán en completar la gestión de boletos, implementar la gestión de paquetes y desarrollar los reportes necesarios para el secretario.
