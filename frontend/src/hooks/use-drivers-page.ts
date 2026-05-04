import { useEffect, useState } from 'react'
import { driverService } from '@/services/driver.service'
import { toast } from 'sonner'
import type { Driver } from '@/types'

export function useDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)

  const [formData, setFormData] = useState({
    license_number: '',
    license_type: '',
    license_expiry: '',
    status: 'active',
  })

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

  const openEdit = (driver: Driver) => {
    setEditing(driver)
    setFormData({
      license_number: driver.license_number || '',
      license_type: driver.license_type || '',
      license_expiry: driver.license_expiry
        ? String(driver.license_expiry).split('T')[0]
        : '',
      status: driver.status || 'active',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      await driverService.update(editing.id, {
        license_number: formData.license_number || null,
        license_type: formData.license_type || null,
        license_expiry: formData.license_expiry || null,
        status: formData.status,
      })
      toast.success('Chofer actualizado exitosamente')
      setEditing(null)
      loadData()
    } catch (err) {
      toast.error('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return {
    drivers,
    loading,
    saving,
    editing,
    setEditing,
    formData,
    setFormData,
    openEdit,
    handleSubmit,
  }
}
