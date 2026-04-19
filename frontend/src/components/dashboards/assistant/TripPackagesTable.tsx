import type { TripPackage } from './types'
import { PKG_STATUS_LABELS } from './constants'

export function TripPackagesTable({ packages }: { packages: TripPackage[] }) {
  if (packages.length === 0) {
    return <p className="text-sm text-gray-500 italic">Sin encomiendas en este viaje.</p>
  }
  return (
    <div className="overflow-x-auto">
      {/* eslint-disable-next-line no-restricted-syntax */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-3 font-medium text-gray-600">Tracking #</th>
            <th className="text-left py-2 pr-3 font-medium text-gray-600">Remitente</th>
            <th className="text-left py-2 pr-3 font-medium text-gray-600">Destinatario</th>
            <th className="text-left py-2 pr-3 font-medium text-gray-600">Estado</th>
            <th className="text-left py-2 font-medium text-gray-600">Pago</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.id} className="border-b border-gray-50">
              <td className="py-2 pr-3 font-mono text-xs text-gray-900">{pkg.tracking_number}</td>
              <td className="py-2 pr-3 text-gray-700">{pkg.sender_name}</td>
              <td className="py-2 pr-3 text-gray-700">{pkg.recipient_name}</td>
              <td className="py-2 pr-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {PKG_STATUS_LABELS[pkg.status] || pkg.status}
                </span>
              </td>
              <td className="py-2">
                {pkg.payment_status === 'collect_on_delivery' ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Por cobrar</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Pagado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
