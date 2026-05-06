import { useState, useMemo, useEffect } from 'react'
import { useAppSelector } from '@/store'
import { packageService } from '@/services/package.service'
import { cashRegisterService } from '@/services/cash-register.service'
import { errMsg } from '@/lib/error-utils'

interface Person { firstname?: string; lastname?: string }
export interface DeliveryItem { id?: number; description?: string; quantity?: number; total_price?: number; [k: string]: unknown }
export interface PackageData {
    id: number
    tracking_number?: string
    payment_status?: string
    payment_method?: string
    sender_name?: string
    receiver_name?: string
    recipient_name?: string
    total_amount?: number
    price?: number
    total_items_count?: number
    sender?: Person
    recipient?: Person
    items?: DeliveryItem[]
    [k: string]: unknown
}

export function usePackageDeliveryModal(show: boolean, packageData: PackageData | null) {
    const { user } = useAppSelector((state) => state.auth)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash')
    const [isCashRegisterOpen, setIsCashRegisterOpen] = useState<boolean | null>(null)

    useEffect(() => {
        if (show) {
            setPaymentMethod('cash')
            setIsSubmitting(false)
            setErrorMessage('')
            setIsCashRegisterOpen(null)
        }
    }, [show])

    useEffect(() => {
        const checkCashRegister = async () => {
            if (!show || !packageData) return
            if (packageData.payment_status !== 'collect_on_delivery') {
                setIsCashRegisterOpen(true)
                return
            }
            const officeId = user?.office_id
            if (!officeId) {
                setIsCashRegisterOpen(false)
                return
            }
            try {
                const register = await cashRegisterService.getCurrentRegister(officeId)
                setIsCashRegisterOpen(register?.status === 'open')
            } catch {
                setIsCashRegisterOpen(false)
            }
        }
        checkCashRegister()
    }, [show, packageData, user?.office_id])

    const isReadyToDeliver = useMemo(() => {
        if (!packageData) return false
        if (packageData.payment_status === 'collect_on_delivery') {
            if (paymentMethod === null) return false
            if (isCashRegisterOpen === false) return false
        }
        return true
    }, [packageData, paymentMethod, isCashRegisterOpen])

    const getSenderName = (pkg: PackageData | null) => {
        if (!pkg) return 'N/A'
        if (pkg.sender_name) return pkg.sender_name
        if (pkg.sender) return `${pkg.sender.firstname || ''} ${pkg.sender.lastname || ''}`.trim() || 'N/A'
        return 'N/A'
    }

    const getRecipientName = (pkg: PackageData | null) => {
        if (!pkg) return 'N/A'
        if (pkg.receiver_name) return pkg.receiver_name
        if (pkg.recipient_name) return pkg.recipient_name
        if (pkg.recipient) return `${pkg.recipient.firstname || ''} ${pkg.recipient.lastname || ''}`.trim() || 'N/A'
        return 'N/A'
    }

    const confirmDelivery = async (onConfirm: (data: { packageId: number }) => void) => {
        if (!isReadyToDeliver || !packageData) return

        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const defaultMethod = 'cash'
            let finalPaymentMethod = defaultMethod

            if (packageData.payment_status === 'collect_on_delivery') {
                finalPaymentMethod = paymentMethod
            } else {
                finalPaymentMethod = packageData.payment_method || defaultMethod
            }

            await packageService.deliver(packageData.id, finalPaymentMethod, user?.id || null)
            onConfirm({ packageId: packageData.id })
        } catch (error) {
            setErrorMessage(errMsg(error, 'Error al confirmar la entrega. Por favor, intente nuevamente.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        user,
        isSubmitting,
        errorMessage,
        paymentMethod,
        setPaymentMethod,
        isCashRegisterOpen,
        isReadyToDeliver,
        getSenderName,
        getRecipientName,
        confirmDelivery,
    }
}
