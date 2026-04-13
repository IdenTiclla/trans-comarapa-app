# Plan de Implementación: Manifiesto de Encomiendas

## Objetivo
Implementar una nueva vista para imprimir el manifiesto de encomiendas de un viaje, accesible desde un nuevo botón en la página de detalles del viaje, y mejorar la claridad de los botones existentes.

## Revisión de Mapeo de Datos
A continuación detallamos cómo mapearemos los datos del sistema a las columnas de la tabla, en el siguiente orden:
- **Nº**: Número correlativo de fila (1, 2, 3...).
- **REMITENTE**: Nombre del remitente (`sender_name`).
- **DESCRIPCIÓN ENCOMIENDA**: Una descripción de la carga basándose en los ítems de la encomienda.
- **DESTINATARIO**: Nombre del destinatario (`recipient_name`). *(antes llamado "Nombre")*
- **ESTADO**: Estado de pago de la encomienda. Puede ser **"Pagado"** o **"Por Pagar"**, derivado del campo `payment_status` del paquete.
- **Bs.**: Precio total (`total_amount`).

> **Nota:** La columna **FIRMA** ha sido eliminada del diseño. Ya no se incluirá espacio para firma en el manifiesto imprimible.

## Cambios Propuestos

### 1. Modificación de la UI del Viaje
**Archivo**: `frontend-react/src/pages/trips/TripDetailPage.tsx`
- Renombrar el texto del botón actual "Planilla" a "Planilla de pasajeros".
- Añadir un nuevo componente `Button` y `Link` a su lado derecho etiquetado "Manifiesto de encomiendas", utilizando el ícono `Package` (lucide-react).
- El enlace apuntará a `/trips/${tripId}/packages-manifest`, abriéndose con `target="_blank"`.

### 2. Actualización de Rutas
**Archivo**: `frontend-react/src/router/index.tsx`
- Se debe añadir la nueva ruta al arreglo de componentes para impresión, dentro de `PrintLayout`:
  `{ path: '/trips/:id/packages-manifest', lazy: () => import('@/pages/trips/TripPackagesManifestPage') }`
- Esto garantiza que la cabecera y barra lateral de la app base no se rindan en esta vista.

### 3. Creación de la Vista Imprimible
**Archivo nuevo**: `frontend-react/src/pages/trips/TripPackagesManifestPage.tsx`
- Será un clon funcional ajustado de `TripSheetPage.tsx`.
- Utilizará hooks de estado y selectores (`useAppSelector`) o `apiFetch` para cargar los detalles del viaje (`trip`) y las encomiendas asociadas al viaje (`/packages/by-trip/${tripId}`).
- Utilizará Media Queries (`@media print`) para forzar un diseño apaisado limpio, sin los bordes convencionales del navegador.
- Incorporará en el encabezado toda la data estática mostrada en la foto, como 'Ruta', 'Fecha', 'Conductor', etc.
- Renderizará la tabla de encomiendas con las columnas en el siguiente **orden definitivo**:

| # | Columna | Fuente de dato |
|---|---------|----------------|
| 1 | Nº | Correlativo |
| 2 | Remitente | `sender_name` |
| 3 | Descripción Encomienda | ítems del paquete |
| 4 | Destinatario | `recipient_name` |
| 5 | Estado | `payment_status` → "Pagado" / "Por Pagar" |
| 6 | Bs. | `total_amount` |

- La columna **Estado** debe mostrarse con una etiqueta visual distintiva: fondo verde claro para "Pagado" y fondo amarillo claro para "Por Pagar", tanto en pantalla como en impresión (`print-color-adjust: exact`).
