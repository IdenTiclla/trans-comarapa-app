import { useState, useEffect, useRef } from 'react'
import { salesService } from '@/services/sales.service'
import { Button } from '@/components/ui/button'

interface Sale {
    id: number
    type: 'ticket' | 'package'
    reference: string
    client_name: string
    amount: number
    date: string
}

function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
    }).format(new Date(dateString))
}

interface RecentSalesProps {
    limit?: number
    onViewAll?: () => void
}

export default function RecentSales({ limit = 5, onViewAll }: RecentSalesProps) {
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchSales = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = (await salesService.getRecentSales(limit)) as Sale[]
            setSales(data)
        } catch {
            setError('No se pudieron cargar las ventas.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSales()
        intervalRef.current = setInterval(fetchSales, 60000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit])

    return (
        <>
            <div className="divide-y divide-gray-200">
                {loading && (
                    <div className="p-4 text-center">
                        <p className="text-gray-500">Cargando ventas...</p>
                    </div>
                )}
                {!loading && error && (
                    <div className="p-4 text-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}
                {!loading && !error && sales.length === 0 && (
                    <div className="p-4 text-center">
                        <p className="text-gray-500">No hay ventas recientes</p>
                    </div>
                )}
                {!loading &&
                    !error &&
                    sales.map((sale) => (
                        <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{sale.client_name}</p>
                                    <p className="text-sm text-gray-500">
                                        {sale.type === 'ticket' ? 'Boleto' : 'Paquete'} #{sale.reference}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">Bs. {sale.amount.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
            {onViewAll && (
                <div className="px-6 py-3 bg-gray-50 text-right">
                    <Button
                        variant="link"
                        onClick={onViewAll}
                        className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        Ver todas las ventas →
                    </Button>
                </div>
            )}
        </>
    )
}
