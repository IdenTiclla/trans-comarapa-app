import { useEffect, useState } from 'react'
import { secretaryService } from '@/services/secretary.service'
import { officeService } from '@/services/office.service'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
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

interface SecretaryFormData {
  firstname: string
  lastname: string
  phone: string
  office_id: string
  username: string
  email: string
  password: string
  is_active: boolean
}

const INITIAL_FORM: SecretaryFormData = {
  firstname: '',
  lastname: '',
  phone: '',
  office_id: '',
  username: '',
  email: '',
  password: '',
  is_active: true,
}

export function useSecretariesPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [secretaries, setSecretaries] = useState<SecretaryWithEmail[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SecretaryWithEmail | null>(null)
  const [formData, setFormData] = useState<SecretaryFormData>({ ...INITIAL_FORM })

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

  const openCreate = () => {
    setEditing(null)
    setFormData({ ...INITIAL_FORM })
    setShowForm(true)
  }

  const openEdit = (sec: SecretaryWithEmail) => {
    setEditing(sec)
    setFormData({
      firstname: sec.firstname || '',
      lastname: sec.lastname || '',
      phone: sec.phone || '',
      office_id: sec.office_id ? String(sec.office_id) : '',
      username: '',
      email: sec.email || '',
      password: '',
      is_active: sec.is_active !== false,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const payload: Record<string, unknown> = {
          firstname: formData.firstname || null,
          lastname: formData.lastname || null,
          phone: formData.phone || null,
          office_id: formData.office_id ? Number(formData.office_id) : null,
        }
        await secretaryService.update(editing.id, payload)
        toast.success('Secretaria actualizada')
      } else {
        if (!formData.username || !formData.email || !formData.password) {
          toast.error('Username, email y contraseña son requeridos')
          setSaving(false)
          return
        }
        await secretaryService.create({
          firstname: formData.firstname,
          lastname: formData.lastname,
          phone: formData.phone || null,
          office_id: formData.office_id ? Number(formData.office_id) : null,
          user: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            is_active: formData.is_active,
            is_admin: false,
          },
        })
        toast.success('Secretaria creada')
      }
      setShowForm(false)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sec: SecretaryWithEmail) => {
    if (!(await confirm({ title: 'Eliminar secretaria', description: `¿Eliminar secretaria ${sec.firstname} ${sec.lastname}?`, confirmLabel: 'Sí, eliminar', variant: 'destructive' }))) return
    try {
      await secretaryService.delete(sec.id)
      toast.success('Secretaria eliminada')
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  const getOfficeName = (officeId?: number | null) =>
    offices.find((o) => o.id === officeId)?.name ?? null

  return {
    secretaries,
    offices,
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
    getOfficeName,
    confirmDialog: ConfirmDialog,
  }
}
