import { cn } from '@/lib/utils'

type SkeletonType = 'card' | 'list' | 'table-row' | 'detail' | 'text'

interface SkeletonLoaderProps {
  type?: SkeletonType
  withActions?: boolean
  className?: string
}

export default function SkeletonLoader({ type = 'card', withActions = true, className }: SkeletonLoaderProps) {
  if (type === 'card') {
    return (
      <div role="status" aria-busy="true" className={cn('w-full bg-card rounded-2xl p-6 shadow-sm border border-border h-full', className)}>
        <span className="sr-only">Cargando contenido...</span>
        <div aria-hidden="true" className="animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-muted rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
          {withActions && (
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-border">
              <div className="h-8 bg-muted rounded w-16" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div role="status" aria-busy="true" className={cn('w-full bg-card rounded-xl p-4 shadow-sm border border-border', className)}>
        <span className="sr-only">Cargando contenido...</span>
        <div aria-hidden="true" className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-full flex-shrink-0" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded hidden md:block" />
              <div className="h-4 bg-muted rounded hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'table-row') {
    return (
      <tr className={cn('w-full bg-card border-b border-border', className)}>
        <td colSpan={6} className="p-0">
          <div role="status" aria-busy="true">
            <span className="sr-only">Cargando fila...</span>
            <div aria-hidden="true" className="animate-pulse flex items-center px-6 py-4 gap-4">
            <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1 w-32">
              <div className="h-4 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
            <div className="h-4 bg-muted rounded w-24" />
            <div className="space-y-2 w-32">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-6 w-16 rounded-full bg-muted" />
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded" />
            </div>
            </div>
          </div>
        </td>
      </tr>
    )
  }

  if (type === 'detail') {
    return (
      <div role="status" aria-busy="true" className={cn('w-full bg-card shadow-md rounded-xl border border-border p-6', className)}>
        <span className="sr-only">Cargando contenido...</span>
        <div aria-hidden="true" className="animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-6 bg-muted rounded-full w-20 flex-shrink-0" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div role="status" aria-busy="true" className={cn('w-full space-y-3', className)}>
      <span className="sr-only">Cargando contenido...</span>
      <div aria-hidden="true" className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    </div>
  )
}
