import { Link } from 'react-router'
import { Package, User, ArrowRight, MapPin } from 'lucide-react'
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
import { ROUTES } from '@/lib/routes'

export function PackageListView({
  packages,
  tripStatus,
  onUnassignPackage,
  onDeliverPackage,
  onReceivePackage,
  onShowReceipt,
}: PackageViewProps) {
  return (
    <div className="space-y-2">
      {packages.map((pkg) => (
        <article
          key={pkg.id}
          className="group rounded-lg border border-border bg-card transition-all duration-150 hover:border-primary/30 hover:bg-muted/20"
        >
          <div className="px-3 py-3.5 sm:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Link
                to={ROUTES.packageDetail(pkg.id)}
                className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors flex-shrink-0">
                        <Package className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <span className="text-sm font-bold text-foreground tracking-tight truncate max-w-full">
                        #{pkg.tracking_number}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary max-w-full min-w-0">
                        <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{getPackageDestination(pkg)}</span>
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
              </Link>
              <PackageActions
                pkg={pkg}
                tripStatus={tripStatus}
                onUnassignPackage={onUnassignPackage}
                onDeliverPackage={onDeliverPackage}
                onReceivePackage={onReceivePackage}
                onShowReceipt={onShowReceipt}
              />
            </div>

            <Link
              to={ROUTES.packageDetail(pkg.id)}
              className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
            <div className="flex items-center gap-2 mt-2.5 ml-0 sm:ml-9 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-1 sm:flex-none">
                <User className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground truncate">
                  {pkg.sender_name || 'N/A'}
                </span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-1 sm:flex-none">
                <User className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground truncate">
                  {pkg.recipient_name || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 ml-0 sm:ml-9 text-xs text-muted-foreground flex-wrap">
              <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium text-foreground truncate min-w-0">{getPackageOrigin(pkg)}</span>
              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50 flex-shrink-0" aria-hidden="true" />
              <span className="font-semibold text-primary truncate min-w-0">{getPackageDestination(pkg)}</span>
            </div>

            <div className="ml-0 sm:ml-9 mt-2.5">
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
                      <div key={item.id} className="flex justify-between items-center text-xs gap-2">
                        <span className="text-muted-foreground truncate min-w-0">
                          <span className="font-semibold text-foreground">{item.quantity}x</span>{' '}
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
                  <p className="text-xs text-muted-foreground italic">Sin descripción disponible</p>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-semibold text-muted-foreground">Total</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    Bs. {(pkg.total_amount ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            </Link>
          </div>
        </article>
      ))}
    </div>
  )
}
