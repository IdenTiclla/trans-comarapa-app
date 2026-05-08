import { useState } from 'react'
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'
import { Loader2, UserPlus } from 'lucide-react'

interface ClientRegistrationFormData {
    firstname: string
    email: string
    phone: string
    address: string
}

interface ClientRegistrationFormProps {
    onSubmit: (data: ClientRegistrationFormData) => void
    onCancel: () => void
    loading?: boolean
}

interface FormErrors {
    firstname?: string
    email?: string
    phone?: string
    address?: string
}

const INITIAL_FORM: ClientRegistrationFormData = {
    firstname: '',
    email: '',
    phone: '',
    address: '',
}

export default function ClientRegistrationForm({
    onSubmit,
    onCancel,
    loading = false,
}: ClientRegistrationFormProps) {
    const [form, setForm] = useState<ClientRegistrationFormData>(INITIAL_FORM)
    const [errors, setErrors] = useState<FormErrors>({})

    const validate = (): boolean => {
        const newErrors: FormErrors = {}

        if (!form.firstname.trim()) {
            newErrors.firstname = 'El nombre es requerido'
        }

        if (!form.email.trim()) {
            newErrors.email = 'El correo electrónico es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'El correo electrónico no es válido'
        }

        if (form.phone && !/^\+?[\d\s\-()]{7,20}$/.test(form.phone)) {
            newErrors.phone = 'El teléfono no es válido'
        }

        if (!form.address.trim()) {
            newErrors.address = 'La dirección es requerida'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: keyof ClientRegistrationFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onSubmit(form)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-lg mx-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Registro de Cliente</h2>
                    <p className="text-sm text-gray-500">Complete los datos del nuevo cliente</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
                <FormInput
                    id="client-firstname"
                    label="Nombre completo *"
                    value={form.firstname}
                    onChange={(e) => handleChange('firstname', e.target.value)}
                    error={errors.firstname}
                    required
                    autoComplete="name"
                    placeholder="Ingrese el nombre del cliente"
                    aria-describedby={errors.firstname ? 'client-firstname-error' : undefined}
                    aria-invalid={!!errors.firstname}
                />

                <FormInput
                    id="client-email"
                    label="Correo electrónico *"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={errors.email}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    aria-describedby={errors.email ? 'client-email-error' : undefined}
                    aria-invalid={!!errors.email}
                />

                <FormInput
                    id="client-phone"
                    label="Teléfono"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={errors.phone}
                    type="tel"
                    autoComplete="tel"
                    placeholder="+591 700 00000"
                    aria-describedby={errors.phone ? 'client-phone-error' : undefined}
                    aria-invalid={!!errors.phone}
                />

                <FormInput
                    id="client-address"
                    label="Dirección *"
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    error={errors.address}
                    required
                    autoComplete="street-address"
                    placeholder="Calle, número, ciudad"
                    aria-describedby={errors.address ? 'client-address-error' : undefined}
                    aria-invalid={!!errors.address}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Registrando...
                            </span>
                        ) : (
                            'Registrar Cliente'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
