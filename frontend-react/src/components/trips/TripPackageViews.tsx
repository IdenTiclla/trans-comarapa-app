import { Link } from 'react-router'
import {
    Package,
    User,
    ArrowRight,
    MapPin,
    Truck,
    Trash2,
    FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    getPackageStatusLabel,
    getPackageStatusBg,
    getPackageStatusText,
    getPaymentStatusLabel,
    getPaymentStatusBg,
    getPaymentStatusTextClass,
    getPackageDestination,
    getPackageOrigin,
} from '@/lib/package-status'
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
    origin_office_name?: string
    destination_office_name?: string
}

export interface PackageViewProps {
    packages: TripPackage[]
    tripStatus: string
    onUnassignPackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
    onReceivePackage?: (id: number) => void
}

/* ─── Status dot component ─── */

function StatusDot({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'h-1.5 w-1.5 rounded-full flex-shrink-0',
                status === 'registered_at_office' && 'bg-yellow-500',
                status === 'assigned_to_trip' && 'bg-blue-500',
                status === 'in_transit' && 'bg-orange-500',
                status === 'arrived_at_destination' && 'bg-emerald-500',
                status === 'delivered' && 'bg-green-500',
                !['registered_at_office', 'assigned_to_trip', 'in_transit', 'arrived_at_destination', 'delivered'].includes(status) && 'bg-gray-500',
            )}
        />
    )
}

/* ─── List View ─── */

