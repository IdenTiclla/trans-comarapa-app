import { useState, useMemo, useEffect } from 'react'

interface Filters {
    search?: string
    city?: string
    is_minor?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    sortBy?: string
    sortDirection?: string
}

interface ClientFiltersProps {
    initialFilters?: Filters
    onFilterChange: (filters: Filters) => void
    onSortChange: (sort: { column: string; direction: string }) => void
}

const CITIES = [
    'Santa Cruz', 'Comarapa', 'Cochabamba', 'La Paz', 'Sucre',
    'Tarija', 'Oruro', 'Potosí', 'Trinidad', 'Cobija'
]

export default function ClientFilters({ initialFilters = {}, onFilterChange, onSortChange }: ClientFiltersProps) {
    const [filters, setFilters] = useState<Filters>({
        search: initialFilters.search || '',
        city: initialFilters.city || '',
        is_minor: initialFilters.is_minor || '',
        status: initialFilters.status || 'active',
        dateFrom: initialFilters.dateFrom || '',
        dateTo: initialFilters.dateTo || ''
    })

    const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'created_at')
    const [sortDirection, setSortDirection] = useState(initialFilters.sortDirection || 'desc')

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [autoApply, setAutoApply] = useState(true)

    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (filters.search) count++
        if (filters.city) count++
        if (filters.is_minor !== '') count++
        if (filters.status !== 'active') count++
        if (filters.dateFrom || filters.dateTo) count++
        return count
    }, [filters])

    const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo)

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        try {
            return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
        } catch { return '' }
    }

    const formatDateFilter = useMemo(() => {
        if (filters.dateFrom && filters.dateTo) return `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`
        if (filters.dateFrom) return `Desde ${formatDate(filters.dateFrom)}`
        if (filters.dateTo) return `Hasta ${formatDate(filters.dateTo)}`
        return ''
    }, [filters.dateFrom, filters.dateTo])

    const getStatusText = (status?: string) => {
        if (status === 'active') return 'Activos'
        if (status === 'all') return 'Todos'
        if (status === 'inactive') return 'Inactivos'
        return 'Desconocido'
    }

    const applyFilters = () => {
        const filtersToSend = { ...filters }
        Object.keys(filtersToSend).forEach((key) => {
            if (key !== 'is_minor' && !filtersToSend[key as keyof Filters]) {
                delete filtersToSend[key as keyof Filters]
            }
        })
        onFilterChange(filtersToSend)
    }

    const handleFilterChange = (key: keyof Filters, value: any) => {
        setFilters(prev => {
            const updated = { ...prev, [key]: value }
            if (autoApply) {
                setTimeout(() => {
                    const toSend = { ...updated }
                    Object.keys(toSend).forEach((k) => {
                        if (k !== 'is_minor' && !toSend[k as keyof Filters]) delete toSend[k as keyof Filters]
                    })
                    onFilterChange(toSend)
                }, 0)
            }
            return updated
        })
    }

    const handleSearchInput = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }))
        if (autoApply) {
            const timer = setTimeout(() => {
                applyFilters()
            }, 300)
            return () => clearTimeout(timer)
        }
    }

    // Custom search effect for auto-apply
    useEffect(() => {
        if (!autoApply) return
        const timer = setTimeout(() => {
            applyFilters()
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search])

    const handleSortChange = (col: string, dir: string) => {
        setSortBy(col)
        setSortDirection(dir)
        onSortChange({ column: col, direction: dir })
    }

    const clearFilter = (key: keyof Filters) => {
        handleFilterChange(key, key === 'status' ? 'active' : '')
    }

    const clearDateFilters = () => {
        setFilters(prev => {
            const updated = { ...prev, dateFrom: '', dateTo: '' }
            if (autoApply) {
                setTimeout(() => {
                    const toSend = { ...updated }
                    Object.keys(toSend).forEach((k) => {
                        if (k !== 'is_minor' && !toSend[k as keyof Filters]) delete toSend[k as keyof Filters]
                    })
                    onFilterChange(toSend)
                }, 0)
            }
            return updated
        })
    }

    const resetFilters = () => {
        setFilters({ search: '', city: '', is_minor: '', status: 'active', dateFrom: '', dateTo: '' })
        setSortBy('created_at')
        setSortDirection('desc')
        onFilterChange({ status: 'active' })
        onSortChange({ column: 'created_at', direction: 'desc' })
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
                <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
                    {activeFiltersCount > 0 && (
                        <div className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full shadow-sm">
                            {activeFiltersCount} activo{activeFiltersCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
                <div className="flex items-center flex-wrap gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setAutoApply(!autoApply)}>
                        <input
                            type="checkbox"
                            checked={autoApply}
                            onChange={(e) => setAutoApply(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">Aplicar automáticamente</label>
                    </div>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
                    >
                        {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
                        <svg className={`h-4 w-4 ml-1 transition-transform duration-200 ${showAdvancedFilters ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mb-5">
                <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        placeholder="Buscar cliente por nombre, CI o teléfono..."
                        className="pl-12 py-3 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:bg-white transition-colors duration-200"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <div className="relative">
                        <select
                            value={filters.city}
                            onChange={(e) => handleFilterChange('city', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors focus:bg-white"
                        >
                            <option value="">Todas</option>
                            {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                        {filters.city && (
                            <button onClick={() => clearFilter('city')} className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente</label>
                    <div className="relative">
                        <select
                            value={filters.is_minor}
                            onChange={(e) => handleFilterChange('is_minor', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors focus:bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="false">Adultos</option>
                            <option value="true">Menores de edad</option>
                        </select>
                        {filters.is_minor !== '' && (
                            <button onClick={() => clearFilter('is_minor')} className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <div className="relative">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-8 py-2.5 transition-colors focus:bg-white"
                        >
                            <option value="active">Activos</option>
                            <option value="all">Todos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                        {filters.status !== 'active' && (
                            <button onClick={() => clearFilter('status')} className="absolute inset-y-0 right-8 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="border-t border-gray-200 pt-5 mt-5">
                    <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        Filtros avanzados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de registro</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Desde</label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Hasta</label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value, sortDirection)}
                                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 focus:bg-white"
                                >
                                    <option value="created_at">Fecha de registro</option>
                                    <option value="name">Nombre</option>
                                    <option value="document_id">Documento</option>
                                    <option value="city">Ciudad</option>
                                </select>
                                <select
                                    value={sortDirection}
                                    onChange={(e) => handleSortChange(sortBy, e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 focus:bg-white"
                                >
                                    <option value="desc">Descendente</option>
                                    <option value="asc">Ascendente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center w-full sm:w-auto">
                    {activeFiltersCount > 0 && (
                        <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-1">
                            {filters.city && (
                                <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100">
                                    Ciudad: {filters.city}
                                    <button onClick={() => clearFilter('city')} className="ml-1 text-blue-500 hover:text-blue-700"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            )}
                            {filters.is_minor !== '' && (
                                <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100">
                                    Tipo: {filters.is_minor === 'true' ? 'Menores' : 'Adultos'}
                                    <button onClick={() => clearFilter('is_minor')} className="ml-1 text-blue-500 hover:text-blue-700"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            )}
                            {filters.status !== 'active' && (
                                <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100">
                                    Estado: {getStatusText(filters.status)}
                                    <button onClick={() => clearFilter('status')} className="ml-1 text-blue-500 hover:text-blue-700"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            )}
                            {hasDateFilter && (
                                <div className="bg-blue-50 text-blue-700 text-xs rounded-full px-3 py-1.5 flex items-center shadow-sm border border-blue-100">
                                    Fecha: {formatDateFilter}
                                    <button onClick={clearDateFilters} className="ml-1 text-blue-500 hover:text-blue-700"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex space-x-3 w-full sm:w-auto justify-end">
                    <button onClick={resetFilters} className="inline-flex justify-center items-center py-2.5 px-5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Limpiar filtros
                    </button>
                    {!autoApply && (
                        <button onClick={applyFilters} className="inline-flex justify-center items-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Aplicar filtros
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
