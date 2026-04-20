import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, Loader2, MapPin, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

interface RouteRecord {
    id: number
    distance?: number | null
    duration?: number | null
    price?: number | null
    origin_location?: { name?: string } | null
    destination_location?: { name?: string } | null
    schedules?: unknown[]
    [key: string]: unknown
}

interface RouteTableProps {
    routes: RouteRecord[]
    loading?: boolean
    error?: string | null
    onRefresh: () => void
    onCreate: () => void
    onEdit: (route: RouteRecord) => void
    onDelete: (route: RouteRecord) => void
    onManageSchedules: (route: RouteRecord) => void
}

export default function RouteTable({
    routes = [],
    loading = false,
    error = null,
    onRefresh,
    onCreate,
    onEdit,
    onDelete,
    onManageSchedules,
}: RouteTableProps) {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Lista de Rutas</h2>
                    <p className="text-sm text-gray-500">{routes.length} rutas registradas</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onRefresh} aria-label="Actualizar lista de rutas">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Ruta
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center">
                        <Loader2 className="animate-spin mr-3 h-5 w-5 text-indigo-600" />
                        <span className="text-gray-600">Cargando rutas...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
            ) : routes.length > 0 ? (
                <div className="overflow-x-auto">
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distancia</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horarios</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {routes.map((route) => (
                                <tr key={route.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{route.origin_location?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{route.destination_location?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.distance} km</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.duration} hrs</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Bs. {route.price}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            onClick={() => onManageSchedules(route)}
                                            aria-label="Gestionar horarios"
                                            className="h-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                        >
                                            <Clock className="w-3 h-3 mr-1" />
                                            {route.schedules?.length || 0} horarios
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(route)}
                                                aria-label="Editar ruta"
                                                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(route)}
                                                aria-label="Eliminar ruta"
                                                className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-8 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay rutas</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva ruta.</p>
                    <div className="mt-6">
                        <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Ruta
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
