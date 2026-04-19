import { Trash2, FileCheck, Truck, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TripPackage } from './types'

interface PackageActionsProps {
  pkg: TripPackage
  tripStatus: string
  onUnassignPackage?: (id: number) => void
  onDeliverPackage?: (id: number) => void
  onReceivePackage?: (id: number) => void
  onShowReceipt?: (id: number) => void
  compact?: boolean
}

export function PackageActions({
  pkg,
  tripStatus,
  onUnassignPackage,
  onDeliverPackage,
  onReceivePackage,
  onShowReceipt,
  compact,
 }: PackageActionsProps) {
  const hasActions =
    (pkg.status === 'in_transit' && tripStatus === 'arrived') ||
    pkg.status === 'arrived_at_destination' ||
    pkg.status === 'assigned_to_trip' ||
    !!onShowReceipt

  if (!hasActions) return null

  return (
    <div className={cn('flex items-center gap-1.5', !compact && 'ml-2 flex-shrink-0')}>
      {onShowReceipt && (
        <Button
          size="sm"
          variant="outline"
          aria-label={`Ver boleta de encomienda ${pkg.tracking_number || pkg.id}`}
          onClick={(e) => {
            e.preventDefault()
            onShowReceipt(pkg.id)
          }}
          className={cn(
            'gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800',
            compact && 'px-2.5',
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          {!compact && 'Ver Boleta'}
        </Button>
      )}
      {pkg.status === 'in_transit' && tripStatus === 'arrived' && (
        <Button
          size="sm"
          variant="outline"
          aria-label={`Marcar como recibido el paquete ${pkg.tracking_number || pkg.id}`}
          onClick={(e) => {
            e.preventDefault()
            onReceivePackage?.(pkg.id)
          }}
          className={cn(
            'gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
            compact && 'px-2.5',
          )}
        >
          <FileCheck className="h-3.5 w-3.5" />
          {!compact && 'Marcar Recibido'}
        </Button>
      )}
      {pkg.status === 'arrived_at_destination' && (
        <Button
          size="sm"
          variant="outline"
          aria-label={`Entregar paquete ${pkg.tracking_number || pkg.id}`}
          onClick={(e) => {
            e.preventDefault()
            onDeliverPackage?.(pkg.id)
          }}
          className={cn(
            'gap-1.5 border-primary/30 text-primary hover:bg-primary/5',
            compact && 'px-2.5',
          )}
        >
          <Truck className="h-3.5 w-3.5" />
          {!compact && 'Entregar'}
        </Button>
      )}
      {pkg.status === 'assigned_to_trip' && (
        <Button
          size="sm"
          variant="outline"
          aria-label={`Quitar del viaje el paquete ${pkg.tracking_number || pkg.id}`}
          onClick={(e) => {
            e.preventDefault()
            onUnassignPackage?.(pkg.id)
          }}
          className={cn(
            'gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800',
            compact && 'px-2.5',
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {!compact && 'Quitar del viaje'}
        </Button>
      )}
    </div>
  )
}
