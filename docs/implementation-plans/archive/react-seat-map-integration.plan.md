# Plan: Integrar mapa de asientos interactivo en TripDetailPage (React)

## Contexto

La página de detalle de viaje (`/trips/:id`) en React tiene un **placeholder** donde debería estar el mapa de asientos interactivo (líneas 327-363 de `TripDetailPage.tsx`). Todos los componentes necesarios ya existen y están completamente implementados:

- `BusSeatMapPrint` - Componente principal del mapa
- `BusSeatGrid` - Grid visual de asientos
- `SelectedSeatsPanel` - Panel de asientos seleccionados
- `SeatContextMenu` - Menú contextual (click derecho)
- `TicketSaleModal` - Modal de venta/reserva de boletos
- `TicketModal` - Modal de detalle de boleto

La tarea es **integrar** estos componentes existentes en `TripDetailPage`, conectando los event handlers para venta, reserva, y gestión de asientos. Debe ser funcional como en Nuxt pero con diseño mejorado usando shadcn/Tailwind.

## Archivo a modificar

### `frontend-react/src/pages/trips/TripDetailPage.tsx`

### Cambios:

**1. Imports adicionales**
```tsx
import BusSeatMapPrint from '@/components/seats/BusSeatMapPrint'
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import TicketModal from '@/components/tickets/TicketModal'
```

**2. Nuevos estados para mapa de asientos**
```tsx
// Ticket sale modal
const [showTicketSaleModal, setShowTicketSaleModal] = useState(false)
const [saleActionType, setSaleActionType] = useState<'sell' | 'reserve'>('sell')
const [selectedSeatsForSale, setSelectedSeatsForSale] = useState<any[]>([])

// Ticket detail modal
const [showTicketModal, setShowTicketModal] = useState(false)
const [selectedTicketForView, setSelectedTicketForView] = useState<any>(null)

// Seat map re-render key
const [seatMapKey, setSeatMapKey] = useState(0)
```

**3. Handlers para el mapa de asientos**
```tsx
// Vender ticket(s)
const handleSellTicket = (seats: any[] | any) => {
  const seatsArray = Array.isArray(seats) ? seats : [seats]
  setSelectedSeatsForSale(seatsArray)
  setSaleActionType('sell')
  setShowTicketSaleModal(true)
}

// Reservar asiento(s)
const handleReserveSeat = (seats: any[] | any) => {
  const seatsArray = Array.isArray(seats) ? seats : [seats]
  setSelectedSeatsForSale(seatsArray)
  setSaleActionType('reserve')
  setShowTicketSaleModal(true)
}

// Ticket creado → refresh silencioso
const handleTicketCreated = () => {
  setShowTicketSaleModal(false)
  refreshTrip()
  setSeatMapKey(prev => prev + 1)
}

// Ver detalle de ticket (desde context menu en asiento ocupado)
const handleViewDetails = (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number)
  if (ticket) {
    setSelectedTicketForView(ticket)
    setShowTicketModal(true)
  }
}

// Cancelar reserva
const handleCancelReservation = async (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'reserved')
  if (ticket) {
    await apiFetch(`/tickets/${ticket.id}`, { method: 'DELETE' })
    refreshTrip()
    setSeatMapKey(prev => prev + 1)
  }
}

// Confirmar venta (reserva → confirmada)
const handleConfirmSale = async (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'reserved')
  if (ticket) {
    await apiFetch(`/tickets/${ticket.id}`, { method: 'PUT', body: { state: 'confirmed' } })
    refreshTrip()
    setSeatMapKey(prev => prev + 1)
  }
}
```

**4. Reemplazar placeholder con BusSeatMapPrint + modales**

