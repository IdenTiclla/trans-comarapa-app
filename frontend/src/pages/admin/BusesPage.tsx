import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchBuses, createBus, updateBus, deleteBus, createBusWithSeats, updateBusSeats, selectBuses, selectBusLoading, selectBusError } from '@/store/bus.slice'
import { ownerService } from '@/services/owner.service'
import { busService } from '@/services/bus.service'
import BusForm from '@/components/admin/BusForm'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bus, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Bus {
    id: number
    plate_number?: string
    license_plate?: string
    model?: string
    brand?: string
    capacity?: number
    floors?: number
    is_active?: boolean
    owner_id?: number | null
    [key: string]: unknown
}

interface Owner {
    id: number
    firstname: string
    lastname: string
}

export function Component() {
    const dispatch = useAppDispatch()
    const buses = useAppSelector(selectBuses) as Bus[]
    const loading = useAppSelector(selectBusLoading)
    const error = useAppSelector(selectBusError)

    const [showForm, setShowForm] = useState(false)
    const [editingBus, setEditingBus] = useState<Bus | null>(null)
    const [existingSeats, setExistingSeats] = useState<unknown[]>([])
    const [saving, setSaving] = useState(false)
    const [owners, setOwners] = useState<Owner[]>([])

    useEffect(() => {
        dispatch(fetchBuses({}))
        ownerService.getAll().then(data => {
            setOwners(Array.isArray(data) ? data : [])
        }).catch(err => console.error("Error cargando socios:", err))
    }, [dispatch])

    const openCreate = () => {
        setEditingBus(null)
        setExistingSeats([])
        setShowForm(true)
    }

    const openEdit = async (bus: Bus) => {
        setEditingBus(bus)
        setSaving(true)
        try {
            const seats = await busService.getSeats(bus.id)
            setExistingSeats(Array.isArray(seats) ? seats : [])
        } catch (err) {
            console.error("Error cargando asientos:", err)
            setExistingSeats([])
        } finally {
            setSaving(false)
        }
        setShowForm(true)
    }

    const handleFormSubmit = async (busData: Record<string, unknown>) => {
        setSaving(true)
        try {
            if (editingBus) {
                await dispatch(updateBus({ id: editingBus.id, data: busData })).unwrap()
                if (busData.seatsModified && busData.seats) {
                    await dispatch(updateBusSeats({ busId: editingBus.id, seats: busData.seats as unknown[] })).unwrap()
                }
                toast.success('Bus actualizado correctamente')
            } else {
                if (busData.seats && (busData.seats as unknown[]).length > 0) {
                    await dispatch(createBusWithSeats(busData)).unwrap()
                } else {
                    await dispatch(createBus(busData)).unwrap()
                }
                toast.success('Bus creado correctamente')
            }
            setShowForm(false)
        } catch (err) {
            toast.error(`Error: ${err}`)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (bus: Bus) => {
        if (!confirm(`¿Eliminar bus ${bus.plate_number || bus.license_plate}?`)) return
        try {
            await dispatch(deleteBus(bus.id)).unwrap()
            toast.success('Bus eliminado correctamente')
        } catch (err) {
            toast.error(`Error: ${err}`)
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Bus
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        {/* eslint-disable-next-line no-restricted-syntax */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pisos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dueño</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {buses.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No hay buses registrados</td></tr>
                                ) : (
                                    buses.map((bus) => (
                                        <tr key={bus.id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{bus.plate_number || bus.license_plate}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.model || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.brand || '—'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{bus.capacity || '—'}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant={(bus.floors ?? 1) === 2 ? 'default' : 'secondary'}>
                                                    {(bus.floors ?? 1) === 2 ? '2 pisos' : '1 piso'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {(() => {
                                                    const owner = bus.owner_id ? owners.find(o => o.id === bus.owner_id) : null
                                                    return owner ? `${owner.firstname} ${owner.lastname}` : <span className="text-gray-400">Sin dueño</span>
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={bus.is_active !== false ? 'default' : 'destructive'}>
                                                    {bus.is_active !== false ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(bus)}>
                                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                                        Editar
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(bus)}>
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <BusForm
                        bus={editingBus}
                        isEditing={!!editingBus}
                        existingSeats={existingSeats}
                        loading={saving}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}
        </div>
    )
}
