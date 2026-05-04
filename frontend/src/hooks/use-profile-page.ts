import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { officeService } from '@/services/office.service'
import { toast } from 'sonner'
import type { Office } from '@/types/office'

export function useProfilePage() {
  const { user, userFullName, userInitials, userRole, updateProfile, loading } =
    useAuth()

  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [office, setOffice] = useState<Office | null>(null)
  const [officeLoading, setOfficeLoading] = useState(false)

  useEffect(() => {
    if (userRole === 'secretary' && user?.office_id) {
      setOfficeLoading(true)
      officeService
        .getById(user.office_id)
        .then(setOffice)
        .catch(() => toast.error('Error al cargar la oficina'))
        .finally(() => setOfficeLoading(false))
    }
  }, [userRole, user?.office_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(formData)
      toast.success('Perfil actualizado correctamente')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  return {
    user,
    userFullName,
    userInitials,
    userRole,
    loading,
    formData,
    setFormData,
    saving,
    office,
    officeLoading,
    handleSubmit,
  }
}
