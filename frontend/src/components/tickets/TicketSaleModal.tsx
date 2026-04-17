import { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useClientSearch } from '@/hooks/use-client-search'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import TicketDisplay from './TicketDisplay'
import TicketReceiptModal from './TicketReceiptModal'

interface TicketSaleModalProps {
    show: boolean
    trip: any
    selectedSeats: any[]
    actionType: 'sell' | 'reserve'
    onClose: () => void
    onTicketCreated: (tickets: any[]) => void
}

export default function TicketSaleModal({
    show,
    trip,
    selectedSeats = [],
    actionType,
    onClose,
    onTicketCreated
}: TicketSaleModalProps) {
    const { user } = useSelector((state: RootState) => state.auth)

    const {
        clientType, setClientType,
        clientSearchQuery: searchTerm,
        searchClients: setSearchTerm,
        foundClients,
        searchingClients,
        hasSearched,
        selectedExistingClient,
        hasSelectedExistingClient,
        selectExistingClient: setSelectedExistingClient,
        clearExistingClientSelection,
        resetClientSearch: clearSearch
    } = useClientSearch()

    const [newClientForm, setNewClientForm] = useState({
        firstname: '',
        lastname: '',
        document_id: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        is_minor: false
    })

    const [ticketForm, setTicketForm] = useState({
        price: 0,
        payment_method: '',
        state: 'pending',
        destination: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showReceiptModal, setShowReceiptModal] = useState(false)
    const [createdTicketsData, setCreatedTicketsData] = useState<any[]>([])

    useEffect(() => {
        if (show) {
            setTicketForm(prev => ({
                ...prev,
                price: trip?.route?.price || 0,
                state: actionType === 'sell' ? 'confirmed' : 'pending',
                payment_method: '',
                destination: ''
            }))
            setNewClientForm({
                firstname: '', lastname: '', document_id: '', phone: '', email: '', address: '', city: '', state: '', is_minor: false
            })
            clearSearch()
            setHasTriedSubmit(false)
            setErrorMessage('')
        }
    }, [show, trip, actionType, clearSearch])

    const canSubmit = useMemo(() => {
        const hasClient = clientType === 'existing'
            ? hasSelectedExistingClient
            : (newClientForm.firstname && newClientForm.lastname && newClientForm.document_id)
        const hasDestination = ticketForm.destination && ticketForm.destination.trim()
        return hasClient && hasDestination && ticketForm.price > 0 && ticketForm.payment_method
    }, [clientType, hasSelectedExistingClient, newClientForm, ticketForm])

    const previewTicket = useMemo(() => {
        if (selectedSeats.length === 0) return null

        const client = clientType === 'existing'
            ? selectedExistingClient
            : {
                firstname: newClientForm.firstname || 'Cliente',
                lastname: newClientForm.lastname || '',
                document_id: newClientForm.document_id || '',
                phone: newClientForm.phone || ''
            }

        const destinationName = ticketForm.destination || trip?.route?.destination_location?.name || trip?.route?.destination || ''

        return {
            id: 'PREVIEW',
            client,
            destination: destinationName,
            seats: selectedSeats.map(seat => ({
                seat_number: seat.number,
                deck: seat.deck || 'Planta Baja'
            })),
            seat: selectedSeats.length === 1 ? {
                seat_number: selectedSeats[0].number,
                deck: selectedSeats[0].deck || 'Planta Baja'
            } : null,
            price: ticketForm.price * selectedSeats.length,
            payment_method: ticketForm.payment_method || 'cash',
            state: actionType === 'sell' ? 'confirmed' : 'pending',
            created_at: new Date().toISOString()
        }
    }, [selectedSeats, clientType, selectedExistingClient, newClientForm, ticketForm, trip, actionType])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setHasTriedSubmit(true)
        setErrorMessage('')

        if (!canSubmit) {
            if (!ticketForm.destination || !ticketForm.destination.trim()) {
                setErrorMessage('Debe ingresar un destino')
            } else if (!ticketForm.payment_method) {
                setErrorMessage('Debe seleccionar un método de pago')
            } else if (ticketForm.price <= 0) {
                setErrorMessage('El precio debe ser mayor a 0')
            } else {
                setErrorMessage('Debe completar la información del cliente')
            }
            return
        }

        try {
            setIsSubmitting(true)

            let clientId = selectedExistingClient?.id
            if (clientType === 'new') {
                const clientRes = await apiFetch('/clients', {
                    method: 'POST',
                    body: newClientForm
                })
                clientId = (clientRes as any).id
            }

            if (!trip?.seats_layout || trip.seats_layout.length === 0) {
                throw new Error('No se pudo encontrar información de asientos para este viaje')
            }

            const seats = trip.seats_layout.filter((s: any) => selectedSeats.some(selectedSeat => s.id === selectedSeat.id))

            if (seats.length === 0) {
                throw new Error(`No se pudo encontrar los asientos ${selectedSeats.map(s => s.number).join(', ')} en este viaje`)
            }

            const createdTickets = []

            for (const seat of seats) {
                const ticketData = {
                    trip_id: trip.id,
                    client_id: clientId,
                    seat_id: seat.id,
                    destination: ticketForm.destination.trim(),
                    price: ticketForm.price,
                    payment_method: ticketForm.payment_method,
                    state: ticketForm.state,
                    operator_user_id: user?.id
                }

                const createdTicket = await apiFetch('/tickets', {
                    method: 'POST',
                    body: ticketData
                })

                createdTickets.push(createdTicket)
            }

            const seatNumbers = createdTickets.map((t: any) => t.seat?.seat_number).filter(Boolean).join(', ')
            toast.success(
                actionType === 'sell' ? '¡Boleto Vendido!' : '¡Asiento Reservado!',
                {
                    description: seatNumbers ? `Asiento${createdTickets.length > 1 ? 's' : ''}: ${seatNumbers}` : undefined,
                    duration: 5000,
                }
            )

            setCreatedTicketsData(createdTickets)
            setShowReceiptModal(true)

        } catch (error: any) {
            console.error('Error al crear los boletos:', error)
            const errorDetail = error.data?.detail || error.response?._data?.detail || ''
            if (error.status === 403) {
                setErrorMessage('No tiene permisos para crear boletos.')
            } else if (error.status === 409) {
                setErrorMessage(errorDetail || 'El asiento ya está ocupado para este viaje.')
            } else if (error.status === 400) {
                setErrorMessage(errorDetail || 'Error en los datos del boleto.')
            } else {
                setErrorMessage(errorDetail || error.message || 'Error al crear los boletos')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const closeReceiptModal = () => {
        setShowReceiptModal(false)
        setCreatedTicketsData([])
        onTicketCreated(createdTicketsData)
        onClose()
    }

    if (!show && !showReceiptModal) return null

    return (
        <>
            <div className={cn("fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-300", showReceiptModal ? "hidden" : "opacity-100")}>
            <div className="absolute inset-0 modal-overlay-bokeh transition-opacity" onClick={onClose}></div>

            <div className="relative flex items-center justify-center min-h-screen p-4 pointer-events-none">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {actionType === 'sell' ? 'Vender Boleto' : 'Reservar Asiento'}
                                </h3>
                                <p className="text-blue-100 text-sm">
                                    Asientos {selectedSeats.map(seat => seat.number).join(', ')} - {trip?.route?.origin} → {trip?.route?.destination}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                        <div className="w-full lg:w-1/2 p-4 lg:p-8 shrink-0 overflow-y-auto bg-gray-50">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        Información del Cliente
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${clientType === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <input type="radio" value="existing" checked={clientType === 'existing'} onChange={() => setClientType('existing')} className="sr-only" />
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${clientType === 'existing' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                        {clientType === 'existing' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Cliente Existente</div>
                                                    <div className="text-sm text-gray-500">Buscar en base</div>
                                                </div>
                                            </div>
                                        </label>

                                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${clientType === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                            <input type="radio" value="new" checked={clientType === 'new'} onChange={() => setClientType('new')} className="sr-only" />
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${clientType === 'new' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                        {clientType === 'new' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Cliente Nuevo</div>
                                                    <div className="text-sm text-gray-500">Crear registro</div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>

                                    {clientType === 'existing' && (
                                        <div className="space-y-4">
                                            <FormInput
                                                label="Buscar Cliente"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar por nombre, apellido o CI..."
                                            />

                                            {searchingClients ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : hasSearched && foundClients.length > 0 && !hasSelectedExistingClient ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">Resultados encontrados:</p>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {foundClients.map(client => (
                                                            <div key={client.id} onClick={() => setSelectedExistingClient(client)} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                                                                <div className="font-medium text-gray-900">{client.firstname} {client.lastname}</div>
                                                                <div className="text-sm text-gray-500">CI: {client.document_id}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : hasSearched && foundClients.length === 0 && !hasSelectedExistingClient ? (
                                                <div className="text-center py-8">
                                                    <p className="mt-2 text-sm text-gray-500">No se encontraron clientes</p>
                                                </div>
                                            ) : null}

                                            {hasSelectedExistingClient && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h5 className="font-medium text-green-800">Cliente seleccionado</h5>
                                                            <p className="text-green-700">{selectedExistingClient.firstname} {selectedExistingClient.lastname}</p>
                                                            <p className="text-sm text-green-600">CI: {selectedExistingClient.document_id}</p>
                                                        </div>
                                                        <button onClick={clearExistingClientSelection} type="button" className="text-green-600 hover:text-green-800 transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {clientType === 'new' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput label="Nombres *" value={newClientForm.firstname} onChange={(e) => setNewClientForm({ ...newClientForm, firstname: e.target.value })} required placeholder="Nombres" />
                                            <FormInput label="Apellidos *" value={newClientForm.lastname} onChange={(e) => setNewClientForm({ ...newClientForm, lastname: e.target.value })} required placeholder="Apellidos" />
                                            <FormInput label="CI/Documento *" value={newClientForm.document_id} onChange={(e) => setNewClientForm({ ...newClientForm, document_id: e.target.value })} required placeholder="Carnet" />
                                            <FormInput label="Teléfono" value={newClientForm.phone} onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })} placeholder="Teléfono" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path></svg>
                                        Información del Boleto
                                    </h4>

                                    <div className="mb-4">
                                        <FormInput label="Destino *" value={ticketForm.destination} onChange={(e) => setTicketForm({ ...ticketForm, destination: e.target.value })} required placeholder="Ej: Los Negros, Samaipata..." />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Precio (Bs.) *" type="number" step="0.01" value={ticketForm.price} onChange={(e) => setTicketForm({ ...ticketForm, price: parseFloat(e.target.value) || 0 })} required placeholder="0.00" />
                                        <div>
                                            <FormSelect
                                                label="Método de Pago *"
                                                value={ticketForm.payment_method}
                                                onChange={(value) => setTicketForm({ ...ticketForm, payment_method: value })}
                                                required
                                                options={[
                                                    { value: '', label: 'Seleccionar método' },
                                                    { value: 'cash', label: '💵 Efectivo' },
                                                    { value: 'card', label: '💳 Tarjeta' },
                                                    { value: 'transfer', label: '🏦 Transferencia' },
                                                    { value: 'qr', label: '📱 QR' }
                                                ]}
                                            />
                                            {!ticketForm.payment_method && hasTriedSubmit && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    El método de pago es requerido
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {errorMessage && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </div>
                                            <div className="ml-3"><p className="text-sm font-medium text-red-800">{errorMessage}</p></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting || !canSubmit} className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center">
                                        {isSubmitting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        <span>{isSubmitting ? 'Procesando...' : actionType === 'sell' ? '🎫 Vender Boleto' : '📝 Reservar'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="w-full lg:w-1/2 p-4 lg:p-8 bg-white lg:border-l border-t lg:border-t-0 border-gray-200 shrink-0 overflow-y-auto">
                            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                Previsualización del Boleto
                            </h4>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex justify-center">
                                <div className="w-full max-w-lg">
                                    {previewTicket ? (
                                        <TicketDisplay ticket={previewTicket} trip={trip} previewMode={true} />
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="mt-4 text-gray-500 font-medium">La previsualización aparecerá aquí</p>
                                            <p className="text-sm text-gray-400">Complete la información del cliente para ver el boleto</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <TicketReceiptModal
                show={showReceiptModal}
                tickets={createdTicketsData}
                trip={trip}
                onClose={closeReceiptModal}
            />
        </>
    )
}
