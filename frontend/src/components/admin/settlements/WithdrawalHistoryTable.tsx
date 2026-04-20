import { Badge } from '@/components/ui/badge'
import type { WithdrawalEntry } from '@/hooks/use-owner-settlements'
import { fmt, formatDate, formatDateTime } from './settlement-utils'

interface Props {
    withdrawals: WithdrawalEntry[]
    ownerName: string
}

export function WithdrawalHistoryTable({ withdrawals, ownerName }: Props) {
    const displayedWithdrawals = withdrawals.slice(0, 8)
    const hasMore = withdrawals.length > 8

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-bold text-gray-900">Historial de Liquidación Reciente</h3>
                    <span className="text-xs text-gray-400 italic">({ownerName})</span>
                </div>
            </div>

            {withdrawals.length === 0 ? (
                <div className="text-center py-12 px-5 text-gray-400">
                    <p className="text-sm">No hay retiros registrados para este socio.</p>
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                        {/* eslint-disable-next-line no-restricted-syntax */}
                        <table className="w-full">
                            <thead>
                                <tr className="border-t border-gray-100">
                                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Oficina / Destino
                                    </th>
                                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Fecha Retiro
                                    </th>
                                    <th className="px-5 py-2.5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Monto
                                    </th>
                                    <th className="px-5 py-2.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayedWithdrawals.map(w => (
                                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium text-gray-800">{w.office_name}</p>
                                            <p className="text-[10px] text-gray-400">
                                                RETIRO #{w.id} · Viaje #{w.trip_id}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm text-gray-700">{formatDate(w.created_at)}</p>
                                            <p className="text-[10px] text-gray-400">{formatDateTime(w.created_at).split(',').pop()?.trim()}</p>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className="text-sm font-bold text-gray-900 tabular-nums">
                                                {fmt(w.amount)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-semibold px-2 py-0.5 hover:bg-emerald-100">
                                                PROCESADO
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Load more */}
                    {hasMore && (
                        <div className="px-5 py-3 border-t border-gray-100 text-center">
                            <span className="text-xs font-semibold text-comarapa-medium uppercase tracking-wider cursor-pointer hover:text-comarapa-dark transition-colors">
                                Ver Histórico Completo
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
