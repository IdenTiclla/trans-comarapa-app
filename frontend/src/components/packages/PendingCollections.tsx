import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { packageService } from '@/services/package.service'
import PackageDeliveryModal from './PackageDeliveryModal'
import { Package, Clock, MapPin, User, ArrowRight, DollarSign, RefreshCw } from 'lucide-react'

interface PendingPackage {
    id: number
    tracking_number: string
    status: string
    total_amount: number
    total_items_count: number
    sender_name: string | null
    recipient_name: string | null
    origin_office_name: string | null
    destination_office_name: string | null
    payment_status: string
    created_at: string
    items: Array<{ id: number; description: string; quantity: number; unit_price: number; total_price: number }>
}

interface PendingCollectionsProps {
    officeId: number
    limit?: number
    showTitle?: boolean
    compact?: boolean
    onViewAll?: () => void
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

export default function PendingCollections({
    officeId,
    limit,
    showTitle = true,
    compact = false,
    onViewAll
}: PendingCollectionsProps) {
    const navigate = useNavigate()
    const [packages, setPackages] = useState<PendingPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPackage, setSelectedPackage] = useState<PendingPackage | null>(null)
    const [showDeliveryModal, setShowDeliveryModal] = useState(false)

    const fetchPendingCollections = useCallback(async () => {
        if (!officeId) {
            setLoading(false)
            return
        }
        try {
            setLoading(true)
            setError(null)
            const params = limit ? { limit } : {}
            const data = await packageService.getPendingCollections(officeId, params)
            setPackages(data as PendingPackage[])
        } catch (err: unknown) {
            const errorObj = err as { data?: { detail?: string }; message?: string }
            setError(errorObj.data?.detail || errorObj.message || 'Error al cargar cobros pendientes')
        } finally {
            setLoading(false)
        }
    }, [officeId, limit])

    useEffect(() => {
        fetchPendingCollections()
    }, [fetchPendingCollections])

    const totalAmount = useMemo(() => {
        return packages.reduce((sum, pkg) => sum + (pkg.total_amount || 0), 0)
    }, [packages])

    const handleDeliver = (pkg: PendingPackage) => {
        setSelectedPackage(pkg)
        setShowDeliveryModal(true)
    }

    const handleDeliveryConfirm = async () => {
        setShowDeliveryModal(false)
        setSelectedPackage(null)
        await fetchPendingCollections()
    }

    if (!officeId) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 text-sm">No se ha asignado una oficina a tu usuario.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm mb-2">{error}</p>
                <button
                    onClick={fetchPendingCollections}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                    Intentar nuevamente
                </button>
            </div>
        )
    }

    if (packages.length === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Package className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">No hay cobros pendientes</p>
                <p className="text-green-600 text-sm mt-1">Todas las encomiendas por cobrar han sido entregadas.</p>
            </div>
        )
    }

    if (compact) {
        return (
            <div className="space-y-3">
                {showTitle && (
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-orange-600" />
                            Cobros Pendientes
                        </h3>
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">
                            {packages.length}
                        </span>
                    </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700">Total a cobrar:</span>
                        <span className="font-bold text-orange-800">Bs. {totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">#{pkg.tracking_number}</p>
                                    <p className="text-xs text-gray-500">{formatDate(pkg.created_at)}</p>
                                </div>
                                <span className="font-bold text-green-600 text-sm">Bs. {pkg.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-600">
                                    <span>{pkg.sender_name || 'N/A'}</span>
                                    <ArrowRight className="h-3 w-3 inline mx-1" />
                                    <span>{pkg.recipient_name || 'N/A'}</span>
                                </div>
                                <button
                                    onClick={() => handleDeliver(pkg)}
                                    className="px-2.5 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                                >
                                    Entregar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="w-full mt-3 text-center text-sm text-orange-600 hover:text-orange-800 font-medium"
                    >
                        Ver todos los cobros pendientes
                    </button>
                )}

                <PackageDeliveryModal
                    show={showDeliveryModal}
                    packageData={selectedPackage}
                    onClose={() => { setShowDeliveryModal(false); setSelectedPackage(null) }}
                    onConfirm={handleDeliveryConfirm}
                />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                {showTitle && (
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-orange-600" />
                            Cobros Pendientes
                        </h2>
                        <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-sm font-bold rounded-full">
                            {packages.length}
                        </span>
                    </div>
                )}
                <button
                    onClick={fetchPendingCollections}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Actualizar"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-orange-700">Monto total pendiente de cobro</p>
                        <p className="text-2xl font-bold text-orange-800">Bs. {totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-orange-700">Encomiendas</p>
                        <p className="text-2xl font-bold text-orange-800">{packages.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tracking
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Remitente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Destinatario
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Origen
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Monto
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {packages.map((pkg) => (
                                <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span className="font-semibold text-gray-900">{pkg.tracking_number}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(pkg.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">{pkg.sender_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">{pkg.recipient_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-900">{pkg.origin_office_name || 'N/A'}</span>
                                            <ArrowRight className="h-3 w-3 text-gray-400 mx-1" />
                                            <span className="text-gray-900">{pkg.destination_office_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-600">{pkg.total_items_count} items</span>
                                        {pkg.items && pkg.items.length > 0 && (
                                            <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                                                {pkg.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-bold text-green-600">Bs. {pkg.total_amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleDeliver(pkg)}
                                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-sm"
                                            >
                                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                                Entregar y Cobrar
                                            </button>
                                            <button
                                                onClick={() => navigate(`/packages/${pkg.id}`)}
                                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                            >
                                                Ver
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PackageDeliveryModal
                show={showDeliveryModal}
                packageData={selectedPackage}
                onClose={() => { setShowDeliveryModal(false); setSelectedPackage(null) }}
                onConfirm={handleDeliveryConfirm}
            />
        </div>
    )
}
