import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useNavigate } from 'react-router'
import {
  type Ticket,
  formatCurrency,
  formatDate,
  getStatusText,
  getStatusBadgeClass,
} from './tickets-helpers'

interface ViewProps {
  tickets: Ticket[]
  getClientName: (id: number) => string
  getTripInfo: (id: number) => string
  onEdit: (t: Ticket) => void
  onCancel: (id: number) => void
}

export function TicketsTableView({ tickets, getClientName, getTripInfo, onEdit, onCancel }: ViewProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-x-auto mb-6">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="uppercase text-xs">Boleto</TableHead>
            <TableHead className="uppercase text-xs">Cliente</TableHead>
            <TableHead className="uppercase text-xs">Viaje</TableHead>
            <TableHead className="uppercase text-xs">Estado</TableHead>
            <TableHead className="uppercase text-xs">Precio</TableHead>
            <TableHead className="uppercase text-xs text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id} className="hover:bg-gray-50">
              <TableCell className="text-sm font-medium">
                <p>#{t.id}</p>
                <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
              </TableCell>
              <TableCell className="text-sm">{getClientName(t.client_id)}</TableCell>
              <TableCell className="text-sm">
                {getTripInfo(t.trip_id)}
                <br /> Asiento {t.seat_id}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(t.state)}`}>
                  {getStatusText(t.state)}
                </span>
              </TableCell>
              <TableCell className="text-sm font-medium">{formatCurrency(t.price)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => navigate(`/tickets/${t.id}`)}>
                  Ver
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(t)} className="text-indigo-600 hover:text-indigo-900">
                  Editar
                </Button>
                {t.state !== 'cancelled' && (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(t.id)} className="text-red-600 hover:text-red-900">
                    Cancelar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TicketsCardGridView({ tickets, getClientName, getTripInfo, onEdit, onCancel }: ViewProps) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      {tickets.map((t) => (
        <div key={t.id} className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">Boleto #{t.id}</h4>
              <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(t.state)}`}>
              {getStatusText(t.state)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900">{getClientName(t.client_id)}</p>
          <p className="text-sm text-gray-600 mb-2">{getTripInfo(t.trip_id)}</p>
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">Asiento {t.seat_id}</span>
            <span className="font-bold text-gray-900">{formatCurrency(t.price)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/tickets/${t.id}`)} className="flex-1">
              Ver
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(t)} className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100">
              Editar
            </Button>
            {t.state !== 'cancelled' && (
              <Button variant="secondary" size="sm" onClick={() => onCancel(t.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100">
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
