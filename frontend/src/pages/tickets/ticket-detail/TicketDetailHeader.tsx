import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, Edit, Ticket, Printer } from 'lucide-react'
import { formatDateTime, getStateInfo } from './helpers'

interface Props {
  ticketId: number
  state?: string
  createdAt?: string
  onEdit: () => void
  onPreview: () => void
  onPrint: () => void
}

export function TicketDetailHeader({ ticketId, state, createdAt, onEdit, onPreview, onPrint }: Props) {
  const stateInfo = getStateInfo(state)

  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          <Link to="/tickets" className="hover:text-primary">Boletos</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">Detalles</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Boleto #{ticketId}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className={cn(
            'px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest rounded ring-1',
            stateInfo.className,
          )}>
            {stateInfo.label}
          </span>
          <span className="text-sm text-gray-500">
            Emitido: {formatDateTime(createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={onEdit} aria-label="Editar boleto">
          <Edit className="h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" onClick={onPreview} aria-label="Previsualizar boleto">
          <Ticket className="h-4 w-4" />
          Previsualizar
        </Button>
        <Button onClick={onPrint} aria-label="Imprimir boleto">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>
    </header>
  )
}
