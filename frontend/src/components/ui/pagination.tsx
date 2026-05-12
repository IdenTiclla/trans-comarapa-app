import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { computeDisplayedPages } from './pagination-helpers'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  /**
   * "compact" → Anterior · "Página X de Y" · Siguiente. Para tarjetas/listas.
   * "full"    → Numeradas con elipsis y conteo de resultados. Para tablas.
   */
  variant?: 'compact' | 'full'
  /** Solo aplica a variant="full". */
  totalItems?: number
  startItem?: number
  endItem?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'compact',
  totalItems,
  startItem,
  endItem,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  if (variant === 'compact') {
    return (
      <nav className={cn('flex justify-between items-center bg-card border rounded-lg p-3', className)} aria-label="Paginación">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={prevDisabled}
        >
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={nextDisabled}
        >
          Siguiente
        </Button>
      </nav>
    )
  }

  const pages = computeDisplayedPages(totalPages, currentPage)

  return (
    <div className={cn('px-4 py-3 bg-card border-t flex items-center justify-between', className)}>
      <div className="flex-1 flex justify-between sm:hidden">
        <Button onClick={() => onPageChange(currentPage - 1)} disabled={prevDisabled} size="sm">
          Anterior
        </Button>
        <Button onClick={() => onPageChange(currentPage + 1)} disabled={nextDisabled} size="sm" className="ml-3">
          Siguiente
        </Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{startItem}</span> a{' '}
            <span className="font-medium text-foreground">{endItem}</span> de{' '}
            <span className="font-medium text-foreground">{totalItems}</span> resultados
          </p>
        ) : (
          <span />
        )}
        <nav className="relative z-0 inline-flex -space-x-px" aria-label="Paginación">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={prevDisabled}
            aria-label="Página anterior"
            className="rounded-l-md rounded-r-none h-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="relative inline-flex items-center px-3 py-2 border bg-card text-sm text-muted-foreground"
                aria-hidden="true"
              >
                ...
                <span className="sr-only">Más páginas</span>
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                variant="outline"
                onClick={() => onPageChange(page as number)}
                aria-label={`Ir a página ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                className={cn(
                  'rounded-none h-9',
                  page === currentPage && 'z-10 bg-primary/10 border-primary text-primary hover:bg-primary/15',
                )}
              >
                {page}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={nextDisabled}
            aria-label="Página siguiente"
            className="rounded-r-md rounded-l-none h-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}

