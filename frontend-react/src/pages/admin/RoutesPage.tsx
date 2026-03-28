import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchRoutes, createRoute, updateRoute, deleteRoute, selectRoutes, selectRouteLoading, selectRouteError } from '@/store/route.slice'
import { fetchLocations, selectLocations } from '@/store/location.slice'
import { toast } from 'sonner'

interface Location { id: number; name: string;[key: string]: unknown }
interface Route {
  id: number
  origin_location?: Location
  destination_location?: Location
  origin_location_id?: number
  destination_location_id?: number
  distance?: number
  duration?: number
  price?: number
  is_active?: boolean
  schedules?: unknown[]
  [key: string]: unknown
}

export function Component() {
  const dispatch = useAppDispatch()
  const routes = useAppSelector(selectRoutes) as Route[]
  const loading = useAppSelector(selectRouteLoading)
  const error = useAppSelector(selectRouteError)
  const locations = useAppSelector(selectLocations) as Location[]

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Route | null>(null)
  const [formData, setFormData] = useState({ origin_location_id: 0, destination_location_id: 0, distance: 0, duration: 0, price: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchRoutes({})); dispatch(fetchLocations({})) }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    setFormData({ origin_location_id: 0, destination_location_id: 0, distance: 0, duration: 0, price: 0 })
    setShowForm(true)
  }

  const openEdit = (route: Route) => {
    setEditing(route)
    setFormData({
      origin_location_id: route.origin_location_id || route.origin_location?.id || 0,
      destination_location_id: route.destination_location_id || route.destination_location?.id || 0,
      distance: route.distance || 0,
      duration: route.duration || 0,
      price: route.price || 0,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateRoute({ id: editing.id, data: formData })).unwrap()
        toast.success('Ruta actualizada correctamente')
      } else {
        await dispatch(createRoute(formData)).unwrap()
        toast.success('Ruta creada correctamente')
      }
      setShowForm(false)
    } catch (err) { toast.error(`Error: ${err}`) } finally { setSaving(false) }
  }

  const handleDelete = async (route: Route) => {
    const name = `${route.origin_location?.name || 'Origen'} → ${route.destination_location?.name || 'Destino'}`
    if (!confirm(`¿Eliminar ruta ${name}?`)) return
    try { await dispatch(deleteRoute(route.id)).unwrap(); toast.success('Ruta eliminada') } catch (err) { toast.error(`Error: ${err}`) }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración de Rutas</h1>
          <p className="text-gray-600 mt-1">Gestiona las rutas del sistema</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">+ Nueva Ruta</button>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distancia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {routes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay rutas registradas</td></tr>
              ) : (
                routes.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.origin_location?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.destination_location?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.distance ? `${r.distance} km` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.duration ? `${r.duration} hrs` : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.price ? `Bs. ${r.price}` : '—'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                      <button onClick={() => handleDelete(r)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Editar Ruta' : 'Nueva Ruta'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <select value={formData.origin_location_id} onChange={(e) => setFormData({ ...formData, origin_location_id: Number(e.target.value) })} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value={0}>Seleccionar origen</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                <select value={formData.destination_location_id} onChange={(e) => setFormData({ ...formData, destination_location_id: Number(e.target.value) })} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value={0}>Seleccionar destino</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distancia (km)</label>
                  <input type="number" step="0.1" value={formData.distance} onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })} className="w-full rounded-lg border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (hrs)</label>
                  <input type="number" step="0.1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} className="w-full rounded-lg border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs)</label>
                  <input type="number" step="0.1" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full rounded-lg border-gray-300 shadow-sm" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50">
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
