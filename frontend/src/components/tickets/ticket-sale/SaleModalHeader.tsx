import { Button } from '@/components/ui/button'
import { Ticket as TicketIcon, X } from 'lucide-react'
import type { ActionType, SelectedSeat } from './types'

interface Props {
  actionType: ActionType
  selectedSeats: SelectedSeat[]
  origin?: string
  destination?: string
  onClose: () => void
}

export function SaleModalHeader({ actionType, selectedSeats, origin, destination, onClose }: Props) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b shrink-0">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-2 rounded-lg">
          <TicketIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {actionType === 'sell' ? 'Vender Boleto' : 'Reservar Asiento'}
          </h3>
          <p className="text-blue-100 text-sm">
            Asientos {selectedSeats.map((s) => s.number).join(', ')} - {origin} → {destination}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Cerrar modal"
        className="text-white hover:bg-white/20 hover:text-white"
      >
        <X className="w-6 h-6" />
      </Button>
    </div>
  )
}
