import FormInput from '@/components/forms/FormInput'
import FormCheckbox from '@/components/forms/FormCheckbox'
import { cn } from '@/lib/utils'
import { getPackageDestination } from '@/lib/package-status'
import { Button } from '@/components/ui/button'
import { Plus, X, Loader2, Package } from 'lucide-react'
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

    if (!show) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="fixed inset-0 modal-overlay-bokeh" onClick={onClose} />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className="relative z-10 w-full bg-card rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-3xl border border-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-primary px-6 py-4 border-b border-border">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-foreground/15 text-primary-foreground shrink-0">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold text-primary-foreground truncate">Cargar Encomiendas al Viaje</h3>
                                    <p className="text-xs text-primary-foreground/80">Seleccione las encomiendas para cargar al bus</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {onOpenRegistration && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => { onClose(); onOpenRegistration(); }}
                                        className="gap-1.5"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Registrar Nueva
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                    className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 max-h-[60vh] overflow-y-auto w-full">
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
                                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                        <div
                                            key={pkg.id}
                                            className={cn(
                                                'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                                                selected
                                                    ? 'bg-primary/10 border-primary/40'
                                                    : 'bg-card border-border hover:bg-muted/50'
                                            )}
                                            onClick={() => toggleSelect(pkg.id)}
                                        >
                                            <FormCheckbox
                                                checked={selected}
                                                onChange={() => toggleSelect(pkg.id)}
                                            />
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-semibold text-foreground truncate">#{pkg.tracking_number}</span>
                                                    <span className="text-sm font-bold text-primary shrink-0">Bs. {(pkg.total_amount || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center flex-wrap text-xs text-muted-foreground mt-1 gap-x-2 gap-y-1">
                                                    <span>{`📤`} {pkg.sender_name || 'N/A'}</span>
                                                    <span className="text-border">|</span>
                                                    <span className="text-primary font-medium">{getPackageDestination(pkg)}</span>
                                                    <span className="text-border">→</span>
                                                    <span>{`📥`} {pkg.recipient_name || 'N/A'}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground/80 mt-0.5">
                                                    {pkg.total_items_count || 0} items · {formatDate(pkg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/50 px-6 py-4 flex justify-between items-center border-t border-border gap-3">
                        <div className="text-sm">
                            {selectedIds.length > 0 ? (
                                <span className="font-semibold text-primary">
                                    {selectedIds.length} encomienda{selectedIds.length > 1 ? 's' : ''} seleccionada{selectedIds.length > 1 ? 's' : ''}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Ninguna seleccionada</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => confirmAssignment(onPackagesAssigned, onClose)}
                                disabled={selectedIds.length === 0 || assigning}
                                className="gap-1.5"
                            >
                                {assigning && <Loader2 className="h-4 w-4 animate-spin" />}
                                {assigning ? 'Asignando...' : `Cargar ${selectedIds.length || ''} al Viaje`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
