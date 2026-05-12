import { useEffect, useState } from 'react'
import { userManagementService } from '@/services/user-management.service'
import { secretaryService } from '@/services/secretary.service'
import { officeService } from '@/services/office.service'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { Office } from '@/types/office'

interface User {
  id: number
  email: string
  role: string
  first_name?: string
  last_name?: string
  is_active: boolean
  [key: string]: unknown
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  secretary: 'Secretaria',
  driver: 'Conductor',
  assistant: 'Asistente',
  client: 'Cliente',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700',
  secretary: 'bg-blue-100 text-blue-700',
  driver: 'bg-emerald-100 text-emerald-700',
  assistant: 'bg-amber-100 text-amber-700',
  client: 'bg-gray-100 text-gray-700',
}

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function useUsersPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [users, setUsers] = useState<User[]>([])
  const [offices, setOffices] = useState<Office[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [secretaryInfo, setSecretaryInfo] = useState<{
    id: number
    firstname: string
    lastname: string
    phone?: string
    office_id?: number | null
  } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'secretary',
    first_name: '',
    last_name: '',
  })
  const [officeId, setOfficeId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userManagementService.getAll()
      setUsers(
        Array.isArray(data)
          ? data
          : (data as { items?: User[] }).items || [],
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    officeService.getAll().then(setOffices).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditing(null)
    setSecretaryInfo(null)
    setOfficeId(null)
    setFormData({
      email: '',
      password: '',
      role: 'secretary',
      first_name: '',
      last_name: '',
    })
    setShowForm(true)
  }

  const openEdit = async (user: User) => {
    setEditing(user)
    setSecretaryInfo(null)
    setOfficeId(null)
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    })
    setShowForm(true)

    if (user.role === 'secretary') {
      try {
        const sec = await secretaryService.getByUserId(user.id)
        setSecretaryInfo(sec)
        setOfficeId(sec.office_id ?? null)
      } catch {
        // No secretary record found
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: Record<string, unknown> = { ...formData }
      if (!data.password) delete data.password

      if (editing) {
        await userManagementService.update(editing.id, data)
        if (formData.role === 'secretary' && secretaryInfo) {
          await secretaryService.update(secretaryInfo.id, {
            office_id: officeId,
          })
        }
        toast.success('Usuario actualizado')
      } else {
        await userManagementService.create(data)
        toast.success('Usuario creado')
      }
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!(await confirm({ title: 'Eliminar usuario', description: `¿Eliminar usuario ${user.email}?`, confirmLabel: 'Sí, eliminar', variant: 'destructive' }))) return
    try {
      await userManagementService.delete(user.id)
      toast.success('Usuario eliminado')
      fetchUsers()
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`)
    }
  }

  const toggleActive = async (user: User) => {
    try {
      if (user.is_active) {
        await userManagementService.deactivate(user.id)
        toast.success('Usuario desactivado')
      } else {
        await userManagementService.activate(user.id)
        toast.success('Usuario activado')
      }
      fetchUsers()
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`)
    }
  }

  return {
    users,
    offices,
    loading,
    error,
    showForm,
    setShowForm,
    editing,
    secretaryInfo,
    formData,
    setFormData,
    officeId,
    setOfficeId,
    saving,
    openCreate,
    openEdit,
    handleSubmit,
    handleDelete,
    toggleActive,
    ROLE_LABELS,
    ROLE_COLORS,
    ROLE_OPTIONS,
    confirmDialog: ConfirmDialog,
  }
}
