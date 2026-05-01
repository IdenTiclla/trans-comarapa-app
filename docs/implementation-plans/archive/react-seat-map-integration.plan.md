# Plan: Integrate interactive seat map in TripDetailPage (React)

## Context

The trip detail page (`/trips/:id`) in React has a **placeholder** where the interactive seat map should be (lines 327-363 of `TripDetailPage.tsx`). All necessary components already exist and are completely implemented:

- `BusSeatMapPrint` - Main map component
- `BusSeatGrid` - Visual seat grid
- `SelectedSeatsPanel` - Selected seats panel
- `SeatContextMenu` - Context menu (right click)
- `TicketSaleModal` - Ticket sale/reservation modal
- `TicketModal` - Ticket detail modal

The task is to **integrate** these existing components into `TripDetailPage`, connecting the event handlers for sale, reservation, and seat management. It must be functional like in Nuxt but with an improved design using shadcn/Tailwind.

## File to modify

### `frontend-react/src/pages/trips/TripDetailPage.tsx`

### Changes:

**1. Additional imports**
```tsx
import BusSeatMapPrint from '@/components/seats/BusSeatMapPrint'
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import TicketModal from '@/components/tickets/TicketModal'
```

**2. New states for seat map**
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

**3. Handlers for the seat map**
```tsx
// Sell ticket(s)
const handleSellTicket = (seats: any[] | any) => {
  const seatsArray = Array.isArray(seats) ? seats : [seats]
  setSelectedSeatsForSale(seatsArray)
  setSaleActionType('sell')
  setShowTicketSaleModal(true)
}

// Reserve seat(s)
const handleReserveSeat = (seats: any[] | any) => {
  const seatsArray = Array.isArray(seats) ? seats : [seats]
  setSelectedSeatsForSale(seatsArray)
  setSaleActionType('reserve')
  setShowTicketSaleModal(true)
}

// Ticket created → silent refresh
const handleTicketCreated = () => {
  setShowTicketSaleModal(false)
  refreshTrip()
  setSeatMapKey(prev => prev + 1)
}

// View ticket detail (from context menu on occupied seat)
const handleViewDetails = (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number)
  if (ticket) {
    setSelectedTicketForView(ticket)
    setShowTicketModal(true)
  }
}

// Cancel reservation
const handleCancelReservation = async (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'reserved')
  if (ticket) {
    await apiFetch(`/tickets/${ticket.id}`, { method: 'DELETE' })
    refreshTrip()
    setSeatMapKey(prev => prev + 1)
  }
}

// Confirm sale (reservation → confirmed)
const handleConfirmSale = async (seat: any) => {
  const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'reserved')
  if (ticket) {
    await apiFetch(`/tickets/${ticket.id}`, { method: 'PUT', body: { state: 'confirmed' } })
    refreshTrip()
    setSeatMapKey(prev => prev + 1)
  }
}
```

**4. Replace placeholder with BusSeatMapPrint + modals**

Replace the placeholder block (lines 327-363) with:
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

**5. Keyboard shortcuts (optional but present in Nuxt)**

Add `useEffect` for keyboard shortcuts:
- `V` → Sell selected tickets
- `R` → Reserve selected seats
- `Escape` → Close modals

**6. Remove placeholder code**

Completely remove the current placeholder block (table of sold tickets, text "The interactive seat map component will be loaded when BusSeatMapPrint is implemented").

## Existing components being reused (unmodified)

| Component | Path |
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

## Complete user flow

```
1. User navigates to /trips/42
2. Trip is loaded with seats_layout from backend
3. BusSeatMapPrint renders the visual map (left/right columns, aisle)
4. User selects available seats (click) → SelectedSeatsPanel appears
5. Click "Sell Tickets" → TicketSaleModal opens
6. Fills in client data, price, payment method
7. Creates ticket → modal closes → map updates (seat now occupied)
8. Right click on occupied seat → SeatContextMenu → View details / Change seat
9. Right click on reserved seat → Confirm sale / Cancel reservation options
```

## Verification

1. Navigate to `http://localhost:3001/trips/{id}` (an existing trip)
2. Verify that the seat map renders with the bus layout
3. Click on available seat → it is selected (blue)
4. Select multiple seats → panel appears with "Sell Tickets" and "Reserve"
5. Click "Sell Tickets" → TicketSaleModal opens
6. Create ticket → modal closes → seat appears as occupied (red)
7. Right click on occupied seat → context menu with options
8. Right click on reserved seat → confirm/cancel options
9. Double-decker bus → verify floor selector works
