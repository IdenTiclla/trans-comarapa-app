# Implementation Plan: Intercepted Cash Register Opening Flow

## Context and Objective
The goal is to simplify the secretary's experience during a sale. Instead of blocking the interface or showing restrictive messages forcing them to another screen when there is no open register, the system will allow them to attempt the sale normally. If no open register exists, the system will pause for a moment showing a modal asking for the initial amount ("Change Fund"), open the register, and immediately continue with the sale without losing their work.

## Proposed Changes

### Backend Architecture Maintenance
- **The Backend remains strict:** Backend services (`ticket_service.py`, `package_service.py`) will not be altered and will continue to require an "Open Register" to protect data integrity.

### Visual Interceptor (Frontend-React)

#### [MODIFY] Removal of Previous UI Blocks
- **Unlock Buttons:** In components such as `PackageDeliveryModal.tsx`, `TripTicketsView.tsx`, and `PackageReceptionModal.tsx`, "Sell" or "Collect" buttons will no longer be disabled if the register locally appears closed.
- **Remove Red Warnings:** Deterrent texts such as *"You must open the register before collecting for this package..."* will be removed to avoid overwhelming the user.

#### [MODIFY] Interception Logic on Sale
1. **Just-in-Time Verification:** Upon clicking "Collect/Sell", the view controller will verify the `isRegisterOpen` status.
2. **Modal Deployment:** If the register is closed, the existing `OpenRegisterModal.tsx` or similar will be invoked, overlaying the current sale, asking only for the **Initial Amount**.
3. **Automatic Resumption:** Upon clicking "Confirm" for the initial amount, the Frontend will call the API to open the register and immediately after, transparently, trigger the pending sale/collection request.

## Verification Process

### Manual and E2E Testing
1. Log in with a closed register.
2. Fill in the data to sell a ticket or collect for a package.
3. Press "Sell".
4. Confirm that a modal appears requesting the initial fund.
5. Enter an amount `X` and press confirm.
6. Validate that the register opened with amount `X` and that the ticket was issued correctly at the same moment without forcing the user to re-type information.
