import { useMemo } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ClientCard from './ClientCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface Client {
    id: number
    name?: string
    first_name?: string
    firstname?: string
    lastname?: string
    status?: string
    [k: string]: unknown
}

interface ClientCardListProps {
    clients?: Client[]
    loading?: boolean
    currentPage?: number
    totalItems?: number
    itemsPerPage?: number
    viewMode?: 'grid' | 'table'
    onPageChange: (page: number) => void
    onViewClient: (client: Client) => void
    onEditClient: (client: Client) => void
    onDeleteClient: (client: Client) => void
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

    const getStatusText = (client: Client) => client.status === 'active' ? 'Activo' : 'Inactivo'
    const getStatusClass = (client: Client) => client.status === 'active'
        ? 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
        : 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'

    return (
        <div className="w-full">
            {loading ? (
                <div className="space-y-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-muted rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-muted rounded w-1/2" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-3 bg-muted rounded w-full" />
                                            <div className="h-3 bg-muted rounded w-2/3" />
                                            <div className="flex space-x-2 mt-4">
                                                <div className="h-8 bg-muted rounded w-16" />
                                                <div className="h-8 bg-muted rounded w-16" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-muted rounded-full" />
                                            <div className="flex-1 grid grid-cols-4 gap-4">
                                                <div className="h-4 bg-muted rounded" />
                                                <div className="h-4 bg-muted rounded" />
                                                <div className="h-4 bg-muted rounded" />
                                                <div className="h-4 bg-muted rounded" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                            <Button variant="outline" onClick={onClearFilters}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Limpiar filtros
                            </Button>
                            <Button onClick={onNewClient}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear nuevo cliente
                            </Button>
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
                        <Card>
                            <div className="overflow-x-auto">
                                {/* eslint-disable-next-line no-restricted-syntax */}
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Documento</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubicación</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedClients.map(client => (
                                            <tr key={client.id} className="hover:bg-muted/50 transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                                                {getInitials(client.name || client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim())}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-foreground">
                                                                {client.name || client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim()}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {client.is_minor ? '👶 Menor de edad' : '👤 Adulto'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-foreground">{client.ci || client.document_id || 'Sin CI'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-foreground">{client.phone || 'Sin teléfono'}</div>
                                                    <div className="text-sm text-muted-foreground">{client.email || 'Sin email'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-foreground">{client.city || 'Sin ciudad'}</div>
                                                    <div className="text-sm text-muted-foreground">{client.state || 'Sin estado'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={getStatusClass(client)}>
                                                        {getStatusText(client)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <Button variant="ghost" size="sm" onClick={() => onViewClient(client)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => onEditClient(client)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => onDeleteClient(client)} className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {totalItems > itemsPerPage && (
                        <Card className="mt-8">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{startItem}-{endItem}</span> de <span className="font-medium text-foreground">{totalItems}</span> clientes
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {displayedPages.map((page, idx) => (
                                                <Button
                                                    key={idx}
                                                    variant={page === currentPage ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => typeof page === 'number' && page !== currentPage ? onPageChange(page) : null}
                                                    disabled={typeof page !== 'number'}
                                                    className="min-w-[2.5rem]"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
