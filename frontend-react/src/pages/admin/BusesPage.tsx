import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchBuses, createBus, updateBus, deleteBus, createBusWithSeats, updateBusSeats, selectBuses, selectBusLoading, selectBusError } from '@/store/bus.slice'
import { ownerService } from '@/services/owner.service'
import { busService } from '@/services/bus.service'
import BusForm from '@/components/admin/BusForm'
import { toast } from 'sonner'

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
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Administración de Buses</h1>
                    <p className="text-gray-600 mt-1">Gestiona los buses de la flota</p>
                </div>
                <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                    + Nuevo Bus
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
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
                        <tbody className="bg-white divide-y divide-gray-200">
                            {buses.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No hay buses registrados</td></tr>
                            ) : (
                                buses.map((bus) => (
                                    <tr key={bus.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{bus.plate_number || bus.license_plate}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{bus.model || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{bus.brand || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{bus.capacity || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${(bus.floors ?? 1) === 2 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {(bus.floors ?? 1) === 2 ? '2 pisos' : '1 piso'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {(() => {
                                                const owner = bus.owner_id ? owners.find(o => o.id === bus.owner_id) : null
                                                return owner ? `${owner.firstname} ${owner.lastname}` : <span className="text-gray-400">Sin dueño</span>
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${bus.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {bus.is_active !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => openEdit(bus)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                                            <button onClick={() => handleDelete(bus)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
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
