# Plan: Panel flotante de asientos seleccionados + venta/reserva multiple

## Contexto

Actualmente el `SelectedSeatsPanel` se renderiza debajo del mapa de asientos dentro de `BusSeatMapPrint.tsx` (linea 331-345). Esto obliga al usuario a hacer scroll para ver los asientos seleccionados y acceder a los botones de vender/reservar, haciendo incomodo el flujo de seleccion multiple.

**Objetivo:** Reemplazar el panel inline por un componente flotante (fixed bottom-right) que muestre los asientos seleccionados con botones de accion, visible sin scroll. El flujo de venta/reserva multiple ya funciona en el backend y en `TicketSaleModal` - solo necesitamos mejorar la UX de seleccion.

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `frontend-react/src/components/seats/FloatingSeatsPanel.tsx` | **NUEVO** - Componente flotante |
| `frontend-react/src/components/seats/BusSeatMapPrint.tsx` | Eliminar `SelectedSeatsPanel` |
| `frontend-react/src/pages/trips/TripDetailPage.tsx` | Agregar `FloatingSeatsPanel` |

## Implementacion

### Paso 1: Crear `FloatingSeatsPanel.tsx`

**Path:** `frontend-react/src/components/seats/FloatingSeatsPanel.tsx`

Componente flotante con `position: fixed` en esquina inferior derecha:

```
Props (mismas que SelectedSeatsPanel):
- selectedSeats: any[]
- selectionEnabled: boolean
- seatChangeMode: boolean
- onSellTicket: () => void
- onReserveSeat: () => void
- onClearSelection: () => void
- onRemoveSeat: (seat) => void
```

**Comportamiento:**
- **Oculto** cuando `selectedSeats.length === 0` o `seatChangeMode === true`
- **Estado colapsado** (default): Burbuja compacta mostrando cantidad de asientos + botones Vender/Reservar/Limpiar
- **Estado expandido** (click en la burbuja): Muestra lista de asientos seleccionados con opcion de remover individualmente
- Animacion de entrada/salida (slide-up desde abajo)
- `z-index: 40` (debajo de modales z-50, encima del mapa)
- Responsive: en mobile ocupa mas ancho, en desktop max-w-sm
- `print:hidden` para no aparecer en impresion

**Diseno colapsado (vista principal):**
```
+------------------------------------------+
| [badge: 3]  Asientos: 1, 5, 12           |
|                                           |
| [Vender]  [Reservar]  [Limpiar]          |
+------------------------------------------+
```

**Diseno expandido (click para ver detalle):**
```
+------------------------------------------+
| Asientos Seleccionados            [^]    |
|------------------------------------------|
| [1 Ventana x]  [5 Pasillo x]            |
| [12 Ventana x]                           |
|------------------------------------------|
| [Vender Tickets]  [Reservar]  [Limpiar] |
+------------------------------------------+
```

**Atajos de teclado** (mostrados como hints):
- `V` = Vender
- `R` = Reservar
- `C` = Limpiar

### Paso 2: Eliminar SelectedSeatsPanel de BusSeatMapPrint

**Path:** `frontend-react/src/components/seats/BusSeatMapPrint.tsx`

Cambios:
1. Eliminar import de `SelectedSeatsPanel` (linea 6)
2. Eliminar el bloque `<SelectedSeatsPanel ... />` (lineas 331-345)
3. Exponer `selectedSeats` y `clearSelection` como props/callbacks para que `TripDetailPage` pueda controlarlos:
   - Nuevo callback prop: `onClearSelection?: () => void`
   - Agregar llamada a `onClearSelection` cuando se limpie internamente

**Nota:** `BusSeatMapPrint` ya emite `onSelectionChange` con los seats seleccionados (linea 228/323), y `onSellTicket`/`onReserveSeat` ya funcionan. Solo hay que eliminar el panel inline y exponer la limpieza.

### Paso 3: Integrar FloatingSeatsPanel en TripDetailPage

**Path:** `frontend-react/src/pages/trips/TripDetailPage.tsx`

