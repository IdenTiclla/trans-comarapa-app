/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { X, Pencil } from 'lucide-react'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
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
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-500 self-start">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Información Personal</h4>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</span>
                                <p className="text-gray-900 font-medium mt-1">{client.firstname || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</span>
                                <p className="text-gray-900 font-medium mt-1">{client.lastname || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documento de Identidad</span>
                                <p className="text-gray-900 font-mono mt-1">{client.document_id || 'No registrado'}</p>
                            </div>
                            {client.birth_date && (
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</span>
                                    <p className="text-gray-900 mt-1">{formatDate(client.birth_date)}</p>
                                </div>
                            )}
                        </div>

                        {/* Información de Contacto */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Contacto</h4>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</span>
                                <p className="text-gray-900 font-mono mt-1">{client.phone || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</span>
                                <p className="text-gray-900 break-all mt-1">{client.email || 'No registrado'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</span>
                                <p className="text-gray-900 mt-1">{client.address || 'No registrada'}</p>
                            </div>
                        </div>

                        {/* Información de Ubicación */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Ubicación</h4>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</span>
                                <p className="text-gray-900 mt-1">{client.city || 'No registrada'}</p>
                            </div>
                            <div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</span>
                                <p className="text-gray-900 mt-1">{client.state || 'No registrado'}</p>
                            </div>
                            {client.created_at && (
                                <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente desde</span>
                                    <p className="text-gray-900 mt-1">{formatDate(client.created_at)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between sm:items-center p-6 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-2xl gap-4 sm:gap-0">
                    <div className="text-sm text-gray-500 text-center sm:text-left">
                        {client.updated_at && (
                            <span>Última actualización: {formatDate(client.updated_at)}</span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cerrar
                        </Button>
                        <Button type="button" onClick={() => onEdit(client)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar Cliente
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
