import { useState } from 'react'
import { useNavigate } from 'react-router'
import TripCard from './TripCard'
import { EmptyState } from '@/components/common'

interface SlotRoute {
    id: number
    origin: string
    destination: string
    price?: number
}

interface Slot {
    time: string
    trip: Record<string, unknown> | null
    route: SlotRoute
    schedule?: Record<string, unknown>
}

interface RouteGroup {
    route: SlotRoute
    slots: Slot[]
}

interface TripCardListProps {
    scheduleBoard: RouteGroup[]
    loading?: boolean
    selectedDate?: string
    onViewTrip?: (id: number) => void
    onEditTrip?: (id: number) => void
    onCreateTrip?: (data: { routeId: number; date: string; time: string }) => void
}

function formatCurrency(amount?: number) {
    if (!amount) return ''
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(amount)
}

export default function TripCardList({
    scheduleBoard = [],
    loading = false,
    selectedDate = '',
    onViewTrip,
    onEditTrip,
    onCreateTrip,
}: TripCardListProps) {
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})

    const isExpanded = (routeId: number) => collapsed[routeId] !== true
    const toggle = (routeId: number) => setCollapsed((prev) => ({ ...prev, [routeId]: !prev[routeId] }))
    const countTrips = (group: RouteGroup) => group.slots.filter((s) => s.trip !== null).length

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2].map((n) => (
                    <div key={n} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3" /></div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[1, 2, 3].map((m) => (
                                    <div key={m} className="bg-white shadow-md rounded-xl border border-gray-100 p-6 animate-pulse">
                                        <div className="flex justify-between items-start mb-4"><div className="flex-1"><div className="h-6 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-4 bg-gray-200 rounded w-1/2" /></div><div className="h-6 bg-gray-200 rounded-full w-20" /></div>
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2" /><div className="h-4 bg-gray-200 rounded w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!scheduleBoard || scheduleBoard.length === 0) {
        return (
            <EmptyState
                title="No hay horarios configurados"
                description="No se encontraron rutas con horarios activos. Configure horarios desde la administración de rutas."
                icon={<svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                action={
                    <button onClick={() => navigate('/admin/routes')} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Configurar Rutas
                    </button>
                }
            />
        )
    }

    return (
        <div className="space-y-6">
            {scheduleBoard.map((group) => {
                const tripsCount = countTrips(group)
                return (
                    <div key={group.route.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        {/* Route Header */}
                        <button onClick={() => toggle(group.route.id)} className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 hover:from-indigo-100 hover:to-purple-100 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-sm">
                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {group.route.origin}
                                        <svg className="h-4 w-4 inline mx-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        {group.route.destination}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {group.slots.length} horario{group.slots.length !== 1 ? 's' : ''} · {tripsCount} viaje{tripsCount !== 1 ? 's' : ''} creado{tripsCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${tripsCount === group.slots.length ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {tripsCount}/{group.slots.length}
                                </span>
                                <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isExpanded(group.route.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </button>

                        {/* Slots Content */}
                        {isExpanded(group.route.id) && (
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {group.slots.map((slot) =>
                                        slot.trip ? (
                                            <TripCard
                                                key={`${group.route.id}-${slot.time}`}
                                                trip={slot.trip as any}
                                                onViewTrip={onViewTrip}
                                                onEditTrip={onEditTrip}
                                            />
                                        ) : (
                                            <div
                                                key={`${group.route.id}-${slot.time}`}
                                                className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-4 lg:p-6 flex flex-col justify-between hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group cursor-pointer"
                                                onClick={() => onCreateTrip?.({ routeId: slot.route.id, date: selectedDate, time: slot.time })}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 group-hover:bg-indigo-100 rounded-xl transition-colors">
                                                                <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-2xl font-bold text-gray-900">{slot.time}</p>
                                                                <p className="text-sm text-gray-500">Horario programado</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                                                            <span className="w-2 h-2 rounded-full mr-2 bg-gray-400" />Sin viaje
                                                        </span>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                                                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                                                            <span className="font-medium">{slot.route.origin}</span>
                                                            <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                                            <span className="font-medium">{slot.route.destination}</span>
                                                        </div>
                                                        {slot.route.price && <p className="text-xs text-gray-500 mt-1">Precio: {formatCurrency(slot.route.price)}</p>}
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-gray-200 mt-auto">
                                                    <button className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 group-hover:bg-indigo-100 group-hover:border-indigo-300">
                                                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                                        Crear Viaje
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
