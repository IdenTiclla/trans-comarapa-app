/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router'
import { Bus } from 'lucide-react'
import { formatDateTime } from './helpers'

interface Props {
  pkg: any
}

export function AssignedTripCard({ pkg }: Props) {
  const trip = pkg.trip
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-[3px] border-[#932720] border-y border-r border-y-gray-100 border-r-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1e293b] mb-1">Viaje Asignado</p>
            <h3 className="text-2xl font-black text-[#1e293b]">{trip ? `Viaje #${trip.id}` : 'No Asignado'}</h3>
          </div>
          <Bus className="w-6 h-6 text-[#932720]" />
        </div>

        {trip ? (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Chofer</span>
              <span className="text-[13px] font-bold text-[#1e293b]">
                {trip.driver?.firstname || 'Sin Asignar'} {trip.driver?.lastname || ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Asistente</span>
              <span className="text-[13px] font-bold text-[#1e293b]">
                {trip.assistant?.firstname || 'Sin Asignar'} {trip.assistant?.lastname || ''}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-[13px] text-gray-500">Placa / Bus</span>
              <span className="text-[13px] font-bold text-[#1e293b]">{trip.bus?.license_plate || 'Sin Asignar'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500">Fecha Llegada Est.</span>
              <span className="text-[13px] font-bold text-[#932720]">
                {formatDateTime(trip.arrival_date || trip.trip_datetime, false)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 italic mb-2">No hay viaje asignado temporalmente.</div>
        )}

        {trip && (
          <Link
            to={`/trips/${trip.id}`}
            className="block w-full text-center py-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1e293b] text-[11px] font-bold tracking-widest rounded-lg transition-colors uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver todos los detalles del Viaje
          </Link>
        )}
      </div>
    </div>
  )
}
