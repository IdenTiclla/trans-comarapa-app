import { Link } from 'react-router'
import { Bus } from 'lucide-react'
import { formatDateTime } from './helpers'
import type { Package } from '@/types'
import { ROUTES } from '@/lib/routes'

interface Props {
  pkg: Package
}

export function AssignedTripCard({ pkg }: Props) {
  const trip = pkg.trip
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-[3px] border-brand-crimson border-y border-r border-y-gray-100 border-r-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-1">Viaje Asignado</p>
            <h3 className="text-2xl font-black text-slate-800">{trip ? `Viaje #${trip.id}` : 'No Asignado'}</h3>
          </div>
          <Bus className="w-6 h-6 text-brand-crimson" />
        </div>

        {trip ? (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Chofer</span>
              <span className="text-[13px] font-bold text-slate-800">
                {trip.driver?.firstname || 'Sin Asignar'} {trip.driver?.lastname || ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Asistente</span>
              <span className="text-[13px] font-bold text-slate-800">
                {trip.assistant?.firstname || 'Sin Asignar'} {trip.assistant?.lastname || ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Placa / Bus</span>
              <span className="text-[13px] font-bold text-slate-800">{trip.bus?.license_plate || 'Sin Asignar'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500">Fecha Llegada Est.</span>
              <span className="text-[13px] font-bold text-brand-crimson">
                {formatDateTime(trip.arrival_date || trip.trip_datetime, false)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 italic mb-2">No hay viaje asignado temporalmente.</div>
        )}

        {trip && (
          <Link
            to={ROUTES.tripDetail(trip.id)}
            className="block w-full text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold tracking-widest rounded-lg transition-colors uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver todos los detalles del Viaje
          </Link>
        )}
      </div>
    </div>
  )
}
