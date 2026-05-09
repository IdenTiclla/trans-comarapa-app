import { useMemo, useState } from 'react'
import { Package, Plus, List, LayoutGrid, ArrowRight, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { PackageListView, PackageCardsView } from './TripPackageViews'
import type { TripPackage } from './TripPackageViews'

interface TripPackagesSectionProps {
    tripPackages: TripPackage[]
    tripId?: number | string
    isLoading?: boolean
    tripStatus?: string
    onOpenAssignModal?: () => void
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
    onShowReceipt?: (id: number) => void
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
    onShowReceipt,
}: TripPackagesSectionProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const totalAmount = useMemo(
        () => tripPackages.reduce((sum, pkg) => sum + (pkg.total_amount ?? 0), 0),
        [tripPackages],
    )
    const totalItems = useMemo(
        () => tripPackages.reduce((sum, pkg) => sum + (pkg.total_items_count ?? 0), 0),
        [tripPackages],
    )

    const canAssign = tripStatus !== 'arrived' && tripStatus !== 'cancelled' && tripStatus !== 'departed'

    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-labelledby="trip-packages-title">
            {/* ── Header ── */}
            <div className="border-b border-border bg-muted/20 px-4 py-4 sm:px-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary flex-shrink-0">
                            <Package className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <h2 id="trip-packages-title" className="text-lg font-bold text-foreground tracking-tight truncate">Encomiendas</h2>
                            <p className="text-xs text-muted-foreground font-medium truncate">
                                {tripPackages.length} encomienda{tripPackages.length !== 1 ? 's' : ''} cargada{tripPackages.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-shrink-0">
                        {tripPackages.length > 0 && (
                            <div className="hidden sm:flex items-center">
                                <ViewToggle
                                    value={viewMode}
                                    onChange={(val) => setViewMode(val as ViewMode)}
                                    options={[
                                        { value: 'list', icon: <List className="h-3.5 w-3.5" />, label: 'Lista', ariaLabel: 'Vista de lista' },
                                        { value: 'cards', icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Tarjetas', ariaLabel: 'Vista de tarjetas' }
                                    ]}
                                />
                            </div>
                        )}
                        {canAssign && (
                            <Button
                                id="btn-cargar-encomienda"
                                size="sm"
                                onClick={onOpenAssignModal}
                                className="gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Cargar Encomienda
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Summary stats bar ── */}
            {tripPackages.length > 0 && (
                <div className="px-5 py-3 border-b border-border/60 bg-muted/20">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Paquetes</span>
                            <span className="text-sm font-bold text-foreground">{tripPackages.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Items</span>
                            <span className="text-sm font-bold text-foreground">{totalItems}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">Total</span>
                            <span className="text-sm font-bold text-foreground">Bs. {(totalAmount ?? 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Body ── */}
            <div className="p-4 sm:p-5">
                {isLoading ? (
                    <div role="status" aria-live="polite" className="space-y-3">
                        <span className="sr-only">Cargando encomiendas…</span>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : tripPackages.length === 0 ? (
                    <EmptyState
                        title="Sin encomiendas"
                        description="No hay encomiendas cargadas en este viaje."
                        icon={<Package className="h-8 w-8" aria-hidden="true" />}
                        action={canAssign ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onOpenAssignModal}
                                className="gap-1.5 border-border"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Cargar Encomienda
                            </Button>
                        ) : undefined}
                    />
                ) : (
                    <div className="space-y-3">
                        {/* Mobile view toggle */}
                        <div className="flex sm:hidden items-center justify-end">
                            <div className="flex items-center">
                                <ViewToggle
                                    value={viewMode}
                                    onChange={(val) => setViewMode(val as ViewMode)}
                                    options={[
                                        { value: 'list', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista de lista' },
                                        { value: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista de tarjetas' }
                                    ]}
                                />
                            </div>
                        </div>

                        {viewMode === 'list' ? (
                            <PackageListView
                                packages={tripPackages}
                                tripStatus={tripStatus}
                                onUnassignPackage={onUnassignPackage}
                                onDeliverPackage={onDeliverPackage}
                                onReceivePackage={onReceivePackage}
                                onShowReceipt={onShowReceipt}
                            />
                        ) : (
                            <PackageCardsView
                                packages={tripPackages}
                                tripStatus={tripStatus}
                                onUnassignPackage={onUnassignPackage}
                                onDeliverPackage={onDeliverPackage}
                                onReceivePackage={onReceivePackage}
                                onShowReceipt={onShowReceipt}
                            />
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
