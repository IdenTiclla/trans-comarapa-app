import { formatDate, formatTime } from './helpers'
import { COMPANY, OFFICES, ROUTE_BANNER } from '@/lib/company-config'

interface TripManifest {
  id: number
  trip_datetime?: string
  departure_time?: string
  route?: { origin?: string | { name?: string }; destination?: string | { name?: string } }
  driver?: { firstname?: string; lastname?: string }
  assistant?: { firstname?: string; lastname?: string }
  bus?: { license_plate?: string }
  [k: string]: unknown
}

export function ManifestHeader({ trip }: { trip: TripManifest }) {
  return (
    <div className="doc-header">
      <div className="doc-logo">
        <div className="doc-logo-trans">TRANS</div>
        <div className="doc-logo-comarapa">COMARAPA</div>
        <div className="doc-sindicato">
          {COMPANY.legalName.split('"')[0].trim()}<br />
          "MANUEL MARIA CABALLERO"
        </div>
        <div className="doc-phones">
          OF. STA. CRUZ: {OFFICES.santa_cruz.phone}<br />
          OF. COMARAPA: {OFFICES.comarapa.phoneFormatted}
        </div>
      </div>

      <div className="doc-center">
        <div className="doc-route-banner">
          {ROUTE_BANNER}
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

      <div className="doc-trip-id">
        <div className="doc-trip-id-label">Nº</div>
        <div className="doc-trip-id-number">{String(trip.id).padStart(6, '0')}</div>
      </div>
    </div>
  )
}
