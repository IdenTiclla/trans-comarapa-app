/* eslint-disable @typescript-eslint/no-explicit-any */
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import { Button } from '@/components/ui/button'

interface DispatchState {
    show: boolean
    setShow: (v: boolean) => void
    executing: boolean
    execute: () => void
}

interface FinishState {
    show: boolean
    setShow: (v: boolean) => void
    executing: boolean
    execute: () => void
}

interface ConfirmSaleState {
    show: boolean
    ticket: any
    executing: boolean
    execute: () => void
    close: () => void
}

interface SeatChangeState {
    mode: boolean
    ticket: any
    newSeat: any
    showConfirm: boolean
    loading: boolean
    confirm: () => void
    cancel: () => void
}

interface TicketSaleState {
    show: boolean
    actionType: 'sell' | 'reserve'
    seats: any[]
    close: () => void
    onCreated: () => void
}

interface Props {
    trip: any
    dispatch: DispatchState
    finish: FinishState
    confirmSale: ConfirmSaleState
    seatChange: SeatChangeState
    ticketSale: TicketSaleState
}

export function TripConfirmationModals({ trip, dispatch, finish, confirmSale, seatChange, ticketSale }: Props) {
    return (
        <>
            {/* Dispatch Modal */}
            {dispatch.show && (
                <div className="fixed inset-0 z-50 modal-overlay-bokeh backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100"><svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div>
                            <div><h3 className="text-lg font-medium text-gray-900">Despachar Viaje</h3><p className="text-sm text-gray-500 mt-2">¿Estás seguro? Las encomiendas asignadas pasarán a "En tránsito".</p></div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => dispatch.setShow(false)} disabled={dispatch.executing}>Cancelar</Button>
                            <Button onClick={dispatch.execute} disabled={dispatch.executing} className="bg-blue-600 hover:bg-blue-700">{dispatch.executing ? 'Despachando...' : 'Sí, despachar'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Finish Modal */}
            {finish.show && (
                <div className="fixed inset-0 z-50 modal-overlay-bokeh backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100"><svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                            <div><h3 className="text-lg font-medium text-gray-900">Terminar Viaje</h3><p className="text-sm text-gray-500 mt-2">¿Estás seguro? Las encomiendas en tránsito pasarán a "En destino".</p></div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => finish.setShow(false)} disabled={finish.executing}>Cancelar</Button>
                            <Button onClick={finish.execute} disabled={finish.executing} className="bg-green-600 hover:bg-green-700">{finish.executing ? 'Terminando...' : 'Sí, terminar'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Sale Modal */}
            <TicketSaleModal
                show={ticketSale.show}
                trip={trip}
                selectedSeats={ticketSale.seats}
                actionType={ticketSale.actionType}
                onClose={ticketSale.close}
                onTicketCreated={ticketSale.onCreated}
            />

            {/* Confirm Sale Modal */}
            {confirmSale.show && confirmSale.ticket && (
                <div className="fixed inset-0 z-50 modal-overlay-bokeh backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Confirmar Venta</h3>
                                <p className="text-sm text-gray-500 mt-2">¿Confirmar la venta del asiento {confirmSale.ticket.seat?.seat_number} para {confirmSale.ticket.client?.firstname} {confirmSale.ticket.client?.lastname}?</p>
                                <p className="text-sm font-bold mt-2">Monto a cobrar: Bs. {confirmSale.ticket.price}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={confirmSale.close} disabled={confirmSale.executing}>Cancelar</Button>
                            <Button onClick={confirmSale.execute} disabled={confirmSale.executing} className="bg-blue-600 hover:bg-blue-700">{confirmSale.executing ? 'Confirmando...' : 'Confirmar Venta'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Seat Change Modal */}
            {seatChange.showConfirm && seatChange.ticket && seatChange.newSeat && (
                <div className="fixed inset-0 z-50 modal-overlay-bokeh backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Confirmar Cambio de Asiento</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    ¿Mover al pasajero <strong>{seatChange.ticket.client?.firstname} {seatChange.ticket.client?.lastname}</strong> del asiento <strong>{seatChange.ticket.seat?.seat_number}</strong> al asiento <strong>{seatChange.newSeat.number}</strong>?
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={seatChange.cancel} disabled={seatChange.loading}>Cancelar</Button>
                            <Button onClick={seatChange.confirm} disabled={seatChange.loading} className="bg-orange-600 hover:bg-orange-700">{seatChange.loading ? 'Cambiando...' : 'Confirmar Cambio'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
