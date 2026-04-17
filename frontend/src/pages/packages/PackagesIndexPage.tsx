import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackages, deletePackage } from '@/store/package.slice'
import { debounce } from 'lodash'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageCardList from '@/components/packages/PackageCardList'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Package, Search, Clock, BarChart3, Plus, LayoutGrid, List, AlertCircle } from 'lucide-react'

export function Component() {
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  const packagesState = useSelector((state: RootState) => state.package)
  const { packages, loading, error } = packagesState

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

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

  useEffect(() => {
    dispatch(fetchPackages({ limit: 100 }))
  }, [dispatch])

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
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowRegistrationModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Encomienda
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : totalPackages}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : pendingPackages}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : inTransitPackages}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">En tránsito</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loading ? '...' : deliveredToday}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Entregados hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleQuickAction('new-package')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Nueva Encomienda</p>
              <p className="text-xs text-muted-foreground">Registrar paquete</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleQuickAction('track-package')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Rastrear Paquete</p>
              <p className="text-xs text-muted-foreground">Buscar por código</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleQuickAction('pending-deliveries')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Entregas Pendientes</p>
              <p className="text-xs text-muted-foreground">Ver pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => handleQuickAction('reports')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Reportes</p>
              <p className="text-xs text-muted-foreground">Estadísticas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormInput
              label="Buscar"
              id="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Remitente, destinatario, código..."
              leftIcon={<Search className="w-4 h-4" />}
            />
            <FormSelect
              label="Estado"
              id="status-filter"
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); applyFilters() }}
              options={statusOptions}
            />
            <FormDatePicker
              label="Fecha desde"
              id="date-from"
              value={dateFrom}
              onChange={(date) => { setDateFrom(date ? date.toISOString().split('T')[0] : ''); applyFilters() }}
            />
            <FormDatePicker
              label="Fecha hasta"
              id="date-to"
              value={dateTo}
              onChange={(date) => { setDateTo(date ? date.toISOString().split('T')[0] : ''); applyFilters() }}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error al cargar encomiendas</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchPackagesWithFilters} className="mt-2 border-red-300 text-red-700 hover:bg-red-50">
                Intentar nuevamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Lista de Encomiendas</h2>
            {!loading && filteredPackages.length > 0 && (
              <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {filteredPackages.length} encomiendas encontradas
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ViewToggle
                value={viewMode}
                onChange={(val) => setViewMode(val as 'grid' | 'table')}
                options={[
                    { value: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista en cuadrícula' },
                    { value: 'table', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista en tabla' }
                ]}
            />
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
        <Card>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredPackages.length)} de {filteredPackages.length} resultados
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
