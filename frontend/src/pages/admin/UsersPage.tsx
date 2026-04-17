import { useEffect, useState } from 'react'
import { userManagementService } from '@/services/user-management.service'
import { officeService } from '@/services/office.service'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import type { Office } from '@/types/office'

interface User {
  id: number
  email: string
  role: string
  first_name?: string
  last_name?: string
  is_active: boolean
  [key: string]: unknown
}

interface Secretary {
  id: number
  firstname: string
  lastname: string
  phone?: string
  office_id?: number | null
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  secretary: 'Secretaria',
  driver: 'Conductor',
  assistant: 'Asistente',
  client: 'Cliente',
}
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700',
  secretary: 'bg-blue-100 text-blue-700',
  driver: 'bg-emerald-100 text-emerald-700',
  assistant: 'bg-amber-100 text-amber-700',
  client: 'bg-gray-100 text-gray-700',
}

export function Component() {
  const [users, setUsers] = useState<User[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [secretaryInfo, setSecretaryInfo] = useState<Secretary | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'secretary',
    first_name: '',
    last_name: '',
  })
  const [officeId, setOfficeId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true); setError(null)
    try {
      const data = await userManagementService.getAll()
      setUsers(Array.isArray(data) ? data : (data as { items?: User[] }).items || [])
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchUsers()
    officeService.getAll().then(setOffices).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setSecretaryInfo(null)
    setOfficeId(null)
    setFormData({ email: '', password: '', role: 'secretary', first_name: '', last_name: '' })
    setShowForm(true)
  }

  const openEdit = async (user: User) => {
    setEditing(user)
    setSecretaryInfo(null)
    setOfficeId(null)
    setFormData({ email: user.email, password: '', role: user.role, first_name: user.first_name || '', last_name: user.last_name || '' })
    setShowForm(true)

    // Load secretary-specific data if applicable
    if (user.role === 'secretary') {
      try {
        const sec = await apiFetch<Secretary>(`/secretaries/by-user/${user.id}`)
        setSecretaryInfo(sec)
        setOfficeId(sec.office_id ?? null)
      } catch {
        // No secretary record found — not a problem for display
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      const data: Record<string, unknown> = { ...formData }
      if (!data.password) delete data.password

      if (editing) {
        await userManagementService.update(editing.id, data)

        // If secretary, also update office assignment
        if (formData.role === 'secretary' && secretaryInfo) {
          await apiFetch(`/secretaries/${secretaryInfo.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ office_id: officeId }),
          })
        }
        toast.success('Usuario actualizado')
      } else {
        await userManagementService.create(data)
        toast.success('Usuario creado')
      }
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return
    try {
      await userManagementService.delete(user.id)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch (err) { toast.error(`Error: ${(err as Error).message}`) }
  }

  const toggleActive = async (user: User) => {
    try {
      if (user.is_active) {
        await userManagementService.deactivate(user.id)
        toast.success('Usuario desactivado')
      } else {
        await userManagementService.activate(user.id)
        toast.success('Usuario activado')
      }
      fetchUsers()
    } catch (err) { toast.error(`Error: ${(err as Error).message}`) }
  }

  const isSecretary = formData.role === 'secretary'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona las cuentas de usuario del sistema</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No hay usuarios</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.first_name} {u.last_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`px-2 py-1 text-xs rounded-full font-medium cursor-pointer ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                      <button onClick={() => handleDelete(u)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            {editing && (
              <p className="text-sm text-gray-500 mb-4">ID: {editing.id} · {editing.email}</p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editing ? <span className="text-gray-400">(dejar vacío para no cambiar)</span> : ''}
                </label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} {...(!editing ? { required: true } : {})} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Secretary office assignment — only shown when role is secretary */}
              {isSecretary && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                    <span>🏢</span> Oficina Asignada
                  </label>
                  <p className="text-xs text-blue-600 mb-2">
                    Las secretarias deben tener una oficina asignada para poder operar la caja registradora.
                  </p>
                  <select
                    value={officeId ?? ''}
                    onChange={(e) => setOfficeId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">— Sin oficina asignada —</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {!officeId && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️</span> Sin oficina la secretaria no podrá abrir la caja registradora.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
