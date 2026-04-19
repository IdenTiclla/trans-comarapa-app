import type { Passenger } from './types'

export function TripPassengersTable({ passengers }: { passengers: Passenger[] }) {
  if (passengers.length === 0) {
    return <p className="text-sm text-gray-500 italic">Sin pasajeros registrados.</p>
  }
  return (
    <div className="overflow-x-auto">
      {/* eslint-disable-next-line no-restricted-syntax */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-medium text-gray-600">Asiento</th>
            <th className="text-left py-2 pr-4 font-medium text-gray-600">Pasajero</th>
            <th className="text-left py-2 font-medium text-gray-600">Estado</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map(p => (
            <tr key={p.ticket_id} className="border-b border-gray-50">
              <td className="py-2 pr-4 font-medium text-gray-900">{p.seat_number}</td>
              <td className="py-2 pr-4 text-gray-700">{p.client_name}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.state === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {p.state === 'confirmed' ? 'Confirmado' : p.state === 'pending' ? 'Pendiente' : p.state}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
