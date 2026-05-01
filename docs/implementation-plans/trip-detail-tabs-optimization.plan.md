# Plan: Trip Detail Page Optimization (Tabs & Sidebar)

## Context

The **Trip Detail** page (`TripDetailPage.tsx`) currently presents a usability issue due to vertical "infinite scroll". As trip information, the bus seat map, and the package list are stacked, the page becomes extremely long, especially for double-decker buses or trips with many packages.

## Objectives

1. **Reduce vertical scroll** by using tabs to separate responsibilities.
2. **Improve information density** using a two-column layout on desktop.
3. **Maintain operability** by ensuring critical actions (Dispatch, Print) are always accessible.

## Scope

- Implementation of a Tabs system to separate "Seats" from "Packages".
- Restructuring the main layout into two columns on large screens (`lg`+).
- Conversion of the trip information card into a fixed/sticky sidebar.
- Ensuring the `FloatingSeatsPanel` continues to function correctly within the seats tab.
- Aesthetic modernization of the `FloatingSeatsPanel` (Glassmorphism, theme variables, and a11y).

---

## Phase 1 — Tabs Structure

**Objective:** Divide the central content into logical sections.

1. **Define Tabs:**
   - **Tab 1: Seats & Sales**: Contains the `BusSeatMapPrint`. This is the default view.
   - **Tab 2: Packages**: Contains the `TripPackagesSection`.
   - **Tab 3: Details & Staff**: Contains driver/assistant management and detailed statistics.

2. **Implementation in `TripDetailPage.tsx`:**
   - Import `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs`.
   - Wrap the current content (lines 156-188) in the Tabs structure.
   - Optionally make the selected tab persist in the URL (query param `?tab=...`) to facilitate page refreshes.

---

## Phase 2 — Two-Column Layout (Desktop)

**Objective:** Leverage horizontal space on large screens.

1. **Grid Restructuring:**
   - Change the main container to a grid: `grid grid-cols-1 lg:grid-cols-4 gap-6`.
   - **Left Column (Main - `lg:col-span-3`):** Contains the Tabs system.
   - **Right Column (Sidebar - `lg:col-span-1`):** Contains the `TripInfoCard`.

2. **Sticky Sidebar:**
   - Apply `sticky top-24` to the right column so the trip information follows the scroll of the seat map or package list.

---

## Phase 3 — `TripInfoCard` Refactor

**Objective:** Adapt the information card for the sidebar format.

1. **Sidebar Variant:**
   - Modify `TripInfoCard` to be more vertical and compact.
   - Move actions (Dispatch/Print buttons) to the top of the card or to a dedicated actions block in the sidebar.
   - The Occupancy section should look good in a narrower width.

---

## Phase 4 — Polish and Accessibility

1. **Sticky Tab Bar:**
   - Ensure the tab buttons are sticky (`sticky top-0` or below the seat change banner) to switch contexts quickly.
2. **A11y:**
   - Verify `TabsTrigger` have correct roles and are keyboard navigable.
   - Ensure tab switching does not break the focus of the `FloatingSeatsPanel`.

---

## Phase 5 — FloatingSeatsPanel Modernization

**Objective:** Align the floating panel with the application's new premium design.

1. **Theme Variables & Styles:**
   - Replace hardcoded colors (`indigo-100`, `emerald-600`, etc.) with variables from `globals.css` (`--primary`, `--border`, `--card`, etc.).
   - Apply `backdrop-blur-md` and semi-transparent backgrounds (`bg-card/90`) for a glassmorphism effect.
2. **Component Standardization:**
   - Use official shadcn/ui `Button` variants instead of manual styles.
   - Unify border radii (`rounded-xl`) and shadows (`shadow-xl`) with the rest of the app.
3. **Accessibility (A11y):**
   - Fix lint warnings by removing `eslint-disable`.
   - Add `role="dialog"` or similar and ensure buttons have descriptive labels.
   - Support full keyboard navigation.

---

## Critical Files

| File | Action |
|---|---|
| `frontend/src/pages/trips/TripDetailPage.tsx` | Layout restructuring and addition of Tabs. |
| `frontend/src/components/trips/TripInfoCard.tsx` | Design adjustments for sidebar mode. |
| `frontend/src/components/seats/FloatingSeatsPanel.tsx` | Aesthetic redesign and accessibility improvements. |
| `frontend/src/components/ui/tabs.tsx` | Style verification (already exists). |

---

## Verification

1. **Manual:**
   - Switch between tabs and verify that the state (selected seats) is maintained.
   - Test on mobile: the layout should revert to a single column (vertical) with tabs at the top.
   - Test on desktop: verify the sidebar stays sticky while scrolling.
2. **Functional:**
   - Perform a ticket sale from the "Seats" tab.
   - Assign a package from the "Packages" tab.
   - Dispatch the trip from the sidebar.

---

## Risks

- **Z-Index:** Conflicts between the `FloatingSeatsPanel`, the seat change banner, and the sticky tab bar.
- **Context Loss:** Ensure that if the user is selling a ticket and accidentally switches tabs, they don't lose the selection (the state lives in the hook/store, so it should be safe).
