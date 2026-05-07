# Plan: UI Standardization, Refactor Large Files, Accessibility, and Linting

> Target path: `docs/implementation-plans/ui-standardization.plan.md`

## Context

The React app (`frontend/`) already widely adopts the 25 components from `src/components/ui/` (shadcn/ui), but presents three real problems that degrade maintainability, UX, and accessibility:

1. **Large Files**: 20 `.tsx/.ts` files exceed 300 lines; 5 exceed 600 lines (the largest, `PackageRegistrationModal.tsx`, has 815). This makes reading, testing, and reuse difficult.
2. **Accessibility**: `Card` with `onClick` without `role="button"`, no keyboard support, and no `aria-label`; 2 loose native `<button>` elements in dashboards; no linting rules to prevent it.
3. **No Automated Barrier**: Nothing prevents new code from reintroducing native `<button>`/`<input>` elements or non-accessible patterns.

The decision was made: **gradual rollout with a pilot** + focus on file splitting, a11y, and linting/CI. The formal design system (Storybook) is out of scope for this iteration.

## Scope (IN)

- Linting rules and CI that block regressions.
- Splitting the 5 files >600 lines as a pilot, followed by those between 400–600 lines.
- Replacing `<Card onClick>` with a reusable accessible component and fixing the 2 detected native `<button>` elements.
- Written convention (`docs/guides/ui-conventions.md`) for the team.

## Scope (OUT)

- Storybook / visual documentation of components.
- Visual redesign or new color palette.
- Migration of the legacy Nuxt app (old `frontend/`, already renamed — verify).

---

## ~~Phase 0 — Foundations~~ ✅ Completed (2026-04-19)

> **Baseline:** `docs/implementation-plans/ui-standardization.baseline.md`
> **Deliverables:**
> - ✅ `docs/guides/ui-conventions.md`
> - ✅ `frontend/src/components/ui/clickable-card.tsx` (Accessible ClickableCard — renders a `<button>` with a mandatory `aria-label`)
> - ✅ Updated `frontend/eslint.config.js`: `eslint-plugin-jsx-a11y` (warn), `no-restricted-syntax` for native elements, `max-lines` warn at 300. Ignores `src/components/ui/**`.
> - ✅ `.github/workflows/ci-cd.yml`: New `frontend-lint` job (marked `continue-on-error: true` during Phase 0/1 — progressive)
>
> **Detected Baseline:** 269 native elements (202 button, 34 table, 23 input, 9 select, 1 textarea), 20 files >300 lines, 106 a11y violations, 299 pre-existing `no-explicit-any`.

### ~~0.1 Written UI Convention~~

~~Create~~ ✅ Created `docs/guides/ui-conventions.md`.

### ~~0.2 Create `ClickableCard` Component~~

~~New file~~ ✅ Created `frontend/src/components/ui/clickable-card.tsx`.

### ~~0.3 Lint Rules + CI~~

~~Modify~~ ✅ Done. Note: Instead of `react/forbid-elements` (requires `eslint-plugin-react`), ESLint's native `no-restricted-syntax` with JSX selectors was used — message points to the guide and the correct component. Ignore pattern applied to `src/components/ui/**` and tests.

### ~~0.4 Violation Baseline~~

~~Execute~~ ✅ Saved in `docs/implementation-plans/ui-standardization.baseline.md`.

---

## ~~Phase 1 — Pilot~~ ✅ Completed (2026-04-19)

> **Pilot Results:**
> - `PackageRegistrationModal.tsx`: 815 → 199 lines (-75%)
> - `TicketsIndexPage.tsx`: 796 → 368 lines (-54%)
> - `use-trip-detail-page.ts`: 648 → 355 lines (-45%)
> - 3 files with corrected a11y (ClientsIndexPage, DriverDashboard, AssistantDashboard)

### ~~1.1 `PackageRegistrationModal.tsx`~~ ✅ (815 → 199 lines)

Final extraction in `frontend/src/components/packages/registration/`:
- ✅ `use-package-registration.ts` (329 lines) — Hook with all state, validations, and submit.
- ✅ `PackageTopBar.tsx` (78) — Selects for origin/destination/payment/method.
- ✅ `ClientSection.tsx` (127) — Reusable sender/recipient section with color variant.
- ✅ `ItemsSection.tsx` (108) — Items table with `ui/` `Table` component.
- Shell `PackageRegistrationModal.tsx` (199) within the ≤200 target.

