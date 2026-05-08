# Common Violations & Anti-Patterns

Known issues repeatedly found in this codebase. When auditing, specifically check for these.

---

## 1. `<div onClick>` Pattern (27+ instances known)

The most common a11y violation. Often hidden with `eslint-disable`.

```tsx
// VIOLATION — found in modals, cards, overlays
<div
  onClick={handleClose}
  className="fixed inset-0 bg-black/50"
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
/>
```

**When it's acceptable:** Pure overlay backdrop that should close on click — the overlay is not interactive content, it's a dismiss trigger. However, it should also support Escape key.

**When it's a bug:** Clickable cards, list items, or any element the user intentionally clicks to perform an action. These must be `<button>` or `ClickableCard`.

**Fix pattern:**
```tsx
// For overlay backdrops — add keyboard support
<div
  onClick={handleClose}
  onKeyDown={(e) => e.key === 'Escape' && handleClose()}
  role="button"
  tabIndex={-1}
  aria-label="Cerrar"
/>

// For clickable content — use proper component
<ClickableCard onClick={handleOpen} ariaLabel="Ver detalle del boleto">
  {content}
</ClickableCard>
```

## 2. Missing `aria-label` on Icon-Only Buttons

```tsx
// VIOLATION
<Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
  <Trash2 className="h-4 w-4" />
</Button>

// FIX
<Button variant="ghost" size="icon" onClick={() => onDelete(id)} aria-label="Eliminar">
  <Trash2 className="h-4 w-4" />
</Button>
```

## 3. Hardcoded Tailwind Colors

```tsx
// VIOLATION — using raw color scales
className="text-blue-600 bg-gray-100 border-gray-200"

// FIX — use design tokens
className="text-primary bg-muted border"
```

Check these files specifically:
- Any file with `bg-gray-*`, `text-gray-*`, `border-gray-*`
- Any file with `bg-blue-*`, `text-blue-*`
- Any file with hex colors like `#123456`

## 4. Missing UI States

A view renders data but has no loading, empty, or error handling.

```tsx
// VIOLATION — no loading, no empty state, no error handling
function TicketList({ tickets }: { tickets: Ticket[] }) {
  return (
    <div>
      {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
    </div>
  )
}

// FIX — add all three states
function TicketList({ tickets, isLoading, error }: Props) {
  if (isLoading) return <TicketsSkeleton />
  if (error) return <Alert variant="destructive">{error}</Alert>
  if (tickets.length === 0) return <EmptyState title="Sin boletos" description="..." />
  return (
    <div>
      {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
    </div>
  )
}
```

## 5. Inline Button Color Overrides

```tsx
// VIOLATION
<Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
  Submit
</Button>

// FIX — use proper variant
<Button variant="default">Submit</Button>
```

## 6. Handmade Empty States

```tsx
// VIOLATION — inline empty message
<div className="text-center py-12 text-gray-500">
  No hay boletos disponibles
</div>

// FIX — use EmptyState component
<EmptyState
  title="Sin boletos"
  description="No se encontraron boletos para este viaje"
  action={<Button onClick={onCreate}>Crear Boleto</Button>}
/>
```

## 7. Missing Form Label Associations

```tsx
// VIOLATION — label text but no htmlFor/id connection
<div className="space-y-1">
  <span className="text-sm font-medium">Cliente</span>
  <Input value={client} onChange={...} />
</div>

// FIX — use Label component with htmlFor
<div className="space-y-1">
  <Label htmlFor="client-input">Cliente</Label>
  <Input id="client-input" value={client} onChange={...} />
</div>
```

## 8. Using `alert()` or `console.log()` for User Messages

```tsx
// VIOLATION
alert('Boleto creado exitosamente')
console.log('Error:', error)

// FIX
toast.success('Boleto creado exitosamente')
toast.error(error instanceof Error ? error.message : 'Error al crear boleto')
```

## 9. File Size Exceeding 400 Lines

When a file exceeds 400 lines, it will fail CI. Common extraction targets:

- **Subcomponents:** Extract repeated JSX blocks into `components/<feature>/`
- **Hooks:** Move state and data logic to `hooks/use-<name>.ts`
- **Helpers:** Pure functions to `lib/` or `<feature>/helpers.ts`

## 10. `navigate('/hardcoded-path')` in Close Callbacks

```tsx
// VIOLATION — hardcoded route on modal close
onClose={() => navigate('/tickets')}

// FIX — use navigate(-1) since pages can be reached from multiple locations
onClose={() => navigate(-1)}
```

## 11. Missing Destructive Action Confirmation

```tsx
// VIOLATION — delete without confirmation
<Button variant="destructive" onClick={() => deleteMutation.mutate(id)}>
  Eliminar
</Button>

// FIX — use AlertDialog
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Eliminar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar eliminacion</AlertDialogTitle>
      <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => deleteMutation.mutate(id)}>Eliminar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 12. Re-implemented Pagination

```tsx
// VIOLATION — custom prev/next buttons
<div className="flex gap-2">
  <button onClick={prevPage}>Anterior</button>
  <span>Pagina {page}</span>
  <button onClick={nextPage}>Siguiente</button>
</div>

// FIX — use Pagination component
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  variant="compact"
/>
```

---

## Quick Scan Commands

When auditing, use these search patterns to find violations quickly:

1. `<div onClick` or `<div\n.*onClick` — non-semantic clickable elements
2. `size="icon"` without `aria-label` — unlabeled icon buttons
3. `text-gray-`, `bg-gray-`, `border-gray-`, `text-blue-`, `bg-blue-` — hardcoded colors
4. `text-center py-` with "No hay" or "Sin" — inline empty states
5. Files > 400 lines in `frontend/src/` (excluding `ui/` and `forms/`)
6. `eslint-disable.*jsx-a11y` — suppressed accessibility rules
7. `alert(` — browser alerts
8. `console.log(` — debug logging in production code
