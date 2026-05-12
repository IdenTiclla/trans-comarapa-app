import { useEffect, useMemo, useRef } from 'react'
import type { Trip } from '@/types'
import TicketDisplay from './TicketDisplay'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { COMPANY } from '@/lib/company-config'
import { TIMING } from '@/lib/timing'
import { openPrintWindow } from '@/lib/print'

interface TicketReceiptModalProps {
    show: boolean
    tickets: Record<string, unknown>[]
    trip: Trip
    onClose: () => void
    autoPrint?: boolean
}

/** Merge multiple tickets sold together into a single receipt object so we
 *  render ONE boleto with all seat numbers and the combined total. All
 *  tickets in a multi-seat sale share the same client, trip and destination,
 *  so we take those from the first ticket. */
function mergeTickets(tickets: Record<string, unknown>[]): Record<string, unknown> {
    if (tickets.length === 0) return {}
    if (tickets.length === 1) return tickets[0]

    const first = tickets[0]
    const seats = tickets
        .map((t) => t.seat as Record<string, unknown> | undefined)
        .filter((s): s is Record<string, unknown> => Boolean(s))
    const totalPrice = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0)
    const ids = tickets.map((t) => t.id).filter(Boolean)

    return {
        ...first,
        seats,
        price: totalPrice,
        id: ids.length > 1 ? `${ids[0]}-${ids[ids.length - 1]}` : ids[0],
    }
}

export default function TicketReceiptModal({ show, tickets, trip, onClose, autoPrint = false }: TicketReceiptModalProps) {
    const mergedTicket = useMemo(() => mergeTickets(tickets), [tickets])
    const seatNumbers = useMemo(
        () =>
            tickets
                .map((t) => (t.seat as { seat_number?: number | string } | undefined)?.seat_number)
                .filter(Boolean)
                .join(', '),
        [tickets],
    )
    const autoPrintedRef = useRef(false)

    const printReceipt = () => {
        const printContent = document.getElementById('ticket-receipt-content')
        if (!printContent) return

        const body = `
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                .ticket-container { max-width: 800px; margin: 0 auto; }
                @media print {
                    body { margin: 0; color: black; }
                    .ticket-container { max-width: none; margin: 0; }
                }
            </style>
            <div class="ticket-container">${printContent.innerHTML}</div>
        `
        openPrintWindow(body, `Boleto - ${COMPANY.name}`)
    }

    useEffect(() => {
        if (!show) {
            autoPrintedRef.current = false
            return
        }
        if (autoPrint && !autoPrintedRef.current && tickets.length > 0) {
            autoPrintedRef.current = true
            const timer = setTimeout(() => printReceipt(), TIMING.PRINT_OPEN_DELAY)
            return () => { clearTimeout(timer) }
        }
    }, [show, autoPrint, tickets.length])

    if (!show || tickets.length === 0) return null

    return (
        <Dialog open={show} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-[42rem] p-0 gap-0 overflow-hidden bg-white border border-gray-100/50">
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex flex-row items-center justify-between border-b shrink-0 space-y-0 text-left">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg" aria-hidden="true">
                            <svg aria-hidden="true" className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white">
                                Boleto Registrado
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 text-sm">
                                Asiento{tickets.length > 1 ? 's' : ''}: {seatNumbers}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div id="ticket-receipt-content" className="bg-gray-50 p-4">
                    <div className="mx-auto">
                        <TicketDisplay ticket={mergedTicket} trip={trip} previewMode={false} />
                    </div>
                </div>

                <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={printReceipt}
                        className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                        Imprimir Boleto
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
