import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AppModal, AppModalPrimaryHeader } from '@/components/common'
import { Check, Loader2, PackageCheck } from 'lucide-react'
import type { Package, PackageItem } from '@/types'

interface PackageReceptionModalProps {
    show: boolean
    packageData: Package | Record<string, unknown> | null
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

    const getSenderName = (pkg: Record<string, unknown> | null) => {
        if (!pkg) return 'N/A'
        if (pkg.sender_name) return pkg.sender_name
        if (pkg.sender) return `${pkg.sender.firstname || ''} ${pkg.sender.lastname || ''}`.trim() || 'N/A'
        return 'N/A'
    }

    const getRecipientName = (pkg: Record<string, unknown> | null) => {
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
        } catch {
            setIsSubmitting(false)
        }
    }

    const header = (
        <AppModalPrimaryHeader
            icon={<PackageCheck className="h-5 w-5" />}
            title="Recibir Encomienda"
            subtitle="Confirme la recepción en la oficina destino"
            onClose={onClose}
        />
    )

    const footer = (
        <div className="flex flex-col sm:flex-row-reverse gap-2 justify-start">
            <Button
                type="button"
                onClick={confirmReception}
                disabled={isSubmitting || !packageData}
                className="w-full sm:w-auto gap-1.5"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isSubmitting ? 'Confirmando...' : 'Sí, Marcar Recibida'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
            </Button>
        </div>
    )

    return (
        <AppModal
            open={show}
            onClose={onClose}
            size="sm"
            ariaLabel="Recibir encomienda"
            header={header}
            footer={footer}
            bodyClassName="px-6 py-5"
        >
            {packageData ? (
                <div className="space-y-3 text-sm">
                    <p className="text-foreground">
                        ¿Marcar la encomienda{' '}
                        <strong className="text-primary">
                            #{packageData.tracking_number || packageData.tracking_code}
                        </strong>{' '}
                        como recibida en la oficina destino?
                    </p>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground">Remitente</span>
                                <span className="text-foreground">{getSenderName(packageData)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-muted-foreground">Destinatario</span>
                                <span className="text-foreground">{getRecipientName(packageData)}</span>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border">
                            <span className="block text-xs font-medium text-muted-foreground mb-2">
                                Contenido ({packageData.total_items_count || 0} items)
                            </span>
                            <div className="bg-card rounded border border-border p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                                {packageData.items && packageData.items.length > 0 ? (
                                    <ul className="space-y-1">
                                        {((packageData.items as PackageItem[]) || []).map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between items-center text-xs py-1 border-b border-border/60 last:border-0"
                                            >
                                                <span className="flex items-start min-w-0 pr-4">
                                                    <span className="font-bold text-foreground mr-2 flex-shrink-0">{item.quantity}x</span>
                                                    <span className="text-muted-foreground truncate" title={item.description}>
                                                        {item.description}
                                                    </span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xs text-muted-foreground/80 italic py-1 text-center">
                                        Detalles de contenido no disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AppModal>
    )
}
