import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { createPackage } from '@/store/package.slice'
import { apiFetch } from '@/lib/api'
import { useClientSearch } from '@/hooks/use-client-search'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import PackageReceiptModal from './PackageReceiptModal'
import { cn } from '@/lib/utils'

interface PackageRegistrationModalProps {
    show: boolean
    tripId?: number | string | null
    onClose: () => void
    onPackageRegistered?: (pkg: any) => void
}

export default function PackageRegistrationModal({
    show,
    tripId = null,
    onClose,
    onPackageRegistered
}: PackageRegistrationModalProps) {
    const dispatch = useDispatch<any>()
    const authStore = useSelector((state: RootState) => state.auth)

    // Independent searches
    const senderSearch = useClientSearch()
    const recipientSearch = useClientSearch()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrorMessage, setFormErrorMessage] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const [packageNumber, setPackageNumber] = useState('000000')

    const [newSenderForm, setNewSenderForm] = useState({ firstname: '', lastname: '', document_id: '', phone: '' })
    const [newRecipientForm, setNewRecipientForm] = useState({ firstname: '', lastname: '', document_id: '', phone: '' })

    const [packageData, setPackageData] = useState({
        tracking_number: '',
        origin: 'Comarapa',
        destination: '',
        total_weight: 0,
        total_declared_value: 0,
        notes: '',
        items: [{ quantity: 1, description: '', unit_price: 0 }],
        payment_status: 'paid_on_send',
        payment_method: 'cash',
        received_confirmation: false
    })

    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [registeredPackageData, setRegisteredPackageData] = useState<any>({})

    const now = new Date()
    const currentDay = String(now.getDate()).padStart(2, '0')
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
    const currentYear = String(now.getFullYear())

    const totalAmount = useMemo(() => {
        return packageData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0)
    }, [packageData.items])

    const totalItemsCount = useMemo(() => {
        return packageData.items.reduce((total, item) => total + item.quantity, 0)
    }, [packageData.items])

    const getSenderDocument = () => {
        return senderSearch.clientType === 'existing'
            ? senderSearch.selectedExistingClient?.document_id
            : newSenderForm.document_id
    }

    const getRecipientDocument = () => {
        return recipientSearch.clientType === 'existing'
            ? recipientSearch.selectedExistingClient?.document_id
            : newRecipientForm.document_id
    }

    const isSamePerson = useMemo(() => {
        const sDoc = getSenderDocument()
        const rDoc = getRecipientDocument()
        return Boolean(sDoc && rDoc && String(sDoc).trim() === String(rDoc).trim())
    }, [senderSearch.clientType, senderSearch.selectedExistingClient, newSenderForm.document_id, recipientSearch.clientType, recipientSearch.selectedExistingClient, newRecipientForm.document_id])

    const hasSender = useMemo(() => {
        if (senderSearch.clientType === 'existing') {
            return !!senderSearch.selectedExistingClient
        } else {
            return newSenderForm.firstname.trim() !== '' && newSenderForm.lastname.trim() !== '' && newSenderForm.document_id.trim() !== ''
        }
    }, [senderSearch.clientType, senderSearch.selectedExistingClient, newSenderForm])

    const hasRecipient = useMemo(() => {
        if (recipientSearch.clientType === 'existing') {
            return !!recipientSearch.selectedExistingClient
        } else {
            return newRecipientForm.firstname.trim() !== '' && newRecipientForm.lastname.trim() !== '' && newRecipientForm.document_id.trim() !== ''
        }
    }, [recipientSearch.clientType, recipientSearch.selectedExistingClient, newRecipientForm])

    const isFormValid = useMemo(() => {
        const basicValidation =
            hasSender &&
            hasRecipient &&
            packageData.destination.trim() !== '' &&
            packageData.origin.trim() !== '' &&
            packageData.items.length > 0 &&
            packageData.items.every(item => item.description.trim() !== '' && item.quantity > 0 && item.unit_price >= 0) &&
            packageData.received_confirmation

        return basicValidation && !isSamePerson
    }, [hasSender, hasRecipient, packageData, isSamePerson])

    const generateTrackingNumber = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `${timestamp}${random}`
    }

    const resetForm = useCallback(() => {
        const trackingNumber = generateTrackingNumber()

        senderSearch.resetClientSearch()
        recipientSearch.resetClientSearch()

        setNewSenderForm({ firstname: '', lastname: '', document_id: '', phone: '' })
        setNewRecipientForm({ firstname: '', lastname: '', document_id: '', phone: '' })
        setFormErrorMessage('')
        setFieldErrors({})

        setPackageData({
            tracking_number: trackingNumber,
            origin: 'Comarapa',
            destination: '',
            total_weight: 0,
            total_declared_value: 0,
            notes: '',
            items: [{ quantity: 1, description: '', unit_price: 0 }],
            payment_status: 'paid_on_send',
            payment_method: 'cash',
            received_confirmation: false
        })
        setPackageNumber(trackingNumber)
    }, [senderSearch, recipientSearch])

    useEffect(() => {
        if (show) {
            senderSearch.setClientType('existing')
            recipientSearch.setClientType('existing')
            if (!packageData.origin) {
                setPackageData(prev => ({ ...prev, origin: 'Comarapa' }))
            }
        } else {
            resetForm()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show])

    useEffect(() => {
        if (!packageData.origin || !packageData.origin.trim()) {
            setFieldErrors(prev => ({ ...prev, origin: 'El origen es requerido' }))
        } else {
            setFieldErrors(prev => ({ ...prev, origin: '' }))
        }
        if (!packageData.destination || !packageData.destination.trim()) {
            setFieldErrors(prev => ({ ...prev, destination: 'El destino es requerido' }))
        } else {
            setFieldErrors(prev => ({ ...prev, destination: '' }))
        }
    }, [packageData.origin, packageData.destination])

    const addItem = () => {
        setPackageData(prev => ({
            ...prev,
            items: [...prev.items, { quantity: 1, description: '', unit_price: 0 }]
        }))
    }

    const removeItem = (index: number) => {
        if (packageData.items.length > 1) {
            setPackageData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }))
        }
    }

    const updateItem = (index: number, field: string, value: any) => {
        setPackageData(prev => {
            const newItems = [...prev.items];
            (newItems[index] as any)[field] = value;
            return { ...prev, items: newItems }
        })
    }

    const copySenderToRecipient = () => {
        if (!senderSearch.selectedExistingClient && !newSenderForm.document_id) return

        if (senderSearch.clientType === 'existing') {
            recipientSearch.setClientType('existing')
            recipientSearch.selectExistingClient(senderSearch.selectedExistingClient)
        } else {
            recipientSearch.setClientType('new')
            setNewRecipientForm({ ...newSenderForm })
        }
    }

    const submitPackage = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormErrorMessage('')

        if (!isFormValid) {
            if (!hasSender) setFormErrorMessage('Complete la información del remitente.')
            else if (!hasRecipient) setFormErrorMessage('Complete la información del destinatario.')
            else if (!packageData.received_confirmation) setFormErrorMessage('Debe marcar la casilla de validación.')
            else setFormErrorMessage('Complete los datos requeridos.')
            return
        }

        if (isSamePerson) {
            setFormErrorMessage('El remitente y el destinatario no pueden ser la misma persona.')
            return
        }

        setIsSubmitting(true)
        try {
            const senderPayload = senderSearch.clientType === 'existing'
                ? senderSearch.selectedExistingClient
                : newSenderForm
            const finalSender: any = await senderSearch.getOrCreateClient(senderPayload)

            const recipientPayload = recipientSearch.clientType === 'existing'
                ? recipientSearch.selectedExistingClient
                : newRecipientForm
            const finalRecipient: any = await recipientSearch.getOrCreateClient(recipientPayload)

            if (finalSender.id === finalRecipient.id) {
                throw new Error('El remitente y el destinatario no pueden ser el mismo registro en la base de datos.')
            }

            if (!authStore.user || !authStore.user.id) {
                throw new Error('Debe iniciar sesión para registrar paquetes.')
            }

            let secretaryId = null
            try {
                const secretaryResponse: any = await apiFetch(`/secretaries/by-user/${authStore.user.id}`, { method: 'GET' })
                secretaryId = secretaryResponse.id
            } catch (error) {
                throw new Error('No se pudo verificar su rol de secretario o no tiene los permisos suficientes.')
            }

            const packagePayload = {
                tracking_number: packageData.tracking_number,
                total_weight: packageData.total_weight || null,
                total_declared_value: packageData.total_declared_value || null,
                notes: packageData.notes || null,
                status: tripId ? 'assigned_to_trip' : 'registered_at_office',
                sender_id: finalSender.id,
                recipient_id: finalRecipient.id,
                secretary_id: secretaryId,
                trip_id: tripId ? Number(tripId) : null,
                payment_status: packageData.payment_status,
                payment_method: packageData.payment_status === 'paid_on_send' ? packageData.payment_method : null,
                items: packageData.items.map(item => ({
                    quantity: item.quantity,
                    description: item.description,
                    unit_price: item.unit_price
                }))
            }

            const response = await dispatch(createPackage(packagePayload)).unwrap()

            if (response) {
                setRegisteredPackageData({
                    id: response.id,
                    tracking_number: response.tracking_number,
                    origin: packageData.origin,
                    destination: packageData.destination,
                    sender: {
                        firstname: finalSender.firstname,
                        lastname: finalSender.lastname,
                        document_id: finalSender.document_id,
                        phone: finalSender.phone
                    },
                    recipient: {
                        firstname: finalRecipient.firstname,
                        lastname: finalRecipient.lastname,
                        document_id: finalRecipient.document_id,
                        phone: finalRecipient.phone
                    },
                    items: response.items || packageData.items,
                    total_amount: response.total_amount || totalAmount,
                    total_items_count: response.total_items_count || totalItemsCount,
                    created_at: response.created_at || new Date().toISOString()
                })

                setShowReceiptModal(true)
                if (onPackageRegistered) onPackageRegistered(response)
                resetForm()
            }
        } catch (error: any) {
            console.error('Error registrando encomienda:', error)
            setFormErrorMessage(error.message || error.data?.detail || 'Hubo un error al registrar la encomienda.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const closeReceiptModal = () => {
        setShowReceiptModal(false)
        setRegisteredPackageData({})
        onClose()
    }

    if (!show && !showReceiptModal) return null

    return (
        <>
            <div className={cn("fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 modal-overlay-bokeh backdrop-blur-sm transition-all duration-300", showReceiptModal ? "hidden" : "opacity-100")}>
                <div className="absolute inset-0" aria-hidden="true" onClick={onClose}></div>

                <div
                    className="relative bg-gray-50 rounded-2xl text-left shadow-2xl transform transition-all w-full max-w-6xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-100/50"
                    onClick={(e) => e.stopPropagation()}
                >              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between border-b rounded-t-xl">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/10 p-1.5 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">Emisión de Encomienda</h3>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-white text-right">
                                <div className="text-[10px] font-medium text-blue-200 uppercase tracking-wider">No. Seguimiento</div>
                                <div className="text-lg font-bold tracking-wider leading-none">{packageNumber}</div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar bg-gray-50/50">
                        <form onSubmit={submitPackage} className="space-y-4">

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                                    <FormInput
                                        label="Origen *"
                                        value={packageData.origin}
                                        onChange={(e) => setPackageData(prev => ({ ...prev, origin: e.target.value }))}
                                        type="text"
                                        placeholder="Ej: Comarapa"
                                        error={fieldErrors.origin}
                                        required
                                    />
                                    <FormInput
                                        label="Destino *"
                                        value={packageData.destination}
                                        onChange={(e) => setPackageData(prev => ({ ...prev, destination: e.target.value }))}
                                        required
                                        placeholder="Ej: Santa Cruz"
                                        error={fieldErrors.destination}
                                    />

                                    <FormSelect
                                        label="Estado del Pago *"
                                        value={packageData.payment_status}
                                        onChange={(val) => setPackageData(prev => ({ ...prev, payment_status: val }))}
                                        required
                                        options={[
                                            { value: 'paid_on_send', label: 'Pagado al enviar' },
                                            { value: 'collect_on_delivery', label: 'Por cobrar en destino' }
                                        ]}
                                    />
                                    {packageData.payment_status === 'paid_on_send' ? (
                                        <FormSelect
                                            label="Método *"
                                            value={packageData.payment_method}
                                            onChange={(val) => setPackageData(prev => ({ ...prev, payment_method: val }))}
                                            required
                                            options={[
                                                { value: 'cash', label: '💵 Físico' },
                                                { value: 'qr', label: '📱 QR/Transf.' }
                                            ]}
                                        />
                                    ) : (
                                        <div className="hidden md:block"></div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                                        <div className="flex items-center h-[38px]">
                                            {tripId ? (
                                                <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 w-full justify-center">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                                                    Asignado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 w-full justify-center">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                                                    En oficina
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                                            <svg className="w-4 h-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                            </svg>
                                            Remitente
                                        </h4>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <label className={cn("flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm",
                                                senderSearch.clientType === 'existing' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                                <input type="radio" checked={senderSearch.clientType === 'existing'} onChange={() => senderSearch.setClientType('existing')} className="sr-only" />
                                                Cliente Existente
                                            </label>

                                            <label className={cn("flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm",
                                                senderSearch.clientType === 'new' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                                <input type="radio" checked={senderSearch.clientType === 'new'} onChange={() => senderSearch.setClientType('new')} className="sr-only" />
                                                Cliente Nuevo
                                            </label>
                                        </div>

                                        {senderSearch.clientType === 'existing' ? (
                                            <div className="flex-1 flex flex-col relative w-full h-full min-h-[140px]">
                                                <div className="mb-2">
                                                    <input
                                                        value={senderSearch.clientSearchQuery}
                                                        onChange={(e) => senderSearch.searchClients(e.target.value)}
                                                        type="text"
                                                        className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                                        placeholder="Buscar por nombre, apellido o CI..."
                                                    />
                                                </div>

                                                {senderSearch.searchingClients ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                                    </div>
                                                ) : senderSearch.hasSearched && senderSearch.foundClients.length > 0 && !senderSearch.hasSelectedExistingClient ? (
                                                    <div className="absolute z-10 w-full top-[42px] bg-white shadow-lg border border-gray-200 rounded-lg">
                                                        <div className="max-h-32 overflow-y-auto">
                                                            {senderSearch.foundClients.map(client => (
                                                                <div key={client.id} onClick={() => senderSearch.selectExistingClient(client)}
                                                                    className="p-2 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-all text-sm">
                                                                    <div className="font-medium text-gray-900">{client.firstname} {client.lastname}</div>
                                                                    <div className="text-xs text-gray-500">CI: {client.document_id}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : senderSearch.hasSearched && senderSearch.foundClients.length === 0 && !senderSearch.hasSelectedExistingClient ? (
                                                    <div className="text-center py-2">
                                                        <p className="text-xs text-gray-500">No se encontraron clientes.</p>
                                                    </div>
                                                ) : null}

                                                {senderSearch.hasSelectedExistingClient && senderSearch.selectedExistingClient && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 shadow-sm relative">
                                                        <button onClick={senderSearch.clearExistingClientSelection} type="button" className="absolute top-2 right-2 text-blue-400 hover:text-blue-700">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                        <h5 className="font-semibold text-sm text-blue-900 leading-tight mb-1">{senderSearch.selectedExistingClient.firstname} {senderSearch.selectedExistingClient.lastname}</h5>
                                                        <p className="text-xs text-blue-700">CI: {senderSearch.selectedExistingClient.document_id} {senderSearch.selectedExistingClient.phone && <span>• Cel: {senderSearch.selectedExistingClient.phone}</span>}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 h-full min-h-[140px] items-start">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                                                    <input value={newSenderForm.firstname} onChange={e => setNewSenderForm(p => ({ ...p, firstname: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                                                    <input value={newSenderForm.lastname} onChange={e => setNewSenderForm(p => ({ ...p, lastname: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">CI/Doc *</label>
                                                    <input value={newSenderForm.document_id} onChange={e => setNewSenderForm(p => ({ ...p, document_id: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                                    <input value={newSenderForm.phone} onChange={e => setNewSenderForm(p => ({ ...p, phone: e.target.value }))} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5 border" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-gray-900 flex items-center uppercase tracking-wide">
                                                <svg className="w-4 h-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Consignatario
                                            </h4>
                                            {hasSender && hasRecipient && String(getSenderDocument()) !== String(getRecipientDocument()) && (
                                                <button type="button" onClick={copySenderToRecipient} className="text-xs font-medium text-gray-500 hover:text-green-600 transition-colors uppercase tracking-wider flex items-center">
                                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                                    </svg>
                                                    MISMA PERSONA?
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <label className={cn("flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm",
                                                recipientSearch.clientType === 'existing' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                                <input type="radio" checked={recipientSearch.clientType === 'existing'} onChange={() => recipientSearch.setClientType('existing')} className="sr-only" />
                                                Cliente Existente
                                            </label>

                                            <label className={cn("flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm",
                                                recipientSearch.clientType === 'new' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}>
                                                <input type="radio" checked={recipientSearch.clientType === 'new'} onChange={() => recipientSearch.setClientType('new')} className="sr-only" />
                                                Cliente Nuevo
                                            </label>
                                        </div>

                                        {recipientSearch.clientType === 'existing' ? (
                                            <div className="flex-1 flex flex-col relative w-full h-full min-h-[140px]">
                                                <div className="mb-2">
                                                    <input
                                                        value={recipientSearch.clientSearchQuery}
                                                        onChange={(e) => recipientSearch.searchClients(e.target.value)}
                                                        type="text"
                                                        className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2 border"
                                                        placeholder="Buscar por nombre, apellido o CI..."
                                                    />
                                                </div>

                                                {recipientSearch.searchingClients ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                                    </div>
                                                ) : recipientSearch.hasSearched && recipientSearch.foundClients.length > 0 && !recipientSearch.hasSelectedExistingClient ? (
                                                    <div className="absolute z-10 w-full top-[42px] bg-white shadow-lg border border-gray-200 rounded-lg">
                                                        <div className="max-h-32 overflow-y-auto">
                                                            {recipientSearch.foundClients.map(client => (
                                                                <div key={client.id} onClick={() => recipientSearch.selectExistingClient(client)}
                                                                    className="p-2 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-all text-sm">
                                                                    <div className="font-medium text-gray-900">{client.firstname} {client.lastname}</div>
                                                                    <div className="text-xs text-gray-500">CI: {client.document_id}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : recipientSearch.hasSearched && recipientSearch.foundClients.length === 0 && !recipientSearch.hasSelectedExistingClient ? (
                                                    <div className="text-center py-2">
                                                        <p className="text-xs text-gray-500">No se encontraron clientes.</p>
                                                    </div>
                                                ) : null}

                                                {recipientSearch.hasSelectedExistingClient && recipientSearch.selectedExistingClient && (
                                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-1 shadow-sm relative">
                                                        <button onClick={recipientSearch.clearExistingClientSelection} type="button" className="absolute top-2 right-2 text-green-400 hover:text-green-700">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                        <h5 className="font-semibold text-sm text-green-900 leading-tight mb-1">{recipientSearch.selectedExistingClient.firstname} {recipientSearch.selectedExistingClient.lastname}</h5>
                                                        <p className="text-xs text-green-700">CI: {recipientSearch.selectedExistingClient.document_id} {recipientSearch.selectedExistingClient.phone && <span>• Cel: {recipientSearch.selectedExistingClient.phone}</span>}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 h-full min-h-[140px] items-start">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                                                    <input value={newRecipientForm.firstname} onChange={e => setNewRecipientForm(p => ({ ...p, firstname: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                                                    <input value={newRecipientForm.lastname} onChange={e => setNewRecipientForm(p => ({ ...p, lastname: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">CI/Doc *</label>
                                                    <input value={newRecipientForm.document_id} onChange={e => setNewRecipientForm(p => ({ ...p, document_id: e.target.value }))} required className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5 border" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                                    <input value={newRecipientForm.phone} onChange={e => setNewRecipientForm(p => ({ ...p, phone: e.target.value }))} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5 border" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {isSamePerson && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 col-span-1 md:col-span-2 flex items-center mb-2">
                                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                            </svg>
                                            <p className="text-xs text-red-800 font-medium">El remitente y el destinatario no pueden ser la misma persona.</p>
                                        </div>
                                    )}

                                    <div className="col-span-1 md:col-span-2 text-xs flex mt-auto gap-4">
                                        <div className="flex-1 bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-yellow-800 flex items-start">
                                            <svg className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                                            Aviso Legal: La empresa no se responsabiliza de mercancía que no coincida con el contenido declarado. Sin reclamo pasados los 30 días.
                                        </div>
                                        <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 flex items-center">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={packageData.received_confirmation}
                                                    onChange={(e) => setPackageData(prev => ({ ...prev, received_confirmation: e.target.checked }))}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="ml-2 text-xs font-medium text-gray-900 leading-tight">El cliente declara que el contenido es lícito y RECIBE CONFORME su comprobante.</span>
                                            </label>
                                        </div>
                                    </div>

                                </div>

                                <div className="lg:col-span-4 space-y-4">
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-full">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                                            <svg className="w-4 h-4 text-indigo-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                            </svg>
                                            Detalle Artículos
                                        </h4>

                                        <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col max-h-[220px]">
                                            <div className="overflow-y-auto w-full">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Cant.</th>
                                                            <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Detalle</th>
                                                            <th className="px-2 py-2 text-right text-[10px] font-medium text-gray-500 uppercase">Total (Bs)</th>
                                                            <th className="px-2 py-2 w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                        {packageData.items.map((item, index) => (
                                                            <tr key={index} className="group">
                                                                <td className="px-2 py-1.5 align-top">
                                                                    <input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                                        min="1"
                                                                        className="w-12 px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-center"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1.5 align-top w-full">
                                                                    <input
                                                                        type="text"
                                                                        value={item.description}
                                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                        placeholder="Ej: Ropa"
                                                                        className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all border"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1.5 align-top">
                                                                    <input
                                                                        type="number"
                                                                        value={item.unit_price}
                                                                        onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                                        min="0" step="0.5"
                                                                        className="w-16 px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-right border"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-1.5 text-right align-middle">
                                                                    {packageData.items.length > 1 && (
                                                                        <button onClick={() => removeItem(index)} type="button" className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded p-1 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100">
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <button onClick={addItem} type="button" className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors w-full text-center py-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                                            + Añadir Ítem
                                        </button>

                                        <div className="mt-auto pt-4 border-t border-gray-100">
                                            <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                                                <span className="text-sm text-gray-600 font-medium">Total a Pagar</span>
                                                <span className="text-lg font-bold text-blue-900">Bs. {totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 mt-2 flex flex-col md:flex-row md:justify-between items-center gap-4">
                                {formErrorMessage ? (
                                    <div className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm flex-1 text-left w-full">
                                        {formErrorMessage}
                                    </div>
                                ) : (
                                    <div className="flex-1"></div>
                                )}

                                <div className="flex space-x-3 w-full md:w-auto">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 md:flex-none px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !isFormValid}
                                        className="flex-1 md:flex-none px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {isSubmitting && (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        <span>{isSubmitting ? 'Procesando...' : 'Confirmar Encomienda'}</span>
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div >

            <PackageReceiptModal
                show={showReceiptModal}
                packageData={registeredPackageData}
                onClose={closeReceiptModal}
            />
        </>
    )
}
