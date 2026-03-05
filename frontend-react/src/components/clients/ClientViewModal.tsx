interface ClientViewModalProps {
    show: boolean
    client: Record<string, any> | null
    onClose: () => void
    onEdit: (client: Record<string, any>) => void
}

export default function ClientViewModal({ show, client, onClose, onEdit }: ClientViewModalProps) {
    if (!show || !client) return null

    const getEffectiveName = (c: any) => {
        if (!c) return 'No registrado'
        return c.full_name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || 'No registrado'
    }

    const getAgeColorClass = (ageCategory?: string) => {
        switch (ageCategory) {
            case 'senior': return 'bg-purple-100 text-purple-800'
            case 'adult': return 'bg-blue-100 text-blue-800'
            case 'minor': return 'bg-orange-100 text-orange-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getAgeLabel = (ageCategory?: string) => {
        switch (ageCategory) {
            case 'senior': return 'Adulto Mayor'
            case 'adult': return 'Adulto'
            case 'minor': return 'Menor'
            default: return 'N/A'
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No registrada'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('es-BO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return 'Fecha inválida'
        }
    }

    const fullName = getEffectiveName(client)

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl p-6 max-w-4xl w-full text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 border-b-0 pb-0">
                                {fullName}
                            </h3>
                            <div className="flex items-center space-x-3 mt-3">
                                {client.initials && (
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        {client.initials}
                                    </span>
                                )}
                                {client.age !== undefined && (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAgeColorClass(client.age_category)}`}>
                                        {client.age} años ({getAgeLabel(client.age_category)})
                                    </span>
                                )}
                                {client.is_minor === false && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Mayor de edad
                                    </span>
                                )}
                                {client.is_minor === true && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Menor de edad
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md -mt-8">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Información Personal</h4>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</label>
                                <p className="text-gray-900 font-medium mt-1">{client.firstname || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</label>
                                <p className="text-gray-900 font-medium mt-1">{client.lastname || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documento de Identidad</label>
                                <p className="text-gray-900 font-mono mt-1">{client.document_id || 'No registrado'}</p>
                            </div>
                            {client.birth_date && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</label>
                                    <p className="text-gray-900 mt-1">{formatDate(client.birth_date)}</p>
                                </div>
                            )}
                        </div>

                        {/* Información de Contacto */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Contacto</h4>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                                <p className="text-gray-900 font-mono mt-1">{client.phone || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                                <p className="text-gray-900 break-all mt-1">{client.email || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
                                <p className="text-gray-900 mt-1">{client.address || 'No registrada'}</p>
                            </div>
                        </div>

                        {/* Información de Ubicación */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Ubicación</h4>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
                                <p className="text-gray-900 mt-1">{client.city || 'No registrada'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</label>
                                <p className="text-gray-900 mt-1">{client.state || 'No registrado'}</p>
                            </div>
                            {client.created_at && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente desde</label>
                                    <p className="text-gray-900 mt-1">{formatDate(client.created_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            {client.updated_at && (
                                <span>Última actualización: {formatDate(client.updated_at)}</span>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => onEdit(client)}
                                className="px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors shadow-sm"
                            >
                                Editar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
