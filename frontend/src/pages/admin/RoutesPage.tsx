import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchRoutes, createRoute, updateRoute, deleteRoute, selectRoutes, selectRouteLoading, selectRouteError } from '@/store/route.slice'
import { fetchLocations, selectLocations } from '@/store/location.slice'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

interface Location { id: number; name: string;[key: string]: unknown }
interface RouteData {
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
  const routes = useAppSelector(selectRoutes) as RouteData[]
  const loading = useAppSelector(selectRouteLoading)
  const error = useAppSelector(selectRouteError)
  const locations = useAppSelector(selectLocations) as Location[]

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RouteData | null>(null)
  const [formData, setFormData] = useState({ origin_location_id: 0, destination_location_id: 0, distance: 0, duration: 0, price: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { dispatch(fetchRoutes({})); dispatch(fetchLocations({})) }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    setFormData({ origin_location_id: 0, destination_location_id: 0, distance: 0, duration: 0, price: 0 })
    setShowForm(true)
  }

  const openEdit = (route: RouteData) => {
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

  const handleDelete = async (route: RouteData) => {
    const name = `${route.origin_location?.name || 'Origen'} → ${route.destination_location?.name || 'Destino'}`
    if (!confirm(`¿Eliminar ruta ${name}?`)) return
    try { await dispatch(deleteRoute(route.id)).unwrap(); toast.success('Ruta eliminada') } catch (err) { toast.error(`Error: ${err}`) }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Ruta
        </Button>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded"><p className="text-red-700">{error}</p></div>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
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
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.origin_location?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.destination_location?.name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.distance ? `${r.distance} km` : '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.duration ? `${r.duration} hrs` : '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{r.price ? `Bs. ${r.price}` : '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(r)}>
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
          <Card className="max-w-lg w-full">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Editar Ruta' : 'Nueva Ruta'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormSelect
                  label="Origen"
                  value={formData.origin_location_id}
                  onChange={(val) => setFormData({ ...formData, origin_location_id: Number(val) })}
                  required
                  options={locations.map(l => ({ label: l.name, value: l.id }))}
                  placeholder="Seleccionar origen"
                />
                <FormSelect
                  label="Destino"
                  value={formData.destination_location_id}
                  onChange={(val) => setFormData({ ...formData, destination_location_id: Number(val) })}
                  required
                  options={locations.map(l => ({ label: l.name, value: l.id }))}
                  placeholder="Seleccionar destino"
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormInput
                    label="Distancia (km)"
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                  />
                  <FormInput
                    label="Duración (hrs)"
                    type="number"
                    step="0.1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  />
                  <FormInput
                    label="Precio (Bs)"
                    type="number"
                    step="0.1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
