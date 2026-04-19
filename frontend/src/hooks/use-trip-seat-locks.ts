import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { seatService, type LockedSeatInfo } from '@/services/seat.service'
import { API_BASE_URL } from '@/lib/constants'

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
            pollRef.current = setInterval(() => fetchLockedSeats(tripId), 3000)
        }

        function stopPolling() {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }

        function connect() {
            if (cancelled) return

            const wsBase = API_BASE_URL.replace(/^http/, 'ws')
            const wsUrl = `${wsBase}/seats/ws/${tripId}?user_id=${currentUser!.id}`

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
                        wsReconnectRef.current = setTimeout(connect, 3000)
                    }
                }
            }

            ws.onerror = () => { ws.close() }

            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send('ping')
            }, 30000)

            ws.addEventListener('close', () => clearInterval(pingInterval))
        }

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

    return { lockedSeats, fetchLockedSeats }
}
