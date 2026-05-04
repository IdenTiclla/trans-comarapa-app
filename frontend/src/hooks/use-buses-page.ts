import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  fetchBuses,
  createBus,
  updateBus,
  deleteBus,
  createBusWithSeats,
  updateBusSeats,
  selectBuses,
  selectBusLoading,
  selectBusError,
} from '@/store/bus.slice'
import { ownerService } from '@/services/owner.service'
import { busService } from '@/services/bus.service'
import { toast } from 'sonner'
import type { Bus as BusType, Owner } from '@/types'

export function useBusesPage() {
  const dispatch = useAppDispatch()
  const buses = useAppSelector(selectBuses) as BusType[]
  const loading = useAppSelector(selectBusLoading)
  const error = useAppSelector(selectBusError)

  const [showForm, setShowForm] = useState(false)
  const [editingBus, setEditingBus] = useState<BusType | null>(null)
  const [existingSeats, setExistingSeats] = useState<unknown[]>([])
  const [saving, setSaving] = useState(false)
  const [owners, setOwners] = useState<Owner[]>([])

  useEffect(() => {
    dispatch(fetchBuses({}))
    ownerService
      .getAll()
      .then((data) => setOwners(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [dispatch])

  const openCreate = () => {
    setEditingBus(null)
    setExistingSeats([])
    setShowForm(true)
  }

  const openEdit = async (bus: BusType) => {
    setEditingBus(bus)
    setSaving(true)
    try {
      const seats = await busService.getSeats(bus.id)
      setExistingSeats(Array.isArray(seats) ? seats : [])
    } catch {
      setExistingSeats([])
    } finally {
      setSaving(false)
    }
    setShowForm(true)
  }

  const handleFormSubmit = async (busData: Record<string, unknown>) => {
    setSaving(true)
    try {
      if (editingBus) {
        await dispatch(updateBus({ id: editingBus.id, data: busData })).unwrap()
        if (busData.seatsModified && busData.seats) {
          await dispatch(
            updateBusSeats({
              busId: editingBus.id,
              seats: busData.seats as unknown[],
            }),
          ).unwrap()
        }
        toast.success('Bus actualizado correctamente')
      } else {
        if (busData.seats && (busData.seats as unknown[]).length > 0) {
          await dispatch(createBusWithSeats(busData)).unwrap()
        } else {
          await dispatch(createBus(busData)).unwrap()
        }
        toast.success('Bus creado correctamente')
      }
      setShowForm(false)
    } catch (err) {
      toast.error(`Error: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bus: BusType) => {
    if (!confirm(`¿Eliminar bus ${bus.plate_number || bus.license_plate}?`)) return
    try {
      await dispatch(deleteBus(bus.id)).unwrap()
      toast.success('Bus eliminado correctamente')
    } catch (err) {
      toast.error(`Error: ${err}`)
    }
  }

  return {
    buses,
    loading,
    error,
    showForm,
    setShowForm,
    editingBus,
    existingSeats,
    saving,
    owners,
    openCreate,
    openEdit,
    handleFormSubmit,
    handleDelete,
  }
}
