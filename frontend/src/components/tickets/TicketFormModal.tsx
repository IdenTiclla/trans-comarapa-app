import type { FormEvent } from 'react'
import FormSelect from '@/components/forms/FormSelect'
import { DecimalField } from '@/components/forms/NumericField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type Client, type Trip, type Seat, formatDate } from './tickets-helpers'

interface TicketForm {
  trip_id: string
  client_id: string
  seat_id: string
  state: string
  price: number
  payment_method: string
}

interface Props {
  mode: 'create' | 'edit'
  form: TicketForm
  setForm: (f: TicketForm) => void
  availableTrips: Trip[]
  clients: Client[]
  availableSeats: Seat[]
  isSubmitting: boolean
  onSubmit: (e: FormEvent) => void
  onClose: () => void
}

export function TicketFormModal({
  mode, form, setForm, availableTrips, clients, availableSeats, isSubmitting, onSubmit, onClose,
}: Props) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isSubmitting) onClose() }}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <DialogHeader className="p-6 border-b border-gray-100 text-left">
          <DialogTitle className="text-xl font-bold">
            {mode === 'create' ? 'Crear Nuevo Boleto' : 'Editar Boleto'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para {mode === 'create' ? 'crear un nuevo' : 'editar el'} boleto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <FormSelect
            label="Viaje"
            required
            value={form.trip_id}
            onChange={(val) => setForm({ ...form, trip_id: val })}
            options={availableTrips.map((trip) => ({
              label: `${trip.route?.origin} → ${trip.route?.destination} - ${formatDate(trip.trip_datetime || '')}`,
              value: trip.id,
            }))}
            placeholder="Seleccionar viaje..."
          />

          <FormSelect
            label="Cliente"
            required
            value={form.client_id}
            onChange={(val) => setForm({ ...form, client_id: val })}
            options={clients.map((c) => ({ label: `${c.firstname} ${c.lastname}`, value: c.id }))}
            placeholder="Seleccionar cliente..."
          />

          {form.trip_id && (
            <FormSelect
              label="Asiento"
              required
              value={form.seat_id}
              onChange={(val) => setForm({ ...form, seat_id: val })}
              options={availableSeats.map((s) => ({ label: `Asiento ${s.seat_number} (${s.deck})`, value: s.id }))}
              placeholder="Seleccionar asiento..."
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Estado"
              required
              value={form.state}
              onChange={(val) => setForm({ ...form, state: val })}
              options={[
                { label: 'Pendiente', value: 'pending' },
                { label: 'Confirmado', value: 'confirmed' },
                { label: 'Cancelado', value: 'cancelled' },
                { label: 'Completado', value: 'completed' },
              ]}
            />

            <DecimalField
              label="Precio"
              required
              value={form.price}
              onChange={(n) => setForm({ ...form, price: n })}
            />
          </div>

          <FormSelect
            label="Método de Pago"
            value={form.payment_method}
            onChange={(val) => setForm({ ...form, payment_method: val })}
            options={[
              { label: 'Sin especificar', value: '' },
              { label: 'Efectivo', value: 'cash' },
              { label: 'Tarjeta', value: 'card' },
              { label: 'Transferencia', value: 'transfer' },
              { label: 'QR', value: 'qr' },
            ]}
          />

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? 'Guardando...' : 'Guardar Boleto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
