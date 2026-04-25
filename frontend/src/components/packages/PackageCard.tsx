import { getPackageStatusLabel as getStatusLabel, getPackageStatusBg as getStatusBg, getPackageStatusText as getStatusText, getPaymentStatusLabel, getPaymentStatusTextClass, getPackageOrigin, getPackageDestination } from '@/lib/package-status'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Clock, Receipt, CheckCircle, ArrowRight, Pencil, Trash2, Eye } from 'lucide-react'

interface PackageItem { id?: number; description?: string; quantity?: number; [k: string]: unknown }
interface PackageLike {
    id: number
    tracking_number?: string
    created_at?: string
    status?: string
    sender_name?: string
    recipient_name?: string
    description?: string
    total_items_count?: number
    items?: PackageItem[]
    payment_status?: string
    [k: string]: unknown
}

interface PackageCardProps {
    pkg: PackageLike
    onViewPackage?: (id: number) => void
    onEditPackage?: (id: number) => void
    onDeletePackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function PackageCard({
    pkg,
    onViewPackage,
    onEditPackage,
    onDeletePackage,
    onDeliverPackage
}: PackageCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200">
            <CardContent className="p-0">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className="p-4 border-b border-gray-100 bg-muted/50 flex justify-between items-start cursor-pointer group"
                    onClick={() => onViewPackage?.(pkg.id)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                #{pkg.tracking_number}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1">
                                <Clock size={12} />
                                {formatDate(pkg.created_at)}
                            </div>
                        </div>
                    </div>
                    <span className={cn(
                        "px-2.5 py-1 text-[11px] font-semibold rounded-full border border-opacity-20 whitespace-nowrap",
                        getStatusBg(pkg.status),
                        getStatusText(pkg.status)
                    )}>
                        {getStatusLabel(pkg.status)}
                    </span>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-gray-900">{getPackageOrigin(pkg)}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{getPackageDestination(pkg)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Remitente</p>
                            <p className="font-medium text-gray-900 truncate">{pkg.sender_name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Destinatario</p>
                            <p className="font-medium text-gray-900 truncate">{pkg.recipient_name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Productos ({pkg.total_items_count || 0})</p>
                        <p className="text-sm text-gray-700 italic line-clamp-2">
                            {pkg.items && pkg.items.length > 0
                                ? pkg.items.map((item: PackageItem) => `${item.quantity}x ${item.description}`).join(', ')
                                : pkg.description || 'Sin descripción'}
                        </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1.5 text-sm">
                            <Receipt size={16} className="text-gray-400" />
                            <span className={cn("font-semibold text-xs", getPaymentStatusTextClass(pkg.payment_status))}>
                                {getPaymentStatusLabel(pkg.payment_status)}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 leading-none">Total</p>
                            <p className="font-bold text-gray-900 leading-tight">Bs. {pkg.total_amount || '0.00'}</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3 bg-muted/50 border-t border-gray-100 flex items-center justify-end gap-2">
                    {pkg.status === 'arrived_at_destination' && (
                        <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => onDeliverPackage?.(pkg.id)}
                        >
                            <CheckCircle size={14} />
                            Entregar
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onViewPackage?.(pkg.id)}
                    >
                        <Eye size={14} />
                        Ver
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onEditPackage?.(pkg.id)}
                    >
                        <Pencil size={14} />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => onDeletePackage?.(pkg.id)}
                    >
                        <Trash2 size={14} />
                        Eliminar
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
