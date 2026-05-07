import { useEffect, useState } from 'react'
import { assistantService } from '@/services/assistant.service'
import { toast } from 'sonner'
import type { Assistant } from '@/types'

interface AssistantFormData {
  firstname: string
  lastname: string
  phone: string
}

const INITIAL_FORM: AssistantFormData = {
  firstname: '',
  lastname: '',
  phone: '',
}

export function useAssistantsPage() {
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Assistant | null>(null)
  const [formData, setFormData] = useState<AssistantFormData>({ ...INITIAL_FORM })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await assistantService.getAll()
      setAssistants(
        Array.isArray(data)
          ? data
          : (data as { items?: Assistant[] }).items || [],
      )
    } catch (e) {
      toast.error('Error al cargar asistentes: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setFormData({ ...INITIAL_FORM })
    setShowForm(true)
  }

  const openEdit = (assistant: Assistant) => {
    setEditing(assistant)
    setFormData({
      firstname: assistant.firstname || '',
      lastname: assistant.lastname || '',
      phone: assistant.phone || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        firstname: formData.firstname || null,
        lastname: formData.lastname || null,
        phone: formData.phone || null,
      }

      if (editing) {
        await assistantService.update(editing.id, payload)
        toast.success('Asistente actualizado exitosamente')
      } else {
        await assistantService.create(payload)
        toast.success('Asistente creado exitosamente')
      }
      setShowForm(false)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (assistant: Assistant) => {
    if (!confirm(`¿Eliminar asistente ${assistant.firstname} ${assistant.lastname}?`)) return
    try {
      await assistantService.delete(assistant.id)
      toast.success('Asistente eliminado')
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  return {
    assistants,
    loading,
    saving,
    showForm,
    setShowForm,
    editing,
    formData,
    setFormData,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
  }
}
