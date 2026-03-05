import { useState, useEffect } from 'react'

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
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
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
                        <button
                            type="button"
                            onClick={confirmReception}
                            disabled={isSubmitting || !packageData}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:w-auto sm:text-sm disabled:opacity-50 items-center"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSubmitting ? 'Confirmando...' : 'Sí, Marcar Recibida'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
