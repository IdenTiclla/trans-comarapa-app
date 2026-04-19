import { Link } from 'react-router'
import { Package, ArrowRight, MapPin } from 'lucide-react'
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
import { StatusDot } from './StatusDot'
import { PackageActions } from './PackageActions'
import type { PackageViewProps } from './types'

export function PackageCardsView({
  packages,
  tripStatus,
  onUnassignPackage,
  onDeliverPackage,
  onReceivePackage,
  onShowReceipt,
}: PackageViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {packages.map((pkg) => (
        <Link
          key={pkg.id}
          to={`/packages/${pkg.id}`}
          className="group block rounded-xl border border-border hover:border-primary/30 bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
        >
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
                  ? pkg.items.map((item) => `${item.quantity}x ${item.description}`).join(', ')
                  : 'Sin descripción'}
              </p>
            </div>
          </div>

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
              onShowReceipt={onShowReceipt}
              compact
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
