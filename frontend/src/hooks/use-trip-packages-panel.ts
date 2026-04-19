import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

function notify(type: 'success' | 'error', title: string, message: string) {
    if (type === 'success') toast.success(title, { description: message })
    else toast.error(title, { description: message })
}

export function useTripPackagesPanel(tripId: number) {
    const [tripPackages, setTripPackages] = useState<any[]>([])
    const [loadingPackages, setLoadingPackages] = useState(false)

    const [showPackageAssignModal, setShowPackageAssignModal] = useState(false)
    const [showPackageDeliveryModal, setShowPackageDeliveryModal] = useState(false)
    const [showPackageReceptionModal, setShowPackageReceptionModal] = useState(false)
    const [showPackageRegistrationModal, setShowPackageRegistrationModal] = useState(false)
    const [showPackageReceiptModal, setShowPackageReceiptModal] = useState(false)
    const [selectedPackageForDelivery, setSelectedPackageForDelivery] = useState<any>(null)
    const [selectedPackageForReception, setSelectedPackageForReception] = useState<any>(null)
    const [selectedPackageForReceipt, setSelectedPackageForReceipt] = useState<any>(null)

    const fetchPackages = useCallback(async (tId: number) => {
        setLoadingPackages(true)
        try {
            const data = await apiFetch(`/packages/by-trip/${tId}`)
            setTripPackages(Array.isArray(data) ? data : [])
        } catch { setTripPackages([]) }
        finally { setLoadingPackages(false) }
    }, [])

    const handleUnassignPackage = async (packageId: number) => {
        try {
            await apiFetch(`/packages/${packageId}/unassign`, { method: 'POST' })
            notify('success', 'Encomienda removida', 'La encomienda fue removida del viaje.')
            fetchPackages(tripId)
        } catch (err: any) {
            notify('error', 'Error', err?.message || 'No se pudo remover la encomienda.')
        }
    }

    const handleDeliverPackage = (packageId: number) => {
        const pkg = tripPackages.find(p => p.id === packageId)
        if (pkg) {
            setSelectedPackageForDelivery(pkg)
            setShowPackageDeliveryModal(true)
        }
    }

    const handleReceivePackage = (packageId: number) => {
        const pkg = tripPackages.find(p => p.id === packageId)
        if (pkg) {
            setSelectedPackageForReception(pkg)
            setShowPackageReceptionModal(true)
        }
    }

    const handleShowReceipt = (packageId: number) => {
        const pkg = tripPackages.find(p => p.id === packageId)
        if (pkg) {
            setSelectedPackageForReceipt(pkg)
            setShowPackageReceiptModal(true)
        }
    }

    const handlePackagesAssigned = () => {
        fetchPackages(tripId)
        notify('success', 'Encomiendas cargadas', 'Las encomiendas fueron asignadas al viaje.')
    }

    const handleDeliveryConfirm = () => {
        setShowPackageDeliveryModal(false)
        setSelectedPackageForDelivery(null)
        fetchPackages(tripId)
        notify('success', 'Encomienda entregada', 'La encomienda fue entregada correctamente.')
    }

    const handleReceptionConfirm = async (packageId: number) => {
        try {
            await apiFetch(`/packages/${packageId}/update-status`, {
                method: 'PUT',
                body: { new_status: 'arrived_at_destination' },
            })
            setShowPackageReceptionModal(false)
            setSelectedPackageForReception(null)
            fetchPackages(tripId)
            notify('success', 'Encomienda recibida', 'La encomienda fue marcada como recibida en destino.')
        } catch (err: any) {
            notify('error', 'Error', err?.message || 'No se pudo actualizar el estado.')
        }
    }

    const handlePackageRegistered = () => {
        fetchPackages(tripId)
    }

    return {
        fetchPackages,
        panel: {
            items: tripPackages,
            loading: loadingPackages,
            unassign: handleUnassignPackage,
            deliver: handleDeliverPackage,
            receive: handleReceivePackage,
            showReceipt: handleShowReceipt,
            openAssignModal: () => setShowPackageAssignModal(true),
            assignModal: {
                show: showPackageAssignModal,
                close: () => setShowPackageAssignModal(false),
                onAssigned: handlePackagesAssigned,
            },
            deliveryModal: {
                show: showPackageDeliveryModal,
                packageData: selectedPackageForDelivery,
                close: () => { setShowPackageDeliveryModal(false); setSelectedPackageForDelivery(null) },
                onConfirm: handleDeliveryConfirm,
            },
            receptionModal: {
                show: showPackageReceptionModal,
                packageData: selectedPackageForReception,
                close: () => { setShowPackageReceptionModal(false); setSelectedPackageForReception(null) },
                onConfirm: handleReceptionConfirm,
            },
            receiptModal: {
                show: showPackageReceiptModal,
                packageData: selectedPackageForReceipt,
                close: () => { setShowPackageReceiptModal(false); setSelectedPackageForReceipt(null) },
            },
            registrationModal: {
                show: showPackageRegistrationModal,
                open: () => setShowPackageRegistrationModal(true),
                close: () => setShowPackageRegistrationModal(false),
                onRegistered: handlePackageRegistered,
            },
        },
    }
}
