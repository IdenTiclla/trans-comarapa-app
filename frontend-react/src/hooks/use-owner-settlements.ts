import { useEffect, useState, useMemo, useCallback } from 'react'
import { ownerService } from '@/services/owner.service'
import { useAuth } from '@/hooks/use-auth'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

export interface OwnerOption {
    id: number
    firstname: string
    lastname: string
    ci: string
}

export interface BusOption {
    id: number
    license_plate: string
    model: string | null
}

export interface OfficeBreakdown {
    office_id: number
    office_name: string
    tickets_amount: number
    packages_paid_amount: number
    packages_collected_amount: number
    packages_pending_amount: number
    total_collected: number
    withdrawn_amount: number
    available: number
}

export interface TripFinancial {
    trip_id: number
    departure_time: string
    route_name: string
    bus_plate: string
    tickets_amount: number
    packages_paid_amount: number
    packages_collected_amount: number
    packages_pending_amount: number
    total_collected: number
    total_withdrawn: number
    available_balance: number
    office_breakdown: OfficeBreakdown[]
}

export interface WithdrawalEntry {
    id: number
    created_at: string
    amount: number
    office_name: string
    trip_id: number
    trip_info: string
    bus_license_plate: string
    status: string
}

export interface SettlementTotals {
    totalCollected: number
    totalWithdrawn: number
    totalAvailable: number
    totalPending: number
}

function mapTripFinancial(t: Record<string, unknown>): TripFinancial {
    return {
        trip_id: t.trip_id as number,
        departure_time: t.trip_datetime as string,
        route_name: `${(t.route_origin as string) ?? ''} → ${(t.route_destination as string) ?? ''}`,
        bus_plate: t.bus_license_plate as string,
        tickets_amount: (t.tickets_amount as number) ?? 0,
        packages_paid_amount: (t.packages_paid_amount as number) ?? 0,
        packages_collected_amount: (t.packages_collected_amount as number) ?? 0,
        packages_pending_amount: (t.packages_pending_amount as number) ?? 0,
        total_collected: (t.total_collected as number) ?? 0,
        total_withdrawn: (t.total_withdrawn as number) ?? 0,
        available_balance: (t.available_balance as number) ?? 0,
        office_breakdown: ((t.office_breakdown as Record<string, unknown>[]) ?? []).map((o) => ({
            office_id: o.office_id as number,
            office_name: (o.office_name as string) ?? 'Sin nombre',
            tickets_amount: (o.tickets_amount as number) ?? 0,
            packages_paid_amount: (o.packages_paid_amount as number) ?? 0,
            packages_collected_amount: (o.packages_collected_amount as number) ?? 0,
            packages_pending_amount: (o.packages_pending_amount as number) ?? 0,
            total_collected: (o.total_collected as number) ?? 0,
            withdrawn_amount: (o.withdrawn_amount as number) ?? 0,
            available: (o.available as number) ?? 0,
        })),
    }
}

