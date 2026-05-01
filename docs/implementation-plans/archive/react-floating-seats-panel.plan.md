# Plan: Floating selected seats panel + multiple sale/reservation

## Context

Currently the `SelectedSeatsPanel` is rendered below the seat map inside `BusSeatMapPrint.tsx` (lines 331-345). This forces the user to scroll down to see the selected seats and access the sell/reserve buttons, making the multiple selection flow uncomfortable.

**Objective:** Replace the inline panel with a floating component (fixed bottom-right) that shows the selected seats with action buttons, visible without scrolling. The multiple sale/reservation flow already works in the backend and in `TicketSaleModal` - we just need to improve the selection UX.

## Files to modify

| File | Change |
|---|---|
| `frontend-react/src/components/seats/FloatingSeatsPanel.tsx` | **NEW** - Floating component |
| `frontend-react/src/components/seats/BusSeatMapPrint.tsx` | Remove `SelectedSeatsPanel` |
| `frontend-react/src/pages/trips/TripDetailPage.tsx` | Add `FloatingSeatsPanel` |

## Implementation

### Step 1: Create `FloatingSeatsPanel.tsx`

**Path:** `frontend-react/src/components/seats/FloatingSeatsPanel.tsx`

Floating component with `position: fixed` in bottom right corner:

```
Props (same as SelectedSeatsPanel):
- selectedSeats: any[]
- selectionEnabled: boolean
- seatChangeMode: boolean
- onSellTicket: () => void
- onReserveSeat: () => void
- onClearSelection: () => void
- onRemoveSeat: (seat) => void
```

**Behavior:**
- **Hidden** when `selectedSeats.length === 0` or `seatChangeMode === true`
- **Collapsed state** (default): Compact bubble showing number of seats + Sell/Reserve/Clear buttons
- **Expanded state** (click on bubble): Shows list of selected seats with option to remove individually
- Enter/exit animation (slide-up from bottom)
- `z-index: 40` (below z-50 modals, above map)
- Responsive: on mobile occupies more width, on desktop max-w-sm
- `print:hidden` to not appear in printing

**Collapsed design (main view):**
```
+------------------------------------------+
| [badge: 3]  Seats: 1, 5, 12              |
|                                           |
| [Sell]  [Reserve]  [Clear]               |
+------------------------------------------+
```

**Expanded design (click to see detail):**
```
+------------------------------------------+
| Selected Seats                    [^]    |
|------------------------------------------|
| [1 Window x]  [5 Aisle x]                |
| [12 Window x]                            |
|------------------------------------------|
| [Sell Tickets]  [Reserve]  [Clear]       |
+------------------------------------------+
```

**Keyboard shortcuts** (shown as hints):
- `V` = Sell
- `R` = Reserve
- `C` = Clear

### Step 2: Remove SelectedSeatsPanel from BusSeatMapPrint

**Path:** `frontend-react/src/components/seats/BusSeatMapPrint.tsx`

Changes:
1. Remove `SelectedSeatsPanel` import (line 6)
2. Remove the `<SelectedSeatsPanel ... />` block (lines 331-345)
3. Expose `selectedSeats` and `clearSelection` as props/callbacks so `TripDetailPage` can control them:
   - New callback prop: `onClearSelection?: () => void`
   - Add call to `onClearSelection` when cleared internally

**Note:** `BusSeatMapPrint` already emits `onSelectionChange` with the selected seats (line 228/323), and `onSellTicket`/`onReserveSeat` already work. Just need to remove the inline panel and expose the clear function.

### Step 3: Integrate FloatingSeatsPanel in TripDetailPage

**Path:** `frontend-react/src/pages/trips/TripDetailPage.tsx`

Changes:
1. Import `FloatingSeatsPanel`
2. Render `FloatingSeatsPanel` at the end of the JSX (outside any relative container, so `fixed` works properly)
3. Connect props:
   - `selectedSeats={currentSelectedSeats}`
   - `selectionEnabled={!seatChangeMode}`
   - `seatChangeMode={seatChangeMode}`
   - `onSellTicket={() => handleSellTicket(currentSelectedSeats)}`
   - `onReserveSeat={() => handleReserveSeat(currentSelectedSeats)}`
   - `onClearSelection` -> clear `currentSelectedSeats` and force map re-render (`setSeatMapKey`)
   - `onRemoveSeat` -> remove individual seat from selection

4. For `onClearSelection` and `onRemoveSeat`, we need to sync with `BusSeatMapPrint`'s internal state. Options:
   - **Chosen option:** Pass `selectedSeatIds` as a controlled prop to `BusSeatMapPrint` and move selection state to `TripDetailPage`. This is already partially done with `currentSelectedSeats`.

**Sync problem:** Currently `BusSeatMapPrint` keeps `selectedSeatIds` as internal state (line 90). When the FloatingPanel clears or removes a seat, `BusSeatMapPrint` does not know.

**Solution:** Add `controlledSelectedIds` prop to `BusSeatMapPrint` and sync it:
- In `BusSeatMapPrint`: add `useEffect` to sync `selectedSeatIds` with `controlledSelectedIds` when it changes
- In `TripDetailPage`: keep an array of selected IDs passed to map and floating panel
- When floating panel removes a seat, update array in `TripDetailPage`, which propagates to map

### Step 4: Selection state sync

**BusSeatMapPrint.tsx** - new prop and sync:
```tsx
// New prop
controlledSelectedIds?: number[]

// useEffect to sync
useEffect(() => {
  if (controlledSelectedIds !== undefined) {
    setSelectedSeatIds(controlledSelectedIds)
  }
}, [controlledSelectedIds])
```

**TripDetailPage.tsx** - centralized state:
```tsx
// New state for controlled IDs
const [controlledSeatIds, setControlledSeatIds] = useState<number[]>([])

// handleSelectionChange updates both
const handleSelectionChange = (seats: any[]) => {
  setCurrentSelectedSeats(seats)
  setControlledSeatIds(seats.map(s => s.id))
  // ... existing seatChangeMode logic
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

## Verification

1. **Multiple selection:** Click on multiple available seats -> floating panel appears and shows the seats
2. **Sell multiple:** Click "Sell" in floating panel -> `TicketSaleModal` opens with all selected seats
3. **Reserve multiple:** Click "Reserve" -> modal opens in reserve mode
4. **Remove individual:** Click X on a seat in the panel -> deselected on the map
5. **Clear all:** Click "Clear" -> all deselected on the map
6. **Keyboard:** V, R, C work when seats are selected
7. **Seat change mode:** Floating panel is hidden when `seatChangeMode=true`
8. **Post-sale:** After creating ticket successfully, panel is cleared
9. **Mobile:** Panel is usable on small screens
10. **Scroll:** Panel is visible regardless of scroll position
