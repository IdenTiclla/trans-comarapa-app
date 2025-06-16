# Estados del Sistema - Trans Comarapa

Este documento describe los estados y transiciones de tickets y paquetes en el sistema Trans Comarapa.

## 🎫 Estados de Tickets

### Estados Disponibles

| Estado | Descripción | Color UI | Acciones Permitidas |
|--------|-------------|----------|-------------------|
| `pending` | Ticket reservado, pendiente de confirmación | 🟨 Amarillo | Confirmar, Cancelar |
| `confirmed` | Ticket confirmado y pagado (directo o diferido) | 🟩 Verde | Cancelar, Ver detalles |
| `completed` | Viaje completado (automático) | 🟪 Púrpura | Solo lectura |
| `cancelled` | Ticket cancelado | 🟥 Rojo | Solo lectura |

**Nota**: `confirmed` puede ser un estado inicial (venta directa) o resultado de transición desde `pending` (reserva).

### Flujos de Creación

#### 🏢 Venta Directa en Oficina
- **Estado inicial**: `confirmed`
- **Casos de uso**: Cliente llega con pago inmediato
- **Proceso**: Secretaria crea ticket y procesa pago en el mismo momento
- **Ventaja**: Proceso más rápido, sin estado intermedio

#### 📞 Reserva Previa
- **Estado inicial**: `pending`
- **Casos de uso**: Reservas telefónicas, online, o sin pago inmediato
- **Proceso**: Ticket se crea como reserva, luego se confirma al recibir pago
- **Ventaja**: Permite bloquear asiento sin pago inmediato

### Transiciones Automáticas

- **`confirmed` → `completed`**: Se ejecuta automáticamente cuando el viaje cambia a estado "arrived"
- **Sistema de auditoría**: Todos los cambios se registran en `TicketStateHistory`

### Roles y Permisos

- **Secretaria**: Puede crear, confirmar y cancelar tickets
- **Administrador**: Todos los permisos de secretaria
- **Sistema**: Ejecuta transiciones automáticas

## 📦 Estados de Paquetes

### Estados Disponibles

| Estado | Descripción | Color UI | Acciones Permitidas |
|--------|-------------|----------|-------------------|
| `registered` | Paquete registrado y listo para envío | 🟨 Amarillo | Cancelar, Ver detalles |
| `in_transit` | Paquete en tránsito (viaje en curso) | 🟦 Azul | Marcar como perdido |
| `arrived` | Paquete llegó al destino | 🟪 Púrpura | Marcar como entregado/perdido |
| `delivered` | Paquete entregado exitosamente | 🟩 Verde | Solo lectura |
| `lost` | Paquete perdido durante transporte o en terminal | 🟥 Rojo | Solo lectura |
| `cancelled` | Paquete cancelado antes del envío | 🟥 Rojo | Solo lectura |

### Transiciones Automáticas

- **`registered` → `in_transit`**: Se ejecuta cuando el viaje cambia a estado "departed"
- **`in_transit` → `arrived`**: Se ejecuta automáticamente cuando el viaje llega al destino (estado "arrived")
- **`arrived` → `delivered`**: Requiere acción manual del personal en destino
- **Sistema de auditoría**: Todos los cambios se registran en `PackageStateHistory`

### Probabilidades de Estados (Simulación)

Basado en el archivo de seeding del sistema:

- **Entrega exitosa**: ~95% de los paquetes
- **Pérdida durante transporte**: ~2% de los paquetes
- **Cancelación antes del viaje**: ~3% de los paquetes

## 🏗️ Arquitectura Técnica

### Modelos de Base de Datos

```python
# Ticket States
class TicketState(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed" 
    CANCELLED = "cancelled"
    COMPLETED = "completed"

# Package States
class PackageStatus(str, Enum):
    REGISTERED = "registered"
    IN_TRANSIT = "in_transit"
    ARRIVED = "arrived"
    DELIVERED = "delivered"
    LOST = "lost"
    CANCELLED = "cancelled"
```

### Historial de Estados

Ambos tickets y paquetes mantienen un historial completo de cambios:

```python
class StateHistory:
    old_state: Optional[str]      # Estado anterior (null para creación)
    new_state: str               # Nuevo estado
    changed_at: datetime         # Timestamp del cambio
    changed_by_user_id: int      # Usuario que realizó el cambio
```

### Validaciones de Negocio

1. **No se puede cancelar un ticket `completed`**
2. **No se puede modificar un paquete `delivered` o `lost`**
3. **Los cambios automáticos solo los puede hacer el sistema**
4. **Todos los cambios requieren autenticación**

## 🎨 Interfaz de Usuario

### Componentes Relacionados

- **`SoldTicketsSection.vue`**: Muestra tickets agrupados por estado
- **`PackagesSection.vue`**: Muestra paquetes agrupados por estado
- **`TicketModal.vue`**: Permite cambios de estado en tickets
- **Estados visuales**: Badges de colores según el estado actual

### Iconografía

- **Tickets Pending**: ⏳ Reloj
- **Tickets Confirmed**: ✅ Check
- **Tickets Completed**: 🏁 Bandera
- **Tickets Cancelled**: ❌ X
- **Packages In Transit**: 🚛 Camión
- **Packages Delivered**: ✅ Check
- **Packages Lost**: ❗ Exclamación

## 📊 Métricas y Reportes

El sistema puede generar reportes basados en estados:

- **Eficiencia de entrega**: % de paquetes delivered vs lost
- **Tasa de cancelación**: % de tickets/paquetes cancelled
- **Tiempo promedio en tránsito**: Tiempo entre registered e in_transit
- **Satisfacción del cliente**: Basada en estados finales exitosos

## 🔄 Flujos de Trabajo

### Flujos Normales - Tickets

#### Flujo A: Venta Directa en Oficina
1. Cliente llega a oficina con pago → `confirmed` (directo)
2. Viaje se completa → `completed` (automático)

#### Flujo B: Reserva Previa
1. Cliente solicita reserva → `pending`
2. Secretaria confirma pago → `confirmed`
3. Viaje se completa → `completed` (automático)

### Flujo Normal - Paquete
1. Cliente entrega paquete → `registered`
2. Bus sale de terminal → `in_transit` (automático)
3. Bus llega a destino → `arrived` (automático)
4. Personal entrega al destinatario → `delivered`

### Flujos de Excepción
- **Cancelaciones**: En cualquier momento antes de `completed`/`delivered`
- **Pérdidas**: Para paquetes en estado `in_transit` o `arrived`
- **Cambios de asiento**: Solo para tickets `confirmed`

---

> **Nota**: Este sistema de estados está diseñado para brindar trazabilidad completa y control de calidad en las operaciones de Trans Comarapa.