import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import type { TicketForm } from './types'

interface Props {
  form: TicketForm
  setForm: (updater: (prev: TicketForm) => TicketForm) => void
  hasTriedSubmit: boolean
}

const PAYMENT_OPTIONS = [
  { value: '', label: 'Seleccionar método' },
  { value: 'cash', label: '💵 Efectivo' },
  { value: 'card', label: '💳 Tarjeta' },
  { value: 'transfer', label: '🏦 Transferencia' },
  { value: 'qr', label: '📱 QR' },
]

export function TicketFieldsForm({ form, setForm, hasTriedSubmit }: Props) {
  return (
    <>
      <div className="mb-4">
        <FormInput
          label="Destino *"
          value={form.destination}
          onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
          required
          placeholder="Ej: Los Negros, Samaipata..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Precio (Bs.) *"
          type="number"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
          required
          placeholder="0.00"
        />
        <div>
          <FormSelect
            label="Método de Pago *"
            value={form.payment_method}
            onChange={(value) => setForm((p) => ({ ...p, payment_method: value }))}
            required
            options={PAYMENT_OPTIONS}
          />
          {!form.payment_method && hasTriedSubmit && (
            <p className="mt-2 text-sm text-red-600">El método de pago es requerido</p>
          )}
        </div>
      </div>
    </>
  )
}
