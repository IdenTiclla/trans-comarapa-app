import { Button } from '@/components/ui/button'
import { Bus, Pencil, Plus, RefreshCw, Trash2, Users, Truck, AlertCircle, Loader2, PackageOpen } from 'lucide-react'

interface BusRecord {
    id: number
    license_plate: string
    model?: string | null
    brand?: string | null
    color?: string | null
    floors?: number | null
    capacity: number
    [key: string]: unknown
}

interface BusTableProps {
    buses: BusRecord[]
    loading?: boolean
    error?: string | null
    onRefresh: () => void
    onCreate: () => void
    onEdit: (bus: BusRecord) => void
    onDelete: (bus: BusRecord) => void
}

const colorMap: Record<string, string> = {
    rojo: '#ef4444', azul: '#3b82f6', verde: '#22c55e', amarillo: '#eab308',
    naranja: '#f97316', morado: '#a855f7', rosa: '#ec4899', blanco: '#ffffff',
    negro: '#1f2937', gris: '#6b7280', celeste: '#06b6d4', marron: '#92400e',
    beige: '#d4c5a9', plateado: '#c0c0c0', dorado: '#ffd700',
}

const getColorCode = (color: string) => {
    if (!color) return '#e5e7eb'
    const normalizedColor = color.toLowerCase().trim()
    return colorMap[normalizedColor] || '#e5e7eb'
}

export default function BusTable({
    buses = [],
    loading = false,
    error = null,
    onRefresh,
    onCreate,
    onEdit,
    onDelete,
}: BusTableProps) {
    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Lista de Buses</h2>
                    <p className="text-sm text-gray-500">{buses.length} buses registrados</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onRefresh} aria-label="Actualizar lista de buses">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                    <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700" aria-label="Crear nuevo bus">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Bus
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center">
                        <Loader2 className="animate-spin mr-3 h-5 w-5 text-indigo-600" />
                        <span className="text-gray-600">Cargando buses...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="p-8 text-center">
                    <div className="inline-flex items-center text-red-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
            ) : buses.length > 0 ? (
                <div className="overflow-x-auto">
                    {/* eslint-disable-next-line no-restricted-syntax */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pisos</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {buses.map((bus) => (
                                <tr key={bus.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                                            {bus.license_plate}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bus.model || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.brand || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            {bus.color && (
                                                <span
                                                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                                    style={{ backgroundColor: getColorCode(bus.color) }}
                                                />
                                            )}
                                            {bus.color || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bus.floors === 2 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            <Bus className="w-3 h-3 mr-1" />
                                            {bus.floors || 1} {(bus.floors || 1) === 1 ? 'piso' : 'pisos'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            <Users className="w-3 h-3 mr-1" />
                                            {bus.capacity} asientos
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(bus)}
                                                aria-label="Editar bus"
                                                className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                            >
                                                <Pencil className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(bus)}
                                                aria-label="Eliminar bus"
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
                    <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                        <Truck className="h-10 w-10" />
                        <PackageOpen className="h-10 w-10 hidden" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay buses</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo bus.</p>
                    <div className="mt-6">
                        <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Bus
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
