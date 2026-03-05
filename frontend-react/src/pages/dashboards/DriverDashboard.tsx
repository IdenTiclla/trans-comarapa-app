import { useAuth } from '@/hooks/use-auth'

export function Component() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
      <div className="bg-white shadow-sm border-b border-gray-200 w-full">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard del Conductor</h1>
              <p className="text-gray-700">Bienvenido, {user?.firstname} {user?.lastname}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-2 sm:px-4 lg:px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Dashboard de conductor</h2>
          <p className="text-gray-500">Aquí podrás ver tus viajes asignados y el estado de tu vehículo.</p>
        </div>
      </div>
    </div>
  )
}
