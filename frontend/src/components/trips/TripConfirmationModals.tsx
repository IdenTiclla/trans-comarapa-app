import type { Trip } from '@/types'
import type { SelectedSeat } from '@/components/tickets/ticket-sale/types'
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Send, Check, DollarSign, ArrowLeftRight } from 'lucide-react'

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
    ticket: Record<string, unknown> | null
    executing: boolean
    execute: () => void
    close: () => void
}

interface SeatChangeState {
    mode: boolean
    ticket: Record<string, unknown> | null
    newSeat: SelectedSeat | null
    showConfirm: boolean
    loading: boolean
    confirm: () => void
    cancel: () => void
}

interface TicketSaleState {
    show: boolean
    actionType: 'sell' | 'reserve'
    seats: SelectedSeat[]
    close: () => void
    onCreated: () => void
}

interface Props {
    trip: Trip
    dispatch: DispatchState
    finish: FinishState
    confirmSale: ConfirmSaleState
    seatChange: SeatChangeState
    ticketSale: TicketSaleState
}

function fieldText(source: unknown, field: string) {
    if (!source || typeof source !== 'object') return ''
    const value = (source as Record<string, unknown>)[field]
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    return ''
}

export function TripConfirmationModals({ trip, dispatch, finish, confirmSale, seatChange, ticketSale }: Props) {
    const confirmSaleSeat = confirmSale.ticket?.seat
    const confirmSaleClient = confirmSale.ticket?.client
    const seatChangeClient = seatChange.ticket?.client
    const seatChangeSeat = seatChange.ticket?.seat

    return (
        <>
            <Dialog open={dispatch.show} onOpenChange={(open) => { if (!open) dispatch.setShow(false) }}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                                <Send className="h-5 w-5" />
                            </span>
                            Despachar Viaje
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro? Las encomiendas asignadas pasarán a &quot;En tránsito&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => dispatch.setShow(false)} disabled={dispatch.executing}>Cancelar</Button>
                        <Button onClick={dispatch.execute} disabled={dispatch.executing}>{dispatch.executing ? 'Despachando...' : 'Sí, despachar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={finish.show} onOpenChange={(open) => { if (!open) finish.setShow(false) }}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-status-available/10 text-status-available">
                                <Check className="h-5 w-5" />
                            </span>
                            Terminar Viaje
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro? Las encomiendas en tránsito pasarán a &quot;En destino&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => finish.setShow(false)} disabled={finish.executing}>Cancelar</Button>
                        <Button onClick={finish.execute} disabled={finish.executing}>{finish.executing ? 'Terminando...' : 'Sí, terminar'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TicketSaleModal
                show={ticketSale.show}
                trip={trip}
                selectedSeats={ticketSale.seats}
                actionType={ticketSale.actionType}
                onClose={ticketSale.close}
                onTicketCreated={ticketSale.onCreated}
            />

            {confirmSale.show && confirmSale.ticket && (
                <Dialog open onOpenChange={(open) => { if (!open) confirmSale.close() }}>
                    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                                    <DollarSign className="h-5 w-5" />
                                </span>
                                Confirmar Venta
                            </DialogTitle>
                            <DialogDescription>
                                ¿Confirmar la venta del asiento {fieldText(confirmSaleSeat, 'seat_number')} para {fieldText(confirmSaleClient, 'firstname')} {fieldText(confirmSaleClient, 'lastname')}?
                            </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm font-bold text-foreground">Monto a cobrar: Bs. {fieldText(confirmSale.ticket, 'price')}</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={confirmSale.close} disabled={confirmSale.executing}>Cancelar</Button>
                            <Button onClick={confirmSale.execute} disabled={confirmSale.executing}>{confirmSale.executing ? 'Confirmando...' : 'Confirmar Venta'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {seatChange.showConfirm && seatChange.ticket && seatChange.newSeat && (
                <Dialog open onOpenChange={(open) => { if (!open) seatChange.cancel() }}>
                    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-status-medium/10 text-status-medium">
                                    <ArrowLeftRight className="h-5 w-5" />
                                </span>
                                Confirmar Cambio de Asiento
                            </DialogTitle>
                            <DialogDescription>
                                ¿Mover al pasajero <strong className="text-foreground">{fieldText(seatChangeClient, 'firstname')} {fieldText(seatChangeClient, 'lastname')}</strong> del asiento <strong className="text-foreground">{fieldText(seatChangeSeat, 'seat_number')}</strong> al asiento <strong className="text-foreground">{seatChange.newSeat.number}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={seatChange.cancel} disabled={seatChange.loading}>Cancelar</Button>
                            <Button onClick={seatChange.confirm} disabled={seatChange.loading}>{seatChange.loading ? 'Cambiando...' : 'Confirmar Cambio'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
