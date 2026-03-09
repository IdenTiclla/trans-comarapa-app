import { useMemo } from 'react'
import { Link } from 'react-router'
import { getPackageStatusLabel as getStatusLabel, getPackageStatusBg as getStatusBg, getPackageStatusText as getStatusText, getPaymentStatusLabel, getPaymentStatusBg, getPaymentStatusTextClass } from '@/lib/package-status'

interface PackageItem {
    id: number
    quantity: number
    description: string
    total_price?: number
}

interface TripPackage {
    id: number
    tracking_number?: string
    status: string
    payment_status?: string
    sender_name?: string
    recipient_name?: string
    total_amount?: number
    total_items_count?: number
    items?: PackageItem[]
}

interface TripPackagesSectionProps {
    tripPackages: TripPackage[]
    isLoading?: boolean
    tripStatus?: string
    onOpenAssignModal?: () => void
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
}

export default function TripPackagesSection({
    tripPackages = [],
    isLoading = false,
    tripStatus = '',
    onOpenAssignModal,
    onUnassignPackage,
    onDeliverPackage,
    onReceivePackage,
}: TripPackagesSectionProps) {
    const totalAmount = useMemo(() => tripPackages.reduce((sum, pkg) => sum + (pkg.total_amount || 0), 0), [tripPackages])

    const canAssign = tripStatus !== 'arrived' && tripStatus !== 'cancelled' && tripStatus !== 'departed'

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Encomiendas</h3>
                            <p className="text-sm text-gray-500">{tripPackages.length} encomienda{tripPackages.length !== 1 ? 's' : ''} cargadas</p>
                        </div>
                    </div>
                    {canAssign && (
                        <button onClick={onOpenAssignModal} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Cargar Encomienda
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : tripPackages.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">No hay encomiendas cargadas en este viaje</p>
                        <p className="text-sm text-gray-400 mt-1">Presione "Cargar Encomienda" para asignar paquetes</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Summary */}
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-indigo-700 font-medium">📦 {tripPackages.length} encomiendas</span>
                                <span className="text-indigo-600">💰 Total: Bs. {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Package items */}
                        {tripPackages.map((pkg) => (
                            <Link
                                key={pkg.id}
                                to={`/packages/${pkg.id}`}
                                className="block w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-semibold text-gray-900">#{pkg.tracking_number}</span>
                                            <span className={`${getStatusBg(pkg.status)} ${getStatusText(pkg.status)} px-2 py-0.5 text-xs font-medium rounded-full`}>{getStatusLabel(pkg.status)}</span>
                                            {pkg.payment_status && (
                                                <span className={`${getPaymentStatusBg(pkg.payment_status)} ${getPaymentStatusTextClass(pkg.payment_status)} px-2 py-0.5 text-xs font-medium rounded-full border`}>{getPaymentStatusLabel(pkg.payment_status)}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
                                            <span>📤 {pkg.sender_name || 'N/A'}</span>
                                            <span className="text-gray-300">→</span>
                                            <span>📥 {pkg.recipient_name || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 rounded p-2 border border-gray-100">
                                            <span className="font-medium text-gray-700 block mb-1">Detalle ({pkg.total_items_count || 0} items en total):</span>
                                            {pkg.items && pkg.items.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {pkg.items.map((item) => (
                                                        <li key={item.id} className="flex justify-between items-center text-xs">
                                                            <span className="truncate pr-2"><span className="font-medium text-gray-600">{item.quantity}x</span> {item.description}</span>
                                                            <span className="text-gray-500 flex-shrink-0">Bs. {(item.total_price || 0).toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                    {pkg.items.length === 5 && <li className="text-center text-indigo-500 italic mt-1 font-medium">Ver detalles de la encomienda para ver más items...</li>}
                                                </ul>
                                            ) : (
                                                <div className="text-gray-400 italic">No hay detalles disponibles</div>
                                            )}
                                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">Total a Pagar / Pagado:</span>
                                                <span className="font-bold text-indigo-700">Bs. {(pkg.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                        {pkg.status === 'in_transit' && tripStatus === 'arrived' && (
                                            <button onClick={(e) => { e.preventDefault(); onReceivePackage?.(pkg.id) }} className="text-sm text-emerald-600 hover:text-emerald-800 font-medium px-2 py-1 rounded hover:bg-emerald-50 transition-colors border border-emerald-200">
                                                <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Marcar Recibido</span>
                                            </button>
                                        )}
                                        {pkg.status === 'arrived_at_destination' && (
                                            <button onClick={(e) => { e.preventDefault(); onDeliverPackage?.(pkg.id) }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors border border-indigo-200">
                                                <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> Entregar</span>
                                            </button>
                                        )}
                                        {pkg.status === 'assigned_to_trip' && (
                                            <button onClick={(e) => { e.preventDefault(); onUnassignPackage?.(pkg.id) }} className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors border border-red-200">
                                                <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Quitar del viaje</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
