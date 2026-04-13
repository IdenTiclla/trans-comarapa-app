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

interface PackageItem {
  quantity: number
  description: string
}

interface TripPackage {
  id: number
  sender_name?: string
  recipient_name?: string
  description?: string
  items?: PackageItem[]
  payment_status?: string
  total_amount?: string | number
}

function getDescription(pkg: TripPackage): string {
  if (pkg.items && pkg.items.length > 0) {
    return pkg.items.map((i) => `${i.quantity}x ${i.description}`).join(', ')
  }
  return pkg.description || '—'
}

function getPaymentLabel(status?: string): string {
  if (!status) return 'Por Cobrar'
  const s = status.toLowerCase()
  if (s === 'paid_on_send' || s === 'paid' || s === 'pagado') return 'Pagado'
  return 'Por Cobrar'
}

function isPaid(status?: string): boolean {
  if (!status) return false
  const s = status.toLowerCase()
  return s === 'paid_on_send' || s === 'paid' || s === 'pagado'
}

export function Component() {
  const { id } = useParams()
  const tripId = Number(typeof id === 'string' ? id : id)
  const dispatch = useAppDispatch()
  const trip = useAppSelector(selectCurrentTrip) as any
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)

  const [packages, setPackages] = useState<TripPackage[]>([])
  const [loadingPkgs, setLoadingPkgs] = useState(true)
  const [pkgError, setPkgError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoadingPkgs(true)
      setPkgError(null)
      try {
        await dispatch(fetchTripById(tripId))
        const data = await apiFetch(`/packages/by-trip/${tripId}`)
        setPackages(Array.isArray(data) ? data : data?.items || [])
      } catch (err: any) {
        setPkgError(err?.message || 'Error al cargar el manifiesto.')
      } finally {
        setLoadingPkgs(false)
      }
    }
    load()
  }, [dispatch, tripId])

  const isLoading = loading || loadingPkgs
  const hasError = error || pkgError

  return (
    <>
      <style>{`
        /* ─── Base ─── */
        .pm-page {
          min-height: 100vh;
          background: #edf2f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ─── Toolbar (screen only) ─── */
        .pm-toolbar {
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
        .pm-toolbar-title {
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: .3px;
        }
        .pm-toolbar-sub {
          color: #90cdf4;
          font-size: 11px;
          margin-top: 2px;
        }
        .pm-btn-print {
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
        .pm-btn-print:hover { background: #2b6cb0; }

        /* ─── Paper wrapper ─── */
        .pm-paper-wrap {
          padding: 24px 32px 48px;
        }
        .pm-paper {
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 4px 20px rgba(0,0,0,.14);
          padding: 24px 28px 28px;
        }

        /* ─── Document header ─── */
        .doc-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          border-bottom: 2px solid #276749;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }
        .doc-logo {
          flex-shrink: 0;
          width: 185px;
          border-right: 1px solid #c3d9ca;
          padding-right: 14px;
        }
        .doc-logo-trans {
          font-size: 12px;
          font-weight: 900;
          font-family: 'Times New Roman', serif;
          letter-spacing: 2px;
          color: #1a202c;
          line-height: 1;
        }
        .doc-logo-comarapa {
          font-size: 28px;
          font-weight: 900;
          font-family: 'Times New Roman', serif;
          color: #1a202c;
          letter-spacing: 1px;
          line-height: 1;
          margin-bottom: 4px;
        }
        .doc-sindicato {
          font-size: 8px;
          color: #4a5568;
          line-height: 1.35;
          margin-bottom: 5px;
        }
        .doc-phones {
          font-size: 8px;
          color: #4a5568;
          line-height: 1.5;
        }
        .doc-center {
          flex: 1;
          overflow: hidden;
        }
        .doc-route-banner {
          font-size: 9px;
          font-weight: 700;
          color: #276749;
          text-align: center;
          letter-spacing: .4px;
          border-bottom: 1px solid #c3d9ca;
          padding-bottom: 5px;
          margin-bottom: 8px;
        }
        .doc-manifest-title {
          font-size: 13px;
          font-weight: 900;
          color: #1a365d;
          text-align: center;
          letter-spacing: 1px;
          text-transform: uppercase;
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
          font-size: 9px;
          font-weight: 700;
          color: #1a202c;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .doc-field-value {
          font-size: 9px;
          color: #1a202c;
          border-bottom: 1px dotted #a0aec0;
          flex: 1;
          padding-bottom: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
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
          font-size: 8px;
          color: #e53e3e;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .doc-trip-id-number {
          font-size: 18px;
          font-weight: 900;
          color: #e53e3e;
          letter-spacing: 1px;
          line-height: 1;
        }

        /* ─── Packages table ─── */
        .pkg-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          margin-top: 4px;
        }
        .pkg-table thead th {
          background: #1a365d;
          color: #fff;
          font-size: 9.5px;
          font-weight: 700;
          padding: 5px 7px;
          text-align: left;
          border: 1px solid #1a365d;
        }
        .pkg-table thead th.col-no   { width: 28px; text-align: center; }
        .pkg-table thead th.col-amt  { width: 62px; text-align: right; }
        .pkg-table thead th.col-est  { width: 80px; text-align: center; }

        .pkg-table tbody tr { height: 22px; }
        .pkg-table tbody tr:nth-child(even) { background: #ebf8ff; }
        .pkg-table tbody tr:nth-child(odd)  { background: #fff; }

        .pkg-table tbody td {
          border: 1px solid #bee3f8;
          padding: 2px 6px;
          font-size: 9.5px;
          color: #1a202c;
          vertical-align: middle;
        }
        .pkg-table tbody td.col-no {
          text-align: center;
          font-weight: 700;
          color: #1a365d;
          border-color: #1a365d;
          width: 28px;
        }
        .pkg-table tbody td.col-amt {
          text-align: right;
          font-weight: 700;
          width: 62px;
        }
        .pkg-table tbody td.col-est {
          text-align: center;
          width: 80px;
          padding: 2px 4px;
        }
        .pkg-table tbody td.col-desc {
          max-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ─── Estado badge ─── */
        .badge-paid {
          display: inline-block;
          background: #c6f6d5;
          color: #22543d;
          font-size: 8.5px;
          font-weight: 700;
          border-radius: 3px;
          padding: 1px 6px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .badge-unpaid {
          display: inline-block;
          background: #fefcbf;
          color: #744210;
          font-size: 8.5px;
          font-weight: 700;
          border-radius: 3px;
          padding: 1px 6px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* ─── Summary bar ─── */
        .pm-summary {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #bee3f8;
          font-size: 10px;
          color: #4a5568;
        }
        .pm-summary strong { color: #1a202c; }

        /* ─── Loading / Error ─── */
        .pm-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 320px;
          gap: 14px;
          color: #718096;
        }
        .pm-spinner {
          width: 36px; height: 36px;
          border: 3px solid #bee3f8;
          border-top-color: #3182ce;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── PRINT ─── */
        @media print {
          .pm-toolbar { display: none !important; }

          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .pm-page       { background: #fff !important; min-height: unset !important; }
          .pm-paper-wrap { padding: 0 !important; }
          .pm-paper      { box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }

          .pkg-table thead th {
            background: #1a365d !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pkg-table tbody tr:nth-child(even) {
            background: #ebf8ff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .badge-paid   { background: #c6f6d5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .badge-unpaid { background: #fefcbf !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .doc-trip-id  { background: #fff5f5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          @page { size: letter landscape; margin: 10mm 12mm; }
        }
      `}</style>

      <div className="pm-page">

        {/* ── Toolbar (hidden on print) ── */}
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
          <button id="btn-imprimir-manifiesto" className="pm-btn-print" onClick={() => window.print()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2"/>
              <path d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/>
              <rect x="9" y="13" width="6" height="8" rx="1"/>
            </svg>
            Imprimir
          </button>
        </div>

        {/* ── Paper ── */}
        <div className="pm-paper-wrap">

          {isLoading && (
            <div className="pm-loading">
              <div className="pm-spinner" />
              <span>Cargando manifiesto de encomiendas…</span>
            </div>
          )}

          {hasError && !isLoading && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '14px 20px', color: '#c53030', maxWidth: 480, margin: '40px auto' }}>
              <strong>Error:</strong> {error || pkgError}
            </div>
          )}

          {!trip && !isLoading && !hasError && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#718096' }}>
              No hay información del viaje para mostrar.
            </div>
          )}

          {trip && !isLoading && !hasError && (
            <div className="pm-paper">

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
                  <div className="doc-manifest-title">Manifiesto de Encomiendas</div>
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
                      <span className="doc-field-label">Ayudante:</span>
                      <span className="doc-field-value">{trip.assistant?.firstname} {trip.assistant?.lastname}</span>
                    </div>
                    <div className="doc-field">
                      <span className="doc-field-label">Placa:</span>
                      <span className="doc-field-value">{trip.bus?.license_plate || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Trip ID badge */}
                <div className="doc-trip-id">
                  <div className="doc-trip-id-label">Nº</div>
                  <div className="doc-trip-id-number">{String(trip.id).padStart(6, '0')}</div>
                </div>

              </div>{/* end doc-header */}

              {/* ══ Packages table ══ */}
              {packages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096', fontSize: 13 }}>
                  No hay encomiendas registradas para este viaje.
                </div>
              ) : (
                <>
                  <table className="pkg-table">
                    <thead>
                      <tr>
                        <th className="col-no">Nº</th>
                        <th>Remitente</th>
                        <th>Descripción Encomienda</th>
                        <th>Destinatario</th>
                        <th className="col-est">Estado</th>
                        <th className="col-amt">Bs.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((pkg, idx) => (
                        <tr key={pkg.id}>
                          <td className="col-no">{idx + 1}</td>
                          <td>{pkg.sender_name || '—'}</td>
                          <td className="col-desc">{getDescription(pkg)}</td>
                          <td>{pkg.recipient_name || '—'}</td>
                          <td className="col-est">
                            {isPaid(pkg.payment_status)
                              ? <span className="badge-paid">Pagado</span>
                              : <span className="badge-unpaid">Por Cobrar</span>
                            }
                          </td>
                          <td className="col-amt">{Number(pkg.total_amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="pm-summary">
                    <span>Total encomiendas: <strong>{packages.length}</strong></span>
                    <span>Pagadas: <strong>{packages.filter(p => isPaid(p.payment_status)).length}</strong></span>
                    <span>Monto pagado: <strong>Bs. {packages.filter(p => isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0).toFixed(2)}</strong></span>
                    <span>Por cobrar: <strong>{packages.filter(p => !isPaid(p.payment_status)).length}</strong></span>
                    <span>Monto por cobrar: <strong>Bs. {packages.filter(p => !isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0).toFixed(2)}</strong></span>
                    <span>Monto total: <strong>Bs. {packages.reduce((acc, p) => acc + Number(p.total_amount || 0), 0).toFixed(2)}</strong></span>
                  </div>
                </>
              )}

            </div>
          )}{/* end pm-paper */}
        </div>{/* end pm-paper-wrap */}
      </div>{/* end pm-page */}
    </>
  )
}
