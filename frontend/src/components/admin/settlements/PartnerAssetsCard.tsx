import { Bus } from 'lucide-react'
import type { BusOption, TripFinancial } from '@/hooks/use-owner-settlements'

interface Props {
    buses: BusOption[]
    financials: TripFinancial[]
}

export function PartnerAssetsCard({ buses, financials }: Props) {
    const activeBuses = buses.length
    const totalTrips = financials.length

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
                <h3 className="text-sm font-bold text-gray-900">Activos del Socio</h3>
                <Bus className="h-4 w-4 text-gray-400" />
            </div>

            {/* Active Bus Units */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Unidades (Buses)</span>
                <span className="text-xl font-bold text-comarapa-dark tabular-nums">{activeBuses}</span>
            </div>

            {/* Total Trips */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Viajes Registrados</span>
                <span className="text-xl font-bold text-comarapa-dark tabular-nums">{totalTrips}</span>
            </div>

            {/* Bus List */}
            {buses.length > 0 && (
                <div className="mt-4">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Placas Asignadas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {buses.map(bus => (
                            <span
                                key={bus.id}
                                className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
                            >
                                {bus.license_plate}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
