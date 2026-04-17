import { useAuth } from '@/hooks/use-auth'

export function Component() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard del Cliente</h1>
              <p className="text-gray-700">Bienvenido, {user?.firstname} {user?.lastname}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Portal del cliente</h2>
          <p className="text-gray-500">Aquí podrás ver tus boletos, paquetes y próximos viajes.</p>
        </div>
      </div>
    </div>
  )
}
