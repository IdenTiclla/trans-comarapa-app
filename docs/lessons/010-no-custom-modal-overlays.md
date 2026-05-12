# Lesson 010: No usar overlays modales custom

**Fecha:** 2026-05-11
**Contexto:** Páginas de admin con formularios modales para CRUD de entidades

## Error

```tsx
// MAL
{showForm && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2>Título</h2>
      {/* formulario */}
    </div>
  </div>
)}
```

**Resultado:** Sin `role="dialog"`, sin `aria-modal`, sin focus trap, sin focus return, sin Escape para cerrar. Inaccesible para lectores de pantalla y navegación por teclado.

## Causa raíz

Se usaron divs custom para simular modales en vez del componente `Dialog` de Radix UI que ya existe en el proyecto y maneja toda la accesibilidad automáticamente.

## Solución

```tsx
// BIEN
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

<Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false) }}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descripción del diálogo.</DialogDescription>
    </DialogHeader>
    {/* formulario */}
  </DialogContent>
</Dialog>
```

## Regla

Siempre usa `Dialog` / `DialogContent` de `@/components/ui/dialog` para modales. Nunca uses divs custom con `fixed inset-0`.
