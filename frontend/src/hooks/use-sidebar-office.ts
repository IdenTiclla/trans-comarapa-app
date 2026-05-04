import { useState, useEffect } from 'react'
import { officeService } from '@/services/office.service'

export function useSidebarOffice(officeId?: number) {
  const [officeName, setOfficeName] = useState('')

  useEffect(() => {
    if (officeId) {
      officeService.getById(officeId)
        .then(office => setOfficeName(office.name))
        .catch(() => setOfficeName(''))
    }
  }, [officeId])

  return { officeName }
}
