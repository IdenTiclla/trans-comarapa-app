import { cn } from '@/lib/utils'

export function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'h-1.5 w-1.5 rounded-full flex-shrink-0',
        status === 'registered_at_office' && 'bg-yellow-500',
        status === 'assigned_to_trip' && 'bg-blue-500',
        status === 'in_transit' && 'bg-orange-500',
        status === 'arrived_at_destination' && 'bg-emerald-500',
        status === 'delivered' && 'bg-green-500',
        !['registered_at_office', 'assigned_to_trip', 'in_transit', 'arrived_at_destination', 'delivered'].includes(status) && 'bg-gray-500',
      )}
    />
  )
}
