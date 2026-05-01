# Plan: Add confirmation and feedback when creating a trip in React

## Context

The trip creation page in React (`/trips/new`) already works and has the same visual structure as Nuxt. However, it is missing two key flows that do exist in Nuxt:

1. **Confirmation modal** before creating the trip (shows a summary of what will be created)
2. **Success modal** after creating the trip (instead of the current green banner)
3. **Redirection** back to `/trips` where the newly created trip appears in the corresponding slot

## Existing reusable components

- `src/components/common/ConfirmDialog.tsx` - Confirmation dialog with types (danger/warning/info/success)
- `src/components/common/NotificationModal.tsx` - Notification modal with types (success/error/warning/info)

## Necessary changes

### File: `src/pages/trips/TripNewPage.tsx`

**1. Add confirmation modal before creating**
- New state: `showConfirmDialog: boolean`
- On submit, instead of calling `createTrip` directly, show the `ConfirmDialog` with type `info`
- The dialog shows a summary: selected route, date, time, bus, driver, assistant
- On confirm → execute the actual trip creation

**2. Replace green banner with success NotificationModal**
- Replace the `showSuccess` state + green banner with a `NotificationModal` of type `success`
- Title: "Trip created successfully"
- Message: Summary of the created trip (route, date, time)
- On close modal → navigate to `/trips`

**3. Complete flow:**
```
Submit form → Validation → ConfirmDialog (summary)
  → Confirm → API createTrip → NotificationModal (success) → Navigate to /trips
  → Cancel → Return to form
```

### Implementation details

```tsx
// New states
const [showConfirmDialog, setShowConfirmDialog] = useState(false)
const [showSuccessModal, setShowSuccessModal] = useState(false)

// handleSubmit now only shows the confirm dialog
const handleSubmit = (e: FormEvent) => {
  e.preventDefault()
  if (!isFormValid) return
  setShowConfirmDialog(true)
}

// New function that executes the actual creation
const executeTripCreation = async () => {
  // ... build payload (same as current code)
  const result = await dispatch(createTrip(payload))
  if (result.meta.requestStatus === 'fulfilled') {
    setShowSuccessModal(true)
  }
}

// In JSX:
<ConfirmDialog
  open={showConfirmDialog}
  onOpenChange={setShowConfirmDialog}
  type="info"
  title="Confirm trip creation"
  message={`Route: ${selectedRoute?.origin} → ${selectedRoute?.destination}\nDate: ${departureDate}\nTime: ${departureTime}\nBus: ${selectedBus?.label}`}
  confirmText="Create Trip"
  cancelText="Review"
  onConfirm={executeTripCreation}
/>

<NotificationModal
  open={showSuccessModal}
  onOpenChange={setShowSuccessModal}
  type="success"
  title="Trip created successfully"
  message="The trip has been scheduled correctly."
  buttonText="View Board"
  onClose={() => navigate('/trips')}
/>
```

## Verification

1. Go to `http://localhost:3001/trips`
2. Click on "Create Trip" on an empty card → navigates to `/trips/new` with pre-filled params
3. Complete the form (select at least a bus)
4. Click "Create Trip" → ConfirmDialog appears with summary
5. Click "Create Trip" in the dialog → trip is created → success NotificationModal appears
6. Click "View Board" → navigates to `/trips` → trip appears in the correct slot
