/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getPackageStatusLabel } from '@/lib/package-status'

interface Props {
  pkg: any
  onEdit: () => void
  onShowReceipt: () => void
  onMarkReceived: () => void
  onDeliver: () => void
}

export function PackageHeader({ pkg, onEdit, onShowReceipt, onMarkReceived, onDeliver }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
      <div>
        <h4 className="text-xs font-bold tracking-widest text-[#932720] uppercase mb-2">Resumen de Encomienda</h4>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{pkg.tracking_number}</h1>
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
