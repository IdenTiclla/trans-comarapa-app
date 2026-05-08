import { useId } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Office } from './use-package-registration'

interface PackageDataLike {
  origin_office_id: number | null
  destination_office_id: number | null
  payment_status: string
  payment_method: string
  [key: string]: unknown
}

interface Props {
  offices: Office[]
  loadingOffices: boolean
  packageData: PackageDataLike
  setPackageData: (updater: PackageDataLike | ((prev: PackageDataLike) => PackageDataLike)) => void
  fieldErrors: Record<string, string>
  tripId: number | string | null
}

interface FieldProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  disabled?: boolean
}

function SelectField({ label, value, onChange, placeholder, options, error, required, disabled }: FieldProps) {
  const id = useId()
  return (
    <div>
      <label
        htmlFor={id}
        className={cn('block text-sm font-medium text-muted-foreground mb-1', error && 'text-destructive')}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-required={required}
          className={cn('w-full h-[38px]', error && 'border-destructive')}
        >
          <SelectValue placeholder={placeholder ?? 'Seleccionar...'} />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-[40vh]">
          {options.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function PackageTopBar({ offices, loadingOffices, packageData, setPackageData, fieldErrors, tripId }: Props) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-start">
        <SelectField
          label="Oficina Origen"
          required
          value={packageData.origin_office_id?.toString() || ''}
          onChange={(val) => setPackageData((prev) => ({ ...prev, origin_office_id: val ? Number(val) : null }))}
          options={offices.map(o => ({ value: o.id.toString(), label: o.name }))}
          error={fieldErrors.origin_office_id}
          placeholder={loadingOffices ? 'Cargando...' : 'Seleccione origen'}
          disabled={loadingOffices}
        />
        <SelectField
          label="Oficina Destino"
          required
          value={packageData.destination_office_id?.toString() || ''}
          onChange={(val) => setPackageData((prev) => ({ ...prev, destination_office_id: val ? Number(val) : null }))}
          options={offices.filter(o => o.id !== packageData.origin_office_id).map(o => ({ value: o.id.toString(), label: o.name }))}
          error={fieldErrors.destination_office_id}
          placeholder={loadingOffices ? 'Cargando...' : 'Seleccione destino'}
          disabled={loadingOffices}
        />
        <SelectField
          label="Estado del Pago"
          required
          value={packageData.payment_status}
          onChange={(val) => setPackageData((prev) => ({ ...prev, payment_status: val }))}
          options={[
            { value: 'paid_on_send', label: 'Pagado al enviar' },
            { value: 'collect_on_delivery', label: 'Por cobrar en destino' },
          ]}
        />
        {packageData.payment_status === 'paid_on_send' ? (
          <SelectField
            label="Método"
            required
            value={packageData.payment_method}
            onChange={(val) => setPackageData((prev) => ({ ...prev, payment_method: val }))}
            options={[
              { value: 'cash', label: '💵 Físico' },
              { value: 'qr', label: '📱 QR/Transf.' },
            ]}
          />
        ) : (
          <div className="hidden md:block"></div>
        )}
        <div>
          <span className="block text-sm font-medium text-muted-foreground mb-1">Estado</span>
          <div className="flex items-center h-[38px]">
            {tripId ? (
              <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 w-full justify-center">
                <span className="w-2 h-2 rounded-full bg-primary mr-1.5"></span>
                Asignado
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border w-full justify-center">
                <span className="w-2 h-2 rounded-full bg-muted-foreground mr-1.5"></span>
                En oficina
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
