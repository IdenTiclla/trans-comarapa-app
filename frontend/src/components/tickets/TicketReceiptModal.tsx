/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import TicketDisplay from './TicketDisplay'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface TicketReceiptModalProps {
    show: boolean
    tickets: any[]
    trip: any
    onClose: () => void
    autoPrint?: boolean
}

export default function TicketReceiptModal({ show, tickets, trip, onClose, autoPrint = false }: TicketReceiptModalProps) {
    const autoPrintedRef = useRef(false)

    const printReceipt = () => {
        const printContent = document.getElementById('ticket-receipt-content')
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Boleto - Trans Comarapa</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .ticket-container { max-width: 800px; margin: 0 auto; }
                    .ticket-container + .ticket-container { margin-top: 40px; page-break-before: always; }

                    @media print {
                        body { margin: 0; color: black; }
                        .ticket-container { max-width: none; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    ${printContent.innerHTML}
                </div>
            </body>
            </html>
        `)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 300)
    }

    useEffect(() => {
        if (!show) {
            autoPrintedRef.current = false
            return
        }
        if (autoPrint && !autoPrintedRef.current && tickets.length > 0) {
            autoPrintedRef.current = true
            const timer = setTimeout(() => printReceipt(), 200)
            return () => clearTimeout(timer)
        }
    }, [show, autoPrint, tickets.length])

    if (!show || tickets.length === 0) return null

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 modal-overlay-bokeh backdrop-blur-sm transition-all duration-300 opacity-100">
            <div className="absolute inset-0" aria-hidden="true" onClick={onClose}></div>

            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div
                className="relative bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all w-full border border-gray-100/50"
                style={{ maxWidth: '42rem' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Boleto{tickets.length > 1 ? 's' : ''} Registrado{tickets.length > 1 ? 's' : ''}
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Asiento{tickets.length > 1 ? 's' : ''}: {tickets.map((t: any) => t.seat?.seat_number).filter(Boolean).join(', ')}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div id="ticket-receipt-content" className="bg-gray-50 p-4">
                    <div className="mx-auto space-y-6">
                        {tickets.map((ticket, index) => (
                            <div key={ticket.id || index}>
                                <TicketDisplay ticket={ticket} trip={trip} previewMode={false} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={printReceipt}
                        className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                        Imprimir Boleto{tickets.length > 1 ? 's' : ''}
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    )
}
