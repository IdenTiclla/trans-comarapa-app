import { useState, useEffect, useMemo, useCallback } from 'react'
import { packageService } from '@/services/package.service'

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

export function usePendingCollections(officeId: number, limit?: number) {
    const [packages, setPackages] = useState<PendingPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    return {
        packages,
        loading,
        error,
        totalAmount,
        fetchPendingCollections,
    }
}
