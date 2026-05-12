import { useSecretariesPage } from '@/hooks/use-secretaries-page'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'

export function Component() {
  useDocumentTitle('Secretarias')
  const {
    secretaries, offices, loading, saving,
    showForm, setShowForm, editing,
    formData, setFormData,
    openCreate, openEdit, handleSubmit, handleDelete,
    getOfficeName,
    confirmDialog,
  } = useSecretariesPage()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Secretarias</h1>
          <p className="text-gray-600 mt-1">
            Administra las secretarias y su asignación de oficina.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          + Nueva Secretaria
        </Button>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" aria-hidden="true" />
          <span className="sr-only">Cargando secretarias...</span>
        </div>
      ) : secretaries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay secretarias registradas. Haz clic en "Nueva Secretaria" para agregar una.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Lista de secretarias</caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaria</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oficina</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {secretaries.map((sec) => {
                const officeName = getOfficeName(sec.office_id)
                return (
                  <tr key={sec.id} className={`hover:bg-gray-50 transition-colors ${!sec.office_id ? 'bg-amber-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${officeName ? 'bg-blue-500' : 'bg-amber-400'}`}>
                          {sec.firstname.charAt(0)}{sec.lastname.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sec.firstname} {sec.lastname}</p>
                          <p className="text-xs text-gray-400">ID: {sec.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sec.email ?? <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sec.phone ?? <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {officeName ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">{officeName}</span>
                      ) : (
                        <span className="text-xs text-amber-600">Sin oficina</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        sec.is_active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {sec.is_active !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => openEdit(sec)}
                        className="h-auto py-1 px-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        aria-label={`Editar ${sec.firstname} ${sec.lastname}`}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(sec)}
                        className="h-auto py-1 px-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        aria-label={`Eliminar ${sec.firstname} ${sec.lastname}`}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Secretaria' : 'Nueva Secretaria'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos de la secretaria.' : 'Completa los datos de la nueva secretaria.'}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <p className="text-sm text-gray-500">ID: {editing.id} · {editing.email}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Nombre"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                required
              />
              <FormInput
                label="Apellido"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                required
              />
            </div>
            <FormInput
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ej: 70000000"
            />
            <FormSelect
              label="Oficina Asignada"
              value={formData.office_id}
              onChange={(val) => setFormData({ ...formData, office_id: val })}
              options={[
                { value: '', label: '— Sin oficina —' },
                ...offices.map((o) => ({ value: String(o.id), label: o.name })),
              ]}
            />

            {!editing && (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Datos de Acceso</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Usuario"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <FormInput
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Secretaria'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  )
}
