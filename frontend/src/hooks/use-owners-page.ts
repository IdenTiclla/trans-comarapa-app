import { useEffect, useState } from 'react'
import { ownerService } from '@/services/owner.service'
import { toast } from 'sonner'
import type { Owner } from '@/types'

export function useOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    ci: '',
    phone: '',
    email: '',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await ownerService.getAll()
      setOwners(
        Array.isArray(data)
          ? data
          : (data as { items?: Owner[] }).items || [],
      )
    } catch (e) {
      toast.error('Error al cargar socios: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setFormData({ firstname: '', lastname: '', ci: '', phone: '', email: '' })
    setIsModalOpen(true)
  }

  const openEdit = (owner: Owner) => {
    setEditing(owner)
    setFormData({
      firstname: owner.firstname || '',
      lastname: owner.lastname || '',
      ci: owner.ci || '',
      phone: owner.phone || '',
      email: owner.email || '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        ci: formData.ci,
        phone: formData.phone || null,
        email: formData.email || null,
      }

      if (editing) {
        await ownerService.update(editing.id, payload)
        toast.success('Socio actualizado exitosamente')
      } else {
        await ownerService.create(payload)
        toast.success('Socio registrado exitosamente')
      }
      setIsModalOpen(false)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return {
    owners,
    loading,
    saving,
    isModalOpen,
    setIsModalOpen,
    editing,
    formData,
    setFormData,
    openCreate,
    openEdit,
    handleSubmit,
  }
}
