import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchTripById, selectCurrentTrip, selectTripLoading, selectTripError } from '@/store/trip.slice'
import { fetchDrivers, selectDrivers } from '@/store/driver.slice'
import { fetchAssistants, selectAssistants } from '@/store/assistant.slice'
import { tripService } from '@/services/trip.service'
import { apiFetch } from '@/lib/api'
import TripCountdown from '@/components/trips/TripCountdown'
import TripPackagesSection from '@/components/trips/TripPackagesSection'
import BusSeatMapPrint from '@/components/seats/BusSeatMapPrint'
import FloatingSeatsPanel from '@/components/seats/FloatingSeatsPanel'
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import TicketModal from '@/components/tickets/TicketModal'
import { useTripDetails } from '@/hooks/use-trip-details'
import { toast } from 'sonner'

const STATUS_MAP: Record<string, string> = { scheduled: 'Programado', boarding: 'Abordando', departed: 'Despachado', in_progress: 'En Progreso', arrived: 'Llegó', completed: 'Completado', cancelled: 'Cancelado' }
const STATUS_BADGE: Record<string, string> = { scheduled: 'bg-blue-100 text-blue-800', boarding: 'bg-purple-100 text-purple-800', departed: 'bg-orange-100 text-orange-800', in_progress: 'bg-orange-100 text-orange-800', arrived: 'bg-green-100 text-green-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }

function formatTimeAmPm(timeString: string) {
  if (!timeString) return ''
  const parts = timeString.split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes} ${period}`
  }
  return timeString
}

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)

  const dispatch = useAppDispatch()

  const trip = useAppSelector(selectCurrentTrip) as any
  const loading = useAppSelector(selectTripLoading)
  const error = useAppSelector(selectTripError)
  const drivers = useAppSelector(selectDrivers) as any[]
  const assistants = useAppSelector(selectAssistants) as any[]

  const { soldTickets, reservedSeatNumbers, fetchSoldTickets, formatDate } = useTripDetails()

  // Packages state
  const [tripPackages, setTripPackages] = useState<any[]>([])
  const [loadingPackages, setLoadingPackages] = useState(false)

  // Modal states
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [finishing, setFinishing] = useState(false)

  // Staff editing
  const [editingDriver, setEditingDriver] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('')
  const [savingDriver, setSavingDriver] = useState(false)
  const [savingAssistant, setSavingAssistant] = useState(false)

  // Ticket sale modal
  const [showTicketSaleModal, setShowTicketSaleModal] = useState(false)
  const [saleActionType, setSaleActionType] = useState<'sell' | 'reserve'>('sell')
  const [selectedSeatsForSale, setSelectedSeatsForSale] = useState<any[]>([])

  // Ticket detail modal
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedTicketForView, setSelectedTicketForView] = useState<any>(null)

  // Confirm sale modal
  const [showConfirmSaleModal, setShowConfirmSaleModal] = useState(false)
  const [ticketToConfirm, setTicketToConfirm] = useState<any>(null)
  const [confirmingSale, setConfirmingSale] = useState(false)

  // Seat change mode
  const [seatChangeMode, setSeatChangeMode] = useState(false)
  const [seatChangeTicket, setSeatChangeTicket] = useState<any>(null)
  const [newSelectedSeat, setNewSelectedSeat] = useState<any>(null)
  const [showSeatChangeConfirmModal, setShowSeatChangeConfirmModal] = useState(false)
  const [seatChangeLoading, setSeatChangeLoading] = useState(false)

  // Seat map re-render key & selection
  const [seatMapKey, setSeatMapKey] = useState(0)
  const [currentSelectedSeats, setCurrentSelectedSeats] = useState<any[]>([])
  const [controlledSeatIds, setControlledSeatIds] = useState<number[]>([])

  const isDoubleDeck = (trip?.bus?.floors || 1) >= 2

  const fetchPackages = useCallback(async (tId: number) => {
    setLoadingPackages(true)
    try {
      const data = await apiFetch(`/packages/trip/${tId}`)
      setTripPackages(Array.isArray(data) ? data : [])
    } catch { setTripPackages([]) }
    finally { setLoadingPackages(false) }
  }, [])

  const refreshTrip = useCallback(() => {
    dispatch(fetchTripById(tripId))
    fetchSoldTickets(tripId)
    fetchPackages(tripId)
  }, [dispatch, tripId, fetchSoldTickets, fetchPackages])

  useEffect(() => {
    dispatch(fetchTripById(tripId))
    dispatch(fetchDrivers({}))
    dispatch(fetchAssistants({}))
    fetchSoldTickets(tripId)
    fetchPackages(tripId)
  }, [dispatch, tripId, fetchSoldTickets, fetchPackages])

  useEffect(() => {
    if (trip) {
      setSelectedDriverId(String(trip.driver?.id || ''))
      setSelectedAssistantId(String(trip.assistant?.id || ''))
    }
  }, [trip])

  const canDispatch = useMemo(() => {
    if (!trip?.trip_datetime) return false
    return new Date() >= new Date(trip.trip_datetime)
  }, [trip])

  const showNotification = (type: string, title: string, message: string) => {
    if (type === 'success') {
      toast.success(title, { description: message })
    } else {
      toast.error(title, { description: message })
    }
  }

  // Dispatch trip
  const executeDispatch = async () => {
    setDispatching(true)
    try {
      await tripService.dispatch(tripId)
      showNotification('success', 'Viaje despachado', 'El viaje ha sido despachado correctamente.')
      setShowDispatchModal(false)
      refreshTrip()
    } catch (err: any) {
      showNotification('error', 'Error', err?.message || 'No se pudo despachar el viaje.')
    } finally { setDispatching(false) }
  }

  // Finish trip
  const executeFinish = async () => {
    setFinishing(true)
    try {
      await tripService.finish(tripId)
      showNotification('success', 'Viaje terminado', 'El viaje ha sido marcado como terminado.')
      setShowFinishModal(false)
      refreshTrip()
    } catch (err: any) {
      showNotification('error', 'Error', err?.message || 'No se pudo terminar el viaje.')
    } finally { setFinishing(false) }
  }

  // Save driver
  const saveDriver = async () => {
    setSavingDriver(true)
    try {
      await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { driver_id: selectedDriverId ? Number(selectedDriverId) : null } })
      setEditingDriver(false)
      showNotification('success', 'Conductor actualizado', 'El conductor ha sido actualizado.')
      refreshTrip()
    } catch { showNotification('error', 'Error', 'No se pudo actualizar el conductor.') }
    finally { setSavingDriver(false) }
  }

  const saveAssistant = async () => {
    setSavingAssistant(true)
    try {
      await apiFetch(`/trips/${tripId}`, { method: 'PUT', body: { assistant_id: selectedAssistantId ? Number(selectedAssistantId) : null } })
      setEditingAssistant(false)
      showNotification('success', 'Asistente actualizado', 'El asistente ha sido actualizado.')
      refreshTrip()
    } catch { showNotification('error', 'Error', 'No se pudo actualizar el asistente.') }
    finally { setSavingAssistant(false) }
  }

  // Unassign package
  const handleUnassignPackage = async (packageId: number) => {
    try {
      await apiFetch(`/packages/${packageId}/unassign`, { method: 'POST' })
      showNotification('success', 'Encomienda removida', 'La encomienda fue removida del viaje.')
      fetchPackages(tripId)
    } catch (err: any) { showNotification('error', 'Error', err?.message || 'No se pudo remover la encomienda.') }
  }

  // Seat Map Event Handlers
  const handleSellTicket = useCallback((seats: any[] | any) => {
    const seatsArray = Array.isArray(seats) ? seats : [seats]
    setSelectedSeatsForSale(seatsArray)
    setSaleActionType('sell')
    setShowTicketSaleModal(true)
  }, [])

  const handleReserveSeat = useCallback((seats: any[] | any) => {
    const seatsArray = Array.isArray(seats) ? seats : [seats]
    setSelectedSeatsForSale(seatsArray)
    setSaleActionType('reserve')
    setShowTicketSaleModal(true)
  }, [])

  const handleClearSelection = useCallback(() => {
    setCurrentSelectedSeats([])
    setControlledSeatIds([])
  }, [])

  const handleRemoveSeat = useCallback((seat: any) => {
    setCurrentSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
    setControlledSeatIds(prev => prev.filter(id => id !== seat.id))
  }, [])

  const handleTicketCreated = () => {
    setShowTicketSaleModal(false)
    refreshTrip()
    handleClearSelection()
    setSeatMapKey(prev => prev + 1)
  }

  const handleViewDetails = (seat: any) => {
    const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number)
    if (ticket) {
      setSelectedTicketForView(ticket)
      setShowTicketModal(true)
    }
  }

  const handleCancelReservation = async (seat: any) => {
    const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
    if (ticket) {
      try {
        await apiFetch(`/tickets/${ticket.id}/cancel`, { method: 'PUT' })
        showNotification('success', 'Reserva cancelada', 'La reserva ha sido cancelada exitosamente.')
        refreshTrip()
        setSeatMapKey(prev => prev + 1)
      } catch (err: any) {
        showNotification('error', 'Error', err?.message || 'No se pudo cancelar la reserva.')
      }
    }
  }

  const handleConfirmSale = (seat: any) => {
    const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && t.state === 'pending')
    if (ticket) {
      setTicketToConfirm(ticket)
      setShowConfirmSaleModal(true)
    }
  }

  const executeConfirmSale = async () => {
    if (!ticketToConfirm) return
    setConfirmingSale(true)
    try {
      await apiFetch(`/tickets/${ticketToConfirm.id}`, { method: 'PUT', body: { state: 'confirmed' } })
      showNotification('success', 'Venta confirmada', 'La reserva ha sido confirmada como venta.')
      refreshTrip()
      setSeatMapKey(prev => prev + 1)
      setShowConfirmSaleModal(false)
      setTicketToConfirm(null)
    } catch (err: any) {
      showNotification('error', 'Error', err?.message || 'No se pudo confirmar la venta.')
    } finally {
      setConfirmingSale(false)
    }
  }

  const handleChangeSeat = (seat: any) => {
    const ticket = soldTickets.find(t => t.seat?.seat_number === seat.number && (t.state === 'confirmed' || t.state === 'paid' || t.state === 'pending'))
    if (ticket) {
      setSeatChangeTicket(ticket)
      setSeatChangeMode(true)
      handleClearSelection()
      setSeatMapKey(prev => prev + 1)
    }
  }

  const cancelSeatChange = () => {
    setSeatChangeMode(false)
    setSeatChangeTicket(null)
    setNewSelectedSeat(null)
    setShowSeatChangeConfirmModal(false)
    handleClearSelection()
    setSeatMapKey(prev => prev + 1)
  }

  const confirmSeatChange = async () => {
    if (!seatChangeTicket || !newSelectedSeat) return
    setSeatChangeLoading(true)
    try {
      await apiFetch(`/tickets/${seatChangeTicket.id}/change-seat/${newSelectedSeat.id}`, { method: 'PUT' })
      showNotification('success', 'Asiento cambiado', 'El cambio de asiento se realizó con éxito.')
      refreshTrip()
      cancelSeatChange()
    } catch (err: any) {
      showNotification('error', 'Error', err?.message || 'No se pudo cambiar el asiento.')
    } finally {
      setSeatChangeLoading(false)
    }
  }

  const handleSelectionChange = (seats: any[]) => {
    setCurrentSelectedSeats(seats)
    setControlledSeatIds(seats.map(s => s.id))
    if (seatChangeMode && seats.length === 1) {
      setNewSelectedSeat(seats[0])
      setShowSeatChangeConfirmModal(true)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setShowTicketSaleModal(false)
        setShowTicketModal(false)
        if (seatChangeMode) cancelSeatChange()
      }

      if (e.key === 'Enter' && showSeatChangeConfirmModal) {
        confirmSeatChange()
      }

      if (!showTicketSaleModal && !showTicketModal) {
        if (e.key.toLowerCase() === 'v' && currentSelectedSeats.length > 0) {
          handleSellTicket(currentSelectedSeats)
        }
        if (e.key.toLowerCase() === 'r' && currentSelectedSeats.length > 0) {
          handleReserveSeat(currentSelectedSeats)
        }
        if (e.key.toLowerCase() === 'c') {
          handleClearSelection()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSelectedSeats, showTicketSaleModal, showTicketModal, handleSellTicket, handleReserveSeat, seatChangeMode, showSeatChangeConfirmModal, confirmSeatChange, handleClearSelection])

  // Ticket stats
  const ticketStats = useMemo(() => {
    const total = trip?.total_seats || 0
    const sold = soldTickets.filter(t => ['confirmed', 'sold', 'paid'].includes(t.state)).length
    const reserved = soldTickets.filter(t => t.state === 'pending').length
    return { total, sold, reserved, available: Math.max(0, total - sold - reserved) }
  }, [trip, soldTickets])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <div><p className="text-sm font-medium text-red-800">{error}</p><button onClick={refreshTrip} className="mt-2 text-sm text-red-600 underline">Reintentar</button></div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-bold text-gray-800 truncate">{trip.route?.origin}</span>
                <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <span className="text-sm font-bold text-gray-800 truncate">{trip.route?.destination}</span>
                <span className="hidden md:inline-flex items-center ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{trip.departure_time ? formatTimeAmPm(trip.departure_time) : ''}</span>
              </div>
            </div>

            <div className="hidden sm:flex items-center">
              <TripCountdown tripDateTime={trip.trip_datetime} departureTime={trip.departure_time} tripStatus={trip.status} compact />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {(trip.status === 'scheduled' || trip.status === 'boarding') && (
                <button onClick={() => canDispatch ? setShowDispatchModal(true) : null} disabled={!canDispatch}
                  className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors ${canDispatch ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'}`}
                  title={!canDispatch ? 'Aún no es la hora de salida' : 'Despachar Viaje'}>
                  <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  <span className="hidden sm:inline">Despachar</span>
                </button>
              )}
              {trip.status === 'departed' && (
                <button onClick={() => setShowFinishModal(true)} className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
                  <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="hidden sm:inline">Terminar</span>
                </button>
              )}
              <Link to={`/trips/${tripId}/sheet`} target="_blank" className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors no-underline">
                <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span className="hidden sm:inline">Planilla</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile countdown */}
      <div className="sm:hidden px-3 pt-3">
        <TripCountdown tripDateTime={trip.trip_datetime} departureTime={trip.departure_time} tripStatus={trip.status} compact />
      </div>

      {/* Seat Change Banner */}
      {seatChangeMode && seatChangeTicket && (
        <div className="sticky top-[56px] z-20 bg-gradient-to-r from-orange-400 to-amber-500 shadow-md">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center text-white">
              <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <p className="font-bold">Modo Cambio de Asiento</p>
                <p className="text-sm text-orange-50">Seleccione el nuevo asiento para {seatChangeTicket.client?.firstname} {seatChangeTicket.client?.lastname} (Asiento actual: {seatChangeTicket.seat?.seat_number})</p>
              </div>
            </div>
            <button onClick={cancelSeatChange} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold">
              Cancelar Cambio
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-3 pb-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          {/* Trip Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[trip.status] || 'bg-gray-100 text-gray-800'}`}>{STATUS_MAP[trip.status] || trip.status}</span>
                  <span className="text-lg font-bold text-gray-900">Viaje #{trip.id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500 text-xs">Fecha</p><p className="font-semibold text-gray-900">{formatDate(trip.trip_datetime)}</p></div>
                  <div><p className="text-gray-500 text-xs">Hora</p><p className="font-semibold text-gray-900">{trip.departure_time ? formatTimeAmPm(trip.departure_time) : 'N/A'}</p></div>
                  <div><p className="text-gray-500 text-xs">Bus</p><p className="font-semibold text-gray-900">{trip.bus?.license_plate || 'N/A'}</p></div>
                  <div><p className="text-gray-500 text-xs">Precio</p><p className="font-semibold text-gray-900">Bs. {trip.route?.price || trip.price || 'N/A'}</p></div>
                </div>

                {/* Staff */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Conductor</p>
                        {editingDriver ? (
                          <div className="flex items-center gap-2 mt-1">
                            <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="text-sm border-gray-300 rounded-md py-1 px-2">
                              <option value="">Sin asignar</option>
                              {(drivers || []).map((d: any) => <option key={d.id} value={d.id}>{d.firstname} {d.lastname}</option>)}
                            </select>
                            <button onClick={saveDriver} disabled={savingDriver} className="text-green-600 hover:text-green-800"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                            <button onClick={() => setEditingDriver(false)} className="text-red-600 hover:text-red-800"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-900 text-sm">{trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado'}</p>
                        )}
                      </div>
                      {!editingDriver && <button onClick={() => setEditingDriver(true)} className="text-gray-400 hover:text-indigo-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Asistente</p>
                        {editingAssistant ? (
                          <div className="flex items-center gap-2 mt-1">
                            <select value={selectedAssistantId} onChange={(e) => setSelectedAssistantId(e.target.value)} className="text-sm border-gray-300 rounded-md py-1 px-2">
                              <option value="">Sin asignar</option>
                              {(assistants || []).map((a: any) => <option key={a.id} value={a.id}>{a.firstname} {a.lastname}</option>)}
                            </select>
                            <button onClick={saveAssistant} disabled={savingAssistant} className="text-green-600 hover:text-green-800"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></button>
                            <button onClick={() => setEditingAssistant(false)} className="text-red-600 hover:text-red-800"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-900 text-sm">{trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado'}</p>
                        )}
                      </div>
                      {!editingAssistant && <button onClick={() => setEditingAssistant(true)} className="text-gray-400 hover:text-indigo-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Stats */}
              <div className="lg:w-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Ocupación</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Total asientos</span><span className="font-bold">{ticketStats.total}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-green-600">Vendidos</span><span className="font-bold text-green-700">{ticketStats.sold}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-yellow-600">Reservados</span><span className="font-bold text-yellow-700">{ticketStats.reserved}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-blue-600">Disponibles</span><span className="font-bold text-blue-700">{ticketStats.available}</span></div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all" style={{ width: `${ticketStats.total > 0 ? ((ticketStats.sold + ticketStats.reserved) / ticketStats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Map */}
          <BusSeatMapPrint
            key={seatMapKey}
            trip={trip}
            tickets={soldTickets}
            reserved_seat_numbers={reservedSeatNumbers}
            selectionEnabled={true}
            enableContextMenu={true}
            seatChangeMode={seatChangeMode}
            controlledSelectedIds={controlledSeatIds}
            onSelectionChange={handleSelectionChange}
            onStartEditDriver={() => { }} // Placeholder si BusSeatMapPrint lo pide como prop opcional pero tira error si se pasa otra cosa, aunque en realidad onClearSelection no está en la interface. Eliminamos onClearSelection.
            onViewDetails={handleViewDetails}
            onCancelReservation={handleCancelReservation}
            onConfirmSale={handleConfirmSale}
            onChangeSeat={handleChangeSeat}
          />

          {/* Packages */}
          <TripPackagesSection
            tripPackages={tripPackages}
            isLoading={loadingPackages}
            tripStatus={trip.status}
            onUnassignPackage={handleUnassignPackage}
          />
        </div>
      </div>

      {/* Floating Seats Panel */}
      <FloatingSeatsPanel
        selectedSeats={currentSelectedSeats}
        selectionEnabled={!seatChangeMode}
        seatChangeMode={seatChangeMode}
        isDoubleDeck={isDoubleDeck}
        onSellTicket={() => handleSellTicket(currentSelectedSeats)}
        onReserveSeat={() => handleReserveSeat(currentSelectedSeats)}
        onClearSelection={handleClearSelection}
        onRemoveSeat={handleRemoveSeat}
      />

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100"><svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg></div>
              <div><h3 className="text-lg font-medium text-gray-900">Despachar Viaje</h3><p className="text-sm text-gray-500 mt-2">¿Estás seguro? Las encomiendas asignadas pasarán a "En tránsito".</p></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDispatchModal(false)} disabled={dispatching} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={executeDispatch} disabled={dispatching} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{dispatching ? 'Despachando...' : 'Sí, despachar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100"><svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
              <div><h3 className="text-lg font-medium text-gray-900">Terminar Viaje</h3><p className="text-sm text-gray-500 mt-2">¿Estás seguro? Las encomiendas en tránsito pasarán a "En destino".</p></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowFinishModal(false)} disabled={finishing} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={executeFinish} disabled={finishing} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">{finishing ? 'Terminando...' : 'Sí, terminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Sale Modal */}
      <TicketSaleModal
        show={showTicketSaleModal}
        trip={trip}
        selectedSeats={selectedSeatsForSale}
        actionType={saleActionType}
        onClose={() => setShowTicketSaleModal(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicketForView && (
        <TicketModal
          show={showTicketModal}
          ticket={selectedTicketForView}
          trip={trip}
          modalType="details"
          onClose={() => { setShowTicketModal(false); setSelectedTicketForView(null) }}
        />
      )}

      {/* Confirm Sale Modal */}
      {showConfirmSaleModal && ticketToConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Venta</h3>
                <p className="text-sm text-gray-500 mt-2">
                  ¿Confirmar la venta del asiento {ticketToConfirm.seat?.seat_number} para {ticketToConfirm.client?.firstname} {ticketToConfirm.client?.lastname}?
                </p>
                <p className="text-sm font-bold mt-2">
                  Monto a cobrar: Bs. {ticketToConfirm.price}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowConfirmSaleModal(false)} disabled={confirmingSale} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={executeConfirmSale} disabled={confirmingSale} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{confirmingSale ? 'Confirmando...' : 'Confirmar Venta'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Seat Change Modal */}
      {showSeatChangeConfirmModal && seatChangeTicket && newSelectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Cambio de Asiento</h3>
                <p className="text-sm text-gray-500 mt-2">
                  ¿Mover al pasajero <strong>{seatChangeTicket.client?.firstname} {seatChangeTicket.client?.lastname}</strong> del asiento <strong>{seatChangeTicket.seat?.seat_number}</strong> al asiento <strong>{newSelectedSeat.number}</strong>?
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={cancelSeatChange} disabled={seatChangeLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmSeatChange} disabled={seatChangeLoading} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50">{seatChangeLoading ? 'Cambiando...' : 'Confirmar Cambio'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
