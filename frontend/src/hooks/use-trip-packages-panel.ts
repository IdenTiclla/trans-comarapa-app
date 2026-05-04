import { useState, useCallback } from 'react'
import { packageService } from '@/services/package.service'
import { toast } from 'sonner'
import { errMsg } from '@/lib/error-utils'

interface TripPackage {
    id: number
    [key: string]: unknown
}

function notify(type: 'success' | 'error', title: string, message: string) {
    if (type === 'success') toast.success(title, { description: message })
    else toast.error(title, { description: message })
}

export function useTripPackagesPanel(tripId: number) {
    const [tripPackages, setTripPackages] = useState<TripPackage[]>([])
    const [loadingPackages, setLoadingPackages] = useState(false)

    const [showPackageAssignModal, setShowPackageAssignModal] = useState(false)
    const [showPackageDeliveryModal, setShowPackageDeliveryModal] = useState(false)
    const [showPackageReceptionModal, setShowPackageReceptionModal] = useState(false)
    const [showPackageRegistrationModal, setShowPackageRegistrationModal] = useState(false)
    const [showPackageReceiptModal, setShowPackageReceiptModal] = useState(false)
    const [selectedPackageForDelivery, setSelectedPackageForDelivery] = useState<TripPackage | null>(null)
    const [selectedPackageForReception, setSelectedPackageForReception] = useState<TripPackage | null>(null)
    const [selectedPackageForReceipt, setSelectedPackageForReceipt] = useState<TripPackage | null>(null)

    const fetchPackages = useCallback(async (tId: number) => {
        setLoadingPackages(true)
        try {
            const data = await packageService.getByTrip(tId)
            setTripPackages(Array.isArray(data) ? (data as TripPackage[]) : [])
        } catch { setTripPackages([]) }
        finally { setLoadingPackages(false) }
    }, [])

    const handleUnassignPackage = async (packageId: number) => {
        try {
            await packageService.unassign(packageId)
            notify('success', 'Encomienda removida', 'La encomienda fue removida del viaje.')
            fetchPackages(tripId)
        } catch (err) {
            notify('error', 'Error', errMsg(err, 'No se pudo remover la encomienda.'))
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
            await packageService.updateStatus(packageId, 'arrived_at_destination')
            setShowPackageReceptionModal(false)
            setSelectedPackageForReception(null)
            fetchPackages(tripId)
            notify('success', 'Encomienda recibida', 'La encomienda fue marcada como recibida en destino.')
        } catch (err) {
            notify('error', 'Error', errMsg(err, 'No se pudo actualizar el estado.'))
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
