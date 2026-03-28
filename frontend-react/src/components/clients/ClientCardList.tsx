import { useMemo } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ClientCard from './ClientCard'

interface ClientCardListProps {
    clients?: any[]
    loading?: boolean
    currentPage?: number
    totalItems?: number
    itemsPerPage?: number
    viewMode?: 'grid' | 'table'
    onPageChange: (page: number) => void
    onViewClient: (client: any) => void
    onEditClient: (client: any) => void
    onDeleteClient: (client: any) => void
    onClearFilters: () => void
    onNewClient: () => void
}

export default function ClientCardList({
    clients = [],
    loading = false,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 12,
    viewMode = 'grid',
    onPageChange,
    onViewClient,
    onEditClient,
    onDeleteClient,
    onClearFilters,
    onNewClient
}: ClientCardListProps) {

    const totalPages = useMemo(() => {
        if (totalItems === 0 || itemsPerPage === 0) return 1
        return Math.ceil(totalItems / itemsPerPage)
    }, [totalItems, itemsPerPage])

    const startItem = useMemo(() => {
        if (totalItems === 0) return 0
        return (currentPage - 1) * itemsPerPage + 1
    }, [totalItems, currentPage, itemsPerPage])

    const endItem = useMemo(() => {
        return Math.min(currentPage * itemsPerPage, totalItems)
    }, [currentPage, itemsPerPage, totalItems])

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return clients.slice(start, start + itemsPerPage)
    }, [clients, currentPage, itemsPerPage])

    const displayedPages = useMemo(() => {
        const pages: (number | string)[] = []
        const maxDisplayed = 5
        if (totalPages <= maxDisplayed + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            let start = Math.max(2, currentPage - Math.floor((maxDisplayed - 2) / 2))
            const end = Math.min(totalPages - 1, start + maxDisplayed - 3)
            if (end === totalPages - 1 && (end - start + 1) < (maxDisplayed - 2)) {
                start = Math.max(2, end - (maxDisplayed - 3))
            }
            if (start > 2) pages.push('...')
            for (let i = start; i <= end; i++) pages.push(i)
            if (end < totalPages - 1) pages.push('...')
            if (totalPages > 1) pages.push(totalPages)
        }
        return pages
    }, [totalPages, currentPage])

    const getInitials = (name?: string) => {
        if (!name) return 'CL'
        const parts = name.split(' ')
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.slice(0, 2).toUpperCase()
    }

    const getStatusText = (client: any) => client.status === 'active' ? 'Activo' : 'Inactivo'
    const getStatusClass = (client: any) => client.status === 'active'
        ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
        : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'

    return (
        <div className="w-full">
            {loading ? (
                <div className="space-y-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                                        <div className="flex space-x-2 mt-4">
                                            <div className="h-8 bg-gray-200 rounded w-16" />
                                            <div className="h-8 bg-gray-200 rounded w-16" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1 grid grid-cols-4 gap-4">
                                            <div className="h-4 bg-gray-200 rounded" />
                                            <div className="h-4 bg-gray-200 rounded" />
                                            <div className="h-4 bg-gray-200 rounded" />
                                            <div className="h-4 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : !clients || clients.length === 0 ? (
                <EmptyState
                    title="No se encontraron clientes"
                    description="No hay clientes que coincidan con los filtros seleccionados."
                    action={
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button onClick={onClearFilters} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Limpiar filtros
                            </button>
                            <button onClick={onNewClient} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Crear nuevo cliente
                            </button>
                        </div>
                    }
                />
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedClients.map(client => (
                                <ClientCard
                                    key={client.id}
                                    client={client}
                                    onView={onViewClient}
                                    onEdit={onEditClient}
                                    onDelete={onDeleteClient}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedClients.map(client => (
                                            <tr key={client.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {getInitials(client.name || client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim())}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {client.name || client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim()}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {client.is_minor ? '👶 Menor de edad' : '👤 Adulto'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.ci || client.document_id || 'Sin CI'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.phone || 'Sin teléfono'}</div>
                                                    <div className="text-sm text-gray-500">{client.email || 'Sin email'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{client.city || 'Sin ciudad'}</div>
                                                    <div className="text-sm text-gray-500">{client.state || 'Sin estado'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getStatusClass(client)}>
                                                        {getStatusText(client)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button onClick={() => onViewClient(client)} className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-colors duration-150">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button onClick={() => onEditClient(client)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => onDeleteClient(client)} className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-colors duration-150">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {totalItems > itemsPerPage && (
                        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{startItem}-{endItem}</span> de <span className="font-medium">{totalItems}</span> clientes
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {displayedPages.map((page, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => typeof page === 'number' && page !== currentPage ? onPageChange(page) : null}
                                                disabled={typeof page !== 'number'}
                                                className={`relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 min-w-[2.5rem] justify-center ${typeof page !== 'number' ? 'cursor-default bg-transparent text-gray-500 border-transparent' :
                                                    page === currentPage ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                    <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M6 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