Reemplazar el bloque del placeholder (líneas 327-363) con:
```tsx
{/* Seat Map */}
<BusSeatMapPrint
  key={seatMapKey}
  trip={trip}
  tickets={soldTickets}
  reserved_seat_numbers={reservedSeatNumbers}
  selectionEnabled={true}
  enableContextMenu={true}
  onSellTicket={handleSellTicket}
  onReserveSeat={handleReserveSeat}
  onViewDetails={handleViewDetails}
  onCancelReservation={handleCancelReservation}
  onConfirmSale={handleConfirmSale}
/>

{/* Ticket Sale Modal */}
<TicketSaleModal
  show={showTicketSaleModal}
  trip={trip}
  selectedSeats={selectedSeatsForSale}
  actionType={saleActionType}
  onClose={() => setShowTicketSaleModal(false)}
  onTicketCreated={handleTicketCreated}
/>

{/* Ticket Detail Modal */}
{showTicketModal && selectedTicketForView && (
  <TicketModal
    show={showTicketModal}
    ticket={selectedTicketForView}
    mode="details"
    onClose={() => { setShowTicketModal(false); setSelectedTicketForView(null) }}
    onTicketCancelled={() => { setShowTicketModal(false); refreshTrip(); setSeatMapKey(prev => prev + 1) }}
  />
)}
```

**5. Keyboard shortcuts (opcional pero presente en Nuxt)**

Agregar `useEffect` para atajos de teclado:
- `V` → Vender tickets seleccionados
- `R` → Reservar asientos seleccionados
- `Escape` → Cerrar modales

**6. Eliminar código del placeholder**

Eliminar completamente el bloque placeholder actual (tabla de tickets vendidos, texto "El componente de mapa de asientos interactivo se cargará cuando BusSeatMapPrint esté implementado").

## Componentes existentes que se reutilizan (sin modificar)

| Componente | Path |
|---|---|
| `BusSeatMapPrint` | `src/components/seats/BusSeatMapPrint.tsx` |
| `BusSeatGrid` | `src/components/seats/BusSeatGrid.tsx` |
| `BusSeatLegend` | `src/components/seats/BusSeatLegend.tsx` |
| `SelectedSeatsPanel` | `src/components/seats/SelectedSeatsPanel.tsx` |
| `SeatContextMenu` | `src/components/seats/SeatContextMenu.tsx` |
| `DeckSelector` | `src/components/seats/DeckSelector.tsx` |
| `BusTripHeader` | `src/components/seats/BusTripHeader.tsx` |
| `TicketSaleModal` | `src/components/tickets/TicketSaleModal.tsx` |
| `TicketModal` | `src/components/tickets/TicketModal.tsx` |
| `TicketDisplay` | `src/components/tickets/TicketDisplay.tsx` |

## Flujo de usuario completo

```
1. Usuario navega a /trips/42
2. Se carga el viaje con seats_layout del backend
3. BusSeatMapPrint renderiza el mapa visual (left/right columns, aisle)
4. Usuario selecciona asientos disponibles (click) → aparece SelectedSeatsPanel
5. Click "Vender Tickets" → TicketSaleModal se abre
6. Llena datos del cliente, precio, método de pago
7. Crea ticket → modal se cierra → mapa se actualiza (asiento ahora ocupado)
8. Click derecho en asiento ocupado → SeatContextMenu → Ver detalles / Cambiar asiento
9. Click derecho en asiento reservado → Confirmar venta / Cancelar reserva
```

## Verificación

1. Navegar a `http://localhost:3001/trips/{id}` (un viaje existente)
2. Verificar que el mapa de asientos se renderiza con la distribución del bus
3. Click en asiento disponible → se selecciona (azul)
4. Seleccionar varios asientos → aparece panel con "Vender Tickets" y "Reservar"
5. Click "Vender Tickets" → se abre TicketSaleModal
6. Crear ticket → modal cierra → asiento aparece como ocupado (rojo)
7. Click derecho en asiento ocupado → menú contextual con opciones
8. Click derecho en asiento reservado → opciones de confirmar/cancelar
9. Bus de doble piso → verificar selector de pisos funciona
