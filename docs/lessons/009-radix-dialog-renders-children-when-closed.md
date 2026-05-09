# Lesson 009: Radix Dialog renderiza hijos aunque open={false}

**Fecha:** 2026-05-09
**Contexto:** Migración de modales custom (`<div>` overlay) a `Dialog` de Radix/shadcn en TripConfirmationModals

## Error

```tsx
// MAL — Dialog siempre monta sus hijos, incluso con open={false}
<Dialog open={seatChange.showConfirm} onOpenChange={...}>
  <DialogContent>
    <DialogDescription>
      Asiento {(seatChange.ticket.seat as Record<string, unknown>)?.seat_number}
    </DialogDescription>
  </DialogContent>
</Dialog>
```

**Resultado:** `Cannot read properties of null (reading 'seat')` — cuando `seatChange.ticket` es `null`, Radix aún renderiza el contenido internamente (para animaciones de salida) y el acceso a `.seat` falla.

## Causa raíz

Radix `Dialog` renderiza sus hijos en el DOM incluso cuando `open={false}` para gestionar animaciones de entrada/salida (`animate-out`). A diferencia de un `{condition && <div>}` condicional que no monta nada si la condición es falsa, el Dialog siempre ejecuta el render de sus hijos.

## Solución

```tsx
// BIEN — envolver con condición para evitar null access
{seatChange.showConfirm && seatChange.ticket && seatChange.newSeat && (
  <Dialog open onOpenChange={(open) => { if (!open) seatChange.cancel() }}>
    <DialogContent>
      <DialogDescription>
        Asiento {(seatChange.ticket.seat as Record<string, unknown>)?.seat_number}
      </DialogDescription>
    </DialogContent>
  </Dialog>
)}
```

## Regla

Siempre envolver `Dialog` de Radix con una condición `{datos && <Dialog open>}` cuando los datos internos pueden ser `null`. No confiar en `open={false}` para prevenir el render de hijos.
