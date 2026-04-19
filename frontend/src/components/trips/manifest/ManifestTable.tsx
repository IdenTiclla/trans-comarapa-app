import { Link } from 'react-router'
import { getPackageDestination } from '@/lib/package-status'
import { getDescription, isPaid, type TripPackage } from './helpers'

interface Props {
  packages: TripPackage[]
  trip: any
}

export function ManifestTable({ packages, trip }: Props) {
  if (packages.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#718096', fontSize: 13 }}>
        No hay encomiendas registradas para este viaje.
      </div>
    )
  }

  const totalPaid = packages.filter(p => isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
  const totalUnpaid = packages.filter(p => !isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
  const totalAll = packages.reduce((acc, p) => acc + Number(p.total_amount || 0), 0)

  return (
    <>
      {/* eslint-disable-next-line no-restricted-syntax */}
      <table className="pkg-table">
        <thead>
          <tr>
            <th className="col-no">Nº</th>
            <th className="col-id">ID</th>
            <th>Remitente</th>
            <th>Descripción Encomienda</th>
            <th>Destinatario</th>
            <th>Destino</th>
            <th className="col-est">Estado</th>
            <th className="col-amt">Bs.</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, idx) => (
            <tr key={pkg.id}>
              <td className="col-no">{idx + 1}</td>
              <td className="col-id">
                <Link to={`/packages/${pkg.id}`}>{pkg.tracking_number || pkg.id}</Link>
              </td>
              <td>{pkg.sender_name || '—'}</td>
              <td className="col-desc">{getDescription(pkg)}</td>
              <td>{pkg.recipient_name || '—'}</td>
              <td>{getPackageDestination(pkg, trip)}</td>
              <td className="col-est">
                {isPaid(pkg.payment_status)
                  ? <span className="badge-paid">Pagado</span>
                  : <span className="badge-unpaid">Por Cobrar</span>}
              </td>
              <td className="col-amt">{Number(pkg.total_amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pm-summary">
        <span>Total encomiendas: <strong>{packages.length}</strong></span>
        <span>Pagadas: <strong>{packages.filter(p => isPaid(p.payment_status)).length}</strong></span>
        <span>Monto pagado: <strong>Bs. {totalPaid.toFixed(2)}</strong></span>
        <span>Por cobrar: <strong>{packages.filter(p => !isPaid(p.payment_status)).length}</strong></span>
        <span>Monto por cobrar: <strong>Bs. {totalUnpaid.toFixed(2)}</strong></span>
        <span>Monto total: <strong>Bs. {totalAll.toFixed(2)}</strong></span>
      </div>
    </>
  )
}
