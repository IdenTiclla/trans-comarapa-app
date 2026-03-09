import { getPackageStatusLabel as getStatusLabel, getPackageStatusBg as getStatusBg, getPackageStatusText as getStatusText, getPaymentStatusLabel, getPaymentStatusTextClass } from '@/lib/package-status'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Clock, Receipt, CheckCircle } from 'lucide-react'

interface PackageCardProps {
    pkg: any
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
                {/* Header Section */}
                <div
                    className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start cursor-pointer group"
                    onClick={() => onViewPackage?.(pkg.id)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
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

                {/* Content Section */}
                <div className="p-4 space-y-4">
                    {/* Routes / People */}
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

                    {/* Products (Replacing Weight) */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Productos ({pkg.total_items_count || 0})</p>
                        <p className="text-sm text-gray-700 italic line-clamp-2">
                            {pkg.items && pkg.items.length > 0
                                ? pkg.items.map((item: any) => `${item.quantity}x ${item.description}`).join(', ')
                                : pkg.description || 'Sin descripción'}
                        </p>
                    </div>

                    {/* Footer / Payment */}
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

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
                    {pkg.status === 'arrived_at_destination' && (
                        <button
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                            onClick={() => onDeliverPackage?.(pkg.id)}
                        >
                            <CheckCircle size={14} className="mr-1.5" />
                            Entregar
                        </button>
                    )}
                    <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => onViewPackage?.(pkg.id)}
                    >
                        Ver
                    </button>
                    <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        onClick={() => onEditPackage?.(pkg.id)}
                    >
                        Editar
                    </button>
                    <button
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        onClick={() => onDeletePackage?.(pkg.id)}
                    >
                        Eliminar
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
