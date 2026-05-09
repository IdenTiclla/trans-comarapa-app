# Plan: Auditoría UI/UX/A11y — Emisión de Encomienda

## Objetivo

Corregir las 10 incidencias críticas y 8 advertencias detectadas en la auditoría de accesibilidad, convenciones UI y calidad UX del flujo de emisión de encomienda (`PackageRegistrationModal` + subcomponentes). Priorizar la migración a `Dialog` de shadcn/ui como fix estructural que resuelve múltiples problemas de un golpe.

---

## Archivos afectados

| Archivo | Líneas | Rol |
|---|---|---|
| `frontend/src/components/packages/PackageRegistrationModal.tsx` | 208 | Modal principal del formulario |
| `frontend/src/components/packages/registration/use-package-registration.ts` | 410 | Hook con estado, validación y envío |
| `frontend/src/components/packages/registration/ClientSection.tsx` | 139 | Sección remitente/consignatario |
| `frontend/src/components/packages/registration/ItemsSection.tsx` | 108 | Sección de artículos |
| `frontend/src/components/packages/registration/PackageTopBar.tsx` | 86 | Barra superior oficinas/pago |
| `frontend/src/pages/packages/PackageNewPage.tsx` | 34 | Página wrapper |

---

## Fase 1 — Migración del modal custom a `Dialog` de shadcn/ui

**Resuelve 6 issues críticos/de advertencia de un golpe:** focus trap, Escape-to-close, `aria-modal`, `aria-labelledby`, `eslint-disable` en backdrop, y retorno de foco.

### Paso 1.1 — Refactorizar `PackageRegistrationModal.tsx`

Reemplazar el overlay custom con `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle`:

- **Antes:**
  ```tsx
  <div className="fixed inset-0 z-[60] ...">
    <div className="absolute inset-0" aria-hidden="true" onClick={onClose}></div>
    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
    <div className="relative ..." onClick={(e) => e.stopPropagation()}>
      ...
    </div>
  </div>
  ```

- **Después:**
  ```tsx
  <Dialog open={show} onOpenChange={(open) => { if (!open) onClose() }}>
    <DialogContent className="max-w-[88rem] max-h-[92vh] overflow-hidden p-0">
      <DialogHeader className="bg-primary px-4 py-3 flex flex-row items-center justify-between border-b">
        <DialogTitle className="text-lg font-bold text-primary-foreground">
          {r.isEditMode ? 'Editar Encomienda' : 'Emisión de Encomienda'}
        </DialogTitle>
        {/* tracking number + close button */}
      </DialogHeader>
      {/* form body */}
    </DialogContent>
  </Dialog>
  ```

- Eliminar `aria-hidden="true"` del backdrop (Dialog lo maneja).
- Eliminar `eslint-disable` lines para click-events y no-static-element-interactions.
- Eliminar `onClick={(e) => e.stopPropagation()}` (DialogContent ya lo hace).
- El botón X de cerrar puede mantenerse con `variant="ghost"` pero sin necesidad de manejar onClose manualmente — `onOpenChange` lo hace.

### Paso 1.2 — Ajustar `PackageNewPage.tsx`

- Eliminar el wrapper `<Card>` / `<CardContent>` redundante (el modal es fullscreen, el Card nunca se ve).
- Renderizar `<PackageRegistrationModal>` directamente.

---

## Fase 2 — Reemplazar colores hardcoded por design tokens

**Resuelve ~50+ instancias de violación §6.1 y §6.2.**

### Paso 2.1 — `PackageRegistrationModal.tsx`

