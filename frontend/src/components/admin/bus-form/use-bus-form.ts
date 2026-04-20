/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { ownerService } from '@/services/owner.service'
import type { SeatPos } from '../SeatLayoutEditor'
import type { BusFormState, Deck, Owner } from './types'

const EMPTY_FORM: BusFormState = {
  license_plate: '',
  capacity: 0,
  model: '',
  brand: '',
  color: '',
  floors: 1,
  owner_id: null,
}

export function useBusForm(bus: any, isEditing: boolean, existingSeats: any[]) {
  const [currentStep, setCurrentStep] = useState(1)
  const [activeDeck, setActiveDeck] = useState<Deck>('FIRST')
  const [form, setForm] = useState<BusFormState>(EMPTY_FORM)
  const [owners, setOwners] = useState<Owner[]>([])
  const [loadingOwners, setLoadingOwners] = useState(false)
  const [seats, setSeats] = useState<SeatPos[]>([])
  const [rowsPerDeck, setRowsPerDeck] = useState<Record<Deck, number>>({ FIRST: 10, SECOND: 10 })
  const [errors, setErrors] = useState({ license_plate: '', model: '' })

  useEffect(() => {
    const fetchOwners = async () => {
      setLoadingOwners(true)
      try {
        const response = await ownerService.getAll()
        setOwners(response)
      } catch (error) {
        console.error('Error fetching owners:', error)
      } finally {
        setLoadingOwners(false)
      }
    }
    fetchOwners()
  }, [])

  useEffect(() => {
    setForm(bus ? {
      license_plate: bus.license_plate || '',
      capacity: bus.capacity || 0,
      model: bus.model || '',
      brand: bus.brand || '',
      color: bus.color || '',
      floors: bus.floors || 1,
      owner_id: bus.owner_id || null,
    } : EMPTY_FORM)

    setCurrentStep(1)
    setActiveDeck('FIRST')

    if (isEditing && existingSeats.length > 0) {
      const mapped = existingSeats.map((s) => ({
        seat_number: s.seat_number,
        deck: s.deck,
        row: s.row,
        column: s.column,
      }))
      setSeats(mapped)
      const first = mapped.filter((s) => s.deck === 'FIRST')
      const second = mapped.filter((s) => s.deck === 'SECOND')
      setRowsPerDeck({
        FIRST: first.length > 0 ? Math.max(...first.map((s) => s.row), 10) : 10,
        SECOND: second.length > 0 ? Math.max(...second.map((s) => s.row), 10) : 10,
      })
    } else {
      setSeats([])
      setRowsPerDeck({ FIRST: 10, SECOND: 10 })
    }
  }, [bus, isEditing, existingSeats])

  const canGoToStep2 = form.license_plate.trim() !== '' && form.model.trim() !== ''

  const validateStep1 = () => {
    const newErrors = { license_plate: '', model: '' }
    if (!form.license_plate.trim()) newErrors.license_plate = 'La placa es requerida'
    if (!form.model.trim()) newErrors.model = 'El modelo es requerido'
    setErrors(newErrors)
    return !newErrors.license_plate && !newErrors.model
  }

  const buildPayload = (includeSeats: boolean) => ({
    ...form,
    license_plate: form.license_plate.toUpperCase().trim(),
    capacity: includeSeats ? seats.length : form.capacity,
    model: form.model.trim(),
    brand: form.brand?.trim() || null,
    color: form.color || null,
    owner_id: form.owner_id,
    ...(includeSeats && { seats, seatsModified: isEditing }),
  })

  return {
    currentStep, setCurrentStep,
    activeDeck, setActiveDeck,
    form, setForm,
    owners, loadingOwners,
    seats, setSeats,
    rowsPerDeck, setRowsPerDeck,
    errors,
    canGoToStep2,
    validateStep1,
    buildPayload,
  }
}
