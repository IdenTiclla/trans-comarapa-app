# Venta a Clientes Existentes

## Descripción
Esta funcionalidad permite vender boletos a clientes que ya están registrados en el sistema, evitando tener que crear un nuevo cliente cada vez y mejorando la eficiencia del proceso de venta.

## Características Implementadas

### 1. Búsqueda de Clientes
- **Búsqueda por CI**: Permite buscar clientes ingresando su número de cédula de identidad
- **Búsqueda por nombre**: Permite buscar por nombre, apellido o nombre completo
- **Búsqueda inteligente**: Combina búsquedas en firstname, lastname y document_id
- **Debounce**: Aplica un retraso de 500ms para evitar consultas innecesarias
- **Límite de resultados**: Máximo 10 resultados para mantener la performance

### 2. Interfaz de Usuario Mejorada
- **Selección de tipo de cliente**: Radio buttons para elegir entre "Cliente Nuevo" y "Cliente Existente"
- **Campo de búsqueda interactivo**: Con iconos visuales que cambian según el estado
- **Resultados en tiempo real**: Lista desplegable con los clientes encontrados
- **Vista previa del cliente seleccionado**: Muestra claramente qué cliente está seleccionado
- **Opción de limpiar selección**: Botón para cambiar de cliente o volver a buscar

### 3. Validación
- **Validación dinámica**: Diferentes validaciones según el tipo de cliente seleccionado
- **Cliente existente**: Solo requiere seleccionar un cliente y método de pago
- **Cliente nuevo**: Requiere nombre, CI y método de pago mínimo

### 4. Gestión de Formulario
- **Autocompletado**: Los datos del cliente seleccionado se cargan automáticamente
- **Campos deshabilitados**: Datos principales del cliente no se pueden editar
- **Datos actualizables**: Información de contacto se puede actualizar durante la venta

## Flujo de Uso

### Para Cliente Existente:
1. Hacer clic derecho en asiento disponible y seleccionar "Vender Boleto"
2. En el modal, seleccionar "Cliente Existente"
3. Escribir parte del nombre o CI del cliente en el campo de búsqueda
4. Seleccionar el cliente correcto de la lista de resultados
5. Verificar/actualizar información de contacto si es necesario
6. Seleccionar método de pago
7. Confirmar la venta

### Para Cliente Nuevo:
1. Hacer clic derecho en asiento disponible y seleccionar "Vender Boleto"
2. Mantener seleccionado "Cliente Nuevo" (opción por defecto)
3. Completar datos del cliente (nombre, apellido, CI, etc.)
4. Seleccionar método de pago
5. Confirmar la venta

## Endpoints de API

### Backend: `/api/v1/clients/search`
- **Método**: GET
- **Parámetros**: 
  - `q`: Término de búsqueda (mínimo 2 caracteres)
- **Respuesta**: Lista de clientes que coinciden con el criterio de búsqueda

```json
GET /api/v1/clients/search?q=juan

[
  {
    "id": 1,
    "firstname": "Juan",
    "lastname": "Pérez",
    "document_id": "1234567",
    "phone": "70123456",
    "email": "juan@email.com",
    "address": "Calle Principal 123",
    "city": "Comarapa",
    "state": "Santa Cruz"
  }
]
```

## Beneficios

1. **Eficiencia**: Evita duplicar clientes en el sistema
2. **Historial**: Mantiene un registro completo de compras por cliente
3. **Experiencia de usuario**: Búsqueda rápida y intuitiva
4. **Datos consistentes**: Reduce errores en información del cliente
5. **Performance**: Búsqueda optimizada con límites y debounce

## Consideraciones Técnicas

- **Debounce**: Previene consultas excesivas durante la escritura
- **Validación**: Diferentes validaciones según el tipo de cliente
- **Gestión de estado**: Limpieza automática de formularios al cambiar entre tipos
- **Manejo de errores**: Mensajes claros para casos sin resultados o errores de API
- **Responsive**: Interfaz adaptada para diferentes tamaños de pantalla

## Futuras Mejoras

1. **Búsqueda por múltiples campos**: Email, teléfono, dirección
2. **Favoritos**: Marcar clientes frecuentes para acceso rápido
3. **Historial de compras**: Ver boletos anteriores del cliente en el modal
4. **Autocompletado avanzado**: Sugerencias mientras se escribe
5. **Filtros**: Por ciudad, estado, o fecha de último viaje 