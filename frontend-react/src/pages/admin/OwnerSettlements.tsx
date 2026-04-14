import {
    Select as SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useOwnerSettlements } from '@/hooks/use-owner-settlements'
import { LiquiditySummaryCards } from '@/components/admin/settlements/LiquiditySummaryCards'
import { OfficeBreakdownGrid } from '@/components/admin/settlements/OfficeBreakdownGrid'
import { PartnerAssetsCard } from '@/components/admin/settlements/PartnerAssetsCard'
import { WithdrawalHistoryTable } from '@/components/admin/settlements/WithdrawalHistoryTable'
import { WithdrawModal } from '@/components/admin/settlements/WithdrawModal'

export function Component() {
    const {
        owners, selectedOwnerId, setSelectedOwnerId,
        buses, selectedBusId, setSelectedBusId,
        financials, withdrawalsHistory, loading, loadingOwners,
        isModalOpen, setIsModalOpen, processing,
        ownerId, officeId, totals, aggregatedOffices,
        tripsWithBalance, selectedOwner, handleWithdraw,
    } = useOwnerSettlements()

    const ownerName = selectedOwner
        ? `${selectedOwner.firstname} ${selectedOwner.lastname}`
        : ''

    return (
        <div className="w-full">
            {/* ──── Page Header ──── */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                        Portafolio de Socios {ownerName && <span className="text-comarapa-dark">· {ownerName}</span>}
                    </p>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Resumen de Liquidación
                    </h1>
                </div>

                {/* Live data indicator */}
                {ownerId && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        Datos en Tiempo Real
                    </div>
                )}
            </div>

            {/* ──── Selectors ──── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Seleccionar Socio
                        </label>
                        {loadingOwners ? (
                            <div className="h-9 bg-gray-100 animate-pulse rounded-md" />
                        ) : (
                            <SelectRoot
                                value={selectedOwnerId}
                                onValueChange={setSelectedOwnerId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un socio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {owners.map(o => (
                                        <SelectItem key={o.id} value={String(o.id)}>
                                            {o.firstname} {o.lastname} (CI: {o.ci})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        )}
                    </div>
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                            Unidad (Bus)
                        </label>
                        <SelectRoot value={selectedBusId} onValueChange={setSelectedBusId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos los buses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todos los buses</SelectItem>
                                {buses.map(b => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.license_plate} — {b.model ?? 'S/N'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </div>
                </div>
            </div>

            {/* ──── Content when owner selected ──── */}
            {ownerId && (
                <>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-comarapa-medium" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <LiquiditySummaryCards
                                totals={totals}
                                ownerName={ownerName}
                                hasAvailableFunds={totals.totalAvailable > 0}
                                onInitiateWithdraw={() => setIsModalOpen(true)}
                            />

                            {/* Office Breakdown */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Desglose por Oficina
                                </h2>
                                <OfficeBreakdownGrid offices={aggregatedOffices} currentOfficeId={officeId} />
                            </div>

                            {/* Bottom Section: Assets + Ledger */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-1">
                                    <PartnerAssetsCard buses={buses} financials={financials} />
                                </div>
                                <div className="lg:col-span-2">
                                    <WithdrawalHistoryTable
                                        withdrawals={withdrawalsHistory}
                                        ownerName={ownerName}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Empty State */}
            {!ownerId && !loadingOwners && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">Selecciona un socio</p>
                    <p className="text-xs text-gray-400">Elige un socio para ver el resumen de liquidación</p>
                </div>
            )}

            {/* Withdraw Modal */}
            <WithdrawModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                tripsWithBalance={tripsWithBalance}
                processing={processing}
                onSubmit={handleWithdraw}
            />
        </div>
    )
}
