import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchPackages, deletePackage, selectPackages, selectPackageLoading, selectPackageError } from '@/store/package.slice'
import { toast } from 'sonner'

interface Package {
    id: number
    tracking_code?: string
    sender_name?: string
    receiver_name?: string
    origin_name?: string
    destination_name?: string
    weight_kg?: number
    price?: number
    status?: string
    [key: string]: unknown
}

const STATUS_LABELS: Record<string, string> = {
    registered: 'Registrado', in_transit: 'En tránsito', delivered: 'Entregado', cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-700', in_transit: 'bg-yellow-100 text-yellow-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
}

export function Component() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const packages = useAppSelector(selectPackages) as Package[]
    const loading = useAppSelector(selectPackageLoading)
    const error = useAppSelector(selectPackageError)

    useEffect(() => { dispatch(fetchPackages({})) }, [dispatch])

    const handleDelete = async (pkg: Package) => {
        if (!confirm(`¿Eliminar paquete ${pkg.tracking_code}?`)) return
        try { await dispatch(deletePackage(pkg.id)).unwrap(); toast.success('Paquete eliminado'); dispatch(fetchPackages({})) } catch (err) { toast.error(`Error: ${err}`) }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Encomiendas</h1>
                    <p className="text-gray-600 mt-1">Registro y seguimiento de paquetes</p>
                </div>
                <button onClick={() => navigate('/packages/new')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">+ Nueva Encomienda</button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"><p className="text-red-700">{error}</p></div>}

            {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remitente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {packages.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No hay encomiendas</td></tr>
                            ) : (
                                packages.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.tracking_code || `#${p.id}`}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.sender_name || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.receiver_name || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.weight_kg ? `${p.weight_kg} kg` : '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.price ? `Bs. ${p.price}` : '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[p.status || ''] || 'bg-gray-100 text-gray-700'}`}>
                                                {STATUS_LABELS[p.status || ''] || p.status || 'Registrado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => navigate(`/packages/${p.id}`)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver</button>
                                            <button onClick={() => handleDelete(p)} className="text-red-600 hover:text-red-800 text-sm font-medium">Eliminar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
