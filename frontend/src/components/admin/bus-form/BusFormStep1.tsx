import type React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronRight, Loader2, LayoutGrid } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { COLORS, type BusFormState, type Owner } from './types'

interface Props {
  form: BusFormState
  setForm: React.Dispatch<React.SetStateAction<BusFormState>>
  owners: Owner[]
  loadingOwners: boolean
  errors: { license_plate: string; model: string }
  isEditing: boolean
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onGoStep2: () => void
}

export function BusFormStep1({
  form, setForm, owners, loadingOwners, errors, isEditing, loading,
  onSubmit, onCancel, onGoStep2,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
      <FormInput
        label="Placa *"
        id="license_plate"
        value={form.license_plate}
        onChange={(e) => setForm({ ...form, license_plate: e.target.value.toUpperCase() })}
        required
        maxLength={10}
        placeholder="Ej: 2312ABX"
        error={errors.license_plate}
      />
      <FormInput
        label="Modelo *"
        id="model"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
        required
        maxLength={100}
        placeholder="Ej: Sprinter 515"
        error={errors.model}
      />
      <FormInput
        label="Marca"
        id="brand"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        maxLength={50}
        placeholder="Ej: Mercedes-Benz"
      />

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          label="Color"
          id="color"
          value={form.color}
          onChange={(val) => setForm({ ...form, color: val })}
          options={COLORS.map((c) => ({ label: c, value: c }))}
          placeholder="Seleccionar..."
        />
        <FormSelect
          label="Pisos *"
          id="floors"
          value={form.floors}
          onChange={(val) => setForm({ ...form, floors: Number(val) })}
          required
          options={[
            { label: '1 Piso', value: 1 },
            { label: '2 Pisos', value: 2 },
          ]}
        />
      </div>

      <FormSelect
        label="Dueño del Bus"
        id="owner_id"
        value={form.owner_id || ''}
        onChange={(val) => setForm({ ...form, owner_id: val ? Number(val) : null })}
        disabled={loadingOwners}
        options={owners.map((owner) => ({
          label: `${owner.firstname} ${owner.lastname}${owner.phone ? ` - ${owner.phone}` : ''}`,
          value: owner.id,
        }))}
        placeholder="Sin dueño asignado"
      />
      {loadingOwners && (
        <p className="text-[10px] text-primary animate-pulse font-bold uppercase tracking-widest">
          Cargando dueños...
        </p>
      )}

      {isEditing && (
        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Capacidad actual</p>
              <p className="text-2xl font-black text-gray-900">{form.capacity} asientos</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onGoStep2}
              aria-label="Editar planilla de asientos"
              className="rounded-xl border-primary/20 text-primary hover:bg-primary/10"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Editar Planilla
            </Button>
          </div>
        </div>
      )}

      <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="rounded-xl px-6 h-12 font-bold">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20">
          {loading && isEditing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            'Actualizar'
          ) : (
            <>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
