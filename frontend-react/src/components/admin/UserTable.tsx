import React, { useState, useMemo, useEffect } from 'react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import SkeletonLoader from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'

interface UserTableProps {
    users: any[]
    loading?: boolean
    error?: string | null
    roles?: string[]
    pagination?: {
        total: number
        skip: number
        limit: number
        pages: number
    }
    currentPage?: number
    onRefresh: () => void
    onCreate: () => void
    onView: (user: any) => void
    onEdit: (user: any) => void
    onDelete: (user: any) => void
    onActivate: (user: any) => void
    onDeactivate: (user: any) => void
    onPageChange: (page: number) => void
    onFilterChange: (filters: { role?: string; is_active?: boolean }) => void
    onSearch: (term: string) => void
}

export default function UserTable({
    users = [],
    loading = false,
    error = null,
    roles = [],
    pagination = { total: 0, skip: 0, limit: 10, pages: 1 },
    currentPage = 1,
    onRefresh,
    onCreate,
    onView,
    onEdit,
    onDelete,
    onActivate,
    onDeactivate,
    onPageChange,
    onFilterChange,
    onSearch
}: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(searchTerm)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [searchTerm, onSearch])

    const handleFilterChange = (role: string, status: string) => {
        onFilterChange({
            role: role || undefined,
            is_active: status === '' ? undefined : status === 'true'
        })
    }

    const totalItems = pagination.total || 0
    const totalPages = pagination.pages || 1
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pagination.limit + 1
    const endItem = Math.min(currentPage * pagination.limit, totalItems)

    const displayedPages = useMemo(() => {
        const pages: (number | string)[] = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            if (currentPage <= 2) endPage = 4
            else if (currentPage >= totalPages - 1) startPage = totalPages - 3

            if (startPage > 2) pages.push('...')
            for (let i = startPage; i <= endPage; i++) pages.push(i)
            if (endPage < totalPages - 1) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }, [totalPages, currentPage])

    const getEffectiveName = (user: any) => {
        if (user.firstname && user.lastname) return `${user.firstname} ${user.lastname}`
        return user.username || 'Usuario Desconocido'
    }

    const getInitials = (user: any) => {
        if (user.firstname && user.lastname) return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase()
        if (user.username) return user.username.substring(0, 2).toUpperCase()
        return 'U'
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Usuarios del Sistema</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={onRefresh}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        title="Actualizar lista"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <button
                        onClick={onCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center transition-colors duration-200"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <FormInput
                            label="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            type="text"
                            placeholder="Nombre, email, usuario..."
                            className="pl-9"
                        />
                        <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-40">
                        <FormSelect
                            label="Rol"
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value)
                                handleFilterChange(e.target.value, selectedStatus)
                            }}
                            options={[
                                { value: '', label: 'Todos' },
                                ...roles.map(role => ({ value: role, label: getRoleLabel(role) }))
                            ]}
                        />
                    </div>
                    <div className="w-40">
                        <FormSelect
                            label="Estado"
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value)
                                handleFilterChange(selectedRole, e.target.value)
                            }}
                            options={[
                                { value: '', label: 'Todos' },
                                { value: 'true', label: 'Activos' },
                                { value: 'false', label: 'Inactivos' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Rol</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Creado</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skel-${i}`}>
                                    <td colSpan={6} className="px-6 py-4">
                                        <SkeletonLoader className="h-10 w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">
                                    <div className="flex justify-center text-red-500 mb-2">
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-red-500">{error}</p>
                                    <button
                                        onClick={onRefresh}
                                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                        Intentar nuevamente
                                    </button>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8">
                                    <EmptyState
                                        title="No se encontraron usuarios"
                                        description={(searchTerm || selectedRole || selectedStatus) ? 'Prueba a cambiar los filtros de búsqueda' : ''}
                                    />
                                </td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                                {getInitials(user)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{getEffectiveName(user)}</div>
                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                                <div className="text-xs text-gray-500 sm:hidden mt-1">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onView(user)} className="text-blue-600 hover:text-blue-900 transition-colors duration-200" title="Ver detalles">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200" title="Editar">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            {user.is_active ? (
                                                <button onClick={() => onDeactivate(user)} className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200" title="Desactivar">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button onClick={() => onActivate(user)} className="text-green-600 hover:text-green-900 transition-colors duration-200" title="Activar">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900 transition-colors duration-200" title="Eliminar">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        Siguiente
                    </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalItems}</span> resultados
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 transition-colors duration-200 ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {displayedPages.map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => onPageChange(page as number)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}

                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 transition-colors duration-200 ${currentPage === totalPages || totalPages === 0 ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                <span className="sr-only">Siguiente</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}
