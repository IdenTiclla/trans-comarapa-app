import { useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { manifestStyles } from '@/components/trips/manifest/styles'
import { formatDate, formatTime } from '@/components/trips/manifest/helpers'
import { useTripManifest } from '@/components/trips/manifest/use-trip-manifest'
import { ManifestHeader } from '@/components/trips/manifest/ManifestHeader'
import { ManifestTable } from '@/components/trips/manifest/ManifestTable'

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const { trip, packages, isLoading, hasError, errorMessage } = useTripManifest(tripId)

  return (
    <>
      <style>{manifestStyles}</style>

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
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '14px 20px', color: '#c53030', maxWidth: 480, margin: '40px auto' }}>
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {!trip && !isLoading && !hasError && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#718096' }}>
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
    </>
  )
}