Cambios:
1. Importar `FloatingSeatsPanel`
2. Renderizar `FloatingSeatsPanel` al final del JSX (fuera de cualquier contenedor relativo, para que `fixed` funcione correctamente)
3. Conectar props:
   - `selectedSeats={currentSelectedSeats}`
   - `selectionEnabled={!seatChangeMode}`
   - `seatChangeMode={seatChangeMode}`
   - `onSellTicket={() => handleSellTicket(currentSelectedSeats)}`
   - `onReserveSeat={() => handleReserveSeat(currentSelectedSeats)}`
   - `onClearSelection` -> limpiar `currentSelectedSeats` y forzar re-render del mapa (`setSeatMapKey`)
   - `onRemoveSeat` -> quitar seat individual de la seleccion

4. Para `onClearSelection` y `onRemoveSeat`, necesitamos sincronizar con el estado interno de `BusSeatMapPrint`. Opciones:
   - **Opcion elegida:** Pasar `selectedSeatIds` como prop controlada a `BusSeatMapPrint` y mover el estado de seleccion a `TripDetailPage`. Esto ya se hace parcialmente con `currentSelectedSeats`.

**Problema de sincronizacion:** Actualmente `BusSeatMapPrint` mantiene `selectedSeatIds` como estado interno (linea 90). Cuando el FloatingPanel limpia o remueve un asiento, `BusSeatMapPrint` no se entera.

**Solucion:** Agregar prop `controlledSelectedIds` a `BusSeatMapPrint` y sincronizarla:
- En `BusSeatMapPrint`: agregar `useEffect` que sincronice `selectedSeatIds` con `controlledSelectedIds` cuando cambie
- En `TripDetailPage`: mantener un array de IDs seleccionados que pasa al mapa y al panel flotante
- Cuando el panel flotante remueve un asiento, actualizar el array en `TripDetailPage`, que se propaga al mapa

### Paso 4: Sincronizacion de estado de seleccion

**BusSeatMapPrint.tsx** - nueva prop y sync:
```tsx
// Nueva prop
controlledSelectedIds?: number[]

// useEffect para sincronizar
useEffect(() => {
  if (controlledSelectedIds !== undefined) {
    setSelectedSeatIds(controlledSelectedIds)
  }
}, [controlledSelectedIds])
```

**TripDetailPage.tsx** - estado centralizado:
```tsx
// Nuevo estado para IDs controlados
const [controlledSeatIds, setControlledSeatIds] = useState<number[]>([])

// handleSelectionChange actualiza ambos
const handleSelectionChange = (seats: any[]) => {
  setCurrentSelectedSeats(seats)
  setControlledSeatIds(seats.map(s => s.id))
  // ... logica existente de seatChangeMode
}

// onClearSelection
const handleClearSelection = () => {
  setCurrentSelectedSeats([])
  setControlledSeatIds([])
}

// onRemoveSeat
const handleRemoveSeat = (seat: any) => {
  setCurrentSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
  setControlledSeatIds(prev => prev.filter(id => id !== seat.id))
}
```

## Verificacion

1. **Seleccion multiple:** Hacer click en multiples asientos disponibles -> el panel flotante aparece y muestra los asientos
2. **Vender multiples:** Click "Vender" en panel flotante -> se abre `TicketSaleModal` con todos los asientos seleccionados
3. **Reservar multiples:** Click "Reservar" -> se abre modal en modo reserva
4. **Remover individual:** Click X en un asiento del panel -> se deselecciona en el mapa
5. **Limpiar todo:** Click "Limpiar" -> se deseleccionan todos en el mapa
6. **Teclado:** V, R, C funcionan cuando hay asientos seleccionados
7. **Modo cambio de asiento:** El panel flotante se oculta cuando `seatChangeMode=true`
8. **Post-venta:** Despues de crear ticket exitosamente, el panel se limpia
9. **Mobile:** El panel es usable en pantallas pequenas
10. **Scroll:** El panel es visible sin importar la posicion del scroll
