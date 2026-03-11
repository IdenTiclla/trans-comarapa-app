import { useMemo } from 'react'
import { useParams, Link } from 'react-router'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { useTripDetailPage } from '@/hooks/use-trip-detail-page'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import TripCountdown from '@/components/trips/TripCountdown'
import TripPackagesSection from '@/components/trips/TripPackagesSection'
import { TripInfoCard } from '@/components/trips/TripInfoCard'
import { TripConfirmationModals } from '@/components/trips/TripConfirmationModals'
import BusSeatMapPrint from '@/components/seats/BusSeatMapPrint'
import FloatingSeatsPanel from '@/components/seats/FloatingSeatsPanel'

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

  const currentUser = useAppSelector(selectUser)
  const page = useTripDetailPage(tripId)
  const { trip, loading, error, refreshTrip, seatMap, seatChange, floatPanel } = page

  const isDoubleDeck = (trip?.bus?.floors || 1) >= 2

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    'escape': () => {
      page.ticketSale.close()
      page.ticketView.close()
      if (seatChange.mode) seatChange.cancel()
    },
    'enter': () => {
      if (seatChange.showConfirm) seatChange.confirm()
    },
    'v': () => {
      if (!page.ticketSale.show && !page.ticketView.show && seatMap.selectedSeats.length > 0) {
        page.ticketSale.open(seatMap.selectedSeats)
      }
    },
    'r': () => {
      if (!page.ticketSale.show && !page.ticketView.show && seatMap.selectedSeats.length > 0) {
        page.ticketSale.openReserve(seatMap.selectedSeats)
      }
    },
    'c': () => {
      if (!page.ticketSale.show && !page.ticketView.show) {
        floatPanel.onClearSelection()
      }
    },
  }), [page, seatMap.selectedSeats, seatChange, floatPanel])

  useKeyboardShortcuts(shortcuts, true)

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
                <button
                  onClick={() => page.dispatch.canDispatch ? page.dispatch.setShow(true) : null}
                  disabled={!page.dispatch.canDispatch}
                  className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-colors ${page.dispatch.canDispatch ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'}`}
                  title={!page.dispatch.canDispatch ? 'Aún no es la hora de salida' : 'Despachar Viaje'}
                >
                  <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  <span className="hidden sm:inline">Despachar</span>
                </button>
              )}
              {trip.status === 'departed' && (
                <button onClick={() => page.finish.setShow(true)} className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
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
      {seatChange.mode && seatChange.ticket && (
        <div className="sticky top-[56px] z-20 bg-gradient-to-r from-orange-400 to-amber-500 shadow-md">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center text-white">
              <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <p className="font-bold">Modo Cambio de Asiento</p>
                <p className="text-sm text-orange-50">Seleccione el nuevo asiento para {seatChange.ticket.client?.firstname} {seatChange.ticket.client?.lastname} (Asiento actual: {seatChange.ticket.seat?.seat_number})</p>
              </div>
            </div>
            <button onClick={seatChange.cancel} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-semibold">
              Cancelar Cambio
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-3 pb-8 px-3 sm:px-4 lg:px-6">
        <div className="max-w-screen-2xl mx-auto space-y-6">
          {/* Trip Info Card */}
          <TripInfoCard
            trip={trip}
            ticketStats={page.ticketStats}
            formatDate={page.formatDate}
            drivers={page.drivers}
            assistants={page.assistants}
            staff={page.staff}
          />

          {/* Seat Map */}
          <BusSeatMapPrint
            key={seatMap.key}
            trip={trip}
            tickets={page.soldTickets}
            reserved_seat_numbers={page.reservedSeatNumbers}
            lockedSeats={seatMap.lockedSeats}
            currentUserId={currentUser?.id}
            selectionEnabled={true}
            enableContextMenu={true}
            seatChangeMode={seatChange.mode}
            controlledSelectedIds={seatMap.controlledIds}
            onSelectionChange={seatMap.onSelectionChange}
            onStartEditDriver={() => { }}
            onViewDetails={page.seatMapHandlers.onViewDetails}
            onCancelReservation={page.seatMapHandlers.onCancelReservation}
            onConfirmSale={page.seatMapHandlers.onConfirmSale}
            onChangeSeat={page.seatMapHandlers.onChangeSeat}
          />

          {/* Packages */}
          <TripPackagesSection
            tripPackages={page.packages.items}
            isLoading={page.packages.loading}
            tripStatus={trip.status}
            onUnassignPackage={page.packages.unassign}
          />
        </div>
      </div>

      {/* Floating Seats Panel */}
      <FloatingSeatsPanel
        selectedSeats={seatMap.selectedSeats}
        selectionEnabled={!seatChange.mode}
        seatChangeMode={seatChange.mode}
        isDoubleDeck={isDoubleDeck}
        onSellTicket={floatPanel.onSellTicket}
        onReserveSeat={floatPanel.onReserveSeat}
        onClearSelection={floatPanel.onClearSelection}
        onRemoveSeat={floatPanel.onRemoveSeat}
      />

      {/* All Confirmation Modals */}
      <TripConfirmationModals
        trip={trip}
        dispatch={page.dispatch}
        finish={page.finish}
        confirmSale={page.confirmSale}
        seatChange={page.seatChange}
        ticketSale={page.ticketSale}
        ticketView={page.ticketView}
      />
    </div>
  )
}
