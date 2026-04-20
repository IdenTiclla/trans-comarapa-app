import { useEffect, useState } from 'react'
import { assistantService } from '@/services/assistant.service'
import { toast } from 'sonner'

interface Assistant {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  user_id?: number | null
  email?: string | null
}

export function Component() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await assistantService.getAll()
      setAssistants(Array.isArray(data) ? data : (data as { items?: Assistant[] }).items || [])
    } catch (e) {
      toast.error('Error al cargar asistentes: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Asistentes</h1>
          <p className="text-gray-600 mt-1">
            Visualiza los asistentes registrados en el sistema.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
        </div>
      ) : assistants.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No hay asistentes registrados. Los asistentes se agregan desde "Usuarios".
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assistant.email || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assistant.phone || <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {assistant.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
