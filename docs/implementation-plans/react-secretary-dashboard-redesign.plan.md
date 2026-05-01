# Plan: Secretary Dashboard Redesign

## Context
The current dashboard at `/dashboards/dashboard-secretary` is functional but visually basic. It has hardcoded data in "Recent Activity", lacks a period selector, doesn't use charts, and the stats cards have a minimal design. The goal is a drastic redesign that is modern, fully functional with real data, and offers a significantly better user experience.

---

## Files to Modify

| File | Change Type |
|---------|---------------|
| `frontend-react/src/pages/dashboards/SecretaryDashboard.tsx` | Complete redesign |
| `frontend-react/src/components/dashboard/DashboardStatCard.tsx` | Visual redesign |
| `frontend-react/src/components/dashboard/UpcomingTrips.tsx` | Functional + visual improvements |
| `frontend-react/src/components/dashboard/RecentSales.tsx` | Visual improvements |

---

## Detailed Changes

### 1. `SecretaryDashboard.tsx` — Complete Redesign

**Header:**
- Blue-indigo gradient background (`from-blue-700 to-indigo-800`) with white text.
- Dynamic greeting based on time: "Good morning / afternoon / evening, {name}".
- Current date on the right.
- "Live" indicator (pulsing green dot) + manual refresh button.
- Period selector integrated in the header: tab-like buttons `Today | Week | Month`.

**Added Local State:**
```tsx
const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
const [revenueChartData, setRevenueChartData] = useState<ChartDataPoint[]>([])
```

**Period Effect:** When `selectedPeriod` changes, re-dispatch `fetchDashboardStats(selectedPeriod)`.

**Stats Cards (5 instead of 4):**
- Redesigned with color gradient background (replaces left border).
- `DashboardStatCard` accepts new `gradient` prop (Tailwind class string).
- Add 5th card: **"Pending Reservations"** using `statsService.getReservedTicketStats(selectedPeriod)` — amber color.
- Loading states with shadcn/ui `Skeleton` instead of a full-page spinner.

**Quick Actions — Redesign:**
- Compact horizontal layout on desktop.
- Add visible `→` arrow on hover.
- Better color contrast.

**Main Layout:**
```
[Gradient Header]
[5 Stat Cards]
[Quick Actions]
[Left 3/4: Upcoming Trips + Revenue Chart]  [Right 1/4: Quick Search + Recent Activity (REAL)]
[Recent Sales (full width)]
```

**Replace Hardcoded "Recent Activity":**
- Use `salesService.getRecentSales(8)` (endpoint already exists).
- Real feed: Type icon (ticket/package), customer name, amount, relative time.
- Auto-refresh every 60s (same as `RecentSales`).

**New Revenue Chart:**
- Use existing `MonthlyMetricsChart` component (`components/dashboard/MonthlyMetricsChart.tsx`).
- Data from `statsService.getMonthlyRevenueStats(6)` → `/stats/revenue/monthly`.
- `valueFormatter`: `(v) => \`Bs. \${v.toLocaleString()}\``.
- Place it below `UpcomingTrips` in the left column.

---

### 2. `DashboardStatCard.tsx` — Visual Redesign

- New `gradient?: string` prop (e.g., `'from-blue-500 to-blue-600'`).
- With `gradient`: Gradient background, white text, icon in semitransparent white circle (`bg-white/20`).
- Without `gradient`: Maintain current design as fallback.
- Trend badge: Pill with `bg-white/20` in gradient mode, `bg-green-100/bg-red-100` in light mode.
- Main number larger in gradient mode.

---

### 3. `UpcomingTrips.tsx` — Functional + Visual Improvements

- **Occupancy Bar**: `occupied = (bus.capacity - available_seats) / bus.capacity * 100`
  - Green if <70% occupied, yellow if 70-90%, red if >90%.
  - `<div className="w-full bg-gray-200 rounded-full h-1.5">` with animated fill.
- **Status Badge**: `scheduled` → blue "Scheduled", `in_progress` → green "In Progress".
- **Relative Time**: "In 2h 30min" / "In 45 min" using date difference.
- Skeleton during loading.

---

### 4. `RecentSales.tsx` — Visual Improvements

- **Type Badge**: `Ticket` → blue pill (`bg-blue-100 text-blue-700`), `Package` → green pill (`bg-green-100 text-green-700`).
- **Colored Left Border** by type: `border-l-4 border-blue-400` / `border-l-4 border-green-400`.
- Amount in prominent green (`text-emerald-600 font-bold`).

---

## Existing Code Reuse

| Element | File | Usage |
|----------|---------|-----|
| `MonthlyMetricsChart` | `components/dashboard/MonthlyMetricsChart.tsx` | Monthly revenue chart |
| `statsService.getMonthlyRevenueStats` | `services/stats.service.ts:174` | Chart data |
| `statsService.getReservedTicketStats` | `services/stats.service.ts:33` | 5th stat card |
| `salesService.getRecentSales` | `services/sales.service.ts` | Replace hardcoded activity |
| `Skeleton` | `components/ui/skeleton.tsx` | Loading states |
| `Badge` | `components/ui/badge.tsx` | Badges in RecentSales |
| `fetchDashboardStats` thunk | `store/stats.slice.ts:36` | Already accepts `period` param |

---

## Verification

1. `cd frontend-react && npm run dev`
2. Navigate to `http://localhost:3001/dashboards/dashboard-secretary`
3. Verify:
   - [ ] Blue-indigo gradient header with dynamic greeting based on time.
   - [ ] Today/Week/Month selector updates the stats cards.
   - [ ] 5 cards with color gradient backgrounds.
   - [ ] "Recent Activity" shows real data (not hardcoded).
   - [ ] Monthly revenue chart with real data.
   - [ ] UpcomingTrips with occupancy bar and status badges.
   - [ ] RecentSales with colored type badges.
   - [ ] Loading states with skeletons.
