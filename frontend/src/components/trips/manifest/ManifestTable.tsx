import { Link } from 'react-router'
import { getPackageDestination } from '@/lib/package-status'
import { getDescription, isPaid, type TripPackage } from './helpers'
import { ROUTES } from '@/lib/routes'

interface Props {
  packages: TripPackage[]
  trip: Record<string, unknown>
}

const MIN_ROWS = 25

export function ManifestTable({ packages, trip }: Props) {
  const totalPaid = packages.filter(p => isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
  const totalUnpaid = packages.filter(p => !isPaid(p.payment_status)).reduce((acc, p) => acc + Number(p.total_amount || 0), 0)
  const totalAll = packages.reduce((acc, p) => acc + Number(p.total_amount || 0), 0)

  const emptyRows = Math.max(0, MIN_ROWS - packages.length)

  return (
    <>
      {/* eslint-disable-next-line no-restricted-syntax */}
      <table className="pkg-table">
        <caption className="sr-only">Manifiesto de paquetes</caption>
        <thead>
          <tr>
            <th scope="col" className="col-no">Nº</th>
            <th scope="col" className="col-id">ID</th>
            <th scope="col">Remitente</th>
            <th scope="col">Descripción Encomienda</th>
            <th scope="col">Destinatario</th>
            <th scope="col">Destino</th>
            <th scope="col" className="col-est">Estado</th>
            <th scope="col" className="col-amt">Bs.</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, idx) => (
            <tr key={pkg.id}>
              <td className="col-no">{idx + 1}</td>
              <td className="col-id">
                <Link to={ROUTES.packageDetail(pkg.id)}>{pkg.tracking_number || pkg.id}</Link>
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
          {Array.from({ length: emptyRows }, (_, i) => (
            <tr key={`empty-${i}`}>
              <td className="col-no">{packages.length + i + 1}</td>
              <td className="col-id" />
              <td />
              <td className="col-desc" />
              <td />
              <td />
              <td className="col-est" />
              <td className="col-amt" />
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