export function useOwnerSettlements() {
    const { user } = useAuth()
    const officeId = user?.office_id

    const [searchParams, setSearchParams] = useSearchParams()
    
    const [owners, setOwners] = useState<OwnerOption[]>([])
    const [buses, setBuses] = useState<BusOption[]>([])
    
    const selectedOwnerId = searchParams.get('owner') || ''
    const selectedBusId = searchParams.get('bus') || '__all__'

    const setSelectedOwnerId = (id: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (id) next.set('owner', id)
            else next.delete('owner')
            // Reset bus when owner changes
            next.delete('bus')
            return next
        })
    }

    const setSelectedBusId = (id: string) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            if (id && id !== '__all__') next.set('bus', id)
            else next.delete('bus')
            return next
        })
    }
    const [financials, setFinancials] = useState<TripFinancial[]>([])
    const [withdrawalsHistory, setWithdrawalsHistory] = useState<WithdrawalEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingOwners, setLoadingOwners] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [processing, setProcessing] = useState(false)

    const ownerId = selectedOwnerId ? Number(selectedOwnerId) : null
    const busId = selectedBusId && selectedBusId !== '__all__' ? Number(selectedBusId) : undefined

    const loadFinancials = useCallback(async (oid: number, bid?: number) => {
        setLoading(true)
        try {
            const data = await ownerService.getFinancials(oid, bid)
            const trips = Array.isArray(data) ? data : []
            setFinancials(trips.map(mapTripFinancial))
        } catch {
            toast.error('Error al cargar datos financieros')
        } finally {
            setLoading(false)
        }
    }, [])

    const loadWithdrawals = useCallback(async (oid: number, bid?: number) => {
        try {
            const data = await ownerService.getWithdrawals(oid, bid)
            setWithdrawalsHistory(Array.isArray(data) ? data : [])
        } catch {
            setWithdrawalsHistory([])
        }
    }, [])

    useEffect(() => {
        ownerService.getAll()
            .then(data => setOwners(Array.isArray(data) ? data : []))
            .catch(() => toast.error('Error cargando socios'))
            .finally(() => setLoadingOwners(false))
    }, [])

    useEffect(() => {
        if (!ownerId) {
            setBuses([])
            setFinancials([])
            setWithdrawalsHistory([])
            setSelectedBusId('')
            return
        }
        ownerService.getBuses(ownerId)
            .then(data => setBuses(Array.isArray(data) ? data : []))
            .catch(() => setBuses([]))
        loadFinancials(ownerId)
        loadWithdrawals(ownerId)
    }, [selectedOwnerId, ownerId, loadFinancials, loadWithdrawals])

    useEffect(() => {
        if (!ownerId) return
        loadFinancials(ownerId, busId)
        loadWithdrawals(ownerId, busId)
    }, [selectedBusId, ownerId, busId, loadFinancials, loadWithdrawals])

    const totals: SettlementTotals = useMemo(() => ({
        totalCollected: financials.reduce((s, t) => s + t.total_collected, 0),
        totalWithdrawn: financials.reduce((s, t) => s + t.total_withdrawn, 0),
        totalAvailable: financials.reduce((s, t) => s + t.available_balance, 0),
        totalPending: financials.reduce((s, t) => s + t.packages_pending_amount, 0),
    }), [financials])

    const aggregatedOffices: OfficeBreakdown[] = useMemo(() => {
        const map = new Map<number, OfficeBreakdown>()
        for (const trip of financials) {
            for (const o of trip.office_breakdown) {
                const existing = map.get(o.office_id)
                if (existing) {
                    existing.tickets_amount += o.tickets_amount
                    existing.packages_paid_amount += o.packages_paid_amount
                    existing.packages_collected_amount += o.packages_collected_amount
                    existing.packages_pending_amount += o.packages_pending_amount
                    existing.total_collected += o.total_collected
                    existing.withdrawn_amount += o.withdrawn_amount
                    existing.available += o.available
                } else {
                    map.set(o.office_id, { ...o })
                }
            }
        }
        return Array.from(map.values()).sort((a, b) => a.office_name.localeCompare(b.office_name))
    }, [financials])

    const tripsWithBalance = useMemo(
        () => financials.filter(t => t.available_balance > 0),
        [financials]
    )

    const selectedOwner = useMemo(
        () => owners.find(o => o.id === ownerId) ?? null,
        [owners, ownerId]
    )

    const handleWithdraw = async (tripId: number, officeIdW: number, amount: number) => {
        if (!ownerId) return
        setProcessing(true)
        try {
            await ownerService.withdraw(ownerId, {
                trip_id: tripId,
                amount,
                office_id: officeIdW,
            })
            toast.success('Retiro registrado exitosamente')
            setIsModalOpen(false)
            loadFinancials(ownerId, busId)
            loadWithdrawals(ownerId, busId)
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Error al procesar el retiro')
        } finally {
            setProcessing(false)
        }
    }

    return {
        owners, selectedOwnerId, setSelectedOwnerId,
        buses, selectedBusId, setSelectedBusId,
        financials, withdrawalsHistory, loading, loadingOwners,
        isModalOpen, setIsModalOpen, processing,
        ownerId, officeId, totals, aggregatedOffices,
        tripsWithBalance, selectedOwner, handleWithdraw,
    }
}
