import { useSecretariesPage } from '@/hooks/use-secretaries-page'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import FormSelect from '@/components/forms/FormSelect'

export function Component() {
  const {
    secretaries, offices, loading, savingId,
    handleOfficeChange, saveOffice, getOfficeName,
    hasPendingChange, currentOfficeValue,
  } = useSecretariesPage()

  const handleSave = async (sec: Parameters<typeof saveOffice>[0]) => {
    const ok = await saveOffice(sec)
    if (ok) toast.success('Oficina asignada correctamente')
    else toast.error('Error al asignar oficina')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Secretarias</h1>
          <p className="text-gray-600 mt-1">
            Administra las secretarias y su asignación de oficina. Las sin oficina no pueden operar la caja.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>
            Con oficina
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            Sin oficina
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : secretaries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay secretarias registradas.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Oficina Asignada</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {secretaries.map((sec) => {
                const officeAssigned = currentOfficeValue(sec)
                const officeName = getOfficeName(officeAssigned)
                const pending = hasPendingChange(sec)
                const saving = savingId === sec.id

                return (
                  <tr key={sec.id} className={`hover:bg-gray-50 transition-colors ${!sec.office_id && !pending ? 'bg-amber-50/40' : ''}`}>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <FormSelect
                            value={officeAssigned ? String(officeAssigned) : ''}
                            onChange={(val) => handleOfficeChange(sec.id, val)}
                            options={[
                              { value: '', label: '— Sin oficina —' },
                              ...offices.map((o) => ({ value: String(o.id), label: o.name })),
                            ]}
                            className={officeName ? '' : 'border-amber-300 bg-amber-50 text-amber-700'}
                          />
                        </div>
                        {pending && (
                          <Button
                            onClick={() => handleSave(sec)}
                            disabled={saving}
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 h-auto whitespace-nowrap"
                          >
                            {saving ? '...' : 'Guardar'}
                          </Button>
                        )}
                      </div>
                      {!officeAssigned && !pending && (
                        <p className="text-xs text-amber-600 mt-1">⚠️ Sin oficina — no puede operar la caja</p>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
