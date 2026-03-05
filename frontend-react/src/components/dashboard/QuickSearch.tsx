import { useState } from 'react'
import { useNavigate } from 'react-router'

const SEARCH_TYPES = [
    { value: 'client', label: 'Cliente' },
    { value: 'ticket', label: 'Boleto' },
    { value: 'trip', label: 'Viaje' },
    { value: 'package', label: 'Paquete' },
]

const SEARCH_CONFIG: Record<string, { label: string; placeholder: string }> = {
    client: { label: 'Nombre o CI del cliente', placeholder: 'Ej: Juan Pérez o 12345678' },
    ticket: { label: 'Número de boleto', placeholder: 'Ej: T-12345' },
    trip: { label: 'Origen o destino', placeholder: 'Ej: Santa Cruz o Comarapa' },
    package: { label: 'Número de paquete o destinatario', placeholder: 'Ej: P-12345 o María López' },
}

export default function QuickSearch() {
    const navigate = useNavigate()
    const [searchType, setSearchType] = useState('client')
    const [query, setQuery] = useState('')

    const config = SEARCH_CONFIG[searchType] ?? SEARCH_CONFIG.client

    const handleSearch = () => {
        if (!query.trim()) return
        // Navigate to the corresponding page with search params
        switch (searchType) {
            case 'client':
                navigate(`/clients?q=${encodeURIComponent(query)}`)
                break
            case 'trip':
                navigate(`/trips?search=${encodeURIComponent(query)}`)
                break
            case 'package':
                navigate(`/packages?q=${encodeURIComponent(query)}`)
                break
            default:
                navigate(`/clients?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="search-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por
                </label>
                <select
                    id="search-type"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                    {SEARCH_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-1">
                    {config.label}
                </label>
                <input
                    id="search-query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={config.placeholder}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
            </div>

            <button
                onClick={handleSearch}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
                Buscar
            </button>
        </div>
    )
}
