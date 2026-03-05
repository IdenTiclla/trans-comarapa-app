# Plan: Agregar confirmación y feedback al crear viaje en React

## Contexto

La página de creación de viajes en React (`/trips/new`) ya funciona y tiene la misma estructura visual que la de Nuxt. Sin embargo, le faltan dos flujos clave que sí existen en Nuxt:

1. **Modal de confirmación** antes de crear el viaje (muestra resumen de lo que se va a crear)
2. **Modal de éxito** después de crear el viaje (en lugar del banner verde actual)
3. **Redirección** de vuelta a `/trips` donde el viaje recién creado aparece en el slot correspondiente

## Componentes reutilizables existentes

- `src/components/common/ConfirmDialog.tsx` - Dialog de confirmación con tipos (danger/warning/info/success)
- `src/components/common/NotificationModal.tsx` - Modal de notificación con tipos (success/error/warning/info)

## Cambios necesarios

### Archivo: `src/pages/trips/TripNewPage.tsx`

**1. Agregar modal de confirmación antes de crear**
- Nuevo estado: `showConfirmDialog: boolean`
- Al hacer submit, en vez de llamar directamente a `createTrip`, mostrar el `ConfirmDialog` con tipo `info`
- El dialog muestra un resumen: ruta seleccionada, fecha, hora, bus, conductor, asistente
- Al confirmar → ejecutar la creación real del viaje

**2. Reemplazar banner verde con NotificationModal de éxito**
- Reemplazar el estado `showSuccess` + banner verde por un `NotificationModal` tipo `success`
- Título: "Viaje creado exitosamente"
- Mensaje: resumen del viaje creado (ruta, fecha, hora)
- Al cerrar el modal → navegar a `/trips`

**3. Flujo completo:**
```
Submit form → Validación → ConfirmDialog (resumen)
  → Confirmar → API createTrip → NotificationModal (éxito) → Navegar a /trips
  → Cancelar → Volver al formulario
```

### Detalle de implementación

```tsx
// Nuevos estados
const [showConfirmDialog, setShowConfirmDialog] = useState(false)
const [showSuccessModal, setShowSuccessModal] = useState(false)

// handleSubmit ahora solo muestra el confirm dialog
const handleSubmit = (e: FormEvent) => {
  e.preventDefault()
  if (!isFormValid) return
  setShowConfirmDialog(true)
}

// Nueva función que ejecuta la creación real
const executeTripCreation = async () => {
  // ... construir payload (mismo código actual)
  const result = await dispatch(createTrip(payload))
  if (result.meta.requestStatus === 'fulfilled') {
    setShowSuccessModal(true)
  }
}

// En el JSX:
<ConfirmDialog
  open={showConfirmDialog}
  onOpenChange={setShowConfirmDialog}
  type="info"
  title="Confirmar creación de viaje"
  message={`Ruta: ${selectedRoute?.origin} → ${selectedRoute?.destination}\nFecha: ${departureDate}\nHora: ${departureTime}\nBus: ${selectedBus?.label}`}
  confirmText="Crear Viaje"
  cancelText="Revisar"
  onConfirm={executeTripCreation}
/>

<NotificationModal
  open={showSuccessModal}
  onOpenChange={setShowSuccessModal}
  type="success"
  title="Viaje creado exitosamente"
  message="El viaje ha sido programado correctamente."
  buttonText="Ver Tablero"
  onClose={() => navigate('/trips')}
/>
```

## Verificación

1. Ir a `http://localhost:3001/trips`
2. Click en "Crear Viaje" en una card vacía → navega a `/trips/new` con params pre-llenados
3. Completar el formulario (seleccionar bus como mínimo)
4. Click "Crear Viaje" → aparece ConfirmDialog con resumen
5. Click "Crear Viaje" en el dialog → se crea el viaje → aparece NotificationModal de éxito
6. Click "Ver Tablero" → navega a `/trips` → el viaje aparece en el slot correcto
