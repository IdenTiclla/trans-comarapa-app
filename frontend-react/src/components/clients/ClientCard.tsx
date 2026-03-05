import { useMemo } from 'react'

interface Client {
    id: number
    firstname?: string
    lastname?: string
    full_name?: string
    initials?: string
    document_id?: string
    phone?: string
    email?: string
    city?: string
    state?: string
    status?: string
    age?: number
    age_category?: string
    is_minor?: boolean
    created_at?: string
    [key: string]: any
}

interface ClientCardProps {
    client: Client
    onView?: (client: Client) => void
    onEdit?: (client: Client) => void
    onDelete?: (client: Client) => void
}

export default function ClientCard({ client, onView, onEdit, onDelete }: ClientCardProps) {
    const initials = useMemo(() => {
        if (client.initials) return client.initials
        const name = client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim()
        if (!name) return 'CL'
        const parts = name.split(' ')
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
        return name.slice(0, 2).toUpperCase()
    }, [client])

    const fullName = client.full_name || `${client.firstname || ''} ${client.lastname || ''}`.trim()

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Fecha no disponible'
        try {
            return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
        } catch { return 'Fecha inválida' }
    }

    const statusClass = client.status === 'active'
        ? 'bg-green-100 text-green-800 border-green-200'
        : 'bg-red-100 text-red-800 border-red-200'

    const ageBadge = useMemo(() => {
        if (client.age_category) {
            const map: Record<string, { cls: string, text: string }> = {
                senior: { cls: 'bg-purple-100 text-purple-800', text: '👴 Adulto Mayor' },
                adult: { cls: 'bg-blue-100 text-blue-800', text: '👤 Adulto' },
                minor: { cls: 'bg-orange-100 text-orange-800', text: '👶 Menor' },
            }
            return map[client.age_category] || { cls: 'bg-gray-100 text-gray-800', text: '👤 N/A' }
        } else if (client.is_minor !== undefined) {
            if (client.is_minor) return { cls: 'bg-orange-100 text-orange-800', text: '👶 Menor' }
            return { cls: 'bg-blue-100 text-blue-800', text: '👤 Adulto' }
        }
        return null
    }, [client])

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-gray-300 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg flex-shrink-0">
                            <span className="text-white font-bold text-sm">{initials}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{fullName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                                {ageBadge && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ageBadge.cls}`}>
                                        {ageBadge.text}
                                    </span>
                                )}
                                {client.age !== undefined && <span className="text-xs text-gray-600">{client.age} años</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${statusClass}`}>
                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0 shrink-0">
                        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Documento</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{client.document_id || 'Sin CI'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg flex-shrink-0 shrink-0">
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{client.phone || 'Sin teléfono'}</p>
                    </div>
                </div>

                {client.email && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg flex-shrink-0 shrink-0">
                            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{client.email}</p>
                        </div>
                    </div>
                )}

                {(client.city || client.state) && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg flex-shrink-0 shrink-0">
                            <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500 font-medium">Ubicación</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{[client.city, client.state].filter(Boolean).join(', ')}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Registrado:</span>
                    <span className="font-medium text-gray-900">{formatDate(client.created_at)}</span>
                </div>
            </div>

            <div className="flex gap-2 mt-auto">
                {onView && (
                    <button onClick={() => onView(client)} className="flex-1 inline-flex justify-center items-center py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Ver
                    </button>
                )}
                {onEdit && (
                    <button onClick={() => onEdit(client)} className="flex-1 inline-flex justify-center items-center py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Editar
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(client)} title="Eliminar" className="px-3 py-2 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>
        </div>
    )
}
