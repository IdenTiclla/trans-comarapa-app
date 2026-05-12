import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { seatService, type LockedSeatInfo } from '@/services/seat.service'
import { API_BASE_URL } from '@/lib/constants'
import { TIMING } from '@/lib/timing'

export function useTripSeatLocks(tripId: number) {
    const currentUser = useAppSelector(selectUser)
    const [lockedSeats, setLockedSeats] = useState<LockedSeatInfo[]>([])
    const wsRef = useRef<WebSocket | null>(null)
    const wsReconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fetchLockedSeats = useCallback(async (tId: number) => {
        try {
            const data = await seatService.getLockedSeats(tId)
            setLockedSeats(Array.isArray(data) ? data : [])
        } catch {
            setLockedSeats([])
        }
    }, [])

    useEffect(() => {
        if (!tripId || !currentUser?.id) return

        let cancelled = false

        function startPolling() {
            if (pollRef.current || cancelled) return
            pollRef.current = setInterval(() => fetchLockedSeats(tripId), TIMING.SEAT_LOCK_POLL)
        }

        function stopPolling() {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }

        async function connect() {
            if (cancelled) return

            let wsToken: string | null = null
            try {
                const res = await seatService.getWsToken()
                wsToken = res.token
            } catch {
                startPolling()
                return
            }

            if (cancelled || !wsToken) return

            const wsBase = API_BASE_URL.replace(/^http/, 'ws')
            const wsUrl = `${wsBase}/seats/ws/${tripId}?token=${wsToken}`

            let ws: WebSocket
            try {
                ws = new WebSocket(wsUrl)
            } catch {
                startPolling()
                return
            }
            wsRef.current = ws
            let wsConnected = false

            ws.onopen = () => {
                wsConnected = true
                stopPolling()
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'seat_locks_updated' && data.locks) {
                        setLockedSeats(data.locks)
                    }
                } catch { /* ignore non-JSON */ }
            }

            ws.onclose = () => {
                wsRef.current = null
                if (!cancelled) {
                    if (!wsConnected) {
                        startPolling()
                    } else {
                        wsReconnectRef.current = setTimeout(connect, TIMING.WS_RECONNECT_DELAY)
                    }
                }
            }

            ws.onerror = () => { ws.close() }

            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send('ping')
            }, TIMING.WS_PING_INTERVAL)

            ws.addEventListener('close', () => clearInterval(pingInterval))
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLockedSeats(tripId)
        connect()

        return () => {
            cancelled = true
            stopPolling()
            if (wsReconnectRef.current) clearTimeout(wsReconnectRef.current)
            if (wsRef.current) {
                wsRef.current.close()
                wsRef.current = null
            }
        }
    }, [tripId, currentUser?.id, fetchLockedSeats])

    const prevLockedSeatsRef = useRef<Set<number>>(new Set())
    const [lockAnnouncement, setLockAnnouncement] = useState('')

    useEffect(() => {
        const currentIds = new Set(lockedSeats.map(s => s.seat_id))
        const newLocked = lockedSeats.filter(
            s => !prevLockedSeatsRef.current.has(s.seat_id) && s.user_id !== currentUser?.id,
        )
        prevLockedSeatsRef.current = currentIds
        if (newLocked.length === 0) return
        const seatLabels = newLocked.map(s => s.seat_id).join(', ')
        setLockAnnouncement(`Asiento${newLocked.length > 1 ? 's' : ''} ${seatLabels} bloqueado${newLocked.length > 1 ? 's' : ''} por otro usuario`)
    }, [lockedSeats, currentUser?.id])

    return { lockedSeats, fetchLockedSeats, lockAnnouncement }
}
