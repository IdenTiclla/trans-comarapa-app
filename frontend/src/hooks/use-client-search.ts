import { useState, useCallback, useRef, useMemo } from 'react'
import { clientService } from '@/services/client.service'
import { TIMING } from '@/lib/timing'

export interface ClientRecord {
    id?: number
    firstname?: string
    lastname?: string
    document_id?: string
    phone?: string | null
    [key: string]: unknown
}

export function useClientSearch() {
    // Client type: 'existing' | 'new'
    const [clientType, setClientType] = useState<'existing' | 'new'>('existing')

    // Search state
    const [clientSearchQuery, setClientSearchQuery] = useState('')
    const [foundClients, setFoundClients] = useState<ClientRecord[]>([])
    const [searchingClients, setSearchingClients] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Selected client
    const [selectedExistingClient, setSelectedExistingClient] = useState<ClientRecord | null>(null)
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
                const resp = await clientService.search(query) as ClientRecord[] | unknown
                setFoundClients(Array.isArray(resp) ? resp : [])
                setHasSearched(true)
            } catch {
                setFoundClients([])
                setHasSearched(true)
            } finally {
                setSearchingClients(false)
            }
        }, TIMING.CLIENT_SEARCH_DEBOUNCE)
    }, [])

    const selectExistingClient = useCallback((client: ClientRecord) => {
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
    const getOrCreateClient = useCallback(async (clientData: ClientRecord): Promise<ClientRecord> => {
        if (clientType === 'existing') {
            if (!clientData || !clientData.id) throw new Error('No se ha seleccionado un cliente existente.')
            return clientData
        } else {
            const { firstname, lastname, document_id, phone } = clientData
            if (!firstname || !lastname || !document_id) {
                throw new Error('Los datos del cliente nuevo son incompletos.')
            }
            const created = await clientService.create({ firstname, lastname, document_id, phone: phone || null }) as ClientRecord
            return created
        }
    }, [clientType])

    const searchAnnouncement = useMemo(() => {
        if (searchingClients) return 'Buscando clientes...'
        if (!hasSearched) return ''
        if (foundClients.length === 0) return 'No se encontraron clientes'
        return `Se encontraron ${foundClients.length} cliente${foundClients.length === 1 ? '' : 's'}`
    }, [searchingClients, hasSearched, foundClients.length])

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
        searchAnnouncement,
    }
}
