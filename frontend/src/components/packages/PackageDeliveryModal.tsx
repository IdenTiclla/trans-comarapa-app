import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppSelector } from '@/store'
import { packageService } from '@/services/package.service'
import { cashRegisterService } from '@/services/cash-register.service'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Check, X, CreditCard, CheckCircle, Banknote, QrCode, AlertTriangle, Wallet, AlertCircle, Loader2 } from 'lucide-react'

interface Person { firstname?: string; lastname?: string }
interface PackageItem { id?: number; description?: string; quantity?: number; [k: string]: unknown }
interface PackageData {
    id: number
    payment_status?: string
    sender_name?: string
    receiver_name?: string
    recipient_name?: string
    sender?: Person
    recipient?: Person
    items?: PackageItem[]
    [k: string]: unknown
}

interface PackageDeliveryModalProps {
    show: boolean
    packageData: PackageData | null
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
    const [, setCheckingCashRegister] = useState(false)

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
        } catch (error) {
            console.error('Error in confirm delivery:', error)
            setErrorMessage(error.data?.detail || (error instanceof Error ? error.message : String(error)) || 'Error al confirmar la entrega. Por favor, intente nuevamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!show || !packageData) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 modal-overlay-bokeh" aria-hidden="true" onClick={onClose} />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className="relative z-10 w-full bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-primary px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl leading-6 font-medium text-primary-foreground flex items-center">
                                <Check className="h-6 w-6 mr-2" />
                                Entregar Encomienda
                            </h3>
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:text-primary-foreground/80">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white px-6 py-6 border-b border-gray-200">
                        <div className="space-y-6">
                            <div className="bg-muted/50 p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
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
                                        <p className="text-2xl font-black text-primary">Bs. {(packageData.total_amount ?? packageData.price ?? 0).toFixed(2)}</p>
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
                                    <p className="text-xs text-gray-500 font-medium mb-2">Contenido ({packageData.total_items_count ?? 0} items)</p>
                                    <div className="bg-white rounded border border-gray-100 p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                                        {packageData.items && packageData.items.length > 0 ? (
                                            <ul className="space-y-1">
                                                {packageData.items.map((item: PackageItem) => (
                                                    <li key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                                                        <span className="flex items-start min-w-0 pr-4">
                                                            <span className="font-bold text-gray-700 mr-2 flex-shrink-0">{item.quantity}x</span>
                                                            <span className="text-gray-600 truncate" title={item.description}>{item.description}</span>
                                                        </span>
                                                        <span className="text-gray-500 text-xs font-medium flex-shrink-0">
                                                            Bs. {(item.total_price ?? 0).toFixed(2)}
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
                                    <CreditCard className="h-5 w-5 mr-2 text-primary" />
                                    Detalles del Pago
                                </h4>

                                {packageData.payment_status === 'paid_on_send' ? (
                                    <div className="bg-green-50 rounded-lg p-5 border border-green-200 flex items-start">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <CheckCircle className="h-6 w-6 text-green-500" />
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
                                                <Banknote className="h-6 w-6 text-orange-500" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-bold text-orange-800">Por Cobrar en Destino</h3>
                                                <p className="mt-1 text-sm text-orange-700">Debe cobrar <strong className="text-lg">Bs. {(packageData.total_amount ?? packageData.price ?? 0).toFixed(2)}</strong> al entregar la encomienda.</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-orange-200 pt-4">
                                            <span className="block text-sm font-medium text-orange-900 mb-2">Seleccione el método de pago recibido:</span>
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                                                <div
                                                    onClick={() => setPaymentMethod('cash')}
                                                    className={cn(
                                                        'cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all',
                                                        paymentMethod === 'cash' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300'
                                                    )}
                                                >
                                                    <Banknote className={cn("h-8 w-8 mb-2", paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-400')} />
                                                    <span className={cn("text-sm font-bold", paymentMethod === 'cash' ? 'text-orange-800' : 'text-gray-600')}>Efectivo</span>
                                                </div>

                                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                                                <div
                                                    onClick={() => setPaymentMethod('qr')}
                                                    className={cn(
                                                        'cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all',
                                                        paymentMethod === 'qr' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300'
                                                    )}
                                                >
                                                    <QrCode className={cn("h-8 w-8 mb-2", paymentMethod === 'qr' ? 'text-orange-600' : 'text-gray-400')} />
                                                    <span className={cn("text-sm font-bold", paymentMethod === 'qr' ? 'text-orange-800' : 'text-gray-600')}>Transferencia QR</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-muted/50 rounded-lg p-5 border border-gray-200">
                                        <p className="text-gray-500 text-sm italic">Estado de pago no definido apropiadamente. Se asumirá pago en efectivo.</p>
                                    </div>
                                )}

                                {packageData.payment_status === 'collect_on_delivery' && isCashRegisterOpen === false && (
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="text-sm font-bold text-red-800">Caja Cerrada</h3>
                                                <p className="mt-1 text-sm text-red-700">
                                                    Debe abrir caja antes de cobrar este paquete. El cobro se registrará en la caja.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate('/admin/cash-register')}
                                                    className="mt-3 border-red-300 text-red-700 hover:bg-red-50 gap-1.5"
                                                >
                                                    <Wallet className="h-4 w-4" />
                                                    Ir a Caja
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mx-6 mt-2 mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                        </div>
                    )}

                    <div className="bg-muted/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmDelivery}
                            disabled={isSubmitting || !isReadyToDeliver}
                            className="gap-1.5"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            {isSubmitting ? 'Confirmando...' : 'Confirmar Entrega'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
