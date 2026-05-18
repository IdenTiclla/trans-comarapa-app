import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { packageService } from '@/services/package.service'
import type { Package as Pkg } from '@/types/package'

export type MyPackagesTab = 'sent' | 'received'

export function useMyPackages() {
  const user = useAppSelector(selectUser)
  const clientId = user?.person?.id

  const [tab, setTab] = useState<MyPackagesTab>('sent')
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
        const [s, r] = await Promise.all([
          packageService.getBySender(clientId),
          packageService.getByRecipient(clientId),
        ])
        if (!cancelled) {
          setSent((s as Pkg[]) ?? [])
          setReceived((r as Pkg[]) ?? [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message || 'No se pudieron cargar tus encomiendas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [clientId])

  const list = useMemo(() => (tab === 'sent' ? sent : received), [tab, sent, received])

  return { tab, setTab, sent, received, list, loading, error }
}
