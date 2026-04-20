import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { computeDisplayedPages } from './helpers'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
}

export function UserTablePagination({ currentPage, totalPages, totalItems, startItem, endItem, onPageChange }: Props) {
  const pages = computeDisplayedPages(totalPages, currentPage)
  const prevDisabled = currentPage === 1
  const nextDisabled = currentPage === totalPages || totalPages === 0

  return (
    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      <div className="flex-1 flex justify-between sm:hidden">
        <Button onClick={() => onPageChange(currentPage - 1)} disabled={prevDisabled} size="sm">Anterior</Button>
        <Button onClick={() => onPageChange(currentPage + 1)} disabled={nextDisabled} size="sm" className="ml-3">Siguiente</Button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={prevDisabled}
              aria-label="Página anterior"
              className="rounded-l-md rounded-r-none h-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {pages.map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
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
                    page === currentPage && 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600',
                  )}
                >
                  {page}
                </Button>
              )
            ))}

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={nextDisabled}
              aria-label="Página siguiente"
              className="rounded-r-md rounded-l-none h-9"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
