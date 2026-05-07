# Plan: Integrate Package Loading in TripDetail + Bokeh Overlay in Modals

## Context

The React `TripDetailPage` already has the `TripPackagesSection` component that shows packages and has action buttons (Load, Remove, Deliver, Receive), but only the `onUnassignPackage` handler is connected. The package modals (`PackageAssignModal`, `PackageDeliveryModal`, `PackageReceptionModal`, `PackageRegistrationModal`) already exist but are not integrated into the trip page. We need to replicate the full flow from Nuxt.

Additionally, all modals use overlays with solid black backgrounds (`bg-black/50` or `bg-gray-500 opacity-75`). The user wants a bokeh-style gradient effect.

---

## Part 1: Bokeh Overlay for Modals

### Step 1: Define Global CSS Class
**File:** `frontend-react/src/styles/globals.css`

Add the `.modal-overlay-bokeh` class with multiple `radial-gradient` in indigo/purple/blue tones over a semi-transparent dark background.

### Step 2: Update shadcn/ui Components (3 files)
Replace `bg-black/50` with `modal-overlay-bokeh`:
- `frontend-react/src/components/ui/dialog.tsx` (DialogOverlay, line 40)
- `frontend-react/src/components/ui/sheet.tsx` (SheetOverlay, line 37)
- `frontend-react/src/components/ui/alert-dialog.tsx` (AlertDialogOverlay, line 37)

### Step 3: Update Custom Trip Modals (4 occurrences)
**File:** `frontend-react/src/components/trips/TripConfirmationModals.tsx`
Replace `bg-black/50` on lines 65, 81, 118, 142.

### Step 4: Update Package Modals (3 files)
Replace the nested `bg-gray-500 opacity-75` pattern with a single div using `modal-overlay-bokeh`:
- `frontend-react/src/components/packages/PackageAssignModal.tsx` (lines 98-99)
- `frontend-react/src/components/packages/PackageDeliveryModal.tsx` (lines 85-86)
- `frontend-react/src/components/packages/PackageReceptionModal.tsx` (lines 56-57)

---

## Part 2: Integrate Package Management in TripDetailPage

### Step 5: Add State and Handlers to the Hook
**File:** `frontend-react/src/hooks/use-trip-detail-page.ts`

New state:
- `showPackageAssignModal`, `showPackageDeliveryModal`, `showPackageReceptionModal`, `showPackageRegistrationModal`
- `selectedPackageForDelivery`, `selectedPackageForReception`

New handlers:
- `handleDeliverPackage(id)` — searches for package in `tripPackages`, opens delivery modal.
- `handleReceivePackage(id)` — searches for package in `tripPackages`, opens reception modal.
- `handlePackagesAssigned()` — refreshes `fetchPackages(tripId)`, success toast.
- `handleDeliveryConfirm()` — closes modal, refreshes, success toast.
- `handleReceptionConfirm(packageId)` — calls `packageService.updateStatus(id, 'arrived_at_destination')`, closes modal, refreshes, success toast.
- `handlePackageRegistered()` — closes registration modal, refreshes.

Expand the `packages: { ... }` return with the modals and handlers.

### Step 6: Connect in TripDetailPage
**File:** `frontend-react/src/pages/trips/TripDetailPage.tsx`

1. Import the 4 package modals.
2. Pass `onOpenAssignModal`, `onDeliverPackage`, `onReceivePackage` to `TripPackagesSection`.
3. Render the 4 modals after `TripConfirmationModals`.

### Full Flow (same as Nuxt):
```
"Load Package" → PackageAssignModal (multiple selection)
  └─ "Register New" → closes Assign, opens PackageRegistrationModal
      └─ On registration → closes, refreshes
  └─ On assign → refreshes trip packages
"Remove from trip" → unassign (already working)
"Mark Received" → PackageReceptionModal → status → arrived_at_destination
"Deliver" → PackageDeliveryModal → deliver with payment method
```

---

## Files to Modify

| File | Change |
|---------|--------|
| `frontend-react/src/styles/globals.css` | Add `.modal-overlay-bokeh` |
| `frontend-react/src/components/ui/dialog.tsx` | Bokeh overlay |
| `frontend-react/src/components/ui/sheet.tsx` | Bokeh overlay |
| `frontend-react/src/components/ui/alert-dialog.tsx` | Bokeh overlay |
| `frontend-react/src/components/trips/TripConfirmationModals.tsx` | Bokeh overlay (x4) |
| `frontend-react/src/components/packages/PackageAssignModal.tsx` | Bokeh overlay |
| `frontend-react/src/components/packages/PackageDeliveryModal.tsx` | Bokeh overlay |
| `frontend-react/src/components/packages/PackageReceptionModal.tsx` | Bokeh overlay |
| `frontend-react/src/hooks/use-trip-detail-page.ts` | Package state + handlers |
| `frontend-react/src/pages/trips/TripDetailPage.tsx` | Props + render modals |

## Existing Functions to Reuse
- `packageService.updateStatus()` — `frontend-react/src/services/package.service.ts`
- `packageService.deliver()` — `frontend-react/src/services/package.service.ts`
- `fetchPackages()` — already exists in the hook (line ~400)
- `showNotification()` — already exists in the hook

## Verification
1. Open a trip in `scheduled` state → verify "Load Package" button opens `PackageAssignModal`.
2. Select packages and assign → verify they appear in the list.
3. Register new package from the assign modal.
4. Remove package from the trip.
5. With `arrived` trip: verify "Mark Received" opens `PackageReceptionModal`.
6. With `arrived_at_destination` package: verify "Deliver" opens `PackageDeliveryModal` with payment selection.
7. Verify that ALL modals (dialog, sheet, alert-dialog, custom) show the bokeh gradient overlay.
