/* eslint-disable @typescript-eslint/no-explicit-any */
export type ActionType = 'sell' | 'reserve'

export interface NewClientForm {
  firstname: string
  lastname: string
  document_id: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  is_minor: boolean
}

export interface TicketForm {
  price: number
  payment_method: string
  state: string
  destination: string
}

export interface SelectedSeat {
  id?: number | string
  number: number | string
  deck?: string | number
}

export interface TicketSaleModalProps {
  show: boolean
  trip: any
  selectedSeats: SelectedSeat[]
  actionType: ActionType
  onClose: () => void
  onTicketCreated: (tickets: any[]) => void
}

export const INITIAL_NEW_CLIENT: NewClientForm = {
  firstname: '',
  lastname: '',
  document_id: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  is_minor: false,
}
