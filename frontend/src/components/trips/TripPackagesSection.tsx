import { useMemo, useState } from 'react'
import { Package, Plus, List, LayoutGrid, ArrowRight, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
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
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div className="px-5 pt-5 pb-3 border-b border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary">
                            <Package className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground tracking-tight">Encomiendas</h2>
                            <p className="text-xs text-muted-foreground font-medium">
                                {tripPackages.length} encomienda{tripPackages.length !== 1 ? 's' : ''} cargada{tripPackages.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-6">
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
                            <span className="text-sm font-bold text-foreground">Bs. {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Body ── */}
            <div className="p-4 sm:p-5">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
                    </div>
                ) : tripPackages.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <div className="flex items-center justify-center w-16 h-16 bg-muted/50 rounded-2xl mx-auto mb-4 text-muted-foreground">
                            <Package className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">Sin encomiendas</p>
                        <p className="text-xs text-muted-foreground">
                            No hay encomiendas cargadas en este viaje
                        </p>
                        {canAssign && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onOpenAssignModal}
                                className="mt-4 gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Cargar Encomienda
                            </Button>
                        )}
                    </div>
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
        </div>
    )
}
