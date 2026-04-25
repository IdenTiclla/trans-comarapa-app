import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    selectClients,
    selectClientLoading,
    selectClientError
} from '@/store/client.slice'
import { toast } from 'sonner'
import ClientFilters from '@/components/clients/ClientFilters'
import ClientCardList from '@/components/clients/ClientCardList'
import ClientModal from '@/components/clients/ClientModal'
import ClientViewModal from '@/components/clients/ClientViewModal'
import { Card, CardContent } from '@/components/ui/card'
import { ClickableCard } from '@/components/ui/clickable-card'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Users, Plus, Search, Download, BarChart3, LayoutGrid, List } from 'lucide-react'

interface Client {
    id: number
    name?: string
    first_name?: string
    firstname?: string
    lastname?: string
    status?: string
    created_at?: string
    [k: string]: unknown
}

export function Component() {
    const dispatch = useAppDispatch()
    const clients = useAppSelector(selectClients)
    const isLoading = useAppSelector(selectClientLoading)
    const error = useAppSelector(selectClientError)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

    const [filters, setFilters] = useState<Record<string, unknown>>({ status: 'active' })
    const [sorting, setSorting] = useState({ column: 'created_at', direction: 'desc' })

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

    const loadClients = () => {
        dispatch(fetchClients({ filters: { ...filters, sort_by: sorting.column, sort_order: sorting.direction } }))
    }

    useEffect(() => {
        loadClients()
    }, [dispatch, filters, sorting])

    const totalClients = clients.length
    const activeClients = clients.filter((c: Client) => c.status === 'active').length
    const newClientsToday = clients.filter((c: Client) => {
        const today = new Date().toDateString()
        return c.created_at && new Date(c.created_at).toDateString() === today
    }).length

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'new-client':
                setShowCreateModal(true)
                break
            case 'search-client': {
                const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
                if (searchInput) searchInput.focus()
                break
            }
            case 'export-clients':
                toast.info('La exportación de clientes estará disponible pronto.')
                break
            case 'reports':
                toast.info('Los reportes de clientes estarán disponibles pronto.')
                break
        }
    }

    const handleFilterChange = (newFilters: Record<string, unknown>) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleSortChange = (newSort: { column: string; direction: string }) => {
        setSorting(newSort)
        setCurrentPage(1)
    }

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage)
    }

    const viewClient = (client: Client) => {
        setSelectedClient(client)
        setShowViewModal(true)
    }

    const editClient = (client: Client) => {
        setSelectedClient(client)
        setShowEditModal(true)
    }

    const handleDeleteClient = async (client: Client) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${client.name || client.first_name || 'este cliente'}?`)) {
            try {
                await dispatch(deleteClient(client.id)).unwrap()
                toast.success('Cliente eliminado correctamente')
                loadClients()
            } catch (err) {
                toast.error(typeof err === 'string' ? err : 'Error al eliminar cliente')
            }
        }
    }

    const closeModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedClient(null)
    }

    const handleSave = async (clientData: Partial<Client>) => {
        try {
            if (showEditModal && selectedClient) {
                await dispatch(updateClient({ id: selectedClient.id, data: clientData })).unwrap()
                toast.success('Cliente actualizado correctamente')
            } else {
                await dispatch(createClient(clientData)).unwrap()
                toast.success('Cliente creado correctamente')
            }
            closeModal()
            loadClients()
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Error al guardar cliente')
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="hidden md:flex items-center space-x-6 text-sm">
                    <div className="text-center">
                        <div className="text-lg font-bold text-primary">{totalClients}</div>
                        <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{activeClients}</div>
                        <div className="text-muted-foreground">Activos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{newClientsToday}</div>
                        <div className="text-muted-foreground">Nuevos hoy</div>
                    </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ClickableCard
                    ariaLabel="Nuevo cliente: registrar cliente"
                    onClick={() => handleQuickAction('new-client')}
                    className="py-0 hover:border-primary/30"
                >
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl flex-shrink-0">
                                <Users className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-foreground truncate">Nuevo Cliente</h3>
                                <p className="text-muted-foreground text-sm truncate">Registrar cliente</p>
                            </div>
                        </div>
                    </div>
                </ClickableCard>

                <ClickableCard
                    ariaLabel="Buscar cliente"
                    onClick={() => handleQuickAction('search-client')}
                    className="py-0 hover:border-green-300"
                >
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-xl flex-shrink-0">
                                <Search className="h-5 w-5 lg:h-6 lg:w-6 text-green-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-foreground truncate">Buscar Cliente</h3>
                                <p className="text-muted-foreground text-sm truncate">Localizar información</p>
                            </div>
                        </div>
                    </div>
                </ClickableCard>

                <ClickableCard
                    ariaLabel="Exportar clientes"
                    onClick={() => handleQuickAction('export-clients')}
                    className="py-0 hover:border-purple-300"
                >
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex-shrink-0">
                                <Download className="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-foreground truncate">Exportar</h3>
                                <p className="text-muted-foreground text-sm truncate">Descargar datos</p>
                            </div>
                        </div>
                    </div>
                </ClickableCard>

                <ClickableCard
                    ariaLabel="Reportes de clientes"
                    onClick={() => handleQuickAction('reports')}
                    className="py-0 hover:border-orange-300"
                >
                    <div className="p-4 lg:p-6">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-xl flex-shrink-0">
                                <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-foreground truncate">Reportes</h3>
                                <p className="text-muted-foreground text-sm truncate">Análisis de clientes</p>
                            </div>
                        </div>
                    </div>
                </ClickableCard>
            </div>

            <ClientFilters
                initialFilters={filters}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
            />

            {error && (
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600 text-sm font-bold">!</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-red-800">Error al cargar clientes</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                                <Button variant="outline" size="sm" onClick={loadClients} className="mt-3 border-red-300 text-red-800 hover:bg-red-50">
                                    Intentar nuevamente
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold text-foreground">Lista de Clientes</h2>
                        {!isLoading && (
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                <span className="font-medium">{clients.length} clientes encontrados</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex bg-muted/50 rounded-lg p-1">
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
                </div>

                <ClientCardList
                    clients={clients}
                    loading={isLoading}
                    currentPage={currentPage}
                    totalItems={clients.length}
                    itemsPerPage={itemsPerPage}
                    viewMode={viewMode}
                    onPageChange={handlePageChange}
                    onViewClient={viewClient}
                    onEditClient={editClient}
                    onDeleteClient={handleDeleteClient}
                    onClearFilters={() => handleFilterChange({})}
                    onNewClient={() => setShowCreateModal(true)}
                />
            </div>

            {(showCreateModal || showEditModal) && (
                <ClientModal
                    show={showCreateModal || showEditModal}
                    client={selectedClient}
                    isEditing={showEditModal}
                    onClose={closeModal}
                    onSave={handleSave}
                />
            )}

            {showViewModal && (
                <ClientViewModal
                    show={showViewModal}
                    client={selectedClient}
                    onClose={() => setShowViewModal(false)}
                    onEdit={editClient}
                />
            )}
        </div>
    )
}
