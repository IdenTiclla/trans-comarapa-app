import { useState, useMemo, useEffect } from 'react'
import { packageService } from '@/services/package.service'
import FormInput from '@/components/forms/FormInput'
import FormCheckbox from '@/components/forms/FormCheckbox'
import { cn } from '@/lib/utils'
import { getPackageDestination } from '@/lib/package-status'
import { Button } from '@/components/ui/button'
import { Plus, X, Loader2, Package } from 'lucide-react'

interface PackageAssignModalProps {
    show: boolean
    tripId: number | string
    onClose: () => void
    onPackagesAssigned: () => void
    onOpenRegistration?: () => void
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export default function PackageAssignModal({
    show,
    tripId,
    onClose,
    onPackagesAssigned,
    onOpenRegistration
}: PackageAssignModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [assigning, setAssigning] = useState(false)
    const [unassignedPackages, setUnassignedPackages] = useState<any[]>([])

    useEffect(() => {
        if (show && tripId) {
            setLoading(true)
            setSelectedIds([])
            setSearchQuery('')
            packageService.getUnassigned()
                .then(res => {
                    const data = Array.isArray(res) ? res : ((res as any).packages || (res as any).data || [])
                    setUnassignedPackages(data)
                })
                .catch(err => {
                    console.error('Error loading unassigned packages:', err)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [show, tripId])

    const filteredPackages = useMemo(() => {
        if (!searchQuery.trim()) return unassignedPackages
        const term = searchQuery.toLowerCase()
        return unassignedPackages.filter(pkg =>
            (pkg.tracking_number && pkg.tracking_number.toLowerCase().includes(term)) ||
            (pkg.sender_name && pkg.sender_name.toLowerCase().includes(term)) ||
            (pkg.recipient_name && pkg.recipient_name.toLowerCase().includes(term))
        )
    }, [searchQuery, unassignedPackages])

    const allSelected = filteredPackages.length > 0 && filteredPackages.every(p => selectedIds.includes(p.id))

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredPackages.map(p => p.id))
        }
    }

    const confirmAssignment = async () => {
        if (selectedIds.length === 0) return
        setAssigning(true)
        try {
            for (const pkgId of selectedIds) {
                await packageService.assignToTrip(pkgId, Number(tripId))
            }
            onPackagesAssigned()
            onClose()
        } catch (error) {
            console.error('Error assigning packages:', error)
        } finally {
            setAssigning(false)
        }
    }

    if (!show) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
            <div className="fixed inset-0 modal-overlay-bokeh" onClick={onClose} />
            <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div
                    className="relative z-10 w-full bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-3xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-white">Cargar Encomiendas al Viaje</h3>
                                <p className="text-sm text-indigo-200">Seleccione las encomiendas para cargar al bus</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {onOpenRegistration && (
                                    <Button
                                        onClick={() => { onClose(); onOpenRegistration(); }}
                                        className="h-auto text-xs font-medium bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 shadow-sm"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Registrar Nueva
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar" className="text-white hover:text-gray-200 hover:bg-transparent">
                                    <X className="h-6 w-6" />
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
                                <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
                                <p className="mt-2 text-sm text-gray-500">Cargando encomiendas disponibles...</p>
                            </div>
                        ) : filteredPackages.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    {searchQuery ? 'No se encontraron encomiendas' : 'No hay encomiendas pendientes'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                    <FormCheckbox
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        label={`Seleccionar todo (${filteredPackages.length})`}
                                    />
                                    <span className="text-sm text-gray-500">{selectedIds.length} seleccionadas</span>
                                </div>

                                {filteredPackages.map(pkg => (
                                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                    <div
                                        key={pkg.id}
                                        className={cn(
                                            'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                                            selectedIds.includes(pkg.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                                        )}
                                        onClick={() => toggleSelect(pkg.id)}
                                    >
                                        <FormCheckbox
                                            checked={selectedIds.includes(pkg.id)}
                                            onChange={() => toggleSelect(pkg.id)}
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">#{pkg.tracking_number}</span>
                                                <span className="text-sm font-semibold text-indigo-700">Bs. {(pkg.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                <span>{`\uD83D\uDCE4`} {pkg.sender_name || 'N/A'}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-indigo-600 font-medium">{getPackageDestination(pkg)}</span>
                                                <span className="text-gray-300">→</span>
                                                <span>{`\uD83D\uDCE5`} {pkg.recipient_name || 'N/A'}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {pkg.total_items_count || 0} items · {formatDate(pkg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            {selectedIds.length > 0 ? (
                                <span className="font-medium text-indigo-700">
                                    {selectedIds.length} encomienda{selectedIds.length > 1 ? 's' : ''} seleccionada{selectedIds.length > 1 ? 's' : ''}
                                </span>
                            ) : (
                                <span className="text-gray-400">Ninguna seleccionada</span>
                            )}
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmAssignment}
                                disabled={selectedIds.length === 0 || assigning}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {assigning ? 'Asignando...' : `Cargar ${selectedIds.length || ''} al Viaje`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
