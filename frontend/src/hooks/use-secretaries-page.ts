import { useEffect, useState } from 'react'
import { secretaryService } from '@/services/secretary.service'
import { officeService } from '@/services/office.service'
import type { Office } from '@/types/office'

interface SecretaryWithEmail {
  id: number
  firstname: string
  lastname: string
  phone?: string | null
  office_id?: number | null
  user_id?: number | null
  email?: string
  is_active?: boolean
}

export function useSecretariesPage() {
  const [secretaries, setSecretaries] = useState<SecretaryWithEmail[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [pendingOffice, setPendingOffice] = useState<Record<number, number | null>>({})

  const loadData = async () => {
    setLoading(true)
    try {
      const [secs, offs] = await Promise.all([
        secretaryService.getAll(),
        officeService.getAll(),
      ])
      setOffices(offs)

      const enriched: SecretaryWithEmail[] = await Promise.all(
        secs.map(async (s) => {
          if (!s.user_id) return s as SecretaryWithEmail
          try {
            const user = await secretaryService.getUser(s.id)
            return { ...s, email: user.email, is_active: user.is_active }
          } catch {
            return s as SecretaryWithEmail
          }
        }),
      )
      setSecretaries(enriched)
    } catch {
      setSecretaries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOfficeChange = (secId: number, value: string) => {
    setPendingOffice((prev) => ({ ...prev, [secId]: value ? Number(value) : null }))
  }

  const saveOffice = async (sec: SecretaryWithEmail) => {
    const newOfficeId = pendingOffice[sec.id] !== undefined ? pendingOffice[sec.id] : sec.office_id
    setSavingId(sec.id)
    try {
      await secretaryService.update(sec.id, { office_id: newOfficeId })
      setSecretaries((prev) =>
        prev.map((s) => (s.id === sec.id ? { ...s, office_id: newOfficeId } : s)),
      )
      setPendingOffice((prev) => {
        const next = { ...prev }
        delete next[sec.id]
        return next
      })
      return true
    } catch {
      return false
    } finally {
      setSavingId(null)
    }
  }

  const getOfficeName = (officeId?: number | null) =>
    offices.find((o) => o.id === officeId)?.name ?? null

  const hasPendingChange = (sec: SecretaryWithEmail) =>
    pendingOffice[sec.id] !== undefined && pendingOffice[sec.id] !== sec.office_id

  const currentOfficeValue = (sec: SecretaryWithEmail) =>
    pendingOffice[sec.id] !== undefined ? pendingOffice[sec.id] : sec.office_id

  return {
    secretaries,
    offices,
    loading,
    savingId,
    pendingOffice,
    handleOfficeChange,
    saveOffice,
    getOfficeName,
    hasPendingChange,
    currentOfficeValue,
  }
}
