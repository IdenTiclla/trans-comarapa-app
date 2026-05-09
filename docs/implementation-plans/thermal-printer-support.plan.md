# Plan de Implementación: Soporte para Impresoras Térmicas (Tiqueteras)

## Objetivo

Adaptar el sistema de impresión de tickets de viaje y recibos de encomienda para que soporte la impresión en máquinas térmicas (tiqueteras), utilizando formatos de rollo continuo estandarizados (como 80mm o 58mm). Esto optimizará los costos de papel y agilizará el proceso de entrega de comprobantes a los clientes, reemplazando la impresión en hojas tamaño A4 o Carta.

---

## 1. Contexto y Consideraciones

Actualmente, el sistema genera vistas o documentos que el navegador asume por defecto en tamaño A4 o Carta al momento de imprimir. Las impresoras térmicas tienen características únicas que requieren una interfaz y diseño adaptado:

*   **Ancho restringido:** El área de impresión es muy estrecha (ej. 72mm reales para un rollo de 80mm).
*   **Largo dinámico:** El papel es continuo; no hay "saltos de página" fijos como en hojas sueltas.
*   **Monocromático:** Solo imprimen en negro (o escalas de grises simuladas por punteado). Los colores, sombras y degradados se ven mal o causan artefactos en la impresión.
*   **Velocidad:** Se requiere cargar el mínimo de gráficos complejos para que la impresión sea instantánea.

---

## 2. Cambios Propuestos

### Fase 1: Componentes Alternativos (Frontend)

1.  **Crear Componentes Específicos para Tiqueteras:**
    *   `frontend/src/components/tickets/ThermalTicket.tsx` (Para pasajes).
    *   `frontend/src/components/packages/ThermalReceipt.tsx` (Para encomiendas).
2.  **Diseño Simplificado:**
    *   Remover fondos, bordes complejos y sombras.
    *   Cambiar toda la paleta a alto contraste (blanco y negro estricto).
    *   Organizar la información en un layout de una sola columna vertical.
    *   Aumentar la legibilidad usando tipografías claras (ej. sans-serif gruesas) y tamaños de fuente más grandes y legibles.

### Fase 2: Adaptación de Impresión (CSS)

1.  **Reglas `@media print`:**
    *   Definir el tamaño de la página específicamente para impresoras térmicas.
        ```css
        @media print {
          @page {
            size: 80mm auto; /* O 58mm dependiendo del hardware que se elija */
            margin: 0;
          }
          /* Ocultar elementos de UI no imprimibles (botones, navegación) */
          .no-print { display: none; }
          /* Reset de fondos y colores a B/N */
        }
        ```
2.  **Generación de QR/Código de Barras:**
    *   Integrar un componente generador de códigos QR (ej. `react-qr-code`) o código de barras optimizado para un ancho pequeño. Esto facilitará el escaneo rápido en ventanilla y en el abordaje.

### Fase 3: Configuración y UI (Frontend/Backend)

1.  **Preferencias de Usuario/Sucursal:**
    *   Agregar un ajuste en el perfil de la sucursal o del usuario para elegir el formato de impresión preferido ("A4/Carta" vs "Térmica 80mm").
    *   Guardar esta preferencia en la base de datos y/o `localStorage` (`frontend/src/store/user.slice.ts` o equivalente).
2.  **Selector de Formato al Imprimir:**
    *   En las modales de emisión o acciones de "Imprimir", mostrar un pequeño _toggle_ rápido por si ocasionalmente necesitan cambiar el formato (ej. el cliente insiste en tamaño grande).
    *   El sistema renderizará el `<TicketA4 />` o el `<ThermalTicket />` basándose en esta preferencia antes de llamar a `window.print()`.

### Fase 4 (Opcional): Generación PDF Backend

_Nota: Si la impresión se maneja actualmente generando PDFs en el backend (FastAPI) en lugar de usar `window.print()` en el navegador, se deben aplicar los siguientes cambios:_

1.  **Modificar Servicio de Reportes:**
    *   Ajustar el servicio generador (ej. ReportLab, WeasyPrint, pdfkit) para aceptar un parámetro de `paper_format` (ej. `A4` o `THERMAL_80MM`).
    *   Generar un PDF con `width: 80mm` y `height` calculado en base a la longitud del contenido (dinámico).

---

## 3. Plan de Verificación

1.  **Emulación de Impresión:**
    *   Usar DevTools del navegador (Chrome > Rendering > Emulate CSS media type > print) para revisar en pantalla que el diseño de `80mm` se vea correctamente y sin desbordes horizontales.
2.  **Pruebas Físicas (Hardware):**
    *   Requerirá disponer de al menos una impresora térmica de 80mm real instalada en un equipo de pruebas para confirmar márgenes reales, cortes de papel automático (esc_pos) si los hubiera, y claridad del código QR.
3.  **UI Testing:**
    *   Verificar que al cambiar las preferencias de formato, el comprobante generado cambie automáticamente entre la versión A4 y la versión Térmica al llamar a la impresión.

---

## 4. Preguntas Abiertas

> [!IMPORTANT]
> 1. **Tamaño de Papel**: ¿Se comprarán impresoras de 80mm o 58mm? (80mm es lo más recomendable para tickets detallados como encomiendas).
> 2. **Hardware Específico**: ¿Hay algún modelo particular en mente? (Algunos modelos económicos requieren márgenes específicos).
> 3. **Método Actual**: ¿La impresión de boletos y recibos actualmente usa `window.print()` del navegador o se descarga un PDF generado en el backend?
