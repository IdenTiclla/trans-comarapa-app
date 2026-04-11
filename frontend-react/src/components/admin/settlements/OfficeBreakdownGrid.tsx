import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OfficeBreakdown } from '@/hooks/use-owner-settlements'
import { fmt } from './settlement-utils'

interface Props {
    offices: OfficeBreakdown[]
    currentOfficeId: number | undefined
}

export function OfficeBreakdownGrid({ offices, currentOfficeId }: Props) {
    if (offices.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
                <p className="text-sm">No se encontraron datos para este socio.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offices.map(office => (
                <OfficeCard
                    key={office.office_id}
                    office={office}
                    isCurrent={office.office_id === currentOfficeId}
                />
            ))}
        </div>
    )
}

function OfficeCard({ office, isCurrent }: { office: OfficeBreakdown; isCurrent: boolean }) {
    return (
        <div
            className={`
                bg-white rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md
                ${isCurrent ? 'ring-2 ring-comarapa-medium border-comarapa-light' : 'border-gray-200'}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">{office.office_name}</h3>
                <div className="flex items-center gap-1">
                    {isCurrent && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 mr-1">
                            Tu oficina
                        </Badge>
                    )}
                    <MapPin className="h-4 w-4 text-comarapa-medium" />
                </div>
            </div>

            {/* Lines */}
            <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-gray-500">Boletos Vendidos</span>
                    <span className="font-semibold text-gray-800 tabular-nums">{fmt(office.tickets_amount)}</span>
                </div>
                {office.packages_paid_amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Enc. Pagadas</span>
                        <span className="font-semibold text-gray-800 tabular-nums">{fmt(office.packages_paid_amount)}</span>
                    </div>
                )}
                {office.packages_collected_amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Enc. Cobradas</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">{fmt(office.packages_collected_amount)}</span>
                    </div>
                )}
                {office.withdrawn_amount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Retirado</span>
                        <span className="font-semibold text-red-600 tabular-nums">-{fmt(office.withdrawn_amount)}</span>
                    </div>
                )}
            </div>

            {/* Available */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    Disponible para Retiro
                </p>
                <p className={`text-2xl font-extrabold tracking-tight tabular-nums ${
                    office.available > 0 ? 'text-comarapa-dark' : 'text-gray-300'
                }`}>
                    {fmt(office.available)}
                </p>
            </div>

            {/* Pending notice */}
            {office.packages_pending_amount > 0 && (
                <div className="mt-2 px-2.5 py-1.5 bg-amber-50 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-amber-600 font-medium">Pend. cobro</span>
                    <span className="text-[10px] text-amber-700 font-bold tabular-nums">{fmt(office.packages_pending_amount)}</span>
                </div>
            )}
        </div>
    )
}
