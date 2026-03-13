import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchBuses, createBus, updateBus, deleteBus, selectBuses, selectBusLoading, selectBusError } from '@/store/bus.slice'

import { toast } from 'sonner'

interface Bus {
  id: number
  plate_number?: string
  license_plate?: string
  model?: string
  brand?: string
  capacity?: number
  is_active?: boolean
  [key: string]: unknown
}

export function Component() {
  const dispatch = useAppDispatch()
  const buses = useAppSelector(selectBuses) as Bus[]
  const loading = useAppSelector(selectBusLoading)
  const error = useAppSelector(selectBusError)

  const [showForm, setShowForm] = useState(false)
  const [editingBus, setEditingBus] = useState<Bus | null>(null)
  const [formData, setFormData] = useState({ plate_number: '', model: '', brand: '', capacity: 40 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchBuses({})) }, [dispatch])

  const openCreate = () => {
    setEditingBus(null)
    setFormData({ plate_number: '', model: '', brand: '', capacity: 40 })
    setShowForm(true)
  }

  const openEdit = async (bus: Bus) => {
    setEditingBus(bus)
    setFormData({
      plate_number: bus.plate_number || bus.license_plate || '',
      model: bus.model || '',
      brand: bus.brand || '',
      capacity: bus.capacity || 40,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingBus) {
        await dispatch(updateBus({ id: editingBus.id, data: formData })).unwrap()
        toast.success('Bus actualizado correctamente')
      } else {
        await dispatch(createBus(formData)).unwrap()
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buses.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay buses registrados</td></tr>
              ) : (
                buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{bus.plate_number || bus.license_plate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bus.model || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bus.brand || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bus.capacity || '—'}</td>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingBus ? 'Editar Bus' : 'Nuevo Bus'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input type="text" value={formData.plate_number} onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })} min={1} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : editingBus ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
