import { Search, ArrowLeft, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getCategory } from './categories'
import type { CategoryId, SearchResult } from './types'

interface Props {
  categoryId: CategoryId
  query: string
  onQueryChange: (q: string) => void
  onClear: () => void
  onBack: () => void
  onItemSelect: (item: SearchResult) => void
  results: SearchResult[]
  isLoading: boolean
  error: string | null
}

export function SearchResultsView({
  categoryId,
  query,
  onQueryChange,
  onClear,
  onBack,
  onItemSelect,
  results,
  isLoading,
  error,
}: Props) {
  const categoryInfo = getCategory(categoryId)

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Volver a categorias"
          className="h-7 w-7"
        >
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </Button>
        <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={categoryInfo.placeholder}
            className="border-0 shadow-none focus-visible:ring-0 px-0 py-0 h-auto text-sm"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </div>
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="Limpiar busqueda"
            className="h-6 w-6"
          >
            <X className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        )}
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-400">
          ESC
        </kbd>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <div className={`p-1.5 rounded-lg ${categoryInfo.bgColor}`}>
          <span className={categoryInfo.color}>{categoryInfo.icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          Buscando en {categoryInfo.plural}
        </span>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {!query.trim() && !isLoading && (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">
              Escribe para buscar en {categoryInfo.plural.toLowerCase()}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Buscando...</span>
          </div>
        )}

        {error && !isLoading && query.trim() && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-medium text-gray-500">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((item) => {
              const cat = getCategory(item.category)
              return (
                <Button
                  key={`${item.category}-${item.id}`}
                  type="button"
                  variant="ghost"
                  onClick={() => onItemSelect(item)}
                  aria-label={`Abrir ${item.title}`}
                  className="w-full h-auto flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 justify-start text-left group whitespace-normal"
                >
                  <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                    <span className={cat.color}>{cat.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600">Ver</span>
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
