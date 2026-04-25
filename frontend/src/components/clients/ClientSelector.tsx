import { useState, useEffect } from 'react'
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { useClientSearch, type ClientRecord } from '@/hooks/use-client-search'

interface ClientDetails {
    name: string
    phone: string
    address: string
    doc_id: string
}

interface ClientSelectorProps {
    role: string // e.g., 'sender' or 'receiver'
    selectedClientId?: number | string | null
    clientDetails?: ClientDetails
    onSelectedClientIdChange: (id: number | string | null) => void
    onClientDetailsChange: (details: ClientDetails) => void
}

export default function ClientSelector({
    role,
    selectedClientId,
    clientDetails,
    onSelectedClientIdChange,
    onClientDetailsChange
}: ClientSelectorProps) {
    const [clientType, setClientType] = useState<'existing' | 'new'>(selectedClientId ? 'existing' : (clientDetails?.name ? 'new' : 'existing'))

    const { searchTerm, results, isLoading, error, searchClients, clearSearch } = useClientSearch('')
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)

    const [newClient, setNewClient] = useState<ClientDetails>({
        name: clientDetails?.name || '',
        phone: clientDetails?.phone || '',
        address: clientDetails?.address || '',
        doc_id: clientDetails?.doc_id || '',
    })

    // Watch for external selectedClientId changes
    useEffect(() => {
        if (selectedClientId && !selectedClient) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setClientType('existing')
            // Parent might pass ID, but we ideally need full info; if only ID is known, we might fetch it or let parent handle
        } else if (clientDetails && clientDetails.name && !selectedClientId) {
            setClientType('new')
            setNewClient({
                name: clientDetails.name,
                phone: clientDetails.phone || '',
                address: clientDetails.address || '',
                doc_id: clientDetails.doc_id || ''
            })
        }
    }, [selectedClientId, clientDetails])

    // Broadcast new client changes
    useEffect(() => {
        if (clientType === 'new') {
            onClientDetailsChange(newClient)
        }
    }, [newClient, clientType, onClientDetailsChange])

    const handleTypeChange = (type: 'existing' | 'new') => {
        setClientType(type)
        if (type === 'new') {
            onSelectedClientIdChange(null)
            setSelectedClient(null)
        } else {
            onClientDetailsChange({ name: '', phone: '', address: '', doc_id: '' })
        }
    }

    const selectClient = (client: ClientRecord) => {
        setSelectedClient(client)
        searchClients(client.full_name || client.name || '')
        onSelectedClientIdChange(client.id)
        clearSearch()
    }

    const clearSelection = () => {
        setSelectedClient(null)
        clearSearch()
        onSelectedClientIdChange(null)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-4 mb-2">
                <label htmlFor={`${role}-client-type-existing`} className="flex items-center cursor-pointer">
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <input
                        type="radio"
                        id={`${role}-client-type-existing`}
                        name={`${role}-client-type`}
                        value="existing"
                        checked={clientType === 'existing'}
                        onChange={() => handleTypeChange('existing')}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cliente Existente</span>
                </label>
                <label htmlFor={`${role}-client-type-new`} className="flex items-center cursor-pointer">
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <input
                        type="radio"
                        id={`${role}-client-type-new`}
                        name={`${role}-client-type`}
                        value="new"
                        checked={clientType === 'new'}
                        onChange={() => handleTypeChange('new')}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nuevo Cliente</span>
                </label>
            </div>

            {clientType === 'existing' && (
                <div className="space-y-2 relative">
                    <div>
                        <FormInput
                            id={`${role}-client-search`}
                            label="Buscar Cliente"
                            value={searchTerm}
                            onChange={(e) => searchClients(e.target.value)}
                            placeholder="Nombre, CI o teléfono..."
                        />
                    </div>
                    {isLoading && searchTerm.length >= 2 && <div className="text-sm text-gray-500">Buscando...</div>}

                    {results.length > 0 && searchTerm && !selectedClient && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-200 shadow-md rounded-md max-h-40 overflow-y-auto mt-1">
                            {results.map((client) => (
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
                                <li
                                    key={client.id}
                                    onClick={() => selectClient(client)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                                >
                                    <div className="font-medium text-gray-900">{client.full_name || client.name || `${client.firstname} ${client.lastname}`}</div>
                                    <div className="text-xs text-gray-500">
                                        CI: {client.document_id || client.doc_id || 'N/A'} - Tel: {client.phone || 'N/A'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {selectedClient && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                            <p><span className="font-medium">Seleccionado:</span> {selectedClient.full_name || selectedClient.name || `${selectedClient.firstname} ${selectedClient.lastname}`}</p>
                            {(selectedClient.document_id || selectedClient.doc_id) && <p><span className="font-medium">CI:</span> {selectedClient.document_id || selectedClient.doc_id}</p>}
                            {selectedClient.phone && <p><span className="font-medium">Teléfono:</span> {selectedClient.phone}</p>}
                            <Button type="button" variant="ghost" onClick={clearSelection} className="h-auto p-0 text-xs text-red-500 hover:text-red-700 hover:bg-transparent mt-2 font-medium">Limpiar selección</Button>
                        </div>
                    )}
                </div>
            )}

            {clientType === 'new' && (
                <div className="space-y-3 border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div>
                        <FormInput
                            id={`${role}-new-client-name`}
                            label="Nombre Completo"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <FormInput
                            id={`${role}-new-client-doc_id`}
                            label="Documento de Identidad (CI)"
                            value={newClient.doc_id}
                            onChange={(e) => setNewClient({ ...newClient, doc_id: e.target.value })}
                        />
                    </div>
                    <div>
                        <FormInput
                            id={`${role}-new-client-phone`}
                            label="Teléfono"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            type="tel"
                        />
                    </div>
                    <div>
                        <FormInput
                            id={`${role}-new-client-address`}
                            label="Dirección (Opcional)"
                            value={newClient.address}
                            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {error && (clientType === 'existing' && searchTerm || clientType === 'new') && (
                <div className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                    Error: {error}
                </div>
            )}
        </div>
    )
}
