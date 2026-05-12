import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarView } from '@/components/ui/calendar-view'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ROUTES } from '@/lib/routes'
import { LOCALE } from '@/lib/locale-config'

interface Props {
  searchQuery: string
  setSearchQuery: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  dateFromFilter: string
  setDateFromFilter: (v: string) => void
  dateToFilter: string
  setDateToFilter: (v: string) => void
  paymentMethodFilter: string
  setPaymentMethodFilter: (v: string) => void
  showAdvancedFilters: boolean
  setShowAdvancedFilters: (v: boolean) => void
  activeFiltersCount: number
  onClearAll: () => void
}

function formatDateLabel(value: string, placeholder: string) {
  if (!value) return placeholder
  const [y, m, d] = value.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (isNaN(date.getTime())) return placeholder
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1 justify-start font-normal"
            >
              <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              {formatDateLabel(value, 'Seleccionar fecha')}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-4 border shadow-xl bg-card rounded-xl">
            <CalendarView value={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Limpiar fecha"
            onClick={() => onChange('')}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function TicketsFilters(props: Props) {
  const navigate = useNavigate()
  const {
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateFromFilter, setDateFromFilter,
    dateToFilter, setDateToFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    showAdvancedFilters, setShowAdvancedFilters,
    activeFiltersCount, onClearAll,
  } = props

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <FormInput
            placeholder="Buscar por ID, cliente, viaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            aria-label="Buscar boletos"
          />
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Filtros Avanzados {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
        <Button onClick={() => navigate(ROUTES.TRIPS)}>
          Vender Boleto
        </Button>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <FormSelect
            label="Estado"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { label: 'Todos los estados', value: '' },
              { label: 'Pendientes', value: 'pending' },
              { label: 'Confirmados', value: 'confirmed' },
              { label: 'Cancelados', value: 'cancelled' },
              { label: 'Completados', value: 'completed' },
            ]}
          />
          <DateField label="Desde" value={dateFromFilter} onChange={setDateFromFilter} />
          <DateField label="Hasta" value={dateToFilter} onChange={setDateToFilter} />
          <FormSelect
            label="Método pago"
            value={paymentMethodFilter}
            onChange={(val) => setPaymentMethodFilter(val)}
            options={[
              { label: 'Todos los pagos', value: '' },
              { label: 'Efectivo', value: 'cash' },
              { label: 'Tarjeta', value: 'card' },
              { label: 'Transferencia', value: 'transfer' },
              { label: 'QR', value: 'qr' },
            ]}
          />
          <div className="flex flex-col justify-end h-full">
            <Button variant="outline" onClick={onClearAll} className="w-full">
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
