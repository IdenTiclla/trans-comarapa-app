import { Button } from '@/components/ui/button'
import { BarChart3, Download } from 'lucide-react'
import FormSelect from '@/components/forms/FormSelect'
import { MONTH_NAMES, type Office } from './constants'

interface Props {
  year: number
  month: number
  officeId: number | undefined
  offices: Office[]
  years: number[]
  isAdmin: boolean
  onYearChange: (y: number) => void
  onMonthChange: (m: number) => void
  onOfficeChange: (id: number | undefined) => void
  onDownload: () => void
}

export function ReportsHeader({
  year, month, officeId, offices, years, isAdmin,
  onYearChange, onMonthChange, onOfficeChange, onDownload,
}: Props) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes Mensuales</h1>
              <p className="text-gray-500 text-sm">{MONTH_NAMES[month - 1]} {year}</p>
            </div>
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <div className="w-36">
              <FormSelect
                label=""
                value={String(month)}
                onChange={(v) => onMonthChange(Number(v))}
                options={MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name }))}
              />
            </div>
            <div className="w-28">
              <FormSelect
                label=""
                value={String(year)}
                onChange={(v) => onYearChange(Number(v))}
                options={years.map((y) => ({ value: y, label: String(y) }))}
              />
            </div>
            {isAdmin && (
              <div className="w-52">
                <FormSelect
                  label=""
                  value={officeId != null ? String(officeId) : ''}
                  onChange={(v) => onOfficeChange(v ? Number(v) : undefined)}
                  options={[
                    { value: '', label: 'Todas las oficinas' },
                    ...offices.map((o) => ({ value: o.id, label: o.name })),
                  ]}
                />
              </div>
            )}
            <Button
              variant="outline"
              onClick={onDownload}
              aria-label="Descargar reporte en formato CSV"
              className="h-10"
            >
              <Download className="h-4 w-4 mr-1.5" />
              CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
