import { Ticket as TicketIcon } from 'lucide-react'
import type { TicketDetail } from '@/hooks/use-ticket-detail'

export function PassengerCard({ ticket }: { ticket: TicketDetail }) {
  const passengerName = [ticket.client?.firstname, ticket.client?.lastname].filter(Boolean).join(' ') || '—'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
            Información del Pasajero
          </h3>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Nombre</p>
            <p className="text-xl font-semibold text-gray-900">{passengerName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">CI / Documento</p>
              <p className="text-base font-medium text-gray-900">{ticket.client?.document_id || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Teléfono</p>
              <p className="text-base font-medium text-gray-900">{ticket.client?.phone || '—'}</p>
            </div>
          </div>
          {ticket.client?.email && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-tight text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{ticket.client.email}</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-5 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-primary text-white flex items-center justify-center rounded-lg mb-3">
            <TicketIcon className="h-7 w-7" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Asiento</p>
          <p className="text-5xl font-bold tracking-tight text-primary leading-none mt-1">
            {ticket.seat?.seat_number ?? ticket.seat_id ?? '—'}
          </p>
          {ticket.seat?.deck && (
            <p className="text-xs text-gray-500 mt-2">Piso {ticket.seat.deck}</p>
          )}
        </div>
      </div>
    </div>
  )
}
