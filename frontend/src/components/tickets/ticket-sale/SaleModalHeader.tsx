import { DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Ticket as TicketIcon } from 'lucide-react'
import type { ActionType, SelectedSeat } from './types'

interface Props {
  actionType: ActionType
  selectedSeats: SelectedSeat[]
  origin?: string
  destination?: string
  isEditMode?: boolean
  onClose: () => void
}

export function SaleModalHeader({ actionType, selectedSeats, origin, destination, isEditMode = false }: Props) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-primary px-4 py-3 sm:items-center sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-start gap-3 sm:items-center">
        <div className="rounded-lg bg-primary-foreground/15 p-2 text-primary-foreground">
          <TicketIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <DialogTitle className="text-lg font-bold leading-tight text-primary-foreground sm:text-xl">
            {isEditMode ? 'Editar Boleto' : actionType === 'sell' ? 'Vender Boleto' : 'Reservar Asiento'}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-xs text-primary-foreground/80 sm:text-sm sm:truncate">
            Asientos {selectedSeats.map((s) => s.number).join(', ')} - {origin} → {destination}
          </DialogDescription>
        </div>
      </div>
    </div>
  )
}
