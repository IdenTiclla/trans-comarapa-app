import { formatDate, formatTime } from './helpers'

export function SheetHeader({ trip }: { trip: any }) {
  return (
    <div className="doc-header">
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

      <div className="doc-trip-id">
        <div className="doc-trip-id-label">Nº</div>
        <div className="doc-trip-id-number">{String(trip.id).padStart(6, '0')}</div>
      </div>
    </div>
  )
}
