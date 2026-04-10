import { Link } from 'react-router'
import { getPackageStatusLabel as getStatusLabel, getPackageStatusBg as getStatusBg, getPackageStatusText as getStatusText, getPaymentStatusLabel, getPaymentStatusBg, getPaymentStatusTextClass } from '@/lib/package-status'
import { cn } from '@/lib/utils'

interface PackageItem {
    id: number
    quantity: number
    description: string
    total_price?: number
}

export interface TripPackage {
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

export interface PackageViewProps {
    packages: TripPackage[]
    tripStatus: string
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
}

/* ─── List View (original detailed design) ─── */

export function PackageListView({ packages, tripStatus, onUnassignPackage, onDeliverPackage, onReceivePackage }: PackageViewProps) {
    return (
        <div className="space-y-3">
            {packages.map((pkg) => (
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

                        <PackageActions
                            pkg={pkg}
                            tripStatus={tripStatus}
                            onUnassignPackage={onUnassignPackage}
                            onDeliverPackage={onDeliverPackage}
                            onReceivePackage={onReceivePackage}
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}

/* ─── Cards View (new compact design) ─── */

export function PackageCardsView({ packages, tripStatus, onUnassignPackage, onDeliverPackage, onReceivePackage }: PackageViewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {packages.map((pkg) => (
                <Link
                    key={pkg.id}
                    to={`/packages/${pkg.id}`}
                    className="group block rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                    {/* Card header */}
                    <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    #{pkg.tracking_number}
                                </span>
                            </div>
                            <span className={cn(
                                'px-2 py-0.5 text-[11px] font-semibold rounded-full',
                                getStatusBg(pkg.status),
                                getStatusText(pkg.status)
                            )}>
                                {getStatusLabel(pkg.status)}
                            </span>
                        </div>
                        {pkg.payment_status && (
                            <span className={cn(
                                'inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                                getPaymentStatusBg(pkg.payment_status),
                                getPaymentStatusTextClass(pkg.payment_status)
                            )}>
                                {getPaymentStatusLabel(pkg.payment_status)}
                            </span>
                        )}
                    </div>

                    {/* Card body */}
                    <div className="px-4 py-3 space-y-3">
                        {/* Sender / Recipient */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Remitente</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{pkg.sender_name || 'N/A'}</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Destinatario</p>
                                <p className="text-sm font-medium text-gray-800 truncate">{pkg.recipient_name || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Items summary */}
                        <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                                Contenido · {pkg.total_items_count || 0} items
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                                {pkg.items && pkg.items.length > 0
                                    ? pkg.items.map((item) => `${item.quantity}x ${item.description}`).join(', ')
                                    : 'Sin descripción'}
                            </p>
                        </div>
                    </div>

                    {/* Card footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Total</p>
                            <p className="text-base font-bold text-indigo-700">Bs. {(pkg.total_amount || 0).toFixed(2)}</p>
                        </div>
                        <PackageActions
                            pkg={pkg}
                            tripStatus={tripStatus}
                            onUnassignPackage={onUnassignPackage}
                            onDeliverPackage={onDeliverPackage}
                            onReceivePackage={onReceivePackage}
                            compact
                        />
                    </div>
                </Link>
            ))}
        </div>
    )
}

/* ─── Shared action buttons ─── */

interface PackageActionsProps {
    pkg: TripPackage
    tripStatus: string
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
    compact?: boolean
}

function PackageActions({ pkg, tripStatus, onUnassignPackage, onDeliverPackage, onReceivePackage, compact }: PackageActionsProps) {
    const btnBase = compact
        ? 'text-xs font-medium px-2 py-1 rounded-md transition-colors border flex items-center gap-1'
        : 'text-sm font-medium px-2 py-1 rounded hover:bg-opacity-10 transition-colors border flex items-center gap-1'

    const hasActions =
        (pkg.status === 'in_transit' && tripStatus === 'arrived') ||
        pkg.status === 'arrived_at_destination' ||
        pkg.status === 'assigned_to_trip'

    if (!hasActions) return null

    return (
        <div className={cn('flex items-center gap-2', !compact && 'ml-3 flex-shrink-0')}>
            {pkg.status === 'in_transit' && tripStatus === 'arrived' && (
                <button
                    onClick={(e) => { e.preventDefault(); onReceivePackage?.(pkg.id) }}
                    className={cn(btnBase, 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200')}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {!compact && 'Marcar Recibido'}
                </button>
            )}
            {pkg.status === 'arrived_at_destination' && (
                <button
                    onClick={(e) => { e.preventDefault(); onDeliverPackage?.(pkg.id) }}
                    className={cn(btnBase, 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200')}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    {!compact && 'Entregar'}
                </button>
            )}
            {pkg.status === 'assigned_to_trip' && (
                <button
                    onClick={(e) => { e.preventDefault(); onUnassignPackage?.(pkg.id) }}
                    className={cn(btnBase, 'text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200')}
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    {!compact && 'Quitar del viaje'}
                </button>
            )}
        </div>
    )
}