export function PackageListView({
    packages,
    tripStatus,
    onUnassignPackage,
    onDeliverPackage,
    onReceivePackage,
}: PackageViewProps) {
    return (
        <div className="space-y-2">
            {packages.map((pkg) => (
                <Link
                    key={pkg.id}
                    to={`/packages/${pkg.id}`}
                    className="group block rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-muted/20 transition-all duration-150"
                >
                    <div className="px-4 py-3.5">
                        {/* Top row: tracking + badges + actions */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors">
                                            <Package className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground tracking-tight">
                                            #{pkg.tracking_number}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            <MapPin className="h-3 w-3" />
                                            {getPackageDestination(pkg)}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full',
                                            getPackageStatusBg(pkg.status),
                                            getPackageStatusText(pkg.status),
                                        )}
                                    >
                                        <StatusDot status={pkg.status} />
                                        {getPackageStatusLabel(pkg.status)}
                                    </span>
                                    {pkg.payment_status && (
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 text-[11px] font-semibold rounded-full border',
                                                getPaymentStatusBg(pkg.payment_status),
                                                getPaymentStatusTextClass(pkg.payment_status),
                                            )}
                                        >
                                            {getPaymentStatusLabel(pkg.payment_status)}
                                        </span>
                                    )}
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

                        {/* Sender → Recipient */}
                        <div className="flex items-center gap-2 mt-2.5 ml-9">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="font-medium text-foreground truncate max-w-[140px]">
                                    {pkg.sender_name || 'N/A'}
                                </span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="font-medium text-foreground truncate max-w-[140px]">
                                    {pkg.recipient_name || 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="flex items-center gap-1.5 mt-1.5 ml-9 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="font-medium text-foreground">{getPackageOrigin(pkg)}</span>
                            <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50 flex-shrink-0" />
                            <span className="font-semibold text-primary">{getPackageDestination(pkg)}</span>
                        </div>

                        {/* Items summary */}
                        <div className="ml-9 mt-2.5">
                            <div className="bg-muted/40 rounded-md px-3 py-2 border border-border/50">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Contenido
                                    </span>
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                        {pkg.total_items_count ?? 0} item{(pkg.total_items_count ?? 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {pkg.items && pkg.items.length > 0 ? (
                                    <div className="space-y-1">
                                        {pkg.items.slice(0, 3).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center text-xs"
                                            >
                                                <span className="text-muted-foreground truncate pr-2">
                                                    <span className="font-semibold text-foreground">
                                                        {item.quantity}x
                                                    </span>{' '}
                                                    {item.description}
                                                </span>
                                                <span className="text-muted-foreground flex-shrink-0 tabular-nums">
                                                    Bs. {(item.total_price ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        {pkg.items.length > 3 && (
                                            <p className="text-[11px] text-primary font-medium italic pt-0.5">
                                                +{pkg.items.length - 3} item{pkg.items.length - 3 !== 1 ? 's' : ''} más...
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        Sin descripción disponible
                                    </p>
                                )}
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                                    <span className="text-[11px] font-semibold text-muted-foreground">Total</span>
                                    <span className="text-sm font-bold text-foreground tabular-nums">
                                        Bs. {(pkg.total_amount ?? 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

/* ─── Cards View ─── */

export function PackageCardsView({
    packages,
    tripStatus,
    onUnassignPackage,
    onDeliverPackage,
    onReceivePackage,
}: PackageViewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {packages.map((pkg) => (
                <Link
                    key={pkg.id}
                    to={`/packages/${pkg.id}`}
                    className="group block rounded-xl border border-border hover:border-primary/30 bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                    {/* Card header */}
                    <div className="px-4 pt-4 pb-3 border-b border-border/50 bg-muted/15">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                                    <Package className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold text-foreground tracking-tight">
                                    #{pkg.tracking_number}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {getPackageDestination(pkg)}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full',
                                    getPackageStatusBg(pkg.status),
                                    getPackageStatusText(pkg.status),
                                )}
                            >
                                <StatusDot status={pkg.status} />
                                {getPackageStatusLabel(pkg.status)}
                            </span>
                        </div>
                        {pkg.payment_status && (
                            <span
                                className={cn(
                                    'inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                                    getPaymentStatusBg(pkg.payment_status),
                                    getPaymentStatusTextClass(pkg.payment_status),
                                )}
                            >
                                {getPaymentStatusLabel(pkg.payment_status)}
                            </span>
                        )}
                    </div>

                    {/* Card body */}
                    <div className="px-4 py-3 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={12} />
                            <span className="font-medium text-foreground/80">{getPackageOrigin(pkg)}</span>
                            <ArrowRight size={10} className="text-muted-foreground/40" />
                            <span className="font-bold text-primary">{getPackageDestination(pkg)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                                    Remitente
                                </p>
                                <p className="text-sm font-medium text-foreground truncate">
                                    {pkg.sender_name || 'N/A'}
                                </p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                                    Destinatario
                                </p>
                                <p className="text-sm font-medium text-foreground truncate">
                                    {pkg.recipient_name || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/40 rounded-lg px-3 py-2 border border-border/50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                Contenido · {pkg.total_items_count ?? 0} item{(pkg.total_items_count ?? 0) !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {pkg.items && pkg.items.length > 0
                                    ? pkg.items
                                          .map((item) => `${item.quantity}x ${item.description}`)
                                          .join(', ')
                                    : 'Sin descripción'}
                            </p>
                        </div>
                    </div>

                    {/* Card footer */}
                    <div className="px-4 py-3 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Total
                            </p>
                            <p className="text-base font-bold text-foreground tabular-nums">
                                Bs. {(pkg.total_amount ?? 0).toFixed(2)}
                            </p>
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

function PackageActions({
    pkg,
    tripStatus,
    onUnassignPackage,
    onDeliverPackage,
    onReceivePackage,
    compact,
}: PackageActionsProps) {
    const hasActions =
        (pkg.status === 'in_transit' && tripStatus === 'arrived') ||
        pkg.status === 'arrived_at_destination' ||
        pkg.status === 'assigned_to_trip'

    if (!hasActions) return null

    return (
        <div className={cn('flex items-center gap-1.5', !compact && 'ml-2 flex-shrink-0')}>
            {pkg.status === 'in_transit' && tripStatus === 'arrived' && (
                <Button
                    size={compact ? 'xs' : 'sm'}
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault()
                        onReceivePackage?.(pkg.id)
                    }}
                    className={cn(
                        'gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800',
                        compact && 'text-[11px]',
                    )}
                >
                    <FileCheck className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                    {!compact && 'Marcar Recibido'}
                </Button>
            )}
            {pkg.status === 'arrived_at_destination' && (
                <Button
                    size={compact ? 'xs' : 'sm'}
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault()
                        onDeliverPackage?.(pkg.id)
                    }}
                    className={cn(
                        'gap-1 border-primary/30 text-primary hover:bg-primary/5',
                        compact && 'text-[11px]',
                    )}
                >
                    <Truck className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                    {!compact && 'Entregar'}
                </Button>
            )}
            {pkg.status === 'assigned_to_trip' && (
                <Button
                    size={compact ? 'xs' : 'sm'}
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault()
                        onUnassignPackage?.(pkg.id)
                    }}
                    className={cn(
                        'gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800',
                        compact && 'text-[11px]',
                    )}
                >
                    <Trash2 className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
                    {!compact && 'Quitar del viaje'}
                </Button>
            )}
        </div>
    )
}
