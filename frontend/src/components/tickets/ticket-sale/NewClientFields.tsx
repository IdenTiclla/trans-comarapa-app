import FormInput from '@/components/forms/FormInput'
import type { NewClientForm } from './types'

interface Props {
  form: NewClientForm
  setForm: (updater: (prev: NewClientForm) => NewClientForm) => void
}

export function NewClientFields({ form, setForm }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormInput
        label="Nombres *"
        value={form.firstname}
        onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
        required
        placeholder="Nombres"
      />
      <FormInput
        label="Apellidos *"
        value={form.lastname}
        onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
        required
        placeholder="Apellidos"
      />
      <FormInput
        label="CI/Documento *"
        value={form.document_id}
        onChange={(e) => setForm((p) => ({ ...p, document_id: e.target.value }))}
        required
        placeholder="Carnet"
      />
      <FormInput
        label="Teléfono"
        value={form.phone}
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        placeholder="Teléfono"
      />
    </div>
  )
}
