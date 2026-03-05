import TicketDisplay from './TicketDisplay'

interface TicketModalProps {
    show: boolean
    ticket?: any
    trip?: any
    modalType?: 'details' | 'cancel'
    cancelling?: boolean
    onClose: () => void
    onConfirmCancel?: () => void
    onPrint?: () => void
}

export default function TicketModal({
    show,
    ticket,
    trip,
    modalType = 'details',
    cancelling = false,
    onClose,
    onConfirmCancel,
    onPrint
}: TicketModalProps) {
    if (!show) return null

    const getClientName = (client: any) => {
        return client ? `${client.firstname || ''} ${client.lastname || ''}`.trim() : 'Sin cliente'
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-60" aria-hidden="true" onClick={onClose} />
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {modalType === 'details' ? (
                    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Detalles del Boleto</h3>
                                        <p className="text-blue-100 text-sm">Boleto #{ticket?.id}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                {ticket && trip && <TicketDisplay ticket={ticket} trip={trip} previewMode={true} />}
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3 border-t border-gray-200">
                            {onPrint && (
                                <button onClick={onPrint} className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    Imprimir Boleto
                                </button>
                            )}
                            <button onClick={onClose} className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md">
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg leading-6 font-medium text-white">Cancelar Reserva</h3>
                                <button onClick={onClose} className="text-white hover:text-gray-200 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <p className="mt-1 text-sm text-red-100">Confirma la cancelación de la reserva</p>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                </div>
                                <div className="ml-4 w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Cancelar Reserva</h3>
                                    {ticket && (
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div><p className="text-gray-500">Boleto #:</p><p className="font-medium">{ticket.id}</p></div>
                                                <div><p className="text-gray-500">Estado:</p><p className="font-medium">{ticket.state}</p></div>
                                                <div><p className="text-gray-500">Asiento:</p><p className="font-medium">{ticket.seat?.seat_number}</p></div>
                                                <div><p className="text-gray-500">Precio:</p><p className="font-medium">Bs. {ticket.price}</p></div>
                                                <div className="col-span-2"><p className="text-gray-500">Cliente:</p><p className="font-medium">{getClientName(ticket.client)}</p></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        <p>¿Está seguro que desea cancelar la reserva del asiento {ticket?.seat?.seat_number}?</p>
                                        <p className="mt-2 text-red-600 font-medium">Esta acción no se puede deshacer.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
                            {onConfirmCancel && (
                                <button onClick={onConfirmCancel} disabled={cancelling} className="inline-flex items-center justify-center px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                                    {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
                                </button>
                            )}
                            <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
