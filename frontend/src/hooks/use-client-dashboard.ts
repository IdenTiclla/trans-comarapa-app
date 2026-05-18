import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { ticketService } from '@/services/ticket.service'
import { packageService } from '@/services/package.service'
import type { Ticket } from '@/types/ticket'
import type { Package as Pkg } from '@/types/package'

interface TripLike {
  date?: string
  trip_datetime?: string
  route?: { origin?: { name?: string }; destination?: { name?: string } }
}

function ticketDate(t: Ticket): Date | null {
  const trip = t.trip as TripLike | undefined
  const raw = trip?.trip_datetime ?? trip?.date ?? t.created_at
  if (!raw) return null
  const d = new Date(raw as string)
  return Number.isNaN(d.getTime()) ? null : d
}

export function useClientDashboard() {
  const user = useAppSelector(selectUser)
  const clientId = user?.person?.id

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [sent, setSent] = useState<Pkg[]>([])
  const [received, setReceived] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!clientId) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const [t, s, r] = await Promise.all([
          ticketService.getByClient(clientId),
          packageService.getBySender(clientId),
          packageService.getByRecipient(clientId),
        ])
        if (!cancelled) {
          setTickets((t as Ticket[]) ?? [])
          setSent((s as Pkg[]) ?? [])
          setReceived((r as Pkg[]) ?? [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message || 'No se pudo cargar tu información')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [clientId])

  const now = useMemo(() => new Date(), [])

  const upcomingTickets = useMemo(() => {
    return tickets
      .filter((t) => {
        const state = String(t.state ?? '')
        if (state === 'cancelled' || state === 'expired') return false
        const d = ticketDate(t)
        return d ? d.getTime() >= now.getTime() : false
      })
      .sort((a, b) => (ticketDate(a)?.getTime() ?? 0) - (ticketDate(b)?.getTime() ?? 0))
  }, [tickets, now])

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => (ticketDate(b)?.getTime() ?? 0) - (ticketDate(a)?.getTime() ?? 0))
      .slice(0, 4)
  }, [tickets])

  const pendingToReceive = useMemo(
    () => received.filter((p) => String(p.status ?? '') !== 'delivered'),
    [received],
  )

  const pendingToSend = useMemo(
    () => sent.filter((p) => {
      const s = String(p.status ?? '')
      return s !== 'delivered'
    }),
    [sent],
  )

  const nextTrip = upcomingTickets[0]

  return {
    loading,
    error,
    tickets,
    sent,
    received,
    upcomingTickets,
    recentTickets,
    pendingToReceive,
    pendingToSend,
    nextTrip,
    stats: {
      totalTickets: tickets.length,
      upcomingCount: upcomingTickets.length,
      sentCount: sent.length,
      receivedCount: received.length,
      pendingToReceiveCount: pendingToReceive.length,
    },
  }
}
