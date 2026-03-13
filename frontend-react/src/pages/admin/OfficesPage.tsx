import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchOffices, createOffice, updateOffice, deleteOffice, selectOffices, selectOfficeLoading, selectOfficeError } from '@/store/office.slice'
import { fetchLocations, selectLocations } from '@/store/location.slice'
import { toast } from 'sonner'
import type { Office } from '@/types/office'

interface Location { id: number; name: string;[key: string]: unknown }

export function Component() {
  const dispatch = useAppDispatch()
  const offices = useAppSelector(selectOffices) as Office[]
  const loading = useAppSelector(selectOfficeLoading)
  const error = useAppSelector(selectOfficeError)
  const locations = useAppSelector(selectLocations) as Location[]

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Office | null>(null)
  
  // State for form. All keys mirror Office attributes
  const [formData, setFormData] = useState({ 
    name: '', 
    location_id: 0, 
    phone: '', 
    email: '', 
    manager_name: '' 
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { 
    dispatch(fetchOffices())
    dispatch(fetchLocations({})) 
  }, [dispatch])

  const openCreate = () => {
    setEditing(null)
    setFormData({ name: '', location_id: 0, phone: '', email: '', manager_name: '' })
    setShowForm(true)
  }

  const openEdit = (office: Office) => {
    setEditing(office)
    setFormData({
      name: office.name || '',
      location_id: office.location_id || 0,
      phone: office.phone || '',
      email: office.email || '',
      manager_name: office.manager_name || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Prepare data to send (convert location_id to Number, optionally handle nulls)
    const payload = {
        name: formData.name,
        location_id: formData.location_id ? Number(formData.location_id) : null,
        phone: formData.phone || null,
        email: formData.email || null,
        manager_name: formData.manager_name || null
    }

    try {
      if (editing) {
        await dispatch(updateOffice({ id: editing.id, data: payload })).unwrap()
        toast.success('Oficina actualizada correctamente')
      } else {
        await dispatch(createOffice(payload)).unwrap()
        toast.success('Oficina creada correctamente')
      }
      setShowForm(false)
    } catch (err) { 
        toast.error(`Error: ${err}`) 
    } finally { 
        setSaving(false) 
    }
  }

  const handleDelete = async (office: Office) => {
    if (!confirm(`¿Eliminar oficina ${office.name}?`)) return
    try { 
        await dispatch(deleteOffice(office.id)).unwrap()
        toast.success('Oficina eliminada') 
    } catch (err) { 
        toast.error(`Error: ${err}`) 
    }
  }

  // Find location name for display purposes
  const getLocationName = (location_id: number | null) => {
      if (!location_id) return '—';
      const loc = locations.find(l => l.id === location_id);
      return loc ? loc.name : location_id;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración de Oficinas</h1>
          <p className="text-gray-600 mt-1">Gestiona las oficinas del sistema</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">+ Nueva Oficina</button>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encargado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay oficinas registradas</td></tr>
              ) : (
                offices.map((office) => (
                  <tr key={office.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{office.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getLocationName(office.location_id)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{office.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{office.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{office.manager_name || '—'}</td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => openEdit(office)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                      <button onClick={() => handleDelete(office)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Editar Oficina' : 'Nueva Oficina'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej. Oficina Central" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <select value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: Number(e.target.value) })} required className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value={0}>Seleccionar ubicación</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border-gray-300 shadow-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border-gray-300 shadow-sm" placeholder="Opcional" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Encargado</label>
                <input type="text" value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} className="w-full rounded-lg border-gray-300 shadow-sm" placeholder="Opcional" />
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
