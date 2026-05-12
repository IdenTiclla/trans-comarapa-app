import { useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime } from '@/components/trips/sheet/helpers'
import { useTripSheet } from '@/components/trips/sheet/use-trip-sheet'
import { SheetHeader } from '@/components/trips/sheet/SheetHeader'
import { PassengerTable } from '@/components/trips/sheet/PassengerTable'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
  useDocumentTitle('Planilla de Pasajeros')
  const { id } = useParams()
  const tripId = Number(id)
  const s = useTripSheet(tripId)

  const busCapacity: number = s.trip?.bus?.capacity ?? 50
  const halfCapacity = Math.ceil(busCapacity / 2)

  return (
    <div className="ts-page">
        <div className="ts-toolbar">
          <div>
            <div className="ts-toolbar-title">
              <span aria-hidden="true">📋</span> Planilla de Pasajeros
              {s.trip ? ` — Viaje #${String(s.trip.id).padStart(6, '0')}` : ''}
            </div>
            {s.trip && (
              <div className="ts-toolbar-sub">
                {s.trip.route?.origin?.name || s.trip.route?.origin} →{' '}
                {s.trip.route?.destination?.name || s.trip.route?.destination}
                {' · '}{formatDate(s.trip.trip_datetime)} · {formatTime(s.trip.departure_time)}
              </div>
            )}
          </div>
          <Button
            type="button"
            aria-label="Imprimir planilla"
            onClick={() => window.print()}
            className="ts-btn-print"
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
              <path d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
              <rect x="9" y="13" width="6" height="8" rx="1" />
            </svg>
            Imprimir
          </Button>
        </div>

        <div className="ts-paper-wrap">
          {s.isLoading && (
            <div className="ts-loading">
              <div className="ts-spinner" />
              <span>Cargando planilla de pasajeros…</span>
            </div>
          )}

          {s.hasError && !s.isLoading && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3.5 px-5 text-red-700 max-w-[480px] mx-auto mt-10">
              <strong>Error:</strong> {s.errorMessage}
            </div>
          )}

          {!s.trip && !s.isLoading && !s.hasError && (
            <div className="text-center py-16 text-gray-500">
              No hay información del viaje para mostrar.
            </div>
          )}

          {s.trip && !s.isLoading && !s.hasError && (
            <div className="ts-paper">
              <SheetHeader trip={s.trip} />

              <div className="pax-grid">
                <PassengerTable
                  startSeat={1}
                  endSeat={halfCapacity}
                  getPassengerName={s.getPassengerName}
                  getPassengerDoc={s.getPassengerDoc}
                  getPassengerDest={s.getPassengerDest}
                />
                <PassengerTable
                  startSeat={halfCapacity + 1}
                  endSeat={busCapacity}
                  getPassengerName={s.getPassengerName}
                  getPassengerDoc={s.getPassengerDoc}
                  getPassengerDest={s.getPassengerDest}
                />
              </div>

              <div className="ts-summary">
                <span>Total pasajeros: <strong>{s.totalPassengers}</strong></span>
                <span>Monto total: <strong>Bs. {s.totalAmount.toFixed(2)}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}
