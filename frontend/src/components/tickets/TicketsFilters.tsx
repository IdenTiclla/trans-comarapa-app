import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

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
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <FormInput
            placeholder="Buscar por ID, cliente, viaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            Filtros Avanzados {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
        </div>
        <Button onClick={() => navigate('/trips')} className="bg-indigo-600 hover:bg-indigo-700">
          Vender Boleto
        </Button>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <FormDatePicker
            label="Desde"
            value={dateFromFilter}
            onChange={(date) => setDateFromFilter(date ? date.toISOString().split('T')[0] : '')}
          />
          <FormDatePicker
            label="Hasta"
            value={dateToFilter}
            onChange={(date) => setDateToFilter(date ? date.toISOString().split('T')[0] : '')}
          />
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
