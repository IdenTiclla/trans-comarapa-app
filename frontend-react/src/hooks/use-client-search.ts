import { useState, useCallback, useRef } from 'react'
import { apiFetch } from '@/lib/api'

export function useClientSearch() {
    // Client type: 'existing' | 'new'
    const [clientType, setClientType] = useState<'existing' | 'new'>('existing')

    // Search state
    const [clientSearchQuery, setClientSearchQuery] = useState('')
    const [foundClients, setFoundClients] = useState<any[]>([])
    const [searchingClients, setSearchingClients] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Selected client
    const [selectedExistingClient, setSelectedExistingClient] = useState<any | null>(null)
    const [hasSelectedExistingClient, setHasSelectedExistingClient] = useState(false)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const searchClients = useCallback((query: string) => {
        setClientSearchQuery(query)
        setHasSelectedExistingClient(false)
        setSelectedExistingClient(null)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (!query || query.trim().length < 2) {
            setFoundClients([])
            setHasSearched(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setSearchingClients(true)
            try {
                const resp = await apiFetch(`/clients/search?q=${encodeURIComponent(query)}`) as any
                setFoundClients(Array.isArray(resp) ? resp : [])
                setHasSearched(true)
            } catch (err) {
                console.error('Error searching clients:', err)
                setFoundClients([])
                setHasSearched(true)
            } finally {
                setSearchingClients(false)
            }
        }, 350)
    }, [])

    const selectExistingClient = useCallback((client: any) => {
        setSelectedExistingClient(client)
        setHasSelectedExistingClient(true)
        setClientSearchQuery(`${client.firstname} ${client.lastname}`)
        setFoundClients([])
    }, [])

    const clearExistingClientSelection = useCallback(() => {
        setSelectedExistingClient(null)
        setHasSelectedExistingClient(false)
        setClientSearchQuery('')
        setFoundClients([])
        setHasSearched(false)
    }, [])

    const resetClientSearch = useCallback(() => {
        setClientType('existing')
        setClientSearchQuery('')
        setFoundClients([])
        setSearchingClients(false)
        setHasSearched(false)
        setSelectedExistingClient(null)
        setHasSelectedExistingClient(false)
        if (debounceRef.current) clearTimeout(debounceRef.current)
    }, [])

    // Creates a new client via API or returns the existing one
    const getOrCreateClient = useCallback(async (clientData: any): Promise<any> => {
        if (clientType === 'existing') {
            // clientData is the selectedExistingClient
            if (!clientData || !clientData.id) throw new Error('No se ha seleccionado un cliente existente.')
            return clientData
        } else {
            // clientData is the new client form
            const { firstname, lastname, document_id, phone } = clientData
            if (!firstname || !lastname || !document_id) {
                throw new Error('Los datos del cliente nuevo son incompletos.')
            }
            const created = await apiFetch('/clients', {
                method: 'POST',
                body: { firstname, lastname, document_id, phone: phone || null }
            })
            return created
        }
    }, [clientType])

    return {
        clientType,
        setClientType,
        clientSearchQuery,
        searchClients,
        foundClients,
        searchingClients,
        hasSearched,
        selectedExistingClient,
        hasSelectedExistingClient,
        selectExistingClient,
        clearExistingClientSelection,
        resetClientSearch,
        getOrCreateClient,
    }
}
