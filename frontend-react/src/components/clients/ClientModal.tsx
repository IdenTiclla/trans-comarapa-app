import { useState, useEffect } from 'react'
import FormInput from '@/components/forms/FormInput'

interface ClientForm {
    firstname: string
    lastname: string
    document_id: string
    phone: string
    email: string
    city: string
    state: string
    [key: string]: any
}

interface ClientModalProps {
    show: boolean
    client?: ClientForm | null
    isEditing?: boolean
    onClose: () => void
    onSave: (data: ClientForm) => void
}

export default function ClientModal({ show, client, isEditing, onClose, onSave }: ClientModalProps) {
    const [form, setForm] = useState<ClientForm>({
        firstname: '',
        lastname: '',
        document_id: '',
        phone: '',
        email: '',
        city: '',
        state: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show) {
            if (client && isEditing) {
                setForm({
                    firstname: client.firstname || '',
                    lastname: client.lastname || '',
                    document_id: client.document_id || '',
                    phone: client.phone || '',
                    email: client.email || '',
                    city: client.city || '',
                    state: client.state || '',
                })
            } else {
                setForm({
                    firstname: '',
                    lastname: '',
                    document_id: '',
                    phone: '',
                    email: '',
                    city: '',
                    state: ''
                })
            }
        }
    }, [show, client, isEditing])

    if (!show) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await onSave(form)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormInput
                                    id="firstname"
                                    label="Nombre *"
                                    value={form.firstname}
                                    onChange={(e) => setForm(f => ({ ...f, firstname: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="lastname"
                                    label="Apellido *"
                                    value={form.lastname}
                                    onChange={(e) => setForm(f => ({ ...f, lastname: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="document_id"
                                    label="CI"
                                    value={form.document_id}
                                    onChange={(e) => setForm(f => ({ ...f, document_id: e.target.value }))}
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="phone"
                                    label="Teléfono"
                                    value={form.phone}
                                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                    type="tel"
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="email"
                                    label="Email"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    type="email"
                                />
                            </div>
                            <div>
                                <FormInput
                                    id="city"
                                    label="Ciudad"
                                    value={form.city}
                                    onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
