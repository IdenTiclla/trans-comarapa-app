/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

interface PackageReceptionModalProps {
    show: boolean
    packageData: any
    onClose: () => void
    onConfirm: (packageId: number) => void
}

export default function PackageReceptionModal({
    show,
    packageData,
    onClose,
    onConfirm
}: PackageReceptionModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (show) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsSubmitting(false)
        }
    }, [show])

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

    const confirmReception = async () => {
        if (!packageData) return
        setIsSubmitting(true)

        try {
            await onConfirm(packageData.id)
        } catch (error) {
            console.error('Error confirming reception', error)
            setIsSubmitting(false)
        }
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 modal-overlay-bokeh" aria-hidden="true" onClick={onClose} />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className="relative z-10 w-full bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                                <Check className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Recibir Encomienda
                                </h3>
                                <div className="mt-2 text-sm text-gray-500 w-full mb-3">
                                    {packageData ? (
                                        <>
                                            <p className="mb-3">
                                                ¿Estás seguro de que deseas marcar la encomienda <strong>#{packageData.tracking_number || packageData.tracking_code}</strong> como recibida en la oficina destino?
                                            </p>
                                            <div className="bg-gray-50 rounded p-3 text-gray-600 border border-gray-100">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-400">Remitente</span>
                                                        <span>{getSenderName(packageData)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-gray-400">Destinatario</span>
                                                        <span>{getRecipientName(packageData)}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <span className="block text-xs font-medium text-gray-400 mb-2">Contenido ({packageData.total_items_count || 0} items)</span>
                                                    <div className="bg-white rounded border border-gray-100 p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                                                        {packageData.items && packageData.items.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {packageData.items.map((item: any) => (
                                                                    <li key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                                                                        <span className="flex items-start min-w-0 pr-4">
                                                                            <span className="font-bold text-gray-700 mr-2 flex-shrink-0">{item.quantity}x</span>
                                                                            <span className="text-gray-600 truncate" title={item.description}>{item.description}</span>
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="text-xs text-gray-400 italic py-1 text-center">
                                                                Detalles de contenido no disponibles
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-2">
                        <Button
                            type="button"
                            onClick={confirmReception}
                            disabled={isSubmitting || !packageData}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Confirmando...' : 'Sí, Marcar Recibida'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
