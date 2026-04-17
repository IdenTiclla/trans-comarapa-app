import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Search,
  Users,
  Ticket,
  MapPin,
  Package,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { clientService } from '@/services/client.service'
import { ticketService } from '@/services/ticket.service'
import { tripService } from '@/services/trip.service'
import { packageService, PACKAGE_STATUS_LABELS } from '@/services/package.service'
import TicketModal from '@/components/tickets/TicketModal'
import PackageReceiptModal from '@/components/packages/PackageReceiptModal'
import ClientViewModal from '@/components/clients/ClientViewModal'
import { useNavigate } from 'react-router'

type ViewMode = 'category' | 'search'
type CategoryId = 'client' | 'ticket' | 'trip' | 'package'

interface Category {
  id: CategoryId
  label: string
  plural: string
  description: string
  icon: React.ReactNode
  placeholder: string
  color: string
  bgColor: string
}

interface SearchResult {
  id: number
  title: string
  subtitle: string
  category: CategoryId
  data: any
}

const CATEGORIES: Category[] = [
  {
    id: 'client',
    label: 'Cliente',
    plural: 'Clientes',
    description: 'Buscar por nombre o CI',
    icon: <Users className="h-5 w-5" />,
    placeholder: 'Nombre o CI...',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'ticket',
    label: 'Boleto',
    plural: 'Boletos',
    description: 'Buscar por numero o cliente',
    icon: <Ticket className="h-5 w-5" />,
    placeholder: 'Numero de boleto o cliente...',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'trip',
    label: 'Viaje',
    plural: 'Viajes',
    description: 'Buscar por origen o destino',
    icon: <MapPin className="h-5 w-5" />,
    placeholder: 'Origen o destino...',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'package',
    label: 'Paquete',
    plural: 'Paquetes',
    description: 'Buscar por tracking o destinatario',
    icon: <Package className="h-5 w-5" />,
    placeholder: 'Tracking o destinatario...',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export default function QuickSearch() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('category')
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open && !showDetailModal) {
      setTimeout(() => {
        setViewMode('category')
        setQuery('')
        setSelectedCategory(null)
        setResults([])
        setError(null)
      }, 200)
    }
  }, [open, showDetailModal])

  const getCategory = useCallback(
    (id: CategoryId) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0],
    []
  )

  const performSearch = useCallback(async (categoryId: CategoryId, searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let data: any[] = []
      const term = searchTerm.trim().toLowerCase()

      switch (categoryId) {
        case 'client': {
          const response = await clientService.search(term)
          data = (response.clients || response || []).map((c: any) => ({
            id: c.id,
            title: `${c.firstname || ''} ${c.lastname || ''}`.trim() || 'Sin nombre',
            subtitle: `CI: ${c.document_id || 'N/A'} - ${c.phone || 'Sin telefono'}`,
            category: 'client' as CategoryId,
            data: c,
          }))
          break
        }
        case 'ticket': {
          const response = await ticketService.search(term, 20)
          const tickets = response.tickets || response || []
          data = tickets.map((t: any) => ({
            id: t.id,
            title: `Boleto #${t.id}`,
            subtitle: `${t.client?.firstname || ''} ${t.client?.lastname || ''} - Asiento ${t.seat?.seat_number || 'N/A'}`,
            category: 'ticket' as CategoryId,
            data: t,
          }))
          break
        }
        case 'trip': {
          const response = await tripService.getAll({ search: term, limit: 20 })
          const trips = response.trips || response || []
          data = trips.map((t: any) => ({
            id: t.id,
            title: `${t.origin} -> ${t.destination}`,
            subtitle: `${t.date} - ${t.departure_time || ''} - Bus: ${t.bus?.plate || 'N/A'}`,
            category: 'trip' as CategoryId,
            data: t,
          }))
          break
        }
        case 'package': {
          const response = await packageService.search(term)
          const packages = response.packages || response || []
          data = packages.map((p: any) => ({
            id: p.id,
            title: `Paquete ${p.tracking_number || `#${p.id}`}`,
            subtitle: `${p.recipient_name || 'Sin destinatario'} - ${PACKAGE_STATUS_LABELS[p.status] || p.status}`,
            category: 'package' as CategoryId,
            data: p,
          }))
          break
        }
      }

      setResults(data)
      if (data.length === 0) {
        setError('No se encontraron resultados')
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'search' && selectedCategory) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        performSearch(selectedCategory, query)
      }, 300)

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }
      }
    }
  }, [query, selectedCategory, viewMode, performSearch])

  const handleCategorySelect = useCallback((categoryId: CategoryId) => {
    setSelectedCategory(categoryId)
    setViewMode('search')
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  const handleItemSelect = useCallback(async (item: SearchResult) => {
    setSelectedItem(item)
    
    if (item.category === 'client') {
      setOpen(false)
      setShowDetailModal(true)
      return
    }
    
    if (item.category === 'trip') {
      setOpen(false)
      navigate(`/trips/${item.id}`)
      return
    }
    
    if (item.category === 'ticket') {
      try {
        const tripData = await tripService.getById(item.data.trip_id)
        setSelectedTrip(tripData)
      } catch {
        setError('Error al cargar el viaje')
        return
      }
    }
    
    if (item.category === 'package') {
      try {
        const fullPackageData = await packageService.getById(item.id)
        setSelectedItem({ ...item, data: fullPackageData })
      } catch {
        setError('Error al cargar el paquete')
        return
      }
    }
    
    setOpen(false)
    setShowDetailModal(true)
  }, [navigate])

  const handleBack = useCallback(() => {
    setViewMode('category')
    setSelectedCategory(null)
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  const handleDetailClose = useCallback(() => {
    setShowDetailModal(false)
    setSelectedItem(null)
    setSelectedTrip(null)
  }, [])

  const categoryInfo = useMemo(
    () => (selectedCategory ? getCategory(selectedCategory) : null),
    [selectedCategory, getCategory]
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 hover:border-purple-300 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg transition-colors">
            <Search className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Busqueda Rapida</p>
            <p className="text-xs text-gray-500">Clientes, boletos, viajes, paquetes...</p>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-500 font-mono shadow-sm">
            <span className="text-xs">Ctrl</span>
            <span className="text-xs">K</span>
          </kbd>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Busqueda Rapida</DialogTitle>
          
          {viewMode === 'category' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Que deseas buscar?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className={`p-3 rounded-xl ${cat.bgColor} group-hover:scale-110 transition-transform`}>
                      <span className={cat.color}>{cat.icon}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'search' && (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={categoryInfo?.placeholder || 'Escribe para buscar...'}
                    className="border-0 shadow-none focus-visible:ring-0 px-0 py-0 h-auto text-sm"
                    autoFocus
                  />
                </div>
                {query && (
                  <button
                    onClick={() => {
                      setQuery('')
                      setResults([])
                      setError(null)
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-400">
                  ESC
                </kbd>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <div className={`p-1.5 rounded-lg ${categoryInfo?.bgColor}`}>
                  <span className={categoryInfo?.color}>{categoryInfo?.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Buscando en {categoryInfo?.plural}
                </span>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {!query.trim() && !isLoading && (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-500">
                      Escribe para buscar en {categoryInfo?.plural?.toLowerCase()}
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
                        <button
                          key={`${item.category}-${item.id}`}
                          onClick={() => handleItemSelect(item)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                            <span className={cat.color}>{cat.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                          </div>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600">
                            Ver
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 text-xs">Esc</kbd>
                cerrar
              </span>
            </div>
            <span className="text-gray-400">Trans Comarapa</span>
          </div>
        </DialogContent>
      </Dialog>

      <TicketModal
        show={showDetailModal && selectedItem?.category === 'ticket'}
        ticket={selectedItem?.data}
        trip={selectedTrip}
        onClose={handleDetailClose}
      />

      <PackageReceiptModal
        show={showDetailModal && selectedItem?.category === 'package'}
        packageData={selectedItem?.data}
        onClose={handleDetailClose}
      />

      <ClientViewModal
        show={showDetailModal && selectedItem?.category === 'client'}
        client={selectedItem?.data}
        onClose={handleDetailClose}
        onEdit={() => {
          handleDetailClose()
          navigate(`/clients/${selectedItem?.id}/edit`)
        }}
      />
    </>
  )
}
