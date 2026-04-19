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
        <Link
          key={pkg.id}
          to={`/packages/${pkg.id}`}
          className="group block rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-muted/20 transition-all duration-150"
        >
          <div className="px-4 py-3.5">
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
                onShowReceipt={onShowReceipt}
              />
            </div>

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

            <div className="flex items-center gap-1.5 mt-1.5 ml-9 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="font-medium text-foreground">{getPackageOrigin(pkg)}</span>
              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="font-semibold text-primary">{getPackageDestination(pkg)}</span>
            </div>

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
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground truncate pr-2">
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
          </div>
        </Link>
      ))}
    </div>
  )
}
