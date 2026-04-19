/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { fetchPackages, deletePackage } from '@/store/package.slice'
import { debounce } from 'lodash'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageCardList from '@/components/packages/PackageCardList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Plus, LayoutGrid, List, AlertCircle } from 'lucide-react'
import { StatCards } from './packages-index/StatCards'
import { QuickActions } from './packages-index/QuickActions'
import { PackageFilters } from './packages-index/PackageFilters'
import { Pagination } from './packages-index/Pagination'
import { filterPackages, computeStats } from './packages-index/helpers'

const ITEMS_PER_PAGE = 12

export function Component() {
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()

  const { packages, loading, error } = useSelector((state: RootState) => state.package)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [selectedPackageForDelivery, setSelectedPackageForDelivery] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchPackages({ limit: 100 }))
  }, [dispatch])

  const stats = useMemo(() => computeStats(packages), [packages])

  const filteredPackages = useMemo(
    () => filterPackages(packages, { searchTerm, statusFilter, dateFrom, dateTo }),
    [packages, searchTerm, statusFilter, dateFrom, dateTo],
  )

  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPackages.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPackages, currentPage])

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)

  const debouncedResetPage = useMemo(
    () => debounce(() => setCurrentPage(1), 500),
    [],
  )

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    debouncedResetPage()
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
        setCurrentPage(1)
        break
      case 'reports':
        navigate('/reports/packages')
        break
    }
  }

  const handlePackageRegistered = () => {
    dispatch(fetchPackages({ limit: 100 }))
  }

  const confirmDeletePackage = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta encomienda?')) {
      await dispatch(deletePackage(id)).unwrap()
      dispatch(fetchPackages({ limit: 100 }))
    }
  }

  const handleDeliverPackage = (id: number) => {
    const pkg = packages.find((p) => p.id === id)
    if (pkg) {
      setSelectedPackageForDelivery(pkg)
      setShowDeliveryModal(true)
    }
  }

  const onDeliverPackageConfirm = () => {
    setShowDeliveryModal(false)
    setSelectedPackageForDelivery(null)
    dispatch(fetchPackages({ limit: 100 }))
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setShowRegistrationModal(true)} aria-label="Crear nueva encomienda">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Encomienda
        </Button>
      </div>

      <StatCards loading={loading} {...stats} />
      <QuickActions onAction={handleQuickAction} />

      <PackageFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={handleSearchChange}
        onStatusChange={(val) => { setStatusFilter(val); setCurrentPage(1) }}
        onDateFromChange={(val) => { setDateFrom(val); setCurrentPage(1) }}
        onDateToChange={(val) => { setDateTo(val); setCurrentPage(1) }}
      />

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error al cargar encomiendas</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchPackages({ limit: 100 }))}
                className="mt-2 border-red-300 text-red-700 hover:bg-red-50"
              >
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
          <ViewToggle
            value={viewMode}
            onChange={(val) => setViewMode(val as 'grid' | 'table')}
            options={[
              { value: 'grid', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista en cuadrícula' },
              { value: 'table', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista en tabla' },
            ]}
          />
        </div>

        <PackageCardList
          packages={paginatedPackages}
          isLoading={loading}
          viewMode={viewMode}
          onViewPackage={(id) => navigate(`/packages/${id}`)}
          onEditPackage={(id) => navigate(`/packages/${id}/edit`)}
          onDeletePackage={confirmDeletePackage}
          onDeliverPackage={handleDeliverPackage}
        />
      </div>

      {!loading && filteredPackages.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          total={filteredPackages.length}
          onPageChange={setCurrentPage}
        />
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
