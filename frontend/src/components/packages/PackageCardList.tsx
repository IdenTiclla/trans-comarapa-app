/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PackageCard from './PackageCard'
import SkeletonLoader from '@/components/common/SkeletonLoader'
import EmptyState from '@/components/common/EmptyState'
import { getPackageStatusLabel as getStatusLabel, getPackageStatusBg as getStatusBg, getPackageStatusText as getStatusText, getPaymentStatusLabel, getPaymentStatusBg, getPaymentStatusTextClass, getPackageOrigin, getPackageDestination } from '@/lib/package-status'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, Eye, Pencil, Trash2, Package, ArrowRight } from 'lucide-react'

interface PackageCardListProps {
    packages: any[]
    isLoading?: boolean
    viewMode?: 'grid' | 'table'
    onViewPackage?: (id: number) => void
    onEditPackage?: (id: number) => void
    onDeletePackage?: (id: number) => void
    onDeliverPackage?: (id: number) => void
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export default function PackageCardList({
    packages,
    isLoading = false,
    viewMode = 'grid',
    onViewPackage,
    onEditPackage,
    onDeletePackage,
    onDeliverPackage
}: PackageCardListProps) {


    if (isLoading) {
        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonLoader key={`skeleton-${i}`} type="card" />
                    ))}
                </div>
            )
        }

        return (
            <div className="w-full max-w-full bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonLoader key={`table-skeleton-${i}`} type="table-row" />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    if (!packages || packages.length === 0) {
        return (
            <EmptyState
                title="No hay encomiendas"
                description="Intente ajustar los filtros o cree una nueva encomienda."
                icon={<Package className="h-10 w-10 text-gray-400" />}
            />
        )
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {packages.map(pkg => (
                    <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onViewPackage={onViewPackage}
                        onEditPackage={onEditPackage}
                        onDeletePackage={onDeletePackage}
                        onDeliverPackage={onDeliverPackage}
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="w-full max-w-full bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="w-full overflow-x-auto">
                {/* eslint-disable-next-line no-restricted-syntax */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {packages.map(pkg => (
                            <tr
                                key={pkg.id}
                                onClick={() => onViewPackage && onViewPackage(pkg.id)}
                                className="hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {pkg.tracking_number || pkg.tracking_code || `#${pkg.id}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <span>{getPackageOrigin(pkg)}</span>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                        <span>{getPackageDestination(pkg)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {pkg.sender_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {pkg.recipient_name || pkg.receiver_name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-opacity-20 border-gray-400",
                                        getStatusBg(pkg.status),
                                        getStatusText(pkg.status)
                                    )}>
                                        {getStatusLabel(pkg.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={cn(
                                        "inline-flex px-2 py-1 text-xs font-semibold rounded-full border border-opacity-20 border-gray-400",
                                        getPaymentStatusBg(pkg.payment_status),
                                        getPaymentStatusTextClass(pkg.payment_status)
                                    )}>
                                        {getPaymentStatusLabel(pkg.payment_status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(pkg.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Bs. {pkg.price || '0.00'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                                    <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                                        {pkg.status === 'arrived_at_destination' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeliverPackage && onDeliverPackage(pkg.id)}
                                                aria-label="Entregar encomienda"
                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onViewPackage && onViewPackage(pkg.id)}
                                            aria-label="Ver detalles"
                                            className="h-8 w-8 text-green-600 hover:text-green-900 hover:bg-green-50"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        {pkg.status === 'registered_at_office' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEditPackage && onEditPackage(pkg.id)}
                                                aria-label="Editar encomienda"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDeletePackage && onDeletePackage(pkg.id)}
                                            aria-label="Eliminar encomienda"
                                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