### ~~1.2 `TicketsIndexPage.tsx`~~ ✅ (796 → 368 lines)

Extraction in `frontend/src/components/tickets/`:
- ✅ `tickets-helpers.ts` (66) — Types + formatters + status helpers.
- ✅ `TicketsStatsCards.tsx` (34) — Stats cards.
- ✅ `TicketsFilters.tsx` (103) — Search + advanced filters.
- ✅ `TicketsListViews.tsx` (114) — `TicketsTableView` (uses `ui/` `Table`) + `TicketsCardGridView`.
- ✅ `TicketFormModal.tsx` (121) — Modal to create/edit tickets.

### ~~1.3 `use-trip-detail-page.ts`~~ ✅ (648 → 355 lines)

Division into specialized hooks in `frontend/src/hooks/`:
- ✅ `use-trip-seat-locks.ts` (105) — WebSocket + polling fallback for seat locks.
- ✅ `use-trip-packages-panel.ts` (121) — Package state and handlers.
- ✅ `use-trip-staff-editor.ts` (61) — Driver/Assistant editing.
- `use-trip-detail-page.ts` (355) remains as orchestrator.

### ~~1.4 Pilot A11y~~ ✅

- ✅ `ClientsIndexPage.tsx`: 4× `<Card onClick>` → `<ClickableCard ariaLabel=...>` (keyboard/focus ring).
- ✅ `DriverDashboard.tsx:241`: native `<button>` → `<Button variant="ghost" aria-expanded aria-label>`.
- ✅ `AssistantDashboard.tsx:308`: same pattern.
- ✅ `PackageRegistrationModal.tsx` (header close, remove client, add/remove item, cancel/confirm): all migrated to `Button` with `aria-label`.

### 1.5 Pilot Retro

Lessons learned for Phase 2:
- **`ClickableCard` covers current cases** — no extra variants needed for now.
- **Sender/Recipient Pattern**: Extracting reusable sections with `color` prop works better than subcomponents per step — avoids duplication of ~95% of JSX.
- **Single Hook + Composable Sub-hooks**: Pattern validated in `use-trip-detail-page`. Keep the orchestrator and extract by domain.
- **Pre-existing `any`**: Not blocked in Phase 1 (was in baseline). Progressive reduction in Phase 3.
- **300-line Limit**: Reasonable for shells and presentation components. For hooks with business logic (329 lines for the package hook), accept up to ~400 as warning, tighten to 400 in Phase 3.

---

## Phase 2 — Rollout (2–3 sprints, by batches)

Batches by functional area, independent PR per batch:

1. ~~**Trips**~~ ✅ **Completed (2026-04-19)**:
   - `TripPackagesManifestPage`: 604 → 78 (-87%). Extracted to `components/trips/manifest/` (styles, helpers, use-trip-manifest, ManifestHeader, ManifestTable).
   - `TripSheetPage`: 579 → 102 (-82%). Extracted to `components/trips/sheet/` (styles, helpers, use-trip-sheet, SheetHeader, PassengerTable).
   - `TripPackageViews.tsx`: 421 → 3 (barrel). Split into `components/trips/package-views/` (types, StatusDot, PackageActions, PackageListView, PackageCardsView).
   - A11y: native print buttons → `Button` with `aria-label`. `PackageActions` with descriptive `aria-label` per package. Native `<table>` in print documents kept with punctual `eslint-disable` (justification: real tabular structure for printing).
2. ~~**Dashboards**~~ ✅ **Completed (2026-04-19)**:
   - `AssistantDashboard.tsx`: 538 → 162 (-70%). Extracted to `components/dashboards/assistant/` (types, constants, KpiCard, TripPassengersTable, TripPackagesTable, BoardingChecklist, TripCard). Native tabs → `Button role="tab" aria-selected`.
   - `SecretaryDashboard.tsx`: 465 → 208 (-55%). Extracted to `components/dashboards/secretary/` (activity-helpers, use-secretary-dashboard, StatCards, QuickActions, CashRegisterWidget, RecentActivityWidget). Native quick actions → `ClickableCard`.
   - `QuickSearch.tsx`: 465 → 83 (-82%). Extracted to `components/dashboard/quick-search/` (types, categories, use-quick-search, SearchTrigger, CategoryPicker, SearchResultsView). All native `<button>` → `Button` or `ClickableCard` with `aria-label`.
