import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import type { TicketDetail, TripDetail } from '@/hooks/use-ticket-detail'
import { formatDate, formatTime } from './helpers'

export function TripLogisticsCard({ ticket, trip }: { ticket: TicketDetail; trip: TripDetail | null }) {
  const origin = trip?.route?.origin_location?.name || trip?.route?.origin || '—'
  const destination =
    ticket.destination || trip?.route?.destination_location?.name || trip?.route?.destination || '—'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
        Información del Viaje
      </h3>

      {trip ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="relative pl-6 border-l-2 border-dashed border-gray-300">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-white" />
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Origen</p>
              <p className="text-lg font-bold text-gray-900">{origin}</p>
            </div>
            <div className="flex flex-col items-center py-2 md:py-0">
              <ArrowRight className="h-7 w-7 text-gray-300" />
              {trip.bus?.license_plate && (
                <p className="text-[10px] font-bold text-primary uppercase mt-1">
                  Bus {trip.bus.license_plate}
                </p>
              )}
            </div>
            <div className="md:text-right">
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Destino</p>
              <p className="text-lg font-bold text-gray-900">{destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Fecha salida</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(trip.trip_datetime)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Hora</p>
              <p className="text-sm font-medium text-gray-900">{formatTime(trip.trip_datetime)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Viaje</p>
              <Link to={`/trips/${trip.id}`} className="text-sm font-medium text-primary hover:underline">
                #{trip.id}
              </Link>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Estado viaje</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{trip.status || '—'}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 italic">Sin información del viaje.</p>
      )}
    </div>
  )
}
