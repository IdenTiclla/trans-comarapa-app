import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getPackageStatusLabel } from '@/lib/package-status'
import type { Package } from '@/types'

interface Props {
  pkg: Package
  onEdit: () => void
  onShowReceipt: () => void
  onMarkReceived: () => void
  onDeliver: () => void
}

export function PackageHeader({ pkg, onEdit, onShowReceipt, onMarkReceived, onDeliver }: Props) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
      <div className="min-w-0">
        <p className="text-[11px] sm:text-xs font-bold tracking-widest text-brand-crimson uppercase mb-1 sm:mb-2">Resumen de Encomienda</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-extrabold text-gray-900 mb-2 break-all">{pkg.tracking_number}</h1>
        <p className="text-gray-600 text-lg flex items-center gap-2">
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-bold uppercase',
            pkg.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700',
          )}>
            {getPackageStatusLabel(pkg.status)}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {pkg.status !== 'delivered' && (
          <Button variant="outline" onClick={onEdit} aria-label="Editar encomienda">
            Editar Encomienda
          </Button>
        )}
        <Button variant="outline" onClick={onShowReceipt} aria-label="Ver boleta de encomienda" className="gap-2">
          <FileText size={18} />
          Ver Boleta
        </Button>
        {pkg.status === 'in_transit' && pkg.trip?.status === 'arrived' && (
          <Button onClick={onMarkReceived} aria-label="Marcar encomienda como recibida">
            Marcar Recibido
          </Button>
        )}
        {pkg.status === 'arrived_at_destination' && (
          <Button onClick={onDeliver} aria-label="Entregar paquete al destinatario">
            Entregar Paquete
          </Button>
        )}
      </div>
    </div>
  )
}
