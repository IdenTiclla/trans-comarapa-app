import { useNavigate } from 'react-router'
import { useAppSelector } from '@/store'
import PendingCollections from '@/components/packages/PendingCollections'

export function Component() {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
            <div className="bg-white shadow-sm border-b border-gray-200 w-full">
                <div className="w-full px-2 sm:px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Cobros Pendientes</h1>
                                <p className="text-gray-700">Encomiendas por cobrar en tu oficina</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => navigate('/packages')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Ver todas las encomiendas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
                <PendingCollections officeId={user?.office_id} showTitle={false} />
            </div>
        </div>
    )
}
