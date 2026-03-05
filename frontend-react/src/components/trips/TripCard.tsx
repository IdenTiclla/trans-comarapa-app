import { useState, useMemo } from 'react'

interface TripProps {
    id: number
    route: { origin: string; destination: string }
    trip_datetime: string
    driver?: { name?: string; photoUrl?: string }
    assistant?: { name?: string; photoUrl?: string }
    bus?: { plate?: string; photoUrl?: string }
    status?: string
    available_seats?: number
    total_seats?: number
    occupied_seats?: string[]
    [key: string]: unknown
}

interface TripCardProps {
    trip: TripProps
    listMode?: boolean
    onViewTrip?: (id: number) => void
    onEditTrip?: (id: number) => void
}

const DEFAULT_PERSON_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRjNGNEY2Ii8+PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMjAiIHk9IjIwIj48cGF0aCBkPSJNMTYgN2E0IDQgMCAxMS04IDAgNCA0IDAgMDE4IDB6TTEyIDE0YTcgNyAwIDAwLTcgN2gxNGE3IDcgMCAwMC03LTd6IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+PC9zdmc+'
const DEFAULT_BUS_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNOCAzSDIwTDIxIDVWMTlBMiAyIDAgMCAxIDE5IDIxSDE1QTIgMiAwIDAgMSAxMyAxOVYxN0g3VjE5QTIgMiAwIDAgMSA1IDIxSDFBMiAyIDAgMCAxIC0xIDE5VjVMMCA0SDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0wIDVIMjEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iNyIgY3k9IjE4IiByPSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjIiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo='

const STATUS_MAP: Record<string, string> = {
    scheduled: 'Programado', in_progress: 'En Progreso', completed: 'Completado',
    cancelled: 'Cancelado', delayed: 'Retrasado', boarding: 'Abordando',
}
const STATUS_CLASS: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-800 border-blue-200',
    in_progress: 'bg-orange-50 text-orange-800 border-orange-200',
    completed: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    delayed: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    boarding: 'bg-purple-50 text-purple-800 border-purple-200',
}
const STATUS_DOT: Record<string, string> = {
    scheduled: 'bg-blue-500', in_progress: 'bg-orange-500', completed: 'bg-green-500',
    cancelled: 'bg-red-500', delayed: 'bg-yellow-500', boarding: 'bg-purple-500',
}

function formatDate(dt: string) {
    if (!dt) return 'Fecha no disponible'
    try { return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dt)) }
    catch { return 'Fecha inválida' }
}
function formatTime(dt: string) {
    if (!dt) return 'Hora no disponible'
    try { return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(dt)) }
    catch { return 'Hora inválida' }
}

export default function TripCard({ trip, listMode = false, onViewTrip, onEditTrip }: TripCardProps) {
    const [showOccupied, setShowOccupied] = useState(false)

    const seatPct = useMemo(() => {
        if (!trip.total_seats || trip.total_seats === 0) return 0
        return Math.max(0, (trip.available_seats ?? 0) / trip.total_seats)
    }, [trip.available_seats, trip.total_seats])

    const statusStr = trip.status || ''
    const statusText = STATUS_MAP[statusStr] || (statusStr ? statusStr.charAt(0).toUpperCase() + statusStr.slice(1).replace(/_/g, ' ') : 'Estado desconocido')

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1 ${listMode ? 'p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center lg:space-x-6' : 'p-4 lg:p-6 flex flex-col justify-between shadow-lg'}`}>
            <div className={listMode ? 'flex-1' : ''}>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex-shrink-0">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" /></svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-bold text-gray-900 truncate">Viaje #{trip.id}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-700">
                                    <span className="font-medium">{trip.route.origin}</span>
                                    <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    <span className="font-medium">{trip.route.destination}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border shadow-sm ${STATUS_CLASS[trip.status || ''] || 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${STATUS_DOT[trip.status || ''] || 'bg-gray-500'}`} />
                            {statusText}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                            <svg className="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-gray-600 font-medium">Fecha</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{formatDate(trip.trip_datetime)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                            <svg className="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-gray-600 font-medium">Hora</p>
                        </div>
                        <p className="text-gray-900 font-semibold">{formatTime(trip.trip_datetime)}</p>
                    </div>
                </div>

                {/* Staff and Bus */}
                <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Personal y Unidad
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                            { img: trip.driver?.photoUrl, name: trip.driver?.name, label: 'Conductor', dot: 'bg-green-500', fallback: DEFAULT_PERSON_IMAGE },
                            { img: trip.assistant?.photoUrl, name: trip.assistant?.name, label: 'Asistente', dot: 'bg-blue-500', fallback: DEFAULT_PERSON_IMAGE },
                            { img: trip.bus?.photoUrl, name: trip.bus?.plate, label: 'Unidad', dot: 'bg-orange-500', fallback: DEFAULT_BUS_IMAGE },
                        ].map((item) => (
                            <div key={item.label} className="group">
                                <div className="relative mb-2">
                                    <img
                                        src={item.img || item.fallback}
                                        alt={`${item.label}: ${item.name || 'No asignado'}`}
                                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg mx-auto object-cover border-2 border-white shadow-md bg-gray-100 group-hover:border-indigo-300 transition-colors"
                                        onError={(e) => { (e.target as HTMLImageElement).src = item.fallback }}
                                    />
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${item.dot} border-2 border-white rounded-full`} />
                                </div>
                                <p className="text-xs text-gray-900 font-medium leading-tight truncate">{item.name || 'No asignado'}</p>
                                <p className="text-xs text-gray-600 leading-tight">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Seat Availability */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                            <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" /></svg>
                            <p className="text-sm text-gray-700 font-semibold">Disponibilidad de Asientos</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{trip.available_seats}<span className="text-gray-600 font-normal"> / {trip.total_seats}</span></p>
                            <p className="text-xs text-gray-600">{Math.round(seatPct * 100)}% disponible</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${seatPct > 0.5 ? 'bg-gradient-to-r from-green-500 to-green-600' : seatPct > 0.2 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`}
                            style={{ width: `${Math.max(5, seatPct * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Occupied Seats */}
                {trip.occupied_seats && trip.occupied_seats.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowOccupied(!showOccupied)}
                            className="w-full text-left text-sm text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-between border border-indigo-200"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <span className="font-medium">{showOccupied ? 'Ocultar' : 'Ver'} Asientos Ocupados ({trip.occupied_seats.length})</span>
                            </div>
                            <svg className={`h-4 w-4 transition-transform duration-200 ${showOccupied ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {showOccupied && (
                            <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner max-h-32 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {trip.occupied_seats.map((seat) => (
                                        <span key={seat} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">{seat}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className={`pt-4 border-t border-gray-200 ${listMode ? 'lg:pt-0 lg:border-t-0 lg:border-l lg:border-gray-200 lg:pl-6 lg:flex-shrink-0' : 'mt-auto'}`}>
                <div className={`flex gap-3 ${listMode ? 'lg:flex-col lg:space-y-3 lg:w-32' : 'justify-end'}`}>
                    <button onClick={() => onViewTrip?.(trip.id)} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200">
                        <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span>Ver Detalles</span>
                    </button>
                    <button onClick={() => onEditTrip?.(trip.id)} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all duration-200">
                        <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <span>Editar</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
