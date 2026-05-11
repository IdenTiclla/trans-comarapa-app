import FormInput from '@/components/forms/FormInput'
import FormCheckbox from '@/components/forms/FormCheckbox'
import { cn } from '@/lib/utils'
import { getPackageDestination } from '@/lib/package-status'
import { Button } from '@/components/ui/button'
import { AppModal, AppModalPrimaryHeader } from '@/components/common'
import { Plus, Loader2, Package } from 'lucide-react'
import { usePackageAssignModal } from './use-package-assign'
import { LOCALE } from '@/lib/locale-config'

interface PackageAssignModalProps {
    show: boolean
    tripId: number | string
    onClose: () => void
    onPackagesAssigned: () => void
    onOpenRegistration?: () => void
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })
}

export default function PackageAssignModal({
    show,
    tripId,
    onClose,
    onPackagesAssigned,
    onOpenRegistration
}: PackageAssignModalProps) {
    const {
        searchQuery,
        setSearchQuery,
        loading,
        assigning,
        filteredPackages,
        allSelected,
        toggleSelect,
        toggleSelectAll,
        confirmAssignment,
        selectedIds,
    } = usePackageAssignModal(show, tripId)

    const header = (
        <AppModalPrimaryHeader
            icon={<Package className="h-5 w-5" />}
            title="Cargar Encomiendas al Viaje"
            subtitle="Seleccione las encomiendas para cargar al bus"
            onClose={onClose}
            actions={onOpenRegistration && (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { onClose(); onOpenRegistration() }}
                    className="gap-1.5"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Registrar Nueva
                </Button>
            )}
        />
    )

    const footer = (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-center sm:text-left">
                {selectedIds.length > 0 ? (
                    <span className="font-semibold text-primary">
                        {selectedIds.length} encomienda{selectedIds.length > 1 ? 's' : ''} seleccionada{selectedIds.length > 1 ? 's' : ''}
                    </span>
                ) : (
                    <span className="text-muted-foreground">Ninguna seleccionada</span>
                )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    Cancelar
                </Button>
                <Button
                    onClick={() => confirmAssignment(onPackagesAssigned, onClose)}
                    disabled={selectedIds.length === 0 || assigning}
                    className="w-full gap-1.5 sm:w-auto"
                >
                    {assigning && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {assigning ? 'Asignando...' : `Cargar ${selectedIds.length || ''} al Viaje`}
                </Button>
            </div>
        </div>
    )

    return (
        <AppModal
            open={show}
            onClose={onClose}
            size="lg"
            ariaLabel="Cargar encomiendas al viaje"
            header={header}
            footer={footer}
            contentClassName="max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
            bodyClassName="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
            <div className="mb-4">
                <FormInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder="Buscar por tracking, remitente, destinatario..."
                />
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <Loader2 className="animate-spin h-8 w-8 text-primary mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Cargando encomiendas disponibles...</p>
                </div>
            ) : filteredPackages.length === 0 ? (
                <div className="text-center py-10 px-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-muted/50 rounded-2xl mx-auto mb-4 text-muted-foreground">
                        <Package className="h-8 w-8" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                        {searchQuery ? 'Sin coincidencias' : 'Sin encomiendas pendientes'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {searchQuery
                            ? 'Ajuste la búsqueda o registre una nueva encomienda'
                            : 'No hay encomiendas disponibles para cargar a este viaje'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                        <FormCheckbox
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            label={`Seleccionar todo (${filteredPackages.length})`}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                            {selectedIds.length} seleccionada{selectedIds.length === 1 ? '' : 's'}
                        </span>
                    </div>

                    {filteredPackages.map(pkg => {
                        const selected = selectedIds.includes(pkg.id)
                        return (
                            <Button
                                type="button"
                                key={pkg.id}
                                variant="outline"
                                aria-pressed={selected}
                                className={cn(
                                    'flex h-auto w-full items-start justify-start rounded-lg border p-3 text-left whitespace-normal shadow-none transition-colors',
                                    selected
                                        ? 'bg-primary/10 border-primary/40'
                                        : 'bg-card border-border hover:bg-muted/50'
                                )}
                                onClick={() => toggleSelect(pkg.id)}
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background',
                                    )}
                                    aria-hidden="true"
                                >
                                    {selected && <span className="h-2 w-2 rounded-sm bg-current" />}
                                </span>
                                <div className="ml-3 min-w-0 flex-1">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                        <span className="text-sm font-semibold text-foreground truncate">#{pkg.tracking_number}</span>
                                        <span className="text-sm font-bold text-primary shrink-0">Bs. {(pkg.total_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center flex-wrap text-xs text-muted-foreground mt-1 gap-x-2 gap-y-1">
                                        <span>Origen: {pkg.sender_name || 'N/A'}</span>
                                        <span className="text-border" aria-hidden="true">|</span>
                                        <span className="text-primary font-medium">{getPackageDestination(pkg)}</span>
                                        <span className="text-border" aria-hidden="true">→</span>
                                        <span>Destino: {pkg.recipient_name || 'N/A'}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground/80 mt-0.5">
                                        {pkg.total_items_count || 0} items · {formatDate(pkg.created_at ?? '')}
                                    </div>
                                </div>
                            </Button>
                        )
                    })}
                </div>
            )}
        </AppModal>
    )
}
