import { useEffect, useState } from 'react'
import { assistantService } from '@/services/assistant.service'
import type { Assistant } from '@/types'

export function useAssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await assistantService.getAll()
      setAssistants(
        Array.isArray(data)
          ? data
          : (data as { items?: Assistant[] }).items || [],
      )
    } catch {
      setAssistants([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return { assistants, loading }
}