| Antes | Después | Línea(s) |
|---|---|---|
| `text-blue-600` (sender icon) | `text-primary` | L20 |
| `text-green-600` (recipient icon) | `text-primary` (o mantener si hay token de accent) | L26 |
| `bg-gray-50`, `border-gray-100/50` | `bg-card`, `border` | L56 |
| `bg-gradient-to-r from-blue-600 to-blue-700` (header) | `bg-primary` | L59 |
| `bg-white/10` (icon bg) | `bg-primary-foreground/10` | L61 |
| `text-blue-200` (tracking label) | `text-primary-foreground/70` | L72 |
| `bg-gray-50/50` (scroll area) | `bg-background` | L90 |
| `text-gray-500` (copy button) | `text-muted-foreground` | L127 |
| `bg-red-50 border-red-200 text-red-500 text-red-800` (same person alert) | Usar `Alert` con `variant="destructive"` | L135-139 |
| `bg-yellow-50 border-yellow-200 text-yellow-800 text-yellow-600` (legal notice) | `bg-muted border text-muted-foreground` | L144-146 |
| `bg-white border-gray-200` (confirmation box) | `bg-card border` | L148 |
| `border-gray-200` (divider) | `border` | L169 |
| `text-red-500 bg-red-50 border-red-200` (form error) | Usar `Alert variant="destructive"` | L171 |
| `bg-blue-600 hover:bg-blue-700` (submit button) | Eliminar className override, usar `variant="default"` | L190 |

### Paso 2.2 — `ClientSection.tsx`

| Antes | Después |
|---|---|
| `border-blue-500 bg-blue-50 text-blue-700` | `border-primary bg-primary/10 text-primary` |
| `border-green-500 bg-green-50 text-green-700` | Token consistente para consignatario |
| `bg-white border-gray-200` | `bg-card border` |
| `text-gray-900` | `text-foreground` |
| `text-gray-600` | `text-muted-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200 text-gray-600 hover:bg-gray-50` | `border text-muted-foreground hover:bg-muted` |
| `border-gray-100` | `border` |
| `bg-blue-50 border-blue-200` (selected card) | `bg-primary/5 border-primary/20` |

### Paso 2.3 — `ItemsSection.tsx`

| Antes | Después |
|---|---|
| `bg-white border-gray-200` | `bg-card border` |
| `text-gray-900` | `text-foreground` |
| `text-indigo-600` | `text-primary` |
| `bg-gray-50` (table header) | `bg-muted` |
| `text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100` (delete btn) | Eliminar overrides, usar `variant="ghost" className="text-destructive"` |
| `text-blue-600 bg-blue-50 hover:bg-blue-100` (add btn) | Eliminar overrides, usar `variant="outline"` |
| `bg-blue-50 border-blue-100 text-blue-900` (total box) | `bg-primary/5 border-primary/10 text-primary` |
| `text-gray-600` (total label) | `text-muted-foreground` |
| `border-gray-100` | `border` |

### Paso 2.4 — `PackageTopBar.tsx`

| Antes | Después |
|---|---|
| `bg-white border-gray-200` | `bg-card border` |
| `text-gray-700` | `text-muted-foreground` |
| `bg-blue-50 text-blue-700 border-blue-200` (status badge) | `bg-primary/10 text-primary border-primary/20` |
| `bg-yellow-50 text-yellow-800 border-yellow-200` (status badge) | `bg-muted text-muted-foreground border` |

---

## Fase 3 — Reemplazar `<div onClick>` en búsqueda de clientes

**Resuelve el Critical Issue #7 (ClientSection.tsx).**

### Paso 3.1 — Resultados de búsqueda

Reemplazar `<div onClick>` en `ClientSection.tsx:95-96`:

```tsx
// ANTES
// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
<div key={client.id} onClick={() => search.selectExistingClient(client)} className="...">

// DESPUÉS
<button
  key={client.id}
  type="button"
  onClick={() => search.selectExistingClient(client)}
  className="p-2 border-b border w-full text-left ... hover:bg-muted"
>
```

- Eliminar `eslint-disable`.
- Agregar `type="button"` para evitar submit accidental.
- Reemplazar `cursor-pointer` con estilos de botón nativo.

### Paso 3.2 — Reemplazar `<input type="radio">` con `RadioGroup`

Reemplazar en `ClientSection.tsx:63,69`:

