import { useState, useEffect, useRef, useCallback } from 'react'
import { salesService } from '@/services/sales.service'
import { TIMING } from '@/lib/timing'

interface Sale {
    id: number
    type: 'ticket' | 'package'
    reference: string
    client_name: string
    amount: number
    date: string
}

export function useRecentSales(limit = 5) {
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchSales = useCallback(async () => {
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
    }, [limit])

    useEffect(() => {
        fetchSales()
        intervalRef.current = setInterval(fetchSales, TIMING.RECENT_SALES_REFRESH)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [fetchSales])

    return { sales, loading, error }
}
