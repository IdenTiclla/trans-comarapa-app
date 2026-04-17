import { useState, useEffect, useMemo, useCallback } from 'react'

interface TripCountdownProps {
    tripDateTime: string
    departureTime?: string
    compact?: boolean
    tripStatus?: string
}

export default function TripCountdown({ tripDateTime, departureTime, compact = false, tripStatus = '' }: TripCountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [isPast, setIsPast] = useState(false)
    const [isTimeToTravel, setIsTimeToTravel] = useState(false)
    const [isAlmostTime, setIsAlmostTime] = useState(false)

    const targetDateTime = useMemo(() => {
        if (tripDateTime && departureTime) {
            const tripDate = new Date(tripDateTime)
            const [h, m] = departureTime.split(':').map(Number)
            tripDate.setHours(h, m, 0, 0)
            return tripDate
        }
        return new Date(tripDateTime)
    }, [tripDateTime, departureTime])

    const calculate = useCallback(() => {
        const now = new Date()
        const diff = targetDateTime.getTime() - now.getTime()

        if (diff <= 60000 && diff > -60000) {
            setIsTimeToTravel(true); setIsPast(false); setIsAlmostTime(false)
        } else if (diff <= -60000) {
            setIsPast(true); setIsTimeToTravel(false); setIsAlmostTime(false)
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            return
        } else if (diff <= 300000) {
            setIsAlmostTime(true); setIsTimeToTravel(false); setIsPast(false)
        } else {
            setIsPast(false); setIsTimeToTravel(false); setIsAlmostTime(false)
        }

        setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        })
    }, [targetDateTime])

    useEffect(() => {
        calculate()
        const id = setInterval(calculate, 1000)
        return () => clearInterval(id)
    }, [calculate])

    const pad = (n: number) => String(n).padStart(2, '0')

    // Compact mode
    if (compact) {
        if (!isPast && !isTimeToTravel) {
            return (
                <div className="inline-flex items-center gap-1.5">
                    <div className="flex items-center gap-1 bg-white/80 backdrop-blur rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-xs font-bold text-gray-700 font-mono tabular-nums">
                            {pad(timeLeft.days)}<span className="text-gray-400">d</span>{' '}
                            {pad(timeLeft.hours)}<span className="text-gray-400">h</span>{' '}
                            {pad(timeLeft.minutes)}<span className="text-gray-400">m</span>{' '}
                            <span className="text-indigo-500">{pad(timeLeft.seconds)}</span><span className="text-gray-400">s</span>
                        </span>
                    </div>
                    {isAlmostTime && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                        </span>
                    )}
                </div>
            )
        }
        if (isTimeToTravel) return <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg animate-pulse">🚌 En marcha</span>
        if (tripStatus === 'departed' || tripStatus === 'en_route') return <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-200">🚌 En Ruta</span>
        if (tripStatus === 'arrived' || tripStatus === 'completed') return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200">🏁 Finalizado</span>
        if (tripStatus === 'cancelled') return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200">❌ Cancelado</span>
        return <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-orange-200">⚠️ Demorado</span>
    }

    // Full mode
    return (
        <div className="w-full max-w-2xl mx-auto mb-4">
            <div className="text-center mb-3">
                <h3 className="text-base font-bold text-gray-800 uppercase tracking-wider">Tiempo Restante</h3>
                <div className="h-0.5 w-16 bg-indigo-600 mx-auto mt-1 rounded-full" />
            </div>

            {!isPast && !isTimeToTravel ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { value: timeLeft.days, label: 'Días' },
                        { value: timeLeft.hours, label: 'Horas' },
                        { value: timeLeft.minutes, label: 'Minutos' },
                        { value: timeLeft.seconds, label: 'Segundos' },
                    ].map((u) => (
                        <div key={u.label} className="flex flex-col items-center">
                            <div className="bg-white rounded-lg shadow-md p-2 sm:p-3 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 relative z-10 font-mono">{pad(u.value)}</span>
                            </div>
                            <span className="mt-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">{u.label}</span>
                        </div>
                    ))}
                </div>
            ) : isTimeToTravel ? (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-4 text-center text-white animate-pulse">
                    <div className="text-2xl mb-1">🚌</div>
                    <h3 className="text-lg font-bold mb-1">¡Es Hora de Viajar!</h3>
                    <p className="opacity-90 text-sm">Tu viaje está programado para salir ahora.</p>
                </div>
            ) : (
                <div className="bg-gray-100 rounded-lg border-2 border-gray-200 p-4 text-center text-gray-500">
                    {(tripStatus === 'departed' || tripStatus === 'en_route') ? (
                        <><div className="text-2xl mb-1 text-blue-500">🚌</div><h3 className="text-base font-bold mb-1 text-blue-600">En Ruta</h3><p className="text-xs text-blue-400">Este viaje ha partido.</p></>
                    ) : (tripStatus === 'arrived' || tripStatus === 'completed') ? (
                        <><div className="text-2xl mb-1">🏁</div><h3 className="text-base font-bold mb-1">Viaje Finalizado</h3><p className="text-xs">Este viaje ha concluido.</p></>
                    ) : tripStatus === 'cancelled' ? (
                        <><div className="text-2xl mb-1 text-red-500">❌</div><h3 className="text-base font-bold mb-1 text-red-600">Cancelado</h3><p className="text-xs text-red-400">Este viaje fue cancelado.</p></>
                    ) : (
                        <><div className="text-2xl mb-1 text-orange-500">⚠️</div><h3 className="text-base font-bold mb-1 text-orange-600">Demorado</h3><p className="text-xs text-orange-400">El viaje está retrasado.</p></>
                    )}
                </div>
            )}

            {isAlmostTime && !isTimeToTravel && !isPast && (
                <div className="mt-2 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-ping" />
                        ¡El viaje sale pronto!
                    </span>
                </div>
            )}
        </div>
    )
}
