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
import FormSelect from '@/components/forms/FormSelect'
import FormInput from '@/components/forms/FormInput'
import { Wallet, Building2, Ticket, Package, History, ArrowRightCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-gray-900 via-gray-800 to-navy-900 text-white">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight">Iniciar Retiro</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 font-medium">
                        Selecciona un viaje y oficina para procesar la liquidación.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <FormSelect
                        label="Seleccionar Viaje"
                        value={selectedTrip}
                        onChange={(v) => {
                            setSelectedTrip(v)
                            setSelectedOffice('')
                            setAmount('0.00')
                        }}
                        required
                        options={tripsWithBalance.map(t => ({
                            label: `#${t.trip_id} · ${t.route_name} · ${t.bus_plate} (Disp: ${fmt(t.available_balance)})`,
                            value: String(t.trip_id)
                        }))}
                        placeholder="Buscar viaje..."
                    />

                    {tripData && (
                        <FormSelect
                            label="Oficina de Retiro"
                            value={selectedOffice}
                            onChange={(v) => {
                                setSelectedOffice(v)
                                const off = tripData.office_breakdown.find(o => o.office_id === Number(v))
                                setAmount(off?.available.toFixed(2) ?? '0.00')
                            }}
                            required
                            options={tripData.office_breakdown
                                .filter(o => o.available > 0)
                                .map(o => ({
                                    label: `${o.office_name} (Sald: ${fmt(o.available)})`,
                                    value: String(o.office_id)
                                }))
                            }
                            placeholder="Seleccionar oficina..."
                        />
                    )}

                    {officeData && (
                        <div className="bg-gray-50/80 rounded-2xl border border-gray-100 p-4 space-y-3 shadow-inner">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                <span>Resumen de Saldos</span>
                                <Building2 className="w-3 h-3" />
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                        <Ticket className="w-3.5 h-3.5 opacity-40" />
                                        <span>Boletos</span>
                                    </div>
                                    <span className="font-bold text-gray-900">{fmt(officeData.tickets_amount)}</span>
                                </div>
                                
                                {officeData.packages_paid_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                            <Package className="w-3.5 h-3.5 opacity-40" />
                                            <span>Encomiendas pagadas</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{fmt(officeData.packages_paid_amount)}</span>
                                    </div>
                                )}
                                
                                {officeData.packages_collected_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                                            <ArrowRightCircle className="w-3.5 h-3.5" />
                                            <span>Cobros en destino</span>
                                        </div>
                                        <span className="font-black text-emerald-600">{fmt(officeData.packages_collected_amount)}</span>
                                    </div>
                                )}
                                
                                {officeData.withdrawn_amount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
                                            <History className="w-3.5 h-3.5" />
                                            <span>Ya retirado</span>
                                        </div>
                                        <span className="font-black text-red-500">-{fmt(officeData.withdrawn_amount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Neto Disponible</span>
                                <span className="text-xl font-black text-gray-900 tracking-tight">{fmt(officeData.available)}</span>
                            </div>
                        </div>
                    )}

                    {officeData && (
                        <FormInput
                            label="Monto a Retirar (Bs.)"
                            id="withdraw-amount"
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => {
                                const val = e.target.value
                                if (/^\d*\.?\d{0,2}$/.test(val) || val === '') setAmount(val)
                            }}
                            onBlur={() => {
                                const num = parseFloat(amount)
                                if (!isNaN(num) && num > 0) setAmount(num.toFixed(2))
                            }}
                            required
                            className="text-2xl font-black text-primary text-center tracking-tighter"
                        />
                    )}

                    <DialogFooter className="bg-gray-50 px-6 py-4 flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => handleOpenChange(false)}
                            className="rounded-xl font-bold flex-1 h-12"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !selectedOffice}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex-1 h-12 shadow-lg shadow-emerald-200"
                        >
                            {processing ? 'Procesando...' : 'Confirmar Retiro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
