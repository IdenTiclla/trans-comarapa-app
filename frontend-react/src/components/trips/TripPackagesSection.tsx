import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { PackageListView, PackageCardsView } from './TripPackageViews'
import type { TripPackage } from './TripPackageViews'

interface TripPackagesSectionProps {
    tripPackages: TripPackage[]
    isLoading?: boolean
    tripStatus?: string
    onOpenAssignModal?: () => void
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
}

type ViewMode = 'list' | 'cards'

export default function TripPackagesSection({
    tripPackages = [],
    isLoading = false,
    tripStatus = '',
    onOpenAssignModal,
    onUnassignPackage,
    onDeliverPackage,
    onReceivePackage,
}: TripPackagesSectionProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
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
                    <div className="flex items-center gap-2">
                        {/* View mode toggle (desktop) */}
                        {tripPackages.length > 0 && (
                            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} className="hidden sm:flex" />
                        )}
                        {canAssign && (
                            <button
                                id="btn-cargar-encomienda"
                                onClick={onOpenAssignModal}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Cargar Encomienda
                            </button>
                        )}
                    </div>
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
                        {/* Summary bar + mobile toggle */}
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-indigo-700 font-medium">📦 {tripPackages.length} encomiendas</span>
                                <span className="text-indigo-600">💰 Total: Bs. {totalAmount.toFixed(2)}</span>
                            </div>
                            {/* Mobile toggle */}
                            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} compact className="flex sm:hidden" />
                        </div>

                        {/* Render view */}
                        {viewMode === 'list' ? (
                            <PackageListView
                                packages={tripPackages}
                                tripStatus={tripStatus}
                                onUnassignPackage={onUnassignPackage}
                                onDeliverPackage={onDeliverPackage}
                                onReceivePackage={onReceivePackage}
                            />
                        ) : (
                            <PackageCardsView
                                packages={tripPackages}
                                tripStatus={tripStatus}
                                onUnassignPackage={onUnassignPackage}
                                onDeliverPackage={onDeliverPackage}
                                onReceivePackage={onReceivePackage}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── View mode toggle sub-component ─── */

interface ViewModeToggleProps {
    viewMode: ViewMode
    onChange: (mode: ViewMode) => void
    compact?: boolean
    className?: string
}

function ViewModeToggle({ viewMode, onChange, compact, className }: ViewModeToggleProps) {
    if (compact) {
        return (
            <div className={cn('items-center bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm', className)}>
                <button
                    onClick={() => onChange('list')}
                    className={cn(
                        'p-1.5 rounded-md transition-all duration-200',
                        viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400'
                    )}
                    title="Vista de lista"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <button
                    onClick={() => onChange('cards')}
                    className={cn(
                        'p-1.5 rounded-md transition-all duration-200',
                        viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400'
                    )}
                    title="Vista de tarjetas"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </button>
            </div>
        )
    }

    return (
        <div className={cn('items-center bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm', className)}>
            <button
                id="btn-view-list"
                onClick={() => onChange('list')}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                    viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
                title="Vista de lista"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Lista
            </button>
            <button
                id="btn-view-cards"
                onClick={() => onChange('cards')}
                className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                    viewMode === 'cards'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
                title="Vista de tarjetas"
            >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Tarjetas
            </button>
        </div>
    )
}
