import { useEffect, useState } from 'react'
import { driverService } from '@/services/driver.service'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/use-confirm'
import type { Driver } from '@/types'

interface DriverFormData {
  firstname: string
  lastname: string
  phone: string
  license_number: string
  license_type: string
  license_expiry: string
  status: string
}

const INITIAL_FORM: DriverFormData = {
  firstname: '',
  lastname: '',
  phone: '',
  license_number: '',
  license_type: '',
  license_expiry: '',
  status: 'active',
}

export function useDriversPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [formData, setFormData] = useState<DriverFormData>({ ...INITIAL_FORM })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await driverService.getAll()
      setDrivers(
        Array.isArray(data)
          ? data
          : (data as { items?: Driver[] }).items || [],
      )
    } catch (e) {
      toast.error('Error al cargar choferes: ' + (e as Error).message)
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

  const openEdit = (driver: Driver) => {
    setEditing(driver)
    setFormData({
      firstname: driver.firstname || '',
      lastname: driver.lastname || '',
      phone: driver.phone || '',
      license_number: driver.license_number || '',
      license_type: driver.license_type || '',
      license_expiry: driver.license_expiry
        ? String(driver.license_expiry).split('T')[0]
        : '',
      status: driver.status || 'active',
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
        license_number: formData.license_number || null,
        license_type: formData.license_type || null,
        license_expiry: formData.license_expiry || null,
        status: formData.status,
      }

      if (editing) {
        await driverService.update(editing.id, payload)
        toast.success('Chofer actualizado exitosamente')
      } else {
        await driverService.create(payload)
        toast.success('Chofer creado exitosamente')
      }
      setShowForm(false)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (driver: Driver) => {
    if (!(await confirm({ title: 'Eliminar chofer', description: `¿Eliminar chofer ${driver.firstname} ${driver.lastname}?`, confirmLabel: 'Sí, eliminar', variant: 'destructive' }))) return
    try {
      await driverService.delete(driver.id)
      toast.success('Chofer eliminado')
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    }
  }

  return {
    drivers,
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
    confirmDialog: ConfirmDialog,
  }
}
