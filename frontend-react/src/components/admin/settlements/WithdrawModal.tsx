import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select as SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { TripFinancial } from '@/hooks/use-owner-settlements'
import { fmt } from './settlement-utils'

interface Props {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    tripsWithBalance: TripFinancial[]
    processing: boolean
    onSubmit: (tripId: number, officeId: number, amount: number) => void
}

export function WithdrawModal({ isOpen, onOpenChange, tripsWithBalance, processing, onSubmit }: Props) {
    const [selectedTrip, setSelectedTrip] = useState<string>('')
    const [selectedOffice, setSelectedOffice] = useState<string>('')
    const [amount, setAmount] = useState<string>('0.00')

    const tripData = selectedTrip
        ? tripsWithBalance.find(t => t.trip_id === Number(selectedTrip))
        : null

    const officeData = tripData && selectedOffice
        ? tripData.office_breakdown.find(o => o.office_id === Number(selectedOffice))
        : null

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedTrip('')
            setSelectedOffice('')
            setAmount('0.00')
        }
        onOpenChange(open)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedTrip || !selectedOffice) return
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return
        if (officeData && numAmount > officeData.available) return
        onSubmit(Number(selectedTrip), Number(selectedOffice), numAmount)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Iniciar Retiro</DialogTitle>
                    <DialogDescription>Selecciona un viaje y oficina con saldo disponible.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Trip Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Viaje</label>
                        <SelectRoot value={selectedTrip} onValueChange={(v) => {
                            setSelectedTrip(v)
                            setSelectedOffice('')
                            setAmount('0.00')
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un viaje" />
                            </SelectTrigger>
                            <SelectContent>
                                {tripsWithBalance.map(t => (
                                    <SelectItem key={t.trip_id} value={String(t.trip_id)}>
                                        #{t.trip_id} · {t.route_name} · {t.bus_plate} (Disp: {fmt(t.available_balance)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </div>

                    {/* Office Selector */}
                    {tripData && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Oficina</label>
                            <SelectRoot value={selectedOffice} onValueChange={(v) => {
                                setSelectedOffice(v)
                                const off = tripData.office_breakdown.find(o => o.office_id === Number(v))
                                setAmount(off?.available.toFixed(2) ?? '0.00')
                            }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona una oficina" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tripData.office_breakdown.filter(o => o.available > 0).map(o => (
                                        <SelectItem key={o.office_id} value={String(o.office_id)}>
                                            {o.office_name} (Disp: {fmt(o.available)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </div>
                    )}

                    {/* Office details summary */}
                    {officeData && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Boletos</span>
                                <span className="tabular-nums">{fmt(officeData.tickets_amount)}</span>
                            </div>
                            {officeData.packages_paid_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Enc. pagadas</span>
                                    <span className="tabular-nums">{fmt(officeData.packages_paid_amount)}</span>
                                </div>
                            )}
                            {officeData.packages_collected_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">Enc. cobradas</span>
                                    <span className="tabular-nums">{fmt(officeData.packages_collected_amount)}</span>
                                </div>
                            )}
                            {officeData.withdrawn_amount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Ya retirado</span>
                                    <span className="tabular-nums">-{fmt(officeData.withdrawn_amount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-1 flex justify-between font-semibold text-comarapa-dark">
                                <span>Disponible</span>
                                <span className="tabular-nums">{fmt(officeData.available)}</span>
                            </div>
                        </div>
                    )}

                    {/* Amount input */}
                    {officeData && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto a Retirar (Bs.)</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                pattern="^\d+(\.\d{0,2})?$"
                                required
                                value={amount}
                                onChange={e => {
                                    const val = e.target.value
                                    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') setAmount(val)
                                }}
                                onBlur={() => {
                                    const num = parseFloat(amount)
                                    if (!isNaN(num) && num > 0) setAmount(num.toFixed(2))
                                }}
                                className="w-full text-lg rounded-lg border border-gray-300 px-4 py-2.5 focus:border-comarapa-medium focus:ring-2 focus:ring-comarapa-light/30 transition-shadow outline-none font-medium text-gray-900"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !selectedOffice}
                            className="bg-comarapa-dark hover:bg-navy-800"
                        >
                            {processing ? 'Procesando...' : 'Confirmar Retiro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
