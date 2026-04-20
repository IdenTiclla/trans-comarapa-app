import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import type { Location, RouteFormState } from './types'

interface Props {
  form: RouteFormState
  setForm: (updater: (prev: RouteFormState) => RouteFormState) => void
  locations: Location[]
  availableDestinations: Location[]
  sameLocationError: boolean
}

export function RouteFormFields({ form, setForm, locations, availableDestinations, sameLocationError }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Origen"
          id="origin"
          value={form.origin_location_id}
          onChange={(val) => setForm((p) => ({ ...p, origin_location_id: String(val) }))}
          required
          options={locations.map((loc) => ({ label: loc.name, value: loc.id }))}
          placeholder="Seleccionar..."
        />
        <FormSelect
          label="Destino"
          id="destination"
          value={form.destination_location_id}
          onChange={(val) => setForm((p) => ({ ...p, destination_location_id: String(val) }))}
          required
          options={availableDestinations.map((loc) => ({ label: loc.name, value: loc.id }))}
          placeholder="Seleccionar..."
          error={sameLocationError ? 'Origen y destino deben ser diferentes' : undefined}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormInput
          label="Distancia (km)"
          id="distance"
          type="number"
          value={form.distance}
          onChange={(e) => setForm((p) => ({ ...p, distance: e.target.value }))}
          step="0.1"
          min="0.1"
          required
        />
        <FormInput
          label="Duración (hrs)"
          id="duration"
          type="number"
          value={form.duration}
          onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
          step="0.5"
          min="0.1"
          required
        />
        <FormInput
          label="Precio (Bs.)"
          id="price"
          type="number"
          value={form.price}
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          step="0.5"
          min="0.1"
          required
        />
      </div>
    </>
  )
}
