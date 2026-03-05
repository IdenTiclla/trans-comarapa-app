import { useState, useMemo, useEffect } from 'react'
import { packageService } from '@/services/package.service'
import FormInput from '@/components/forms/FormInput'
import { cn } from '@/lib/utils'

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
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
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
                                    <button
                                        onClick={() => { onClose(); onOpenRegistration(); }}
                                        className="text-xs font-medium bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Registrar Nueva
                                    </button>
                                )}
                                <button onClick={onClose} className="text-white hover:text-gray-200">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
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
                                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Cargando encomiendas disponibles...</p>
                            </div>
                        ) : filteredPackages.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">
                                    {searchQuery ? 'No se encontraron encomiendas' : 'No hay encomiendas pendientes'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">Seleccionar todo ({filteredPackages.length})</span>
                                    </label>
                                    <span className="text-sm text-gray-500">{selectedIds.length} seleccionadas</span>
                                </div>

                                {filteredPackages.map(pkg => (
                                    <div
                                        key={pkg.id}
                                        className={cn(
                                            'flex items-center p-3 rounded-lg border cursor-pointer transition-colors',
                                            selectedIds.includes(pkg.id) ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-200 hover:bg-gray-50'
                                        )}
                                        onClick={() => toggleSelect(pkg.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(pkg.id)}
                                            onChange={() => toggleSelect(pkg.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 flex-shrink-0"
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">#{pkg.tracking_number}</span>
                                                <span className="text-sm font-semibold text-indigo-700">Bs. {(pkg.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                                <span>{`\uD83D\uDCE4`} {pkg.sender_name || 'N/A'}</span>
                                                <span>→</span>
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
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmAssignment}
                                disabled={selectedIds.length === 0 || assigning}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {assigning ? 'Asignando...' : `Cargar ${selectedIds.length || ''} al Viaje`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
