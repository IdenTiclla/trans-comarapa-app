# Plan: UI Migration to Sidebar Design

## Context

The app currently uses horizontal navigation (top header). We want to migrate to a design with a **dark (navy) sidebar**, a clean top header with breadcrumbs, and a visual style with brown CTA buttons, clean cards, and professional typography — similar to the provided "Kinetic Fleet" mockup.

## Phase Summary

| Phase | Description | Main Files |
|------|-------------|---------------------|
| 1 | Design tokens (colors, typography) | `globals.css` |
| 2 | Sidebar + Layout shell | Install shadcn sidebar, create `AppSidebar`, `navigation.ts`, modify `DefaultLayout` |
| 3 | Top Header | Create `AppHeader` with breadcrumbs and controls |
| 4A | Dashboards | 4 dashboard pages |
| 4B | Trips | 3 pages + trip components |
| 4C | Packages | 4 pages + package components |
| 4D | Admin | ~10 admin pages |
| 4E | Others | Clients, tickets, profile, bookings |
| 5 | Cleanup | Remove obsolete code, audit |

---

## Phase 1: Design Tokens

**Objective:** Update color palette without changing layout.

**Modify:** `frontend-react/src/styles/globals.css`

Changes:
- Update sidebar CSS variables to dark navy:
  ```
  --sidebar: dark navy (#1B2A4A)
  --sidebar-foreground: white
  --sidebar-primary: blue accent (#3B82F6)
  --sidebar-accent: lighter navy (#243656)
  --sidebar-border: (#2D3F5E)
  ```
- Add custom colors in `@theme`:
  ```
  --color-navy-900: #1B2A4A
  --color-navy-800: #243656
  --color-navy-700: #2D3F5E
  --color-cta-brown: #6B3A2A
  --color-cta-brown-hover: #7D4A38
  --color-status-available: #22C55E
  --color-status-medium: #F59E0B
  --color-status-full: #EF4444
  ```
