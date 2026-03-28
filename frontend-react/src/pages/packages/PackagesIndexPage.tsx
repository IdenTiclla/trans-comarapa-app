import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackages, deletePackage } from '@/store/package.slice'
import { debounce } from 'lodash'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageCardList from '@/components/packages/PackageCardList'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
)

export function Component() {
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  // Store data
  const packagesState = useSelector((state: RootState) => state.package)
  const { packages, loading, error } = packagesState

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Modals
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selectedPackageForDelivery, setSelectedPackageForDelivery] = useState<any>(null)

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'registered_at_office', label: 'En oficina' },
    { value: 'assigned_to_trip', label: 'Asignada a viaje' },
    { value: 'in_transit', label: 'En tránsito' },
    { value: 'arrived_at_destination', label: 'En destino' },
    { value: 'delivered', label: 'Entregada' }
  ]

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchPackages({ limit: 100 }))
  }, [dispatch])

  // Stats
  const totalPackages = packages.length
  const pendingPackages = packages.filter(p => p.status === 'registered_at_office').length
  const inTransitPackages = packages.filter(p => p.status === 'in_transit').length
  const deliveredToday = useMemo(() => {
    const today = new Date().toDateString()
    return packages.filter(p =>
      p.status === 'delivered' &&
      new Date(p.updated_at || p.created_at).toDateString() === today
    ).length
  }, [packages])

  // Filtered data
  const filteredPackages = useMemo(() => {
    let filtered = [...packages]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(pkg =>
        (pkg.sender?.firstname && pkg.sender.firstname.toLowerCase().includes(term)) ||
        (pkg.sender?.lastname && pkg.sender.lastname.toLowerCase().includes(term)) ||
        (pkg.recipient?.firstname && pkg.recipient.firstname.toLowerCase().includes(term)) ||
        (pkg.recipient?.lastname && pkg.recipient.lastname.toLowerCase().includes(term)) ||
        (pkg.tracking_number && pkg.tracking_number.toLowerCase().includes(term)) ||
        (pkg.tracking_code && pkg.tracking_code.toLowerCase().includes(term)) ||
        (pkg.items && pkg.items.some((i: any) => i.description.toLowerCase().includes(term)))
      )
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === statusFilter)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter(pkg => new Date(pkg.created_at) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(pkg => new Date(pkg.created_at) <= toDate)
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return filtered
  }, [packages, searchTerm, statusFilter, dateFrom, dateTo])

  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredPackages.slice(start, start + itemsPerPage)
  }, [filteredPackages, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage)

  const fetchPackagesWithFilters = () => {
    dispatch(fetchPackages({ limit: 100 }))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchPackages = useCallback(
    debounce(() => {
      setCurrentPage(1)
    }, 500),
    []
  )

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    debouncedSearchPackages()
  }

  const applyFilters = () => {
    setCurrentPage(1)
  }

  // Quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-package':
        setShowRegistrationModal(true)
        break
      case 'track-package':
        document.querySelector<HTMLElement>('input[placeholder*="código"]')?.focus()
        break
      case 'pending-deliveries':
        setStatusFilter('arrived_at_destination')
        applyFilters()
        break
      case 'reports':
        navigate('/reports/packages')
        break
      default:
        console.log(`Unknown action: ${action}`)
    }
  }

  // Actions
  const handlePackageRegistered = async () => {
    dispatch(fetchPackages({ limit: 100 }))
  }

  const viewPackage = (id: number) => {
    navigate(`/packages/${id}`)
  }

  const editPackage = (id: number) => {
    navigate(`/packages/${id}/edit`)
  }

  const confirmDeletePackage = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta encomienda?')) {
      await dispatch(deletePackage(id)).unwrap()
      dispatch(fetchPackages({ limit: 100 }))
    }
  }

  const handleDeliverPackage = (id: number) => {
    const pkg = packages.find(p => p.id === id)
    if (pkg) {
      setSelectedPackageForDelivery(pkg)
      setShowDeliveryModal(true)
    }
  }

  const onDeliverPackageConfirm = async () => {
    setShowDeliveryModal(false)
    setSelectedPackageForDelivery(null)
    dispatch(fetchPackages({ limit: 100 }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Encomiendas</h1>
                <p className="text-gray-700">Administra y gestiona el seguimiento de paquetes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{loading ? '...' : totalPackages}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{loading ? '...' : pendingPackages}</div>
                  <div className="text-gray-600">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{loading ? '...' : inTransitPackages}</div>
                  <div className="text-gray-600">En tránsito</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{loading ? '...' : deliveredToday}</div>
                  <div className="text-gray-600">Entregados hoy</div>
                </div>
              </div>
              <Button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg text-white font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Encomienda
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div onClick={() => handleQuickAction('new-package')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Nueva Encomienda</h3>
                <p className="text-gray-600 text-sm truncate">Registrar paquete</p>
              </div>
            </div>
          </div>

          <div onClick={() => handleQuickAction('track-package')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Rastrear Paquete</h3>
                <p className="text-gray-600 text-sm truncate">Buscar por código</p>
              </div>
            </div>
          </div>

          <div onClick={() => handleQuickAction('pending-deliveries')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">Entregas Pendientes</h3>
                <p className="text-gray-600 text-sm truncate">Ver pendientes</p>
              </div>
            </div>
          </div>

          <div onClick={() => handleQuickAction('reports')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Reportes</h3>
                <p className="text-gray-600 text-sm truncate">Estadísticas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <FormInput
                    id="search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar por remitente, destinatario, código..."
                  />
                  <SearchIcon className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <FormSelect
                  id="status-filter"
                  value={statusFilter}
                  onChange={(val) => { setStatusFilter(val); applyFilters() }}
                  options={statusOptions}
                />
              </div>
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
                <FormInput
                  type="date"
                  id="date-from"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); applyFilters() }}
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
                <FormInput
                  type="date"
                  id="date-to"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); applyFilters() }}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">Error al cargar encomiendas</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                  <button onClick={fetchPackagesWithFilters} className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                    Intentar nuevamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Lista de Encomiendas</h2>
              {!loading && filteredPackages.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">{filteredPackages.length} encomiendas encontradas</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                    'p-2 rounded-md transition-colors duration-200'
                  )}
                  aria-label="Vista en cuadrícula"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900',
                    'p-2 rounded-md transition-colors duration-200'
                  )}
                  aria-label="Vista en tabla"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <PackageCardList
            packages={paginatedPackages}
            isLoading={loading}
            viewMode={viewMode}
            onViewPackage={viewPackage}
            onEditPackage={editPackage}
            onDeletePackage={confirmDeletePackage}
            onDeliverPackage={handleDeliverPackage}
          />
        </div>

        {!loading && filteredPackages.length > itemsPerPage && (
          <div className="mb-6">
            <div className="bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredPackages.length)} de {filteredPackages.length} resultados
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PackageRegistrationModal
        show={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onPackageRegistered={handlePackageRegistered}
      />

      <PackageDeliveryModal
        show={showDeliveryModal}
        packageData={selectedPackageForDelivery}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={onDeliverPackageConfirm}
      />
    </div>
  )
}
