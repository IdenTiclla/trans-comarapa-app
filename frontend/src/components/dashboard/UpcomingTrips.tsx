import { useNavigate } from 'react-router'
import { useUpcomingTrips } from './use-upcoming-trips'
import { LOCALE } from '@/lib/locale-config'

function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(dateStr))
}

export default function UpcomingTrips() {
  const navigate = useNavigate()
  const { trips, loading } = useUpcomingTrips()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (trips.length === 0) {
    return <p className="text-gray-500 text-center py-4">No hay viajes próximos</p>
  }

  return (
    <div className="space-y-3">
      {trips.map((trip) => {
        const origin = trip.route?.origin || 'Origen'
        const destination = trip.route?.destination || 'Destino'

        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            key={trip.id}
            onClick={() => navigate(`/trips/${trip.id}`)}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200 hover:border-blue-200"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {origin} → {destination}
              </p>
              <p className="text-sm text-gray-600">
                {formatDateTime(trip.trip_datetime)}
              </p>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              {trip.bus?.license_plate && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {trip.bus.license_plate}
                </span>
              )}
              {trip.available_seats !== undefined && (
                <p className="text-xs text-gray-500 mt-1">{trip.available_seats} asientos</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