- Update `--primary` to dark navy.
- Update `--background` to light gray (#F8F9FA).

**Verification:** `npm run dev` → updated colors, no errors.

---

## Phase 2: Sidebar + Layout Shell

**Objective:** Replace horizontal navigation with a side sidebar.

### Step 2.1: Install shadcn Sidebar
```bash
cd frontend-react && npx shadcn@latest add sidebar
```

### Step 2.2: Create Navigation Config
**New:** `frontend-react/src/lib/navigation.ts`
- Extract `NAV_LINKS` from `AdminHeader.tsx` (lines 6-37) to a standalone config.
- Add Lucide icons for each item.
- Group items by category (Main, Operations, Management, Finance).
- Maintain same role mapping (admin, secretary, driver, assistant).
- Add `ROLE_LABELS` for sidebar subtitles.

### Step 2.3: Create AppSidebar Component
**New:** `frontend-react/src/components/layout/AppSidebar.tsx`
- Use shadcn primitives: `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarFooter`.
- Header: "Trans Comarapa" logo + user role.
- Content: Groups of nav items with icons, active state via `NavLink`.
- Footer: Primary CTA button (e.g., "+ New Dispatch" for secretary), Settings, Logout.
- Collapsible on mobile (shadcn automatic sheet overlay).

### Step 2.4: Update DefaultLayout
**Modify:** `frontend-react/src/layouts/DefaultLayout.tsx`
```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <header>  {/* temporary, completed in Phase 3 */}
      <SidebarTrigger />
    </header>
    <main className="flex-1 p-4 lg:p-6">
      <Outlet />
    </main>
  </SidebarInset>
</SidebarProvider>
```
- Remove footer (moved to sidebar footer).
- Do not remove `AdminHeader.tsx` yet (reference).

**Verification:**
- All pages render within the sidebar layout.
- Role-based navigation works (login as admin, secretary, driver).
- Mobile: sidebar collapses to overlay/sheet.
- Active item highlighted.
- Login and Print layouts unaffected.

---

## Phase 3: Top Header

**Objective:** Clean header with breadcrumbs, notifications, and avatar.

### Step 3.1: Install shadcn Breadcrumb
```bash
npx shadcn@latest add breadcrumb
```

### Step 3.2: Create Breadcrumb Hook
**New:** `frontend-react/src/hooks/use-breadcrumb.ts`
- Derives breadcrumb segments from `useLocation()`.
- Static map of routes to Spanish labels.

### Step 3.3: Create AppHeader
**New:** `frontend-react/src/components/layout/AppHeader.tsx`
- Left: `SidebarTrigger` + separator + Breadcrumb.
- Right: Notifications button (bell), help button, quick action (navy), DropdownMenu with avatar + profile/logout.
- Use `useAuth()` for user data.

### Step 3.4: Integrate into DefaultLayout
**Modify:** `frontend-react/src/layouts/DefaultLayout.tsx`
- Replace temporary header with `<AppHeader />`.

**Verification:**
- Breadcrumb updates when navigating.
- User menu works (profile, logout).
- SidebarTrigger opens/closes sidebar.
- Responsive on mobile.

---

## Phase 4A: Dashboards

**Modify:**
- `frontend-react/src/pages/dashboards/AdminDashboard.tsx`
- `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx`
- `frontend-react/src/pages/dashboards/DriverDashboard.tsx`
- `frontend-react/src/pages/dashboards/AssistantDashboard.tsx`
- `frontend-react/src/components/dashboard/UpcomingTrips.tsx`

**Changes:**
- Remove duplicate page headers (already in breadcrumb).
- Stat cards: bold large numbers, small uppercase labels.
- Cards with shadcn Card, clean borders.
- Status with semantic colors (available/medium/full).
- Remove indigo gradients, use navy.

---

## Phase 4B: Trips

**Modify:**
- `frontend-react/src/pages/trips/TripsIndexPage.tsx`
- `frontend-react/src/pages/trips/TripDetailPage.tsx`
- `frontend-react/src/components/trips/TripInfoCard.tsx`
- `frontend-react/src/components/trips/CreateTripModal.tsx`
- `frontend-react/src/components/trips/TripStaffEditor.tsx`

**Changes:**
- Trip cards with blue dashed borders (like mockup).
- Pill badges for status (MORNING/AFTERNOON, RETURN).
- Occupancy indicators with colors (green/yellow/red).
- Brown CTA buttons for "Sell Ticket".
- Two-column layout by route (outbound/inbound).

---

## Phase 4C: Packages

**Modify:**
- `frontend-react/src/pages/packages/PackagesIndexPage.tsx`
- `frontend-react/src/pages/packages/PackageNewPage.tsx`
- `frontend-react/src/pages/packages/PendingCollectionsPage.tsx`
- `frontend-react/src/components/packages/PackageCard.tsx`
- `frontend-react/src/components/packages/PackageCardList.tsx`
- `frontend-react/src/components/packages/PackageRegistrationModal.tsx`
- `frontend-react/src/components/packages/PackageDeliveryModal.tsx`

---

## Phase 4D: Admin

**Modify:**
- `frontend-react/src/pages/admin/BusesPage.tsx`
- `frontend-react/src/pages/admin/RoutesPage.tsx`
- `frontend-react/src/pages/admin/CashRegisterPage.tsx`
- `frontend-react/src/pages/admin/FinancialDashboardPage.tsx`
- `frontend-react/src/pages/admin/OwnersPage.tsx`
- `frontend-react/src/pages/admin/OwnerSettlements.tsx`
- `frontend-react/src/pages/admin/WithdrawalHistoryPage.tsx`
- `frontend-react/src/components/admin/BusForm.tsx`
- `frontend-react/src/components/admin/RouteForm.tsx`

**Changes:**
- Tables with updated style.
- Forms wrapped in Cards.
- Consistent action buttons.

---

## Phase 4E: Others

**Modify:**
- `frontend-react/src/pages/clients/ClientsIndexPage.tsx`
- `frontend-react/src/components/clients/ClientCardList.tsx`
- `frontend-react/src/pages/ProfilePage.tsx`
- `frontend-react/src/pages/TripsPage.tsx` (client)
- `frontend-react/src/pages/PackagesPage.tsx` (client)

---

## Phase 5: Cleanup

1. **Delete** `frontend-react/src/components/layout/AdminHeader.tsx`.
2. **Remove** `@heroicons/react` dependency from `package.json` (replaced by lucide-react).
3. **Clean** obsolete CSS classes from `globals.css` (comarapa gradients if no longer used).
4. **Update** tests referencing AdminHeader or old layout.
5. **Audit** responsive design across all breakpoints.
6. **Verify** PrintLayout is unaffected.

---

## Phase Dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4A-4E (mutually independent) → Phase 5
```

Each phase leaves the app functional and reviewable.
