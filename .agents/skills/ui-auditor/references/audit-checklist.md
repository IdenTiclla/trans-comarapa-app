# Audit Checklist — Detailed Reference

This file provides the full audit checklist with concrete examples specific to this project.

---

## A. Accessibility (WCAG 2.1 AA)

### A1. Semantic HTML & Interactive Elements

**Rule:** All interactive elements must use semantic HTML or project UI components.

```tsx
// BAD — div with onClick (common anti-pattern in this codebase)
<div onClick={handleClick} className="cursor-pointer">
  View Details
</div>

// GOOD — use Button or ClickableCard
<Button variant="ghost" onClick={handleClick}>View Details</Button>
<ClickableCard onClick={handleClick} ariaLabel="View details for ticket #123">
  ...
</ClickableCard>
```

**Check:** Search for `<div` with `onClick` nearby. These are flagged by `jsx-a11y/click-events-have-key-events` and `jsx-a11y/no-static-element-interactions`.

### A2. ARIA Attributes

**Icon-only buttons** — Every button that has only an icon (no visible text) needs `aria-label`:
```tsx
// BAD
<Button variant="ghost" size="icon" onClick={onDelete}><Trash2 /></Button>

// GOOD
<Button variant="ghost" size="icon" onClick={onDelete} aria-label="Eliminar"><Trash2 /></Button>
```

**Dialogs/Modals** — Must have accessible name:
```tsx
// Dialog from shadcn already handles this via DialogTitle, but verify:
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Crear Nuevo Boleto</DialogTitle>  {/* Required */}
    </DialogHeader>
  </DialogContent>
</Dialog>
```

**Dynamic content** — Status changes, counts, filtering results should be announced:
```tsx
// When filtering reduces visible items, consider aria-live for screen readers
<div aria-live="polite" className="sr-only">
  {filteredTickets.length} boletos encontrados
</div>
```

### A3. Keyboard Navigation

**Tab order:** Interactive elements must appear in logical DOM order. Avoid `tabIndex` > 0.

**Focus within components:**
- Tabs: Arrow keys navigate between tabs
- Dropdowns: Arrow keys navigate options, Escape closes
- Modals: Tab cycles within modal, Escape closes
- Tables: Tab enters/exits table (complex tables may use arrow keys for cells)

**Verify:** Can you complete the primary action (create ticket, edit entity, submit form) using only keyboard?

### A4. Focus Management

**Modal focus:** When a modal opens, focus moves to the first interactive element or the modal title. When it closes, focus returns to the trigger element.

**Route changes:** After navigation, focus should move to the main content area (not stay on sidebar or header).

**Dynamic content:** When content updates (e.g., list refreshes, form submissions), focus should move to relevant new content or remain where it makes sense.

### A5. Form Labels & Validation

Every form input must have:
1. A `<Label>` component with `htmlFor` matching the input's `id`
2. Clear indication of required fields
3. Error messages associated with the input

```tsx
// BAD — no label, no id association
<div>
  <span>Nombre</span>
  <Input value={name} onChange={...} />
</div>

// GOOD
<div>
  <Label htmlFor="client-name">Nombre *</Label>
  <Input id="client-name" value={name} onChange={...} />
  {error && <p className="text-sm text-destructive">{error}</p>}
</div>
```

### A6. Color & Contrast

- **Never convey meaning by color alone.** Status badges must have text + icon, not just a colored dot.
- **Contrast ratios:** Normal text 4.5:1, Large text 3:1, UI components 3:1.
- **Status colors** are already defined in tokens: `status-available`, `status-medium`, `status-full`. Use them with accompanying text.

```tsx
// BAD — status by color only
<span className="h-2 w-2 rounded-full bg-green-500" />

// GOOD — color + text
<Badge variant="outline" className="border-status-available text-status-available">
  Disponible
</Badge>
```

### A7. Images & Icons

- Decorative icons (next to text labels): no `aria-label` needed
- Icon-only buttons: `aria-label` required
- `<img>` tags: meaningful `alt` text or `alt=""` for decorative
- SVG icons from Lucide are decorative by default when paired with text

### A8. Screen Reader Announcements

