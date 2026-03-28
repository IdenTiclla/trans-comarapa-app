import { useEffect, useState } from 'react'
import { ownerService } from '@/services/owner.service'
import { toast } from 'sonner'

interface Owner {
  id: number
  firstname: string
  lastname: string
  ci: string
  phone?: string | null
  email?: string | null
  user_id?: number | null
  is_active?: boolean
}

export function Component() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    ci: '',
    phone: '',
    email: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await ownerService.getAll()
      setOwners(Array.isArray(data) ? data : (data as { items?: Owner[] }).items || [])
    } catch (e) {
      toast.error('Error al cargar socios: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openCreate = () => {
    setEditing(null)
    setFormData({ firstname: '', lastname: '', ci: '', phone: '', email: '' })
    setIsModalOpen(true)
  }

  const openEdit = (owner: Owner) => {
    setEditing(owner)
    setFormData({
      firstname: owner.firstname || '',
      lastname: owner.lastname || '',
      ci: owner.ci || '',
      phone: owner.phone || '',
      email: owner.email || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        ci: formData.ci,
        phone: formData.phone || null,
        email: formData.email || null,
      }

      if (editing) {
        await ownerService.update(editing.id, payload)
        toast.success('Socio actualizado exitosamente')
      } else {
        await ownerService.create(payload)
        toast.success('Socio registrado exitosamente')
      }
      setIsModalOpen(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Socios / Dueños</h1>
          <p className="text-gray-600 mt-1">
            Administra los dueños de los buses y su información de contacto.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center gap-2 rounded-lg font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Socio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : owners.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white shadow-sm rounded-lg border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <p className="mt-4 font-medium text-gray-900">No hay socios registrados</p>
          <p className="text-sm mt-1">Agrega el primer socio usando el botón "Nuevo Socio".</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Socio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Carnet</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shadow-sm border border-indigo-200">
                        {owner.firstname?.charAt(0) || ''}{owner.lastname?.charAt(0) || ''}
                      </div>
                      <div>
                         <p className="text-sm font-semibold text-gray-900">{owner.firstname} {owner.lastname}</p>
                         <p className="text-xs text-gray-500 font-medium">ID: #{owner.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-sm text-gray-800 font-medium">{owner.phone || <span className="text-gray-400 italic">Sin teléfono</span>}</div>
                     <div className="text-xs text-gray-500">{owner.email || <span className="text-gray-400 italic">Sin correo</span>}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {owner.ci}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(owner)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-4 transition-colors p-1"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Creación/Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 modal-overlay-glass flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden transform transition-all animate-in zoom-in-95 fade-in duration-200">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900">
                      {editing ? 'Editar Socio' : 'Registrar Nuevo Socio'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Completa los datos del dueño.</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre/s <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none" placeholder="Ej: Juan" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apellidos <span className="text-red-500">*</span></label>
                        <input type="text" required value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none" placeholder="Ej: Perez" />
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cédula de Identidad (CI) <span className="text-red-500">*</span></label>
                      <input type="text" required value={formData.ci} onChange={(e) => setFormData({ ...formData, ci: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none" placeholder="Ej: 1234567" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none" placeholder="Ej: 77766554" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (Opcional)</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-shadow outline-none" placeholder="Ej: correo@ejemplo.com" />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors shadow-sm">
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200">
                      {saving ? 'Guardando...' : 'Guardar Socio'}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
