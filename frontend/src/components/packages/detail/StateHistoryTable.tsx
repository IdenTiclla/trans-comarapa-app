import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatDateTime } from './helpers'
import type { Package } from '@/types'

interface Props {
  pkg: Package
  originName: string
  destinationName: string
}

const getEventLabel = (state: string, tripId: string | number | null) => {
  switch (state) {
    case 'registered_at_office': return 'Encomienda registrada en origen'
    case 'assigned_to_trip': return `Asignada al viaje #${tripId || 'N/A'}`
    case 'in_transit': return 'Salida de terminal'
    case 'arrived_at_destination': return 'Llegada a oficina destino'
    case 'delivered': return 'Entregada al cliente'
    default: return state
  }
}

const getLocation = (state: string, originName: string, destinationName: string) => {
  if (state === 'registered_at_office' || state === 'assigned_to_trip') return originName
  if (state === 'in_transit') return 'En ruta a Destino'
  if (state === 'arrived_at_destination' || state === 'delivered') return destinationName
  return 'Desconocido'
}

export function StateHistoryTable({ pkg, originName, destinationName }: Props) {
  const history = pkg.state_history && (pkg.state_history as Array<Record<string, unknown>>).length > 0 ? [...(pkg.state_history as Array<Record<string, unknown>>)].reverse() : []
  const tripId = pkg.trip_id || pkg.trip?.id || null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-white border-b border-gray-50">
        <h2 className="text-sm font-bold tracking-widest text-slate-800 uppercase">Bitácora de Estados</h2>
        <Button variant="link" size="sm" className="text-brand-blue font-bold px-0 self-start sm:self-auto">
          Descargar historial completo
        </Button>
      </div>

      {/* Mobile: card list */}
      <ul className="sm:hidden divide-y divide-gray-50">
        {history.length > 0 ? history.map((event, idx) => {
          const isLatest = idx === 0
          return (
            <li key={idx} className="px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 font-medium">{formatDateTime(event.changed_at, true).replace(',', '')}</span>
                <span className={cn(
                  'px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider shrink-0',
                  isLatest ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-500',
                )}>
                  {idx === history.length - 1 ? 'Inicial' : 'Normal'}
                </span>
              </div>
              <p className="text-[13px] text-slate-800 font-medium break-words">{getEventLabel(event.new_state, tripId)}</p>
              <p className="text-[12px] text-gray-600 break-words">{getLocation(event.new_state, originName, destinationName)}</p>
            </li>
          )
        }) : (
          <li className="px-4 py-8 text-center text-gray-500 italic text-sm">No hay historial de registro</li>
        )}
      </ul>

      {/* Tablet+: table */}
      <div className="hidden sm:block overflow-x-auto">
        {/* eslint-disable-next-line no-restricted-syntax */}
        <table className="w-full text-sm text-left border-collapse">
          <caption className="sr-only">Historial de estados</caption>
          <thead className="bg-white text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            <tr>
              <th className="px-4 lg:px-6 py-4 font-bold border-b border-gray-50">Fecha y Hora</th>
              <th className="px-4 lg:px-6 py-4 font-bold border-b border-gray-50 hidden md:table-cell">Ubicación</th>
              <th className="px-4 lg:px-6 py-4 font-bold border-b border-gray-50">Evento</th>
              <th className="px-4 lg:px-6 py-4 font-bold border-b border-gray-50 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.length > 0 ? (
              history.map((event, idx: number) => (
                <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 lg:px-6 py-4 text-[13px] text-gray-600 whitespace-nowrap">
                    {formatDateTime(event.changed_at, true).replace(',', '')}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-[13px] text-gray-700 hidden md:table-cell">
                    {getLocation(event.new_state, originName, destinationName)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-[13px] text-slate-800 font-medium">
                    {getEventLabel(event.new_state, tripId)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <span className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider whitespace-nowrap',
                      idx === history.length - 1 ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-500',
                    )}>
                      {idx === history.length - 1 ? 'Inicial' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No hay historial de registro</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
