import { useUsersPage } from '@/hooks/use-users-page'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

export function Component() {
  useDocumentTitle('Usuarios')
  const {
    users, offices, loading, error, showForm, setShowForm,
    editing, formData, setFormData, officeId, setOfficeId, saving,
    openCreate, openEdit, handleSubmit, handleDelete, toggleActive,
    ROLE_LABELS, ROLE_COLORS, ROLE_OPTIONS,
    confirmDialog,
  } = useUsersPage()

  const isSecretary = formData.role === 'secretary'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona las cuentas de usuario del sistema</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          + Nuevo Usuario
        </Button>
      </div>

      {error && <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" aria-hidden="true" /><span className="sr-only">Cargando usuarios...</span></div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Lista de usuarios</caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
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
                      <Button
                        variant="ghost"
                        onClick={() => toggleActive(u)}
                        aria-label={u.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                        className={`h-auto px-2 py-1 text-xs rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" onClick={() => openEdit(u)} className="h-auto py-1 px-2 text-blue-600 hover:text-blue-800 text-sm font-medium" aria-label={`Editar ${u.first_name ?? ''} ${u.last_name ?? ''}`}>Editar</Button>
                      <Button variant="ghost" onClick={() => handleDelete(u)} className="h-auto py-1 px-2 text-red-600 hover:text-red-800 text-sm font-medium" aria-label={`Eliminar ${u.first_name ?? ''} ${u.last_name ?? ''}`}>Eliminar</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos del usuario.' : 'Completa los datos del nuevo usuario.'}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <p className="text-sm text-gray-500">ID: {editing.id} · {editing.email}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Nombre"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <FormInput
                label="Apellido"
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label={editing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editing}
            />
            <FormSelect
              label="Rol"
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              options={ROLE_OPTIONS}
            />

            {isSecretary && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                  <span aria-hidden="true">🏢</span> Oficina Asignada
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  Las secretarias deben tener una oficina asignada para poder operar la caja registradora.
                </p>
                <FormSelect
                  value={officeId ? String(officeId) : ''}
                  onChange={(val) => setOfficeId(val ? Number(val) : null)}
                  options={[
                    { value: '', label: '— Sin oficina asignada —' },
                    ...offices.map((o) => ({ value: String(o.id), label: o.name })),
                  ]}
                />
                {!officeId && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Sin oficina la secretaria no podrá abrir la caja registradora.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  )
}
