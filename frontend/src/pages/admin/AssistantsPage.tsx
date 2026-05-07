import { useAssistantsPage } from '@/hooks/use-assistants-page'
import FormInput from '@/components/forms/FormInput'
import { Button } from '@/components/ui/button'

export function Component() {
  const {
    assistants, loading, saving, showForm, setShowForm,
    editing, formData, setFormData,
    openCreate, openEdit, handleSubmit, handleDelete,
  } = useAssistantsPage()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Asistentes</h1>
          <p className="text-gray-600 mt-1">
            Administra los asistentes registrados en el sistema.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700">
          + Nuevo Asistente
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      ) : assistants.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay asistentes registrados. Haz clic en "Nuevo Asistente" para agregar uno.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assistants.map((assistant) => (
                <tr key={assistant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {assistant.firstname?.charAt(0) || ''}{assistant.lastname?.charAt(0) || ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{assistant.firstname} {assistant.lastname}</p>
                        <p className="text-xs text-gray-400">ID: {assistant.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assistant.email || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assistant.phone || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(assistant)}
                      className="h-auto p-0 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(assistant)}
                      className="h-auto p-0 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 modal-overlay-bokeh flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {editing ? 'Editar Asistente' : 'Nuevo Asistente'}
            </h2>
            {editing && (
              <p className="text-sm text-gray-500 mb-4">ID: {editing.id}</p>
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

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                  {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Asistente'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
