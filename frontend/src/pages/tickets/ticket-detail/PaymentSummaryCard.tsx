import { cn } from '@/lib/utils'
import type { TicketDetail, TripDetail } from '@/hooks/use-ticket-detail'
import { PAYMENT_METHOD, formatCurrency, getStateInfo } from './helpers'

export function PaymentSummaryCard({ ticket, trip }: { ticket: TicketDetail; trip: TripDetail | null }) {
  const stateInfo = getStateInfo(ticket.state)
  const basePrice = trip?.route?.price
  const totalPrice = ticket.price
  const secretaryName = [ticket.secretary?.firstname, ticket.secretary?.lastname].filter(Boolean).join(' ') || '—'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-4">Valor Pagado</p>
      <h3 className="text-[40px] font-bold text-gray-900 leading-none mb-1 tracking-tight">
        {formatCurrency(totalPrice)}
      </h3>
      <p className="text-[11px] text-gray-500 mb-6">Monto total del servicio</p>

      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-gray-700 uppercase tracking-tighter">Estado</span>
          <span className={cn(
            'px-2 py-0.5 font-bold uppercase tracking-widest rounded ring-1 scale-90 origin-right',
            stateInfo.className,
          )}>
            {stateInfo.label}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">Método de pago</span>
          <span className="text-xs font-bold text-gray-900">
            {ticket.payment_method ? PAYMENT_METHOD[ticket.payment_method] ?? ticket.payment_method : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">Emitido por</span>
          <span className="text-xs font-bold text-gray-900">{secretaryName}</span>
        </div>
        {basePrice !== undefined && basePrice !== totalPrice && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
            <span className="text-xs font-bold text-gray-700">Tarifa Base</span>
            <span className="text-xs font-bold text-gray-500 line-through">{formatCurrency(basePrice)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
