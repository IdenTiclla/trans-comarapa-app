import { useAuth } from '@/hooks/use-auth'

export function Component() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard del Asistente</h1>
              <p className="text-gray-700">Bienvenido, {user?.firstname} {user?.lastname}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Dashboard de asistente</h2>
          <p className="text-gray-500">Aquí podrás gestionar las tareas de asistencia de viajes.</p>
        </div>
      </div>
    </div>
  )
}
