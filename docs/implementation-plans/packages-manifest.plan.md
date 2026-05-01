# Implementation Plan: Package Manifest

## Objective
Implement a new view to print the package manifest for a trip, accessible from a new button on the trip details page, and improve the clarity of existing buttons.

## Data Mapping Review
Below we detail how we will map the system data to the table columns, in the following order:
- **No.**: Sequential row number (1, 2, 3...).
- **SENDER**: Name of the sender (`sender_name`).
- **PACKAGE DESCRIPTION**: A description of the cargo based on the package items.
- **RECIPIENT**: Name of the recipient (`recipient_name`). *(formerly "Name")*
- **STATUS**: Payment status of the package. Can be **"Paid"** or **"To Pay"**, derived from the `payment_status` field of the package.
- **Bs.**: Total price (`total_amount`).

> **Note:** The **SIGNATURE** column has been removed from the design. No space for a signature will be included in the printable manifest.

## Proposed Changes

### 1. Trip UI Modification
**File**: `frontend-react/src/pages/trips/TripDetailPage.tsx`
- Rename the current button text "Sheet" to "Passenger Sheet".
- Add a new `Button` and `Link` component to its right labeled "Package Manifest", using the `Package` icon (lucide-react).
- The link will point to `/trips/${tripId}/packages-manifest`, opening with `target="_blank"`.

### 2. Routes Update
**File**: `frontend-react/src/router/index.tsx`
- The new route must be added to the print components array within `PrintLayout`:
  `{ path: '/trips/:id/packages-manifest', lazy: () => import('@/pages/trips/TripPackagesManifestPage') }`
- This ensures the base app's header and sidebar are not rendered in this view.

### 3. Creation of the Printable View
**New File**: `frontend-react/src/pages/trips/TripPackagesManifestPage.tsx`
- It will be a functional clone adjusted from `TripSheetPage.tsx`.
- It will use state hooks and selectors (`useAppSelector`) or `apiFetch` to load trip details (`trip`) and packages associated with the trip (`/packages/by-trip/${tripId}`).
- It will use Media Queries (`@media print`) to force a clean landscape layout, without conventional browser borders.
- It will incorporate all static data shown in the photo into the header, such as 'Route', 'Date', 'Driver', etc.
- It will render the package table with the columns in the following **final order**:

| # | Column | Data Source |
|---|---------|----------------|
| 1 | No. | Sequential |
| 2 | Sender | `sender_name` |
| 3 | Package Description | Package items |
| 4 | Recipient | `recipient_name` |
| 5 | Status | `payment_status` → "Paid" / "To Pay" |
| 6 | Bs. | `total_amount` |

- The **Status** column should be displayed with a distinctive visual label: light green background for "Paid" and light yellow background for "To Pay", both on screen and in print (`print-color-adjust: exact`).
