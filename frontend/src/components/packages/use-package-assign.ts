import { useState, useEffect, useMemo } from 'react'
import { packageService } from '@/services/package.service'

interface UnassignedPackage {
    id: number
    tracking_number?: string
    sender_name?: string
    receiver_name?: string
    recipient_name?: string
    created_at?: string
    total_amount?: number
    total_items_count?: number
    [k: string]: unknown
}

export function usePackageAssignModal(show: boolean, tripId: number | string) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [unassignedPackages, setUnassignedPackages] = useState<UnassignedPackage[]>([])

    useEffect(() => {
        if (show && tripId) {
            setLoading(true)
            setSelectedIds([])
            setSearchQuery('')
            packageService.getUnassigned()
                .then(res => {
                    const data = Array.isArray(res) ? res : ((res as { packages?: UnassignedPackage[]; data?: UnassignedPackage[] }).packages || (res as { packages?: UnassignedPackage[]; data?: UnassignedPackage[] }).data || [])
                    setUnassignedPackages(data)
                })
                .catch(() => { /* unassigned packages load failed */ })
                .finally(() => setLoading(false))
        }
    }, [show, tripId])

    const filteredPackages = useMemo(() => {
        if (!searchQuery.trim()) return unassignedPackages
        const term = searchQuery.toLowerCase()
        return unassignedPackages.filter(pkg =>
            (pkg.tracking_number && pkg.tracking_number.toLowerCase().includes(term)) ||
            (pkg.sender_name && pkg.sender_name.toLowerCase().includes(term)) ||
            (pkg.recipient_name && pkg.recipient_name.toLowerCase().includes(term))
        )
    }, [searchQuery, unassignedPackages])

    const allSelected = filteredPackages.length > 0 && filteredPackages.every(p => selectedIds.includes(p.id))

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredPackages.map(p => p.id))
        }
    }

    const confirmAssignment = async (onPackagesAssigned: () => void, onClose: () => void) => {
        if (selectedIds.length === 0) return
        setAssigning(true)
        try {
            for (const pkgId of selectedIds) {
                await packageService.assignToTrip(pkgId, Number(tripId))
            }
            onPackagesAssigned()
            onClose()
        } catch {
            // assignment failed - handled by UI
        } finally {
            setAssigning(false)
        }
    }

    return {
        searchQuery,
        setSearchQuery,
        selectedIds,
        loading,
        assigning,
        filteredPackages,
        allSelected,
        toggleSelect,
        toggleSelectAll,
        confirmAssignment,
    }
}
