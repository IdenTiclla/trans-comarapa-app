/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { useClientSearch } from '@/hooks/use-client-search'
import { INITIAL_NEW_CLIENT, type ActionType, type NewClientForm, type SelectedSeat, type TicketForm } from './types'

interface Args {
  show: boolean
  trip: any
  selectedSeats: SelectedSeat[]
  actionType: ActionType
  userId?: number | string
}

export function useTicketSale({ show, trip, selectedSeats, actionType, userId }: Args) {
  const clientSearch = useClientSearch()

  const [newClientForm, setNewClientForm] = useState<NewClientForm>(INITIAL_NEW_CLIENT)
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    price: 0, payment_method: '', state: 'pending', destination: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [createdTicketsData, setCreatedTicketsData] = useState<any[]>([])

  useEffect(() => {
    if (!show) return
    setTicketForm({
      price: trip?.route?.price || 0,
      state: actionType === 'sell' ? 'confirmed' : 'pending',
      payment_method: '',
      destination: '',
    })
    setNewClientForm(INITIAL_NEW_CLIENT)
    clientSearch.resetClientSearch()
    setHasTriedSubmit(false)
    setErrorMessage('')
  }, [show, trip, actionType, clientSearch.resetClientSearch]) // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = useMemo(() => {
    const hasClient = clientSearch.clientType === 'existing'
      ? clientSearch.hasSelectedExistingClient
      : Boolean(newClientForm.firstname && newClientForm.lastname && newClientForm.document_id)
    const hasDestination = Boolean(ticketForm.destination && ticketForm.destination.trim())
    return hasClient && hasDestination && ticketForm.price > 0 && Boolean(ticketForm.payment_method)
  }, [clientSearch.clientType, clientSearch.hasSelectedExistingClient, newClientForm, ticketForm])

  const previewTicket = useMemo(() => {
    if (selectedSeats.length === 0) return null

    const client = clientSearch.clientType === 'existing'
      ? clientSearch.selectedExistingClient
      : {
          firstname: newClientForm.firstname || 'Cliente',
          lastname: newClientForm.lastname || '',
          document_id: newClientForm.document_id || '',
          phone: newClientForm.phone || '',
        }

    const destinationName = ticketForm.destination
      || trip?.route?.destination_location?.name
      || trip?.route?.destination
      || ''

    return {
      id: 'PREVIEW',
      client,
      destination: destinationName,
      seats: selectedSeats.map((seat) => ({
        seat_number: seat.number,
        deck: seat.deck || 'Planta Baja',
      })),
      seat: selectedSeats.length === 1 ? {
        seat_number: selectedSeats[0].number,
        deck: selectedSeats[0].deck || 'Planta Baja',
      } : null,
      price: ticketForm.price * selectedSeats.length,
      payment_method: ticketForm.payment_method || 'cash',
      state: actionType === 'sell' ? 'confirmed' : 'pending',
      created_at: new Date().toISOString(),
    }
  }, [selectedSeats, clientSearch.clientType, clientSearch.selectedExistingClient, newClientForm, ticketForm, trip, actionType])

  const submit = async () => {
    setHasTriedSubmit(true)
    setErrorMessage('')

    if (!canSubmit) {
      if (!ticketForm.destination || !ticketForm.destination.trim()) setErrorMessage('Debe ingresar un destino')
      else if (!ticketForm.payment_method) setErrorMessage('Debe seleccionar un método de pago')
      else if (ticketForm.price <= 0) setErrorMessage('El precio debe ser mayor a 0')
      else setErrorMessage('Debe completar la información del cliente')
      return
    }

    try {
      setIsSubmitting(true)
      let clientId = clientSearch.selectedExistingClient?.id
      if (clientSearch.clientType === 'new') {
        const clientRes = await apiFetch('/clients', { method: 'POST', body: newClientForm })
        clientId = (clientRes as any).id
      }

      if (!trip?.seats_layout || trip.seats_layout.length === 0) {
        throw new Error('No se pudo encontrar información de asientos para este viaje')
      }

      const seats = trip.seats_layout.filter((s: any) =>
        selectedSeats.some((sel) => s.id === sel.id),
      )

      if (seats.length === 0) {
        throw new Error(`No se pudo encontrar los asientos ${selectedSeats.map((s) => s.number).join(', ')} en este viaje`)
      }

      const createdTickets = []
      for (const seat of seats) {
        const ticket = await apiFetch('/tickets', {
          method: 'POST',
          body: {
            trip_id: trip.id,
            client_id: clientId,
            seat_id: seat.id,
            destination: ticketForm.destination.trim(),
            price: ticketForm.price,
            payment_method: ticketForm.payment_method,
            state: ticketForm.state,
            operator_user_id: userId,
          },
        })
        createdTickets.push(ticket)
      }

      const seatNumbers = createdTickets.map((t: any) => t.seat?.seat_number).filter(Boolean).join(', ')
      toast.success(
        actionType === 'sell' ? '¡Boleto Vendido!' : '¡Asiento Reservado!',
        {
          description: seatNumbers ? `Asiento${createdTickets.length > 1 ? 's' : ''}: ${seatNumbers}` : undefined,
          duration: 5000,
        },
      )

      setCreatedTicketsData(createdTickets)
      setShowReceiptModal(true)
    } catch (error) {
      console.error('Error al crear los boletos:', error)
      const detail = error.data?.detail || error.response?._data?.detail || ''
      if (error.status === 403) setErrorMessage('No tiene permisos para crear boletos.')
      else if (error.status === 409) setErrorMessage(detail || 'El asiento ya está ocupado para este viaje.')
      else if (error.status === 400) setErrorMessage(detail || 'Error en los datos del boleto.')
      else setErrorMessage(detail || (error instanceof Error ? error.message : String(error)) || 'Error al crear los boletos')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    clientSearch,
    newClientForm, setNewClientForm,
    ticketForm, setTicketForm,
    isSubmitting, hasTriedSubmit, errorMessage,
    showReceiptModal, setShowReceiptModal,
    createdTicketsData, setCreatedTicketsData,
    canSubmit, previewTicket,
    submit,
  }
}
