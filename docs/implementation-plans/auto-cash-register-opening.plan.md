# Plan de Implementación: Flujo Interceptado de Apertura de Caja

## Contexto y Objetivo
Se busca simplificar la experiencia de la secretaria al momento de vender. En lugar de bloquear la interfaz o mostrar mensajes restrictivos obligando a ir a otra pantalla cuando no hay una caja abierta, el sistema le permitirá intentar la venta con normalidad. Si no existe una caja abierta, el sistema la pausará un segundo mostrando un modal pidiendo la cantidad inicial ("Fondo de Cambio"), abrirá la caja, e inmediatamente continuará con la venta sin perder su trabajo.

## Cambios Propuestos

### Mantenimiento de la Arquitectura Backend
- **El Backend se mantiene estricto:** No se alterarán los servicios del backend (`ticket_service.py`, `package_service.py`), seguirán exigiendo que exista una "Caja Abierta" para proteger la integridad de los datos.

### Interceptor Visual (Frontend-React)

#### [MODIFY] Eliminación de Bloqueos Previos en UI
- **Desbloquear Botones:** En componentes como `PackageDeliveryModal.tsx`, `TripTicketsView.tsx` y `PackageReceptionModal.tsx`, los botones de "Vender" o "Cobrar" dejarán de estar deshabilitados si la caja localmente parece cerrada.
- **Remover Letreros Rojos:** Se eliminarán los textos disuasorios como *"Debe abrir caja antes de cobrar este paquete..."* para no abrumar al usuario.

#### [MODIFY] Lógica de Intercepción al Vender
1. **Verificación Just-in-Time:** Al dar clic en "Cobrar/Vender", el controlador de la vista verificará el estado de `isRegisterOpen`.
2. **Despliegue del Modal:** Si la caja está cerrada, se invocará el modal existente `OpenRegisterModal.tsx` o similar, poniéndolo sobre la venta actual, preguntando únicamente el **Monto Inicial**.
3. **Reanudación Automática:** Al darle "Confirmar" al monto inicial, el Frontend llamará a la API para abrir la caja e inmediatamente después, de forma transparente, gatillará la petición de la venta/cobro que estaba pendiente.

## Proceso de Verificación

### Pruebas Manuales y E2E
1. Iniciar sesión con una caja cerrada.
2. Llenar los datos para vender un boleto o cobrar una encomienda.
3. Presionar "Vender".
4. Confirmar que aparece el modal solicitando el fondo inicial.
5. Ingresar un monto `X` y presionar confirmar.
6. Validar que la caja se abrió con el monto `X` y que en el mismo instante el boleto fue emitido correctamente sin obligar al usuario a volver a tipear información.
