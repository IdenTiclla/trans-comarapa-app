import React, { useState, useEffect, useMemo } from 'react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

interface UserFormProps {
    user?: any
    roles?: string[]
    loading?: boolean
    isEditing?: boolean
    onSubmit: (data: any) => void
    onCancel: () => void
}

export default function UserForm({
    user = {},
    roles = [],
    loading = false,
    isEditing = false,
    onSubmit,
    onCancel
}: UserFormProps) {
    const [form, setForm] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        role: roles.length > 0 ? roles[0] : 'client',
        is_active: true,
        is_admin: false
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isEditing && user) {
            setForm({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                username: user.username || '',
                email: user.email || '',
                password: '', // Leave blank unless changing
                role: user.role || (roles.length > 0 ? roles[0] : 'client'),
                is_active: user.is_active !== undefined ? user.is_active : true,
                is_admin: user.is_admin || false
            })
        }
    }, [user, isEditing, roles])

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

    const passwordStrength = useMemo(() => {
        if (!form.password) return 0
        let strength = 0
        const p = form.password

        if (p.length >= 8) strength += 2
        else if (p.length >= 6) strength += 1

        if (/[a-z]/.test(p)) strength += 1
        if (/[A-Z]/.test(p)) strength += 1
        if (/[0-9]/.test(p)) strength += 1
        if (/[^a-zA-Z0-9]/.test(p)) strength += 1

        const uniqueChars = new Set(p.split('')).size
        if (uniqueChars >= 5) strength += 2
        else if (uniqueChars >= 3) strength += 1

        return Math.min(strength, 10)
    }, [form.password])

    const passwordStrengthText = useMemo(() => {
        if (passwordStrength === 0) return 'No evaluada'
        if (passwordStrength < 4) return 'Débil'
        if (passwordStrength < 7) return 'Media'
        return 'Fuerte'
    }, [passwordStrength])

    const passwordStrengthClass = useMemo(() => {
        if (passwordStrength < 4) return 'bg-red-500'
        if (passwordStrength < 7) return 'bg-yellow-500'
        return 'bg-green-500'
    }, [passwordStrength])

    const passwordStrengthTextClass = useMemo(() => {
        if (passwordStrength < 4) return 'text-red-600'
        if (passwordStrength < 7) return 'text-yellow-600'
        return 'text-green-600'
    }, [passwordStrength])

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!form.firstname) newErrors.firstname = 'El nombre es requerido'
        if (!form.lastname) newErrors.lastname = 'El apellido es requerido'
        if (!form.username) newErrors.username = 'El nombre de usuario es requerido'
        else if (form.username.length < 3) newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'

        if (!form.email) newErrors.email = 'El correo electrónico es requerido'
        else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'El correo electrónico no es válido'

        if (!isEditing && !form.password) {
            newErrors.password = 'La contraseña es requerida'
        } else if (form.password && form.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        if (!form.role) newErrors.role = 'El rol es requerido'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: string, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            const userData: any = {
                firstname: form.firstname,
                lastname: form.lastname,
                username: form.username,
                email: form.email,
                role: form.role,
                is_active: form.is_active,
                is_admin: form.is_admin
            }
            if (form.password) {
                userData.password = form.password
            }
            onSubmit(userData)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-lg font-semibold text-gray-900">{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    title="Cerrar"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información personal */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Información Personal
                        </h4>

                        <div>
                            <FormInput
                                id="firstname"
                                label="Nombre"
                                value={form.firstname}
                                onChange={(e) => handleChange('firstname', e.target.value)}
                                type="text"
                                error={errors.firstname}
                            />
                        </div>

                        <div>
                            <FormInput
                                id="lastname"
                                label="Apellido"
                                value={form.lastname}
                                onChange={(e) => handleChange('lastname', e.target.value)}
                                type="text"
                                error={errors.lastname}
                            />
                        </div>
                    </div>

                    {/* Información de cuenta */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Información de Cuenta
                        </h4>

                        <div className="relative">
                            <FormInput
                                id="username"
                                label="Nombre de Usuario"
                                value={form.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                type="text"
                                error={errors.username}
                                className="pl-8"
                            />
                            <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">@</span>
                            </div>
                        </div>

                        <div className="relative">
                            <FormInput
                                id="email"
                                label="Correo Electrónico"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                type="email"
                                error={errors.email}
                                className="pl-8"
                            />
                            <div className="absolute top-[34px] left-0 pl-2.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative">
                            <FormInput
                                id="password"
                                label={isEditing ? 'Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'}
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                type="password"
                                error={errors.password}
                                className="pl-8 pr-12"
                            />
                            <div className="absolute top-[34px] left-0 pl-2.5 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            {form.password && (
                                <div className="absolute top-[38px] right-0 pr-3 flex items-center">
                                    <div className="h-1 w-10 rounded-full overflow-hidden bg-gray-200">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrengthClass}`}
                                            style={{ width: `${passwordStrength * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            {form.password && !errors.password && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Fortaleza: <span className={passwordStrengthTextClass}>{passwordStrengthText}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Configuración de rol y estado */}
                <div className="mt-8 space-y-4">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Configuración de Rol y Estado
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormSelect
                                id="role"
                                label="Rol"
                                value={form.role}
                                onChange={(e) => handleChange('role', e.target.value)}
                                options={roles.map(role => ({ value: role, label: getRoleLabel(role) }))}
                                error={errors.role}
                            />
                        </div>

                        <div className="flex flex-col gap-4 mt-6">
                            <div className="flex items-center">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">Usuario Activo</label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_admin"
                                    type="checkbox"
                                    checked={form.is_admin}
                                    onChange={(e) => handleChange('is_admin', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
                                />
                                <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-700">Permisos de Administrador</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </span>
                        ) : (
                            <span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
