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

export function Component() {
    const dispatch = useAppDispatch()
    const clients = useAppSelector(selectClients)
    const isLoading = useAppSelector(selectClientLoading)
    const error = useAppSelector(selectClientError)

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(12)
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

    const [filters, setFilters] = useState<Record<string, any>>({ status: 'active' })
    const [sorting, setSorting] = useState({ column: 'created_at', direction: 'desc' })

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState<any>(null)

    const loadClients = () => {
        dispatch(fetchClients({ filters: { ...filters, sort_by: sorting.column, sort_order: sorting.direction } }))
    }

    useEffect(() => {
        loadClients()
    }, [dispatch, filters, sorting])

    // Derived Stats
    const totalClients = clients.length
    const activeClients = clients.filter((c: any) => c.status === 'active').length
    const newClientsToday = clients.filter((c: any) => {
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

    const handleFilterChange = (newFilters: any) => {
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

    const viewClient = (client: any) => {
        setSelectedClient(client)
        setShowViewModal(true)
    }

    const editClient = (client: any) => {
        setSelectedClient(client)
        setShowEditModal(true)
    }

    const handleDeleteClient = async (client: any) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${client.name || client.first_name || 'este cliente'}?`)) {
            try {
                await dispatch(deleteClient(client.id)).unwrap()
                toast.success('Cliente eliminado correctamente')
                loadClients()
            } catch (err: any) {
                toast.error(err || 'Error al eliminar cliente')
            }
        }
    }

    const closeModal = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedClient(null)
    }

    const handleSave = async (clientData: any) => {
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
        } catch (err: any) {
            toast.error(err || 'Error al guardar cliente')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full relative z-0">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 w-full relative z-10">
                <div className="w-full px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
                                <p className="text-gray-700">Administra y gestiona la información de tus clientes</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center space-x-6 text-sm">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{totalClients}</div>
                                    <div className="text-gray-600">Total</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">{activeClients}</div>
                                    <div className="text-gray-600">Activos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-purple-600">{newClientsToday}</div>
                                    <div className="text-gray-600">Nuevos hoy</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Nuevo Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 lg:px-6 py-6 overflow-x-hidden relative z-0">
                {/* Quick Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div onClick={() => handleQuickAction('new-client')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">Nuevo Cliente</h3>
                                <p className="text-gray-600 text-sm truncate">Registrar cliente</p>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => handleQuickAction('search-client')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-green-100 group-hover:bg-green-200 rounded-xl transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">Buscar Cliente</h3>
                                <p className="text-gray-600 text-sm truncate">Localizar información</p>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => handleQuickAction('export-clients')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors truncate">Exportar</h3>
                                <p className="text-gray-600 text-sm truncate">Descargar datos</p>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => handleQuickAction('reports')} className="group bg-white rounded-2xl p-4 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300 transform hover:-translate-y-1">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 lg:h-6 lg:w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">Reportes</h3>
                                <p className="text-gray-600 text-sm truncate">Análisis de clientes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <ClientFilters
                    initialFilters={filters}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                />

                {/* Error State */}
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
                                    <h3 className="text-lg font-semibold text-red-800">Error al cargar clientes</h3>
                                    <p className="text-red-700 mt-1">{error}</p>
                                    <button onClick={loadClients} className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                                        Intentar nuevamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Client List */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-bold text-gray-900">Lista de Clientes</h2>
                            {!isLoading && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                    <span className="font-medium">{clients.length} clientes encontrados</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 relative z-0">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`} aria-label="Vista en cuadrícula">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </button>
                                <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors duration-200 ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`} aria-label="Vista en tabla">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                </button>
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
            </div>

            {/* Modals */}
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
