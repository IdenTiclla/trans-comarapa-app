/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button } from '@/components/ui/button'
import { X, AlertCircle, Loader2, Pencil, UserX, UserCheck, Trash2 } from 'lucide-react'

interface UserDetailProps {
    user?: any
    loading?: boolean
    error?: string | null
    onClose: () => void
    onEdit: (user: any) => void
    onDelete: (user: any) => void
    onActivate: (user: any) => void
    onDeactivate: (user: any) => void
    onRefresh: () => void
}

export default function UserDetail({
    user = {},
    loading = false,
    error = null,
    onClose,
    onEdit,
    onDelete,
    onActivate,
    onDeactivate,
    onRefresh
}: UserDetailProps) {
    const getEffectiveName = (u: any) => {
        if (!u) return ''
        if (u.firstname && u.lastname) return `${u.firstname} ${u.lastname}`
        return u.username || 'Usuario Desconocido'
    }

    const getInitials = (u: any) => {
        if (!u) return 'U'
        if (u.firstname && u.lastname) return `${u.firstname.charAt(0)}${u.lastname.charAt(0)}`.toUpperCase()
        if (u.username) return u.username.substring(0, 2).toUpperCase()
        return 'U'
    }

    const getEffectivePhone = (u: any) => {
        if (!u) return ''
        if (u.phone) return u.phone
        if (u.related_entity && u.related_entity.phone) return u.related_entity.phone
        return ''
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }).format(date)
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrador'
            case 'secretary': return 'Secretaria'
            case 'driver': return 'Conductor'
            case 'assistant': return 'Asistente'
            case 'client': return 'Cliente'
            default: return role
        }
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800'
            case 'secretary': return 'bg-blue-100 text-blue-800'
            case 'driver': return 'bg-green-100 text-green-800'
            case 'assistant': return 'bg-yellow-100 text-yellow-800'
            case 'client': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Usuario</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="text-gray-500 hover:text-gray-700"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {loading ? (
                <div className="p-10 text-center">
                    <Loader2 className="animate-spin h-10 w-10 text-indigo-500 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando información del usuario...</p>
                </div>
            ) : error ? (
                <div className="p-10 text-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
                    <p className="mt-4 text-red-600">{error}</p>
                    <Button onClick={onRefresh} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                        Intentar nuevamente
                    </Button>
                </div>
            ) : (
                <div className="p-6">
                    {/* Cabecera con avatar y nombre */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white shadow-md">
                            {getInitials(user)}
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{getEffectiveName(user)}</h2>
                            <p className="text-gray-600">@{user.username}</p>
                            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                                {user.is_admin && (
                                    <span className="bg-purple-100 text-purple-800 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                                        Administrador
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                            <h4 className="font-medium text-gray-700 border-b pb-2 mb-4 flex items-center">
                                <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Información de Cuenta
                            </h4>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">ID de Usuario</p>
                                    <p className="font-medium text-gray-900">{user.id}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">Correo Electrónico</p>
                                    <p className="font-medium text-gray-900">{user.email}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                                    <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-sm text-gray-500">Última Actualización</p>
                                    <p className="font-medium text-gray-900">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        {user.related_entity && (
                            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                                <h4 className="font-medium text-gray-700 border-b pb-2 mb-4 flex items-center">
                                    <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Información de {getRoleLabel(user.role)}
                                </h4>

                                <div className="space-y-4">
                                    {user.related_entity.entity_id && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">ID de {getRoleLabel(user.role)}</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.entity_id}</p>
                                        </div>
                                    )}

                                    {(getEffectivePhone(user) || user.related_entity.phone) && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Teléfono</p>
                                            <p className="font-medium text-gray-900">{getEffectivePhone(user) || user.related_entity.phone}</p>
                                        </div>
                                    )}

                                    {user.related_entity.birth_date && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                                            <p className="font-medium text-gray-900">{formatDate(user.related_entity.birth_date)}</p>
                                        </div>
                                    )}

                                    {user.related_entity.license_number && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Número de Licencia</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.license_number}</p>
                                        </div>
                                    )}

                                    {user.related_entity.experience_years !== undefined && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Años de Experiencia</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.experience_years}</p>
                                        </div>
                                    )}

                                    {user.related_entity.address && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Dirección</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.address}</p>
                                        </div>
                                    )}

                                    {user.related_entity.city && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Ciudad</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.city}</p>
                                        </div>
                                    )}

                                    {user.related_entity.state && (
                                        <div className="flex justify-between">
                                            <p className="text-sm text-gray-500">Estado/Provincia</p>
                                            <p className="font-medium text-gray-900">{user.related_entity.state}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 flex flex-wrap justify-end gap-3 pt-5 border-t border-gray-200">
                        <Button onClick={() => onEdit(user)} className="bg-indigo-600 hover:bg-indigo-700">
                            <Pencil className="h-4 w-4 mr-1.5" />
                            Editar Usuario
                        </Button>

                        {user.is_active ? (
                            <Button onClick={() => onDeactivate(user)} className="bg-yellow-600 hover:bg-yellow-700">
                                <UserX className="h-4 w-4 mr-1.5" />
                                Desactivar Usuario
                            </Button>
                        ) : (
                            <Button onClick={() => onActivate(user)} className="bg-green-600 hover:bg-green-700">
                                <UserCheck className="h-4 w-4 mr-1.5" />
                                Activar Usuario
                            </Button>
                        )}

                        <Button onClick={() => onDelete(user)} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Eliminar Usuario
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
