import { useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/components/trips/manifest/helpers'
import { useTripManifest } from '@/components/trips/manifest/use-trip-manifest'
import { ManifestHeader } from '@/components/trips/manifest/ManifestHeader'
import { ManifestTable } from '@/components/trips/manifest/ManifestTable'

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const { trip, packages, isLoading, hasError, errorMessage } = useTripManifest(tripId)

  return (
    <div className="pm-page">
        <div className="pm-toolbar">
          <div>
            <div className="pm-toolbar-title">
              📦 Manifiesto de Encomiendas
              {trip ? ` — Viaje #${String(trip.id).padStart(6, '0')}` : ''}
            </div>
            {trip && (
              <div className="pm-toolbar-sub">
                {trip.route?.origin?.name || trip.route?.origin} →{' '}
                {trip.route?.destination?.name || trip.route?.destination}
                {' · '}{formatDate(trip.trip_datetime)} · {formatTime(trip.departure_time)}
              </div>
            )}
          </div>
          <Button
            type="button"
            aria-label="Imprimir manifiesto"
            onClick={() => window.print()}
            className="pm-btn-print"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
              <path d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
              <rect x="9" y="13" width="6" height="8" rx="1" />
            </svg>
            Imprimir
          </Button>
        </div>

        <div className="pm-paper-wrap">
          {isLoading && (
            <div className="pm-loading">
              <div className="pm-spinner" />
              <span>Cargando manifiesto de encomiendas…</span>
            </div>
          )}

          {hasError && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 px-5 text-red-700 max-w-[480px] mx-auto mt-10">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {!trip && !isLoading && !hasError && (
            <div className="text-center py-16 text-gray-500">
              No hay información del viaje para mostrar.
            </div>
          )}

          {trip && !isLoading && !hasError && (
            <div className="pm-paper">
              <ManifestHeader trip={trip} />
              <ManifestTable packages={packages} trip={trip} />
            </div>
          )}
        </div>
      </div>
  )
}
