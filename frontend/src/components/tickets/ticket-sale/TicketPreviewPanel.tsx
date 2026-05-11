import { Eye } from 'lucide-react'
import type { Trip } from '@/types'
import TicketDisplay from '../TicketDisplay'

interface Props {
  previewTicket: Record<string, unknown> | null
  trip: Trip
}

export function TicketPreviewPanel({ previewTicket, trip }: Props) {
  return (
    <div className="w-full shrink-0 border-t border-border bg-card p-3 sm:p-4 lg:w-1/2 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-8">
      <h4 className="mb-4 flex items-center text-base font-semibold text-foreground sm:text-lg lg:mb-6">
        <Eye className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
        Previsualización del Boleto
      </h4>
      <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
        <div className="w-full max-w-lg">
          {previewTicket ? (
            <TicketDisplay ticket={previewTicket} trip={trip} previewMode={true} />
          ) : (
            <div className="py-10 text-center sm:py-12">
              <p className="mt-4 font-medium text-muted-foreground">La previsualización aparecerá aquí</p>
              <p className="text-sm text-muted-foreground/80">Complete la información del cliente para ver el boleto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
