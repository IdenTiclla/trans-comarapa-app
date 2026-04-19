/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatDateTime } from './helpers'

interface Props {
  pkg: any
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
  const history = pkg.state_history && pkg.state_history.length > 0 ? [...pkg.state_history].reverse() : []
  const tripId = pkg.trip_id || pkg.trip?.id || null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 flex justify-between items-center bg-white border-b border-gray-50">
        <h2 className="text-sm font-bold tracking-widest text-[#1e293b] uppercase">Bitácora de Estados</h2>
        <Button variant="link" size="sm" className="text-[#16499B] font-bold px-0">
          Descargar historial completo
        </Button>
      </div>
      <div className="p-0">
        {/* eslint-disable-next-line no-restricted-syntax */}
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-white text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-gray-50">Fecha y Hora</th>
              <th className="px-6 py-4 font-bold border-b border-gray-50">Ubicación</th>
              <th className="px-6 py-4 font-bold border-b border-gray-50">Evento</th>
              <th className="px-6 py-4 font-bold border-b border-gray-50 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {history.length > 0 ? (
              history.map((event: any, idx: number) => (
                <tr key={idx} className="bg-white hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] text-gray-600 whitespace-nowrap">
                    {formatDateTime(event.changed_at, true).replace(',', '')}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-700">
                    {getLocation(event.new_state, originName, destinationName)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#1e293b] font-medium">
                    {getEventLabel(event.new_state, tripId)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      'px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider',
                      idx === history.length - 1 ? 'bg-blue-50 text-blue-800' : 'bg-[#F1F5F9] text-[#64748B]',
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
