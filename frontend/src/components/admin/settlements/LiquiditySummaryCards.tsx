import { Button } from '@/components/ui/button'
import { Banknote } from 'lucide-react'
import type { SettlementTotals } from '@/hooks/use-owner-settlements'
import { fmt } from './settlement-utils'

interface Props {
    totals: SettlementTotals
    ownerName: string
    hasAvailableFunds: boolean
    onInitiateWithdraw: () => void
}

export function LiquiditySummaryCards({ totals, ownerName, hasAvailableFunds, onInitiateWithdraw }: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* Main Liquidity Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Liquidez Total del Socio <span className="text-comarapa-dark font-semibold">({ownerName})</span>
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-sm text-gray-400">Bs.</span>
                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight tabular-nums">
                        {totals.totalAvailable.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="flex flex-wrap gap-8 border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total Recaudado</p>
                        <p className="text-sm font-bold text-gray-700 tabular-nums">{fmt(totals.totalCollected)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total Retirado</p>
                        <p className="text-sm font-bold text-red-600 tabular-nums">{fmt(totals.totalWithdrawn)}</p>
                    </div>
                    {totals.totalPending > 0 && (
                        <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Pendiente Cobro</p>
                            <p className="text-sm font-bold text-amber-600 tabular-nums">{fmt(totals.totalPending)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Payouts / Initiate Withdrawal Card */}
            <div className="bg-comarapa-dark rounded-xl p-6 shadow-sm flex flex-col justify-between text-white">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200 mb-1">
                        Pagos Pendientes (Socio)
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight tabular-nums mb-2">
                        {fmt(totals.totalAvailable)}
                    </p>
                    <p className="text-xs text-blue-200">
                        Disponible para retiro inmediato
                    </p>
                </div>
                {hasAvailableFunds && (
                    <Button
                        onClick={onInitiateWithdraw}
                        className="mt-5 w-full bg-white text-comarapa-dark hover:bg-gray-100 font-semibold h-11 text-sm gap-2"
                    >
                        <Banknote className="h-4 w-4" />
                        Iniciar Retiro
                    </Button>
                )}
            </div>
        </div>
    )
}