```tsx
// ANTES
{/* eslint-disable-next-line no-restricted-syntax */}
<input type="radio" ... />

// DESPUÉS — usar RadioGroup de @/components/ui/radio-group
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

<RadioGroup value={search.clientType} onValueChange={search.setClientType}>
  <div className="grid grid-cols-2 gap-2">
    <Label className={cn('flex items-center justify-center ...', activeClsWhenExisting)}>
      <RadioGroupItem value="existing" className="sr-only" />
      Cliente Existente
    </Label>
    <Label className={cn('flex items-center justify-center ...', activeClsWhenNew)}>
      <RadioGroupItem value="new" className="sr-only" />
      Cliente Nuevo
    </Label>
  </div>
</RadioGroup>
```

---

## Fase 4 — Reemplazar spinner manual con `Skeleton`

**Resuelve el Critical Issue #10 (ClientSection.tsx).**

```tsx
// ANTES
<div className="flex items-center justify-center py-4">
  <div className={cn('animate-spin rounded-full h-6 w-6 border-b-2', spinnerCls)}></div>
</div>

// DESPUÉS
<div className="space-y-2 py-4">
  <Skeleton className="h-8 w-full" />
  <Skeleton className="h-8 w-3/4" />
</div>
```

---

## Fase 5 — Reducir `use-package-registration.ts` a ≤ 400 líneas

**Resuelve el Critical Issue #9.**

El hook tiene 410 líneas. Extraer:

### Paso 5.1 — Extraer lógica de edición a `use-package-edit.ts`

Mover las líneas 167-211 (fetch + hydrate de paquete existente) a un hook separado:

```ts
// frontend/src/components/packages/registration/use-package-edit.ts
export function usePackageEdit({ show, isEditMode, packageId, onLoaded }) {
  useEffect(() => {
    if (!show || !isEditMode || !packageId) return
    // fetch + hydrate logic
  }, [show, isEditMode, packageId])
}
```

### Paso 5.2 — Extraer construcción de payload a helper

Mover las líneas 269-334 (construcción de `updatePayload` y `packagePayload`) a:

```ts
// frontend/src/lib/package-payload.ts
export function buildCreatePayload(packageData, senderId, recipientId, secretaryId, tripId) { ... }
export function buildUpdatePayload(packageData) { ... }
```

---

## Fase 6 — Mejoras de UX y A11y adicionales

### Paso 6.1 — Error del formulario con `Alert` + `role="alert"`

Reemplazar el error inline en `PackageRegistrationModal.tsx:170-176`:

```tsx
// ANTES
<div className="text-red-500 font-medium bg-red-50 px-4 py-2 ...">
  {r.formErrorMessage}
</div>

// DESPUÉS
{r.formErrorMessage && (
  <Alert variant="destructive" role="alert">
    <AlertDescription>{r.formErrorMessage}</AlertDescription>
  </Alert>
)}
```

### Paso 6.2 — Agregar `aria-label` a la tabla de artículos

En `ItemsSection.tsx:32`:

```tsx
<Table aria-label="Artículos de la encomienda">
```

### Paso 6.3 — Corregir `.toFixed()` sin null guard en `ItemsSection.tsx`

**Resuelve advertencia Lesson 002.**

En `ItemsSection.tsx:103`:

```tsx
// ANTES
<span className="text-lg font-bold text-blue-900">Bs. {totalAmount.toFixed(2)}</span>

// DESPUÉS (tras aplicar tokens de Fase 2)
<span className="text-lg font-bold text-primary">
  Bs. {(totalAmount ?? 0).toFixed(2)}
</span>
```

### Paso 6.4 — Reemplazar empty state inline en ClientSection

En `ClientSection.tsx:105-107`:

```tsx
// ANTES
<p className="text-xs text-gray-500">No se encontraron clientes.</p>

// DESPUÉS
<p className="text-xs text-muted-foreground">No se encontraron clientes con esa búsqueda.</p>
```

---

## Prerequisitos

Antes de ejecutar cualquier fase, verificar que los componentes shadcn/ui necesarios existen en el proyecto:

