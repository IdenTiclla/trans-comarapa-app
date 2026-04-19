import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { STATUS_OPTIONS } from './helpers'

interface Props {
  searchTerm: string
  statusFilter: string
  dateFrom: string
  dateTo: string
  onSearchChange: (val: string) => void
  onStatusChange: (val: string) => void
  onDateFromChange: (val: string) => void
  onDateToChange: (val: string) => void
}

export function PackageFilters({
  searchTerm, statusFilter, dateFrom, dateTo,
  onSearchChange, onStatusChange, onDateFromChange, onDateToChange,
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormInput
            label="Buscar"
            id="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Remitente, destinatario, código..."
            leftIcon={<Search className="w-4 h-4" />}
          />
          <FormSelect
            label="Estado"
            id="status-filter"
            value={statusFilter}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
          />
          <FormDatePicker
            label="Fecha desde"
            id="date-from"
            value={dateFrom}
            onChange={(date) => onDateFromChange(date ? date.toISOString().split('T')[0] : '')}
          />
          <FormDatePicker
            label="Fecha hasta"
            id="date-to"
            value={dateTo}
            onChange={(date) => onDateToChange(date ? date.toISOString().split('T')[0] : '')}
          />
        </div>
      </CardContent>
    </Card>
  )
}