3. ~~**Packages**~~ ✅ **Completed (2026-04-19)**:
   - `PackageDetailPage.tsx`: 491 → 129 (-74%). Extracted to `components/packages/detail/` (helpers, PackageHeader, RouteDetails, JourneyProgress, MapOverview, StateHistoryTable, PaymentSummary, AssignedTripCard). Native action buttons → `Button` with `aria-label`. Header includes new "View Receipt" button with `FileText`.
   - `PackagesIndexPage.tsx`: 411 → 209 (-49%). Extracted to `pages/packages/packages-index/` (helpers with filterPackages/computeStats, StatCards, QuickActions, PackageFilters, Pagination). Quick actions (`Card onClick`) → `ClickableCard`.
   - `PackageReceiptModal.tsx`: 393 → 81 (-79%). Extracted to `components/packages/receipt/` (print-styles as const, helpers with printReceipt/computeTotalAmount, ReceiptHeader, ReceiptItemsTable, ReceiptDocument). Native print/close buttons → `Button`. Overlay `div onClick` → `Button` with `aria-label`. Impure `useEffect` + `Math.random()` → lazy `useState`.
4. ~~**Admin/Forms**~~ ✅ **Completed (2026-04-19)**:
   - `BusForm.tsx`: 469 → 71 (-85%). Extracted to `components/admin/bus-form/` (types, use-bus-form, BusFormHeader, BusFormStep1, BusFormStep2). Floor tabs → `Button role="tab" aria-selected`. Close button and steps → `Button` with `aria-label`.
   - `ReportsPage.tsx`: 462 → 89 (-81%). Extracted to `pages/admin/reports/` (constants, SummaryCard, DetailTable, BreakdownTable, TicketReport, PackageReport, CashReport, ReportsHeader, ReportTabs). Native `<select>` → `FormSelect`. Download/tab buttons → `Button` with `aria-label`/`role="tab"`. Report `<table>` kept with punctual `eslint-disable` (real tabular).
   - `UserTable.tsx`: 399 → 93 (-77%). Extracted to `components/admin/user-table/` (types, helpers with computeDisplayedPages/getRoleLabel/etc., UserTableToolbar, UserTableFilters, UserTableRow, UserTableBody, UserTablePagination). Inline SVGs → `lucide-react`. Row buttons (view/edit/activate/deactivate/delete) + refresh + pagination → `Button` with `aria-label`. User table kept with punctual `eslint-disable`.
   - `RouteForm.tsx`: 380 → 77 (-80%). Extracted to `components/admin/route-form/` (types, helpers, use-route-form, RouteFormHeader, RouteFormFields, ScheduleEditor). Native buttons (close, active toggle, delete schedule) → `Button` with `aria-label`. Added prop typing and `setForm` with functional updater.
5. ~~**Tickets/Clients**~~ ✅ **Completed (2026-04-19)**:
   - `TicketDetailPage.tsx`: 449 → 139 (-69%). Extracted to `pages/tickets/ticket-detail/` (helpers, TicketDetailHeader, PassengerCard, TripLogisticsCard, PaymentSummaryCard, QuickActionsCard). Native "Quick Actions" buttons → `Button` with `aria-label`.
   - `TicketSaleModal.tsx`: 444 → 147 (-67%). Extracted to `components/tickets/ticket-sale/` (types, use-ticket-sale, SaleModalHeader, ClientTypePicker, ExistingClientPanel, NewClientFields, TicketFieldsForm, TicketPreviewPanel). Native radios → `Button role="radio" aria-checked`. Overlay `div onClick` → a11y `Button`. Inline SVGs → `lucide-react`. Client search results → `ClickableCard`.
   - `ClientFilters.tsx`: 346 → 87 (-75%). Extracted to `components/clients/client-filters/` (types, helpers with cleanFilters/countActive/describeDateFilter, use-client-filters, FiltersHeader, BasicFilters, AdvancedFilters, ActiveFilterChips). SVGs → `lucide-react`. Native buttons (advanced toggle, clear, apply, chips X) → `Button` with `aria-label`/`aria-expanded`.