| Componente | Ruta | Existe? |
|---|---|---|
| `Dialog` | `components/ui/dialog.tsx` | ✅ |
| `Alert` | `components/ui/alert.tsx` | ✅ |
| `Skeleton` | `components/ui/skeleton.tsx` | ✅ |
| `RadioGroup` | `components/ui/radio-group.tsx` | ❌ — **instalar antes de Fase 3** |
| `Label` | `components/ui/label.tsx` | Verificar |

### Pre-paso — Instalar `RadioGroup`

```bash
cd frontend && npx shadcn@latest add radio-group label
```

Si `label.tsx` ya existe, solo instalar `radio-group`. Verificar que ambos archivos aparezcan en `components/ui/` antes de continuar.

---

## Orden de Implementación

Ejecutar estrictamente en este orden. No avanzar al paso siguiente sin verificar que el anterior pasa `npx tsc --noEmit` y `npm run lint`.

| Paso | Fase | Archivo(s) | Verificación |
|---|---|---|---|
| 0 | Pre | — | `RadioGroup` + `Label` instalados |
| 1 | 1.1 | `PackageRegistrationModal.tsx` | `tsc --noEmit` + `lint` |
| 2 | 1.2 | `PackageNewPage.tsx` | `tsc --noEmit` + `lint` |
| 3 | 2.1 | `PackageRegistrationModal.tsx` | `lint` (solo cambios de clases) |
| 4 | 2.2 | `ClientSection.tsx` | `lint` |
| 5 | 2.3 | `ItemsSection.tsx` | `lint` |
| 6 | 2.4 | `PackageTopBar.tsx` | `lint` |
| 7 | 3.1 | `ClientSection.tsx` (div→button) | `tsc --noEmit` + `lint` |
| 8 | 3.2 | `ClientSection.tsx` (RadioGroup) | `tsc --noEmit` + `lint` |
| 9 | 4 | `ClientSection.tsx` (Skeleton) | `lint` |
| 10 | 5.1 | Crear `use-package-edit.ts` + editar hook | `tsc --noEmit` + `lint` + `wc -l ≤ 400` |
| 11 | 5.2 | Crear `lib/package-payload.ts` + editar hook | `tsc --noEmit` + `lint` + `wc -l ≤ 400` |
| 12 | 6.1 | `PackageRegistrationModal.tsx` (Alert) | `lint` |
| 13 | 6.2 | `ItemsSection.tsx` (aria-label) | `lint` |
| 14 | 6.3 | `ClientSection.tsx` (empty state) | `lint` |
| 15 | — | — | Verificación completa (ver abajo) |

> Los pasos 3-6 (Fase 2) son solo cambios de clases CSS, sin lógica. Se pueden ejecutar en batch.

---

## Fuera de alcance (intencional)

- **Cambios en `PackageReceiptModal`**: el recibo no forma parte de la auditoría de emisión.
- **Refactor del hook `use-client-search.ts`**: el plan solo lo consume, no lo modifica.
- **Cambios en backend**: todas las incidencias son de frontend.
- **Migrar `FormInput`/`FormSelect`/`FormCheckbox` a componentes con `Label` for `htmlFor`**: incidencia real pero fuera del alcance de este plan (afecta toda la app, no solo encomiendas).
- **Nuevos tests unitarios para componentes de UI**: este plan corrige incidencias de auditoría; la cobertura de tests se puede abordar en un plan aparte.
- **Cambios en el flujo de edición de encomienda (`PackageEditPage`)**: solo se ajusta la lógica extraída; el flujo visual de edición no se rediseña.

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `Dialog` de shadcn tiene estilos por defecto (`sm:max-w-lg`) que rompen el layout fullscreen | Alto | Pasar `className="max-w-[88rem] max-h-[92vh] overflow-hidden p-0"` para sobreescribir. `cn()` de Tailwind merge respeta la última clase. |
| `DialogContent` incluye un botón X de cierre por defecto (`showCloseButton=true`) que puede duplicar con el existente | Medio | Usar `showCloseButton={false}` en `DialogContent` y mantener el X custom del header, o eliminar el custom y usar el de DialogContent. |
| Extraer `use-package-edit.ts` rompe las refs a `senderSearch`/`recipientSearch` del hook original | Medio | El hook de edición recibe callbacks `onSelectSender`/`onSelectRecipient` como parámetros, no accede directamente a los hooks de búsqueda. |
| `RadioGroup` con `sr-only` items puede perder navegación por teclado si los `Label` no son focuseables | Bajo | Probar manualmente: Tab debe llegar a RadioGroup, flechas deben cambiar opción. Si falla, hacer los items visibles. |
| `ItemsSection.tsx:103` usa `.toFixed(2)` directamente sobre `totalAmount` | Bajo (Lesson 002) | Corregir como `(totalAmount ?? 0).toFixed(2)` o mejor: `new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalAmount ?? 0)`. |
| El `eslint-disable-next-line react-hooks/exhaustive-deps` en `use-package-registration.ts:89,164,210` puede seguir siendo necesario | Bajo | No eliminar esos disables; solo documentar en code review por qué el dep array es intencionalmente parcial. |

