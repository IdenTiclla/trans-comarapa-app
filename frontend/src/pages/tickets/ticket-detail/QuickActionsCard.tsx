import { Button } from '@/components/ui/button'
import { Ban, ChevronRight, Ticket, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
  ariaLabel: string
}

function ActionButton({ icon, label, onClick, danger, ariaLabel }: ActionProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'w-full flex items-center justify-between p-3 rounded-lg transition-colors group h-auto',
        danger ? 'hover:bg-rose-50 text-rose-600 hover:text-rose-600' : 'hover:bg-slate-50',
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className={cn('text-sm font-medium', danger ? '' : 'text-gray-900')}>{label}</span>
      </div>
      <ChevronRight className={cn(
        'h-4 w-4 text-gray-400',
        danger ? 'group-hover:text-rose-600' : 'group-hover:text-primary',
      )} />
    </Button>
  )
}

interface Props {
  canCancel: boolean
  onPreview: () => void
  onPrint: () => void
  onCancel: () => void
}

export function QuickActionsCard({ canCancel, onPreview, onPrint, onCancel }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 print:hidden">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 px-2 pt-1 pb-3">
        Acciones
      </h3>
      <ActionButton
        icon={<Ticket className="h-4 w-4 text-gray-600" />}
        label="Previsualizar boleto"
        onClick={onPreview}
        ariaLabel="Previsualizar boleto"
      />
      <ActionButton
        icon={<Printer className="h-4 w-4 text-gray-600" />}
        label="Imprimir boleto"
        onClick={onPrint}
        ariaLabel="Imprimir boleto"
      />
      {canCancel && (
        <ActionButton
          icon={<Ban className="h-4 w-4" />}
          label="Cancelar boleto"
          onClick={onCancel}
          danger
          ariaLabel="Cancelar boleto"
        />
      )}
    </div>
  )
}