Key moments to announce:
- Form submission success/failure
- Loading state transitions
- List filtering results count
- Modal opening/closing
- Validation errors

Use `aria-live="polite"` for non-urgent updates and `aria-live="assertive"` or `role="alert"` for errors.

### A9. ESLint Disable Comments

Known pattern in this codebase — 30 instances of disabled a11y rules:
```tsx
// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
```

When auditing, check each one: is the disable justified (e.g., overlay backdrop that doesn't need interaction), or is it hiding a real accessibility bug?

---

## B. UI Convention Compliance

### B1. Allowed Components Check

Verify imports. Allowed sources:
- `@/components/ui/*` — 24 primitives
- `@/components/common/*` — shared components (EmptyState, etc.)
- `@/components/dashboard/*` — DashboardStatCard
- `sonner` — toast notifications
- `@/lib/print` — openPrintWindow

Forbidden in non-`ui/` files:
- `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`

### B2. Design Token Verification

Check Tailwind classes against the token allowlist:

| Use | Token | Forbidden |
|---|---|---|
| Background | `bg-background` | `bg-white`, `bg-gray-50` |
| Text | `text-foreground` | `text-gray-900`, `text-black` |
| Secondary text | `text-muted-foreground` | `text-gray-500/600` |
| Borders | `border` | `border-gray-200/300` |
| Primary CTA | `bg-primary`, `text-primary` | `bg-blue-600` |
| Destructive | `text-destructive`, `bg-destructive` | `text-red-600` |
| Muted surface | `bg-muted` | `bg-gray-100` |

Exceptions: `status-*` tokens and brand-specific tokens in `globals.css` are allowed.

### B3. Button Variant Usage

| Variant | Purpose | Visual |
|---|---|---|
| `default` | Primary action — ONE per view | Filled primary |
| `outline` | Secondary (cancel, filter) | Bordered |
| `ghost` | Tertiary, icon-only, in-card | Transparent |
| `destructive` | Delete, irreversible | Red accent + confirm dialog |
| `link` | Inline navigation | Text underline |

**Never** override colors inline on buttons.

### B4. Mandatory UI States

Every data-consuming view must handle three states:

```tsx
if (isLoading) return <Skeleton className="h-[200px] w-full" />
if (error) return <Alert variant="destructive">...</Alert>
if (data.length === 0) return <EmptyState title="..." description="..." action={...} />
return <DataView data={data} />
```

### B5. File Size

- Hard limit: **400 lines** (ESLint error, CI blocks)
- Ideal: **300 lines**
- Extract to: subcomponents, hooks (`use-*.ts`), helpers (`*-helpers.ts`, `lib/`)

---

## C. UX Quality

### C1. Responsive Breakpoints

| Breakpoint | Token | Target |
|---|---|---|
| 320px | `xs:` | Small phones |
| 480px | `sm:` | Large phones |
| 768px | `md:` | Tablets |
| 1024px | `lg:` | Desktop |
| 1280px | `xl:` | Large desktop |
| 1440px | `2xl:` | Wide screens |

Check: Does the layout stack vertically on mobile? Are tables scrollable or card-view on small screens? Are modals full-screen on mobile?

### C2. Loading UX

- Show `Skeleton` immediately when data fetch starts
- No flash of empty content between loading and data arrival
- For actions (submit, delete): disable button, show loading state, re-enable on completion

### C3. Error Recovery

- Network errors: show Alert with "Reintentar" button
- Form validation: show inline errors next to the relevant field, preserve user input
- Permission errors: clear message, redirect if needed

### C4. Destructive Action Confirmation

Any action that deletes data or is irreversible MUST use `AlertDialog`:
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Eliminar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
      <AlertDialogDescription>
        Esta accion no se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### C5. Navigation Patterns

- Back/close actions: `navigate(-1)` (not hardcoded routes)
- Breadcrumbs: use `Breadcrumb` component
- Sidebar: current page highlighted via active state

### C6. Consistency Check

When auditing a new component, compare with similar existing components:
- Does it use the same stat card pattern?
- Does pagination match the project's `Pagination` component?
- Are empty states consistent with `EmptyState`?
- Are status badges consistent with other views?