Each batch:
- Split following the pilot pattern.
- Fix a11y with axe on affected routes.
- When closing the batch, increase the `max-lines` threshold if appropriate.

---

## ~~Phase 3 — Tightening~~ ✅ 3.1 Completed (2026-04-20)

- ~~`max-lines` to error at 400 lines.~~ ✅
- ~~`jsx-a11y/recommended` → errors.~~ ✅
- ~~`react/forbid-elements` (via `no-restricted-syntax`) blocking.~~ ✅
- ~~Total purge of `any` in `services/`, `slices/`, `hooks/`, pages, and components.~~ ✅ (patterns documented in `docs/guides/ui-conventions.md` §7)
- Pending: axe-core in E2E tests (out of current scope).

**Final Lint State:** 0 `no-explicit-any` errors, 0 a11y errors, 0 `no-restricted-syntax` errors. 10 `exhaustive-deps` warnings remain (non-blocking) and 1 pre-existing parsing error in `tests/components/RouteTable.test.tsx` (garbage test, unrelated).

---

## Critical Files to Modify

| File | Phase | Action |
|---|---|---|
| `frontend/eslint.config.*` | 0 | Add rules |
| `frontend/package.json` | 0 | Dep `eslint-plugin-jsx-a11y` |
| `frontend/src/components/ui/clickable-card.tsx` | 0 | Create |
| `docs/guides/ui-conventions.md` | 0 | Create |
| `.github/workflows/*.yml` | 0 | Lint in CI |
| `frontend/src/components/packages/PackageRegistrationModal.tsx` | 1 | Split |
| `frontend/src/pages/tickets/TicketsIndexPage.tsx` | 1 | Split |
| `frontend/src/hooks/use-trip-detail-page.ts` | 1 | Split |
| `frontend/src/pages/clients/ClientsIndexPage.tsx` | 1 | a11y |
| `frontend/src/pages/dashboards/{Driver,Assistant}Dashboard.tsx` | 1 | a11y |
| Phase 2 Batches | 2 | Split + a11y |

---

## Reuse (Do not reinvent)

- **Existing components** in `src/components/ui/`: `Button`, `Card`, `Dialog`, `Sheet`, `Table`, `Tabs`, `DropdownMenu`, `Skeleton`, `Alert`. Prefer these before creating new ones.
- **Split Hook Pattern**: Model to follow in existing `src/hooks/use-trip-details.ts`.
- **Redux slices + services Pattern**: Already established (13 slices, 18 services); newly extracted hooks should consume them, not duplicate fetching.
- **Design Tokens**: Use those from `src/styles/globals.css` (Comarapa brand colors, statuses). Do not introduce hardcoded colors.

---

## Verification

### Per Phase

**Phase 0:**
```bash
cd frontend && npm run lint           # passes
npm run typecheck                     # passes
npm run dev                           # app loads
```
- Verify that adding a native `<button>` in a test file causes lint to fail with a clear message.

**Phase 1 (per pilot file):**
- `npm run lint` and `npm run typecheck` pass.
- Manually test in browser:
  - `PackageRegistrationModal`: create package end-to-end (secretary1@transcomarapa.com).
  - `TicketsIndexPage`: load listing, filter, open detail.
  - Trip detail: load a trip, see seats, tickets, packages.
- a11y: navigate with Tab, activate with Enter/Space; run axe DevTools, 0 critical violations.
- Run tests: `npm test` if they exist covering these areas.

**Phase 2/3:**
- Per batch: same checklist + smoke test of affected role (admin, secretary, driver, assistant, client).

### Global

- Before/After: count of files >300 lines (goal: 0 by the end of Phase 3).
- Before/After: `jsx-a11y` violations (goal: 0 errors).
- Green CI on master.

---

## Risks

- **Regressions in critical modals** (PackageRegistration, TicketSale): Mitigate with manual smoke tests per role after each split.
- **Pattern divergence between batches**: Mitigate with Phase 1 retro and updated written conventions.
- **Linting too strict initially**: That's why it's introduced progressively (warning → error).
