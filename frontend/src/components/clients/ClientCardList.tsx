import { useMemo } from 'react'
import EmptyState from '@/components/common/EmptyState'
import ClientCard from './ClientCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { RefreshCw, Plus, Eye, Pencil, Trash2 } from 'lucide-react'

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

    const totalPages = totalItems > 0 && itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return clients.slice(start, start + itemsPerPage)
    }, [clients, currentPage, itemsPerPage])

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
                <div role="status" aria-busy="true" className="space-y-6">
                    <span className="sr-only">Cargando clientes...</span>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-hidden="true">
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
                        <div className="space-y-4" aria-hidden="true">
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
                                    <caption className="sr-only">Lista de clientes</caption>
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Documento</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contacto</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubicación</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
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
                                                                {client.is_minor ? <><span aria-hidden="true">👶</span> Menor de edad</> : <><span aria-hidden="true">👤</span> Adulto</>}
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
                                                        <Button variant="ghost" size="sm" onClick={() => onViewClient(client)} aria-label={`Ver cliente ${client.full_name ?? ''}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => onEditClient(client)} aria-label={`Editar cliente ${client.full_name ?? ''}`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => onDeleteClient(client)} className="text-destructive hover:text-destructive" aria-label={`Eliminar cliente ${client.full_name ?? ''}`}>
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
                        <Pagination
                            variant="full"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            startItem={startItem}
                            endItem={endItem}
                            onPageChange={onPageChange}
                            className="mt-8 rounded-lg border"
                        />
                    )}
                </>
            )}
        </div>
    )
}
