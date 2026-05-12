import { useDriversPage } from '@/hooks/use-drivers-page'
import FormInput from '@/components/forms/FormInput'
import FormSelect from '@/components/forms/FormSelect'
import FormDatePicker from '@/components/forms/FormDatePicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function Component() {
  useDocumentTitle('Conductores')
  const {
    drivers, loading, saving, showForm, setShowForm,
    editing, formData, setFormData,
    openCreate, openEdit, handleSubmit, handleDelete,
    confirmDialog,
  } = useDriversPage()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Choferes</h1>
          <p className="text-gray-600 mt-1">
            Administra los choferes y su información de licencia.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          + Nuevo Chofer
        </Button>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" aria-hidden="true" />
          <span className="sr-only">Cargando choferes...</span>
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay choferes registrados. Haz clic en "Nuevo Chofer" para agregar uno.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="min-w-full divide-y divide-gray-200">
            <caption className="sr-only">Lista de conductores</caption>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chofer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Licencia</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
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
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => openEdit(driver)}
                      className="h-auto py-1 px-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      aria-label={`Editar ${driver.firstname} ${driver.lastname}`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(driver)}
                      className="h-auto py-1 px-2 text-red-600 hover:text-red-800 text-sm font-medium"
                      aria-label={`Eliminar ${driver.firstname} ${driver.lastname}`}
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

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setShowForm(false) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Chofer' : 'Nuevo Chofer'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Modifica los datos del chofer.' : 'Completa los datos del nuevo chofer.'}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <p className="text-sm text-gray-500">ID: {editing.id}</p>
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
                onChange={(val) => setFormData({ ...formData, license_expiry: val ? String(val).split('T')[0] : '' })}
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
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Chofer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  )
}
