/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                    <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-500">
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    </form>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 p-6 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-2xl gap-3 sm:gap-0">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button type="submit" form="client-form" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                        {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Nuevo Cliente')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
