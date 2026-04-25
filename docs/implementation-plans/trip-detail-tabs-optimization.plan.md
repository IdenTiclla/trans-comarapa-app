# Plan: Optimización de Página de Detalle de Viaje (Tabs & Sidebar)

## Contexto

La página de **Detalle de Viaje** (`TripDetailPage.tsx`) presenta actualmente un problema de usabilidad debido al "scroll infinito" vertical. Al apilarse la información del viaje, el mapa de asientos del bus y el listado de encomiendas, la página se vuelve extremadamente larga, especialmente en buses de dos pisos o viajes con muchas encomiendas.

## Objetivos

1. **Reducir el scroll vertical** mediante el uso de pestañas para separar responsabilidades.
2. **Mejorar la densidad de información** utilizando un layout de dos columnas en escritorio.
3. **Mantener la operatividad** asegurando que las acciones críticas (Despachar, Imprimir) estén siempre accesibles.

## Alcance

- Implementación de un sistema de pestañas (Tabs) para separar "Asientos" de "Encomiendas".
- Reestructuración del layout principal a dos columnas en pantallas grandes (`lg`+).
- Conversión de la tarjeta de información del viaje en un sidebar fijo/sticky.
- Asegurar que el `FloatingSeatsPanel` siga funcionando correctamente dentro de la pestaña de asientos.
- Modernización estética del `FloatingSeatsPanel` (Glassmorphism, variables de tema y a11y).

---

## Fase 1 — Estructura de Pestañas

**Objetivo:** Dividir el contenido central en secciones lógicas.

1. **Definir Tabs:**
   - **Tab 1: Asientos & Venta**: Contiene el `BusSeatMapPrint`. Es la vista por defecto.
   - **Tab 2: Encomiendas**: Contiene el `TripPackagesSection`.
   - **Tab 3: Detalles & Staff**: Contiene la gestión de choferes/ayudantes y estadísticas detalladas.

2. **Implementación en `TripDetailPage.tsx`:**
   - Importar `Tabs, TabsList, TabsTrigger, TabsContent` de `@/components/ui/tabs`.
   - Envolver el contenido actual (líneas 156-188) en la estructura de Tabs.
   - Hacer que la pestaña seleccionada persista opcionalmente en la URL (query param `?tab=...`) para facilitar el refresco de página.

## Fase 2 — Layout de Dos Columnas (Desktop)

**Objetivo:** Aprovechar el espacio horizontal en pantallas grandes.

1. **Reestructuración del Grid:**
   - Cambiar el contenedor principal a un grid: `grid grid-cols-1 lg:grid-cols-4 gap-6`.
   - **Columna Izquierda (Main - `lg:col-span-3`):** Contiene el sistema de Tabs.
   - **Columna Derecha (Sidebar - `lg:col-span-1`):** Contiene la `TripInfoCard`.

2. **Sidebar Sticky:**
   - Aplicar `sticky top-24` a la columna derecha para que la información del viaje acompañe el scroll del mapa de asientos o la lista de paquetes.

## Fase 3 — Refactor de `TripInfoCard`

**Objetivo:** Adaptar la tarjeta de información para el formato sidebar.

1. **Variante Sidebar:**
   - Modificar `TripInfoCard` para que sea más vertical y compacta.
   - Mover las acciones (botones de Despachar/Imprimir) a la parte superior de la tarjeta o a un bloque de acciones dedicado en el sidebar.
   - La sección de Ocupación debe verse bien en un ancho más estrecho.

## Fase 4 — Pulido y Accesibilidad

1. **Sticky Tab Bar:**
   - Asegurar que los botones de las pestañas sean pegajosos (`sticky top-0` o debajo del banner de cambio de asiento) para cambiar de contexto rápidamente.
2. **A11y:**
   - Verificar que los `TabsTrigger` tengan los roles correctos y sean navegables por teclado.
   - Asegurar que el cambio de pestaña no rompa el foco del `FloatingSeatsPanel`.

## Fase 5 — Modernización del FloatingSeatsPanel

**Objetivo:** Alinear el panel flotante con el nuevo diseño premium de la aplicación.

1. **Variables de Tema & Estilos:**
   - Reemplazar colores hardcoded (`indigo-100`, `emerald-600`, etc.) por variables de `globals.css` (`--primary`, `--border`, `--card`, etc.).
   - Aplicar `backdrop-blur-md` y fondos semi-transparentes (`bg-card/90`) para efecto glassmorphism.
2. **Estandarización de Componentes:**
   - Usar variantes oficiales de `Button` de shadcn/ui en lugar de estilos manuales.
   - Unificar radios de borde (`rounded-xl`) y sombras (`shadow-xl`) con el resto de la app.
3. **Accesibilidad (A11y):**
   - Corregir advertencias de lint eliminando `eslint-disable`.
   - Agregar `role="dialog"` o similar y asegurar que los botones tengan etiquetas descriptivas.
   - Soportar navegación por teclado completa.

---

## Archivos Críticos

| Archivo | Acción |
|---|---|
| `frontend/src/pages/trips/TripDetailPage.tsx` | Reestructuración de layout y adición de Tabs. |
| `frontend/src/components/trips/TripInfoCard.tsx` | Ajustes de diseño para modo sidebar. |
| `frontend/src/components/seats/FloatingSeatsPanel.tsx` | Rediseño estético y mejoras de accesibilidad. |
| `frontend/src/components/ui/tabs.tsx` | Verificación de estilos (ya existente). |

## Verificación

1. **Manual:**
   - Cambiar entre pestañas y verificar que el estado (asientos seleccionados) se mantenga.
   - Probar en móvil: el layout debe volver a una sola columna (vertical) con las pestañas arriba.
   - Probar en escritorio: verificar que el sidebar se mantenga pegajoso al hacer scroll.
2. **Funcional:**
   - Realizar una venta de pasaje desde la pestaña de "Asientos".
   - Asignar una encomienda desde la pestaña de "Encomiendas".
   - Despachar el viaje desde el sidebar.

## Riesgos

- **Z-Index:** Conflictos entre el `FloatingSeatsPanel`, el banner de cambio de asiento y la barra de pestañas sticky.
- **Pérdida de Contexto:** Asegurar que si el usuario está vendiendo un boleto y cambia de pestaña por error, no pierda la selección (el estado ya vive en el hook/store, por lo que debería ser seguro).
