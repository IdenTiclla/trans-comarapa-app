import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { officeService } from '@/services/office.service'
import { toast } from 'sonner'
import type { Office } from '@/types/office'

interface Secretary {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  office_id?: number | null
  user_id?: number | null
}

interface SecretaryWithEmail extends Secretary {
  email?: string
  is_active?: boolean
}

export function Component() {
  const [secretaries, setSecretaries] = useState<SecretaryWithEmail[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  // Tracks the pending office_id changes per secretary before saving
  const [pendingOffice, setPendingOffice] = useState<Record<number, number | null>>({})

  const loadData = async () => {
    setLoading(true)
    try {
      const [secs, offs] = await Promise.all([
        apiFetch<Secretary[]>('/secretaries'),
        officeService.getAll(),
      ])
      setOffices(offs)

      // Enrich secretaries with user email by calling by-user endpoint
      const enriched: SecretaryWithEmail[] = await Promise.all(
        secs.map(async (s) => {
          if (!s.user_id) return s
          try {
            const user = await apiFetch<{ email: string; is_active: boolean }>(`/secretaries/${s.id}/user`)
            return { ...s, email: user.email, is_active: user.is_active }
          } catch {
            return s
          }
        })
      )
      setSecretaries(enriched)
    } catch (e) {
      toast.error('Error al cargar secretarias: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleOfficeChange = (secId: number, value: string) => {
    setPendingOffice((prev) => ({ ...prev, [secId]: value ? Number(value) : null }))
  }

  const saveOffice = async (sec: SecretaryWithEmail) => {
    const newOfficeId = pendingOffice[sec.id] !== undefined ? pendingOffice[sec.id] : sec.office_id
    setSavingId(sec.id)
    try {
      await apiFetch(`/secretaries/${sec.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ office_id: newOfficeId }),
      })
      toast.success('Oficina asignada correctamente')
      // Update state locally without full reload
      setSecretaries((prev) =>
        prev.map((s) => (s.id === sec.id ? { ...s, office_id: newOfficeId } : s))
      )
      // Clear pending
      setPendingOffice((prev) => { const next = { ...prev }; delete next[sec.id]; return next })
    } catch (e) {
      toast.error('Error: ' + (e as Error).message)
    } finally {
      setSavingId(null)
    }
  }

  const getOfficeName = (officeId?: number | null) =>
    offices.find((o) => o.id === officeId)?.name ?? null

  const hasPendingChange = (sec: SecretaryWithEmail) =>
    pendingOffice[sec.id] !== undefined && pendingOffice[sec.id] !== sec.office_id

  const currentOfficeValue = (sec: SecretaryWithEmail) =>
    pendingOffice[sec.id] !== undefined ? pendingOffice[sec.id] : sec.office_id

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
                    {/* Name */}
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

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sec.email ?? <span className="italic text-gray-400">—</span>}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sec.phone ?? <span className="italic text-gray-400">—</span>}
                    </td>

                    {/* Office select — the key column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={officeAssigned ?? ''}
                          onChange={(e) => handleOfficeChange(sec.id, e.target.value)}
                          className={`text-sm rounded-lg border px-3 py-1.5 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                            officeName
                              ? 'border-gray-200 bg-white text-gray-700'
                              : 'border-amber-300 bg-amber-50 text-amber-700'
                          }`}
                        >
                          <option value="">— Sin oficina —</option>
                          {offices.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>

                        {pending && (
                          <button
                            onClick={() => saveOffice(sec)}
                            disabled={saving}
                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {saving ? '...' : 'Guardar'}
                          </button>
                        )}
                      </div>
                      {!officeAssigned && !pending && (
                        <p className="text-xs text-amber-600 mt-1">⚠️ Sin oficina — no puede operar la caja</p>
                      )}
                    </td>

                    {/* Status */}
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
