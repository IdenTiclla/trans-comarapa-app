import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { apiFetch } from '@/lib/api'

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const offset = date.getTimezoneOffset()
  const adjusted = new Date(date.getTime() + offset * 60 * 1000)
  return adjusted.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(timeString: string) {
  if (!timeString) return ''
  const parts = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })
}

interface Passenger {
  id: number
  state: string
  seat?: { seat_number: number }
  client?: { firstname: string; lastname: string; document_id?: string }
  destination?: string
  price?: number | string
}

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const dispatch = useAppDispatch()
  const trip = useAppSelector(selectCurrentTrip) as any
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)

  const [passengersBySeat, setPassengersBySeat] = useState<Record<number, Passenger>>({})
  const [loadingPassengers, setLoadingPassengers] = useState(true)
  const [passError, setPassError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingPassengers(true)
      setPassError(null)
      try {
        await dispatch(fetchTripById(tripId))
        const tickets = await apiFetch(`/tickets/trip/${tripId}`)
        const confirmed = (Array.isArray(tickets) ? tickets : [])
          .filter((t: Passenger) => ['confirmed', 'sold', 'paid'].includes(t.state))
          .sort((a: Passenger, b: Passenger) => (a.seat?.seat_number || 0) - (b.seat?.seat_number || 0))
        setPassengersBySeat(
          confirmed.reduce((acc: Record<number, Passenger>, p: Passenger) => {
            if (p.seat?.seat_number) acc[p.seat.seat_number] = p
            return acc
          }, {})
        )
      } catch (err: any) {
        setPassError(err?.message || 'Error al cargar la planilla.')
      } finally {
        setLoadingPassengers(false)
      }
    }
    load()
  }, [dispatch, tripId])

  const getPassengerName = (n: number) => {
    const p = passengersBySeat[n]
    return p ? `${p.client?.firstname || ''} ${p.client?.lastname || ''}` : ''
  }
  const getPassengerDoc = (n: number) => passengersBySeat[n]?.client?.document_id || ''
  const getPassengerDest = (n: number) => {
    const p = passengersBySeat[n]
    if (!p) return ''
    if (p.destination?.trim()) return p.destination
    return trip?.route?.destination?.name || trip?.route?.destination || ''
  }

  const totalPassengers = Object.keys(passengersBySeat).length
  const busCapacity: number = trip?.bus?.capacity ?? 50
  const halfCapacity = Math.ceil(busCapacity / 2)
  const totalAmount = Object.values(passengersBySeat).reduce((acc, p) => acc + Number(p.price || 0), 0)
  const isLoading = loading || loadingPassengers
  const hasError = error || passError

  return (
    <>
      <style>{`
        /* ─── Base ─── */
        .ts-page {
          min-height: 100vh;
          background: #edf2f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ─── Toolbar (screen only) ─── */
        .ts-toolbar {
          background: #1a365d;
          padding: 11px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,.3);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .ts-toolbar-title {
          color: #fff;
          font-size: 17px;
          font-weight: 700;
          letter-spacing: .3px;
        }
        .ts-toolbar-sub {
          color: #90cdf4;
          font-size: 13px;
          margin-top: 2px;
        }
        .ts-btn-print {
          background: #3182ce;
          color: #fff;
          border: none;
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background .15s;
        }
        .ts-btn-print:hover { background: #2b6cb0; }


        /* ─── Paper wrapper ─── */
        .ts-paper-wrap {
          padding: 24px 32px 48px;
        }
        .ts-paper {
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,.14);
          padding: 24px 28px 28px;
        }

        /* ─── Document header (printable) ─── */
        .doc-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          border-bottom: 2px solid #276749;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        /* Logo */
        .doc-logo {
          flex-shrink: 0;
          width: 185px;
          border-right: 1px solid #c3d9ca;
          padding-right: 14px;
        }
        .doc-logo-trans {
          font-size: 16px;
          font-weight: 900;
          font-family: 'Times New Roman', serif;
          letter-spacing: 2px;
          color: #1a202c;
          line-height: 1;
        }
        .doc-logo-comarapa {
          font-size: 36px;
          font-weight: 900;
          font-family: 'Times New Roman', serif;
          color: #1a202c;
          letter-spacing: 1px;
          line-height: 1;
          margin-bottom: 4px;
        }
        .doc-sindicato {
          font-size: 11px;
          color: #4a5568;
          line-height: 1.35;
          margin-bottom: 5px;
        }
        .doc-phones {
          font-size: 11px;
          color: #4a5568;
          line-height: 1.5;
        }
        /* Center info */
        .doc-center {
          flex: 1;
          overflow: hidden;
        }
        .doc-route-banner {
          font-size: 13px;
          font-weight: 700;
          color: #276749;
          text-align: center;
          letter-spacing: .4px;
          border-bottom: 1px solid #c3d9ca;
          padding-bottom: 5px;
          margin-bottom: 8px;
        }
        .doc-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 18px;
        }
        .doc-field {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          min-height: 17px;
        }
        .doc-field-label {
          font-size: 12px;
          font-weight: 700;
          color: #1a202c;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .doc-field-value {
          font-size: 12px;
          color: #1a202c;
          border-bottom: 1px dotted #a0aec0;
          flex: 1;
          padding-bottom: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* Trip ID badge — sits at end of flex row, NOT absolute */
        .doc-trip-id {
          flex-shrink: 0;
          border: 2px solid #e53e3e;
          border-radius: 4px;
          padding: 5px 10px;
          text-align: center;
          align-self: flex-start;
          background: #fff5f5;
        }
        .doc-trip-id-label {
          font-size: 11px;
          color: #e53e3e;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .doc-trip-id-number {
          font-size: 24px;
          font-weight: 900;
          color: #e53e3e;
          letter-spacing: 1px;
          line-height: 1;
        }

        /* ─── Passenger tables ─── */
        .pax-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .pax-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .pax-table thead th {
          background: #276749;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 6px;
          text-align: left;
          border: 1px solid #276749;
        }
        .pax-table thead th.col-no  { width: 28px; text-align: center; }
        .pax-table thead th.col-ci  { width: 78px; }
        .pax-table thead th.col-dst { width: 74px; }

        .pax-table tbody tr { height: 21px; }
        .pax-table tbody tr:nth-child(even) { background: #f0fff4; }
        .pax-table tbody tr:nth-child(odd)  { background: #fff; }
        .pax-table tbody tr.pax-occupied    { background: #c6f6d5 !important; }

        .pax-table tbody td {
          border: 1px solid #68d391;
          padding: 1px 5px;
          font-size: 12px;
          color: #1a202c;
          vertical-align: middle;
        }
        .pax-table tbody td.col-no {
          text-align: center;
          font-weight: 700;
          color: #276749;
          border-color: #276749;
          width: 28px;
        }
        .pax-table tbody td.col-name {
          max-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pax-table tbody td.col-ci  { width: 78px; }
        .pax-table tbody td.col-dst { width: 74px; }

        /* ─── Summary bar ─── */
        .ts-summary {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #c8e6c9;
          font-size: 13px;
          color: #4a5568;
        }
        .ts-summary strong { color: #1a202c; }

        /* ─── Loading / Error ─── */
        .ts-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          gap: 14px;
          color: #718096;
        }
        .ts-spinner {
          width: 36px; height: 36px;
          border: 3px solid #bee3f8;
          border-top-color: #3182ce;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── PRINT ─── */
        @media print {
          /* Hide screen-only chrome */
          .ts-toolbar  { display: none !important; }

          /* Reset backgrounds */
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .ts-page         { background: #fff !important; min-height: unset !important; }
          .ts-paper-wrap   { padding: 0 !important; }
          .ts-paper        { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }

          /* Preserve green header bg */
          .pax-table thead th {
            background: #276749 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Preserve zebra / occupied row colors */
          .pax-table tbody tr:nth-child(even) {
            background: #f0fff4 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pax-table tbody tr.pax-occupied {
            background: #c6f6d5 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-trip-id { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          @page { size: letter landscape; margin: 10mm 12mm; }
        }
      `}</style>

      <div className="ts-page">

        {/* ── Toolbar (hidden on print) ── */}
        <div className="ts-toolbar">
          <div>
            <div className="ts-toolbar-title">
              📋 Planilla de Pasajeros
              {trip ? ` — Viaje #${String(trip.id).padStart(6, '0')}` : ''}
            </div>
            {trip && (
              <div className="ts-toolbar-sub">
                {trip.route?.origin?.name || trip.route?.origin} →{' '}
                {trip.route?.destination?.name || trip.route?.destination}
                {' · '}{formatDate(trip.trip_datetime)} · {formatTime(trip.departure_time)}
              </div>
            )}
          </div>
          <button id="btn-imprimir-planilla" className="ts-btn-print" onClick={() => window.print()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2"/>
              <path d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/>
              <rect x="9" y="13" width="6" height="8" rx="1"/>
            </svg>
            Imprimir
          </button>
        </div>

        {/* ── Paper ── */}
        <div className="ts-paper-wrap">

          {isLoading && (
            <div className="ts-loading">
              <div className="ts-spinner" />
              <span>Cargando planilla de pasajeros…</span>
            </div>
          )}

          {hasError && !isLoading && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '14px 20px', color: '#c53030', maxWidth: 480, margin: '40px auto' }}>
              <strong>Error:</strong> {error || passError}
            </div>
          )}

          {!trip && !isLoading && !hasError && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#718096' }}>
              No hay información del viaje para mostrar.
            </div>
          )}

          {trip && !isLoading && !hasError && (
            <div className="ts-paper">

              {/* ══ Document header ══ */}
              <div className="doc-header">

                {/* Logo */}
                <div className="doc-logo">
                  <div className="doc-logo-trans">TRANS</div>
                  <div className="doc-logo-comarapa">COMARAPA</div>
                  <div className="doc-sindicato">
                    SINDICATO MIXTO DE TRANSPORTISTAS<br />
                    "MANUEL MARIA CABALLERO"
                  </div>
                  <div className="doc-phones">
                    OF. STA. CRUZ: 78175576<br />
                    OF. COMARAPA: 781-75578
                  </div>
                </div>

                {/* Info fields */}
                <div className="doc-center">
                  <div className="doc-route-banner">
                    MAIRANA · YERBA BUENA · AGUA CLARA · LOS NEGROS · MATARAL · QUINE · PALIZADA · SAN ISIDRO · COMARAPA
                  </div>
                  <div className="doc-fields">
                    <div className="doc-field">
                      <span className="doc-field-label">Ruta:</span>
                      <span className="doc-field-value">
                        {trip.route?.origin?.name || trip.route?.origin} — {trip.route?.destination?.name || trip.route?.destination}
                      </span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Fecha:</span>
                      <span className="doc-field-value">{formatDate(trip.trip_datetime)}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Conductor:</span>
                      <span className="doc-field-value">{trip.driver?.firstname} {trip.driver?.lastname}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Hora:</span>
                      <span className="doc-field-value">{formatTime(trip.departure_time)}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Lic.:</span>
                      <span className="doc-field-value">{trip.driver?.license_number || ''}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Placa:</span>
                      <span className="doc-field-value">{trip.bus?.license_plate || 'N/A'}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Ayudante:</span>
                      <span className="doc-field-value">{trip.assistant?.firstname} {trip.assistant?.lastname}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Marca:</span>
                      <span className="doc-field-value">{trip.bus?.brand || 'N/A'}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Cat.:</span>
                      <span className="doc-field-value">{trip.driver?.license_type || ''}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Modelo:</span>
                      <span className="doc-field-value">{trip.bus?.model || 'N/A'}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Color:</span>
                      <span className="doc-field-value">{trip.bus?.color || ''}</span>
                    </div>
                  </div>
                </div>

                {/* Trip ID badge — inline flex item, no absolute */}
                <div className="doc-trip-id">
                  <div className="doc-trip-id-label">Nº</div>
                  <div className="doc-trip-id-number">{String(trip.id).padStart(6, '0')}</div>
                </div>

              </div>{/* end doc-header */}

              {/* ══ Passenger tables ══ */}
              <div className="pax-grid">

                {/* Left column: seats 1 → halfCapacity */}
                <table className="pax-table">
                  <thead>
                    <tr>
                      <th className="col-no">No.</th>
                      <th>Nombre y Apellido</th>
                      <th className="col-ci">C.I.</th>
                      <th className="col-dst">Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: halfCapacity }, (_, i) => i + 1).map((n) => {
                      const name = getPassengerName(n)
                      return (
                        <tr key={n} className={name.trim() ? 'pax-occupied' : ''}>
                          <td className="col-no">{n}</td>
                          <td className="col-name">{name}</td>
                          <td className="col-ci">{getPassengerDoc(n)}</td>
                          <td className="col-dst">{getPassengerDest(n)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Right column: seats halfCapacity+1 → busCapacity */}
                <table className="pax-table">
                  <thead>
                    <tr>
                      <th className="col-no">No.</th>
                      <th>Nombre y Apellido</th>
                      <th className="col-ci">C.I.</th>
                      <th className="col-dst">Destino</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: busCapacity - halfCapacity }, (_, i) => i + halfCapacity + 1).map((n) => {
                      const name = getPassengerName(n)
                      return (
                        <tr key={n} className={name.trim() ? 'pax-occupied' : ''}>
                          <td className="col-no">{n}</td>
                          <td className="col-name">{name}</td>
                          <td className="col-ci">{getPassengerDoc(n)}</td>
                          <td className="col-dst">{getPassengerDest(n)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

              </div>{/* end pax-grid */}

              {/* Summary */}
              <div className="ts-summary">
                <span>Total pasajeros: <strong>{totalPassengers}</strong></span>
                <span>Monto total: <strong>Bs. {totalAmount.toFixed(2)}</strong></span>
              </div>

            </div>
          )}{/* end ts-paper */}
        </div>{/* end ts-paper-wrap */}
      </div>{/* end ts-page */}
    </>
  )
}
