/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Owner {
  id: number
  firstname: string
  lastname: string
  phone?: string
  email?: string
}

export interface BusFormState {
  license_plate: string
  capacity: number
  model: string
  brand: string
  color: string
  floors: number
  owner_id: number | null
}

export type Deck = 'FIRST' | 'SECOND'

export interface BusFormProps {
  bus?: any
  loading?: boolean
  isEditing?: boolean
  existingSeats?: any[]
  onSubmit: (busData: any) => void
  onCancel: () => void
}

export const COLORS = [
  'Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde',
  'Amarillo', 'Naranja', 'Celeste', 'Morado', 'Rosa', 'Marron', 'Beige', 'Dorado',
]
