import { useEffect, useState, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { ticketService } from '@/services/ticket.service'
import type { Ticket, TicketState } from '@/types/ticket'

export type TicketTab = 'all' | TicketState

export function useMyTickets() {
  const user = useAppSelector(selectUser)
  const clientId = user?.person?.id

  const [tab, setTab] = useState<TicketTab>('all')
  const [tickets, setTickets] = useState<Ticket[]>([])
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
        const data = await ticketService.getByClient(clientId)
        if (!cancelled) {
          setTickets((data as Ticket[]) ?? [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message || 'No se pudieron cargar tus boletos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [clientId])

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: tickets.length,
      pending: 0,
      confirmed: 0,
      paid: 0,
      sold: 0,
      cancelled: 0,
      expired: 0
    }
    tickets.forEach((t) => {
      if (c[t.state] !== undefined) {
        c[t.state]++
      } else {
        c[t.state] = 1
      }
    })
    return c
  }, [tickets])

  const list = useMemo(() => {
    if (tab === 'all') return tickets
    return tickets.filter((t) => t.state === tab)
  }, [tickets, tab])

  return { tab, setTab, list, counts, loading, error }
}
