import { useEffect, useState } from 'react'
import { driverService } from '@/services/driver.service'
import { toast } from 'sonner'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'

interface Driver {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  user_id?: number | null
  license_number?: string | null
  license_type?: string | null
  license_expiry?: string | null
  status?: string | null
  is_active?: boolean // Derived from User or Driver properties
  email?: string | null
}

export function Component() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)

  const [formData, setFormData] = useState({
    license_number: '',
    license_type: '',
    license_expiry: '',
    status: 'active'
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await driverService.getAll()
      setDrivers(Array.isArray(data) ? data : (data as { items?: Driver[] }).items || [])
    } catch (e) {
      toast.error('Error al cargar choferes: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openEdit = (driver: Driver) => {
    setEditing(driver)
    setFormData({
      license_number: driver.license_number || '',
      license_type: driver.license_type || '',
      license_expiry: driver.license_expiry ? String(driver.license_expiry).split('T')[0] : '',
      status: driver.status || 'active'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      await driverService.update(editing.id, {
        license_number: formData.license_number || null,
        license_type: formData.license_type || null,
        license_expiry: formData.license_expiry || null,
        status: formData.status
      })
      toast.success('Chofer actualizado exitosamente')
      setEditing(null)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Choferes</h1>
          <p className="text-gray-600 mt-1">
            Administra los choferes y su información de licencia.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay choferes registrados. Los choferes se agregan desde "Usuarios".
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chofer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {driver.firstname?.charAt(0) || ''}{driver.lastname?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{driver.firstname} {driver.lastname}</p>
                        <p className="text-xs text-gray-400">ID: {driver.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.email || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.phone || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {driver.license_number ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{driver.license_number}</span>
                        <span className="text-xs text-gray-500">
                          Cat: {driver.license_type || 'N/A'} {driver.license_expiry ? `· Vence: ${String(driver.license_expiry).split('T')[0]}` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">Sin licencia registrada</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      driver.status === 'active' || driver.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {driver.status === 'active' || driver.status === 'Activo' ? 'Activo' : driver.status || 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEdit(driver)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar Licencia
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Actualizar Información</h2>
              <p className="text-sm text-gray-500 mb-4">Chofer: {editing.firstname} {editing.lastname}</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label="Nº de Licencia"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Ej: 1234567-A"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Categoría"
                    value={formData.license_type}
                    onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                    placeholder="Ej: C"
                  />
                  <FormDatePicker
                    label="Fecha de Vencimiento"
                    value={formData.license_expiry}
                    onChange={(val) => setFormData({ ...formData, license_expiry: val })}
                  />
                </div>
                <FormSelect
                  label="Estado"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { label: 'Activo', value: 'active' },
                    { label: 'Inactivo', value: 'inactive' }
                  ]}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium text-sm disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  )
}