---

## Verificación

Después de completar todas las fases:

1. **TypeScript**: `cd frontend && npx tsc --noEmit` — debe pasar sin errores
2. **ESLint**: `cd frontend && npm run lint` — debe pasar sin errores (los `eslint-disable` eliminados ya no existen)
3. **Build**: `cd frontend && npm run build` — debe compilar sin errores
4. **Verificación manual en browser**:
   - Abrir `/packages/new` — el modal debe abrirse como Dialog con focus trap
   - Presionar Tab — el foco debe permanecer dentro del modal
   - Presionar Escape — el modal debe cerrarse
   - Buscar un cliente existente — resultados deben ser clickeables y alcanzables por teclado
   - Cambiar entre "Cliente Existente" y "Cliente Nuevo" — RadioGroup debe funcionar
   - Verificar que no hay colores hardcoded inspeccionando elementos (solo tokens CSS)
   - Verificar que el spinner de búsqueda fue reemplazado por Skeleton
5. **Verificar tamaño de archivo**: `wc -l frontend/src/components/packages/registration/use-package-registration.ts` — debe ser ≤ 400

---

## Rollback

Si una fase falla y no se puede corregir rápidamente:

1. **Fase 1 (Dialog)**: revertir `PackageRegistrationModal.tsx` al overlay custom. Es la fase más invasiva — las demás no dependen de ella estructuralmente (solo de las clases CSS).
2. **Fases 2-4 (tokens, div→button, Skeleton)**: son cambios locales archivo por archivo. `git checkout -- <file>` para revertir solo ese archivo.
3. **Fase 5 (extracción)**: si la extracción rompe imports, mover la lógica de vuelta al hook original y eliminar los archivos nuevos (`use-package-edit.ts`, `lib/package-payload.ts`).
4. **RadioGroup (paso 3.2)**: si no se puede instalar o falla en CI, mantener los `<input type="radio">` actuales con los `eslint-disable` existentes y crear un issue para abordarlo después.

> La Fase 1 es el único paso que cambia la estructura del modal. Si se posterga, las Fases 2-6 se pueden ejecutar igualmente sobre el overlay custom (con los `eslint-disable` temporalmente restaurados).

---

## Resumen de incidencias resueltas por fase

| Fase | Critical Issues Resueltos | Warnings Resueltos |
|---|---|---|
| 1. Migración a Dialog | #1, #2, #3, #11 | #1 (focus trap), #2 (Escape), #8 (Card wrapper) |
| 2. Design tokens | #4, #5, #6 | — |
| 3. div onClick + radio | #7, #8 | #3 (keyboard nav dropdown) |
| 4. Skeleton | #10 | — |
| 5. File size ≤ 400 | #9 | #7 (hook deps — se reducen al extraer lógica) |
| 6. UX/A11y extra | — | #4 (empty state), #5 (Alert), #6 (same person warning) |

**Total: 10/10 Critical Issues resueltos, 7/8 Warnings resueltos.**

El 1 Warning restante (#7 `eslint-disable` en hook deps para `useEffect[show]`) se mantiene intencionalmente — el dep array es parcial por diseño para evitar re-fetch innecesario.
