import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppSelector } from '@/store'
import { packageService } from '@/services/package.service'
import { cashRegisterService } from '@/services/cash-register.service'
import { cn } from '@/lib/utils'

interface PackageDeliveryModalProps {
    show: boolean
    packageData: any
    onClose: () => void
    onConfirm: (data: { packageId: number }) => void
}

export default function PackageDeliveryModal({
    show,
    packageData,
    onClose,
    onConfirm
}: PackageDeliveryModalProps) {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash')
    const [isCashRegisterOpen, setIsCashRegisterOpen] = useState<boolean | null>(null)
    const [checkingCashRegister, setCheckingCashRegister] = useState(false)

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
            setCheckingCashRegister(true)
            try {
                const register = await cashRegisterService.getCurrentRegister(officeId)
                setIsCashRegisterOpen(register?.status === 'open')
            } catch {
                setIsCashRegisterOpen(false)
            } finally {
                setCheckingCashRegister(false)
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

    const getSenderName = (pkg: any) => {
        if (!pkg) return 'N/A'
        if (pkg.sender_name) return pkg.sender_name
        if (pkg.sender) return `${pkg.sender.firstname || ''} ${pkg.sender.lastname || ''}`.trim() || 'N/A'
        return 'N/A'
    }

    const getRecipientName = (pkg: any) => {
        if (!pkg) return 'N/A'
        if (pkg.receiver_name) return pkg.receiver_name
        if (pkg.recipient_name) return pkg.recipient_name
        if (pkg.recipient) return `${pkg.recipient.firstname || ''} ${pkg.recipient.lastname || ''}`.trim() || 'N/A'
        return 'N/A'
    }

    const confirmDelivery = async () => {
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
            // Don't close here, parent should close on confirm
        } catch (error: any) {
            console.error('Error in confirm delivery:', error)
            setErrorMessage(error.data?.detail || error.message || 'Error al confirmar la entrega. Por favor, intente nuevamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!show || !packageData) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 modal-overlay-bokeh" aria-hidden="true" onClick={onClose} />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                <div
                    className="relative z-10 w-full bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl leading-6 font-medium text-white flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Entregar Encomienda
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 focus:outline-none"
                            >
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white px-6 py-6 border-b border-gray-200">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 h-full w-2 flex flex-col justify-between">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="h-1 w-full bg-gray-300"></div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Nº Tracking</h4>
                                        <p className="text-xl font-bold text-gray-900 tracking-wide">{packageData.tracking_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total</h4>
                                        <p className="text-2xl font-black text-green-600">Bs. {(packageData.total_amount || packageData.price || 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Remitente</p>
                                        <p className="text-sm font-semibold text-gray-800">{getSenderName(packageData)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Destinatario</p>
                                        <p className="text-sm font-semibold text-gray-800">{getRecipientName(packageData)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 font-medium mb-2">Contenido ({packageData.total_items_count || 0} items)</p>
                                    <div className="bg-white rounded border border-gray-100 p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                                        {packageData.items && packageData.items.length > 0 ? (
                                            <ul className="space-y-1">
                                                {packageData.items.map((item: any) => (
                                                    <li key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                                        <span className="flex items-start min-w-0 pr-4">
                                                            <span className="font-bold text-gray-700 mr-2 flex-shrink-0">{item.quantity}x</span>
                                                            <span className="text-gray-600 truncate" title={item.description}>{item.description}</span>
                                                        </span>
                                                        <span className="text-gray-500 text-xs font-medium flex-shrink-0">
                                                            Bs. {(item.total_price || 0).toFixed(2)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic py-1 text-center">
                                                Detalles de contenido no disponibles
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                    Detalles del Pago
                                </h4>

                                {packageData.payment_status === 'paid_on_send' ? (
                                    <div className="bg-green-50 rounded-lg p-5 border border-green-200 flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-bold text-green-800">Pagado al Enviar</h3>
                                            <div className="mt-1 text-sm text-green-700">
                                                <p>Este paquete ya fue pagado en origen mediante <strong>{packageData.payment_method === 'qr' ? 'QR' : 'Efectivo'}</strong>.</p>
                                                <p className="mt-1">No se requiere cobrar ningún monto al destinatario.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : packageData.payment_status === 'collect_on_delivery' ? (
                                    <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                                        <div className="flex items-start mb-4">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <svg className="h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-bold text-orange-800">Por Cobrar en Destino</h3>
                                                <p className="mt-1 text-sm text-orange-700">Debe cobrar <strong className="text-lg">Bs. {(packageData.total_amount || packageData.price || 0).toFixed(2)}</strong> al entregar la encomienda.</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-orange-200 pt-4">
                                            <label className="block text-sm font-medium text-orange-900 mb-2">Seleccione el método de pago recibido:</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div
                                                    onClick={() => setPaymentMethod('cash')}
                                                    className={cn(
                                                        'cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all',
                                                        paymentMethod === 'cash' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300'
                                                    )}
                                                >
                                                    <svg className={cn("h-8 w-8 mb-2", paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-400')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span className={cn("text-sm font-bold", paymentMethod === 'cash' ? 'text-orange-800' : 'text-gray-600')}>Efectivo</span>
                                                </div>

                                                <div
                                                    onClick={() => setPaymentMethod('qr')}
                                                    className={cn(
                                                        'cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all',
                                                        paymentMethod === 'qr' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300'
                                                    )}
                                                >
                                                    <svg className={cn("h-8 w-8 mb-2", paymentMethod === 'qr' ? 'text-orange-600' : 'text-gray-400')} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    <span className={cn("text-sm font-bold", paymentMethod === 'qr' ? 'text-orange-800' : 'text-gray-600')}>Transferencia QR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <p className="text-gray-500 text-sm italic">Estado de pago no definido apropiadamente. Se asumirá pago en efectivo.</p>
                                    </div>
                                )}

                                {packageData.payment_status === 'collect_on_delivery' && isCashRegisterOpen === false && (
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="text-sm font-bold text-red-800">Caja Cerrada</h3>
                                                <p className="mt-1 text-sm text-red-700">
                                                    Debe abrir caja antes de cobrar este paquete. El cobro se registrará en la caja.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/admin/cash-register')}
                                                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                    Ir a Caja
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mx-6 mt-2 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelivery}
                            disabled={isSubmitting || !isReadyToDeliver}
                            className="px-5 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {isSubmitting ? 'Confirmando...' : 'Confirmar Entrega'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
