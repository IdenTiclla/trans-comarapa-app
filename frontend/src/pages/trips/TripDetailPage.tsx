import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useAppSelector } from '@/store'
import { selectUser } from '@/store/auth.slice'
import { useTripDetailPage } from '@/hooks/use-trip-detail-page'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import TripPackagesSection from '@/components/trips/TripPackagesSection'
import { TripInfoCard } from '@/components/trips/TripInfoCard'
import { TripConfirmationModals } from '@/components/trips/TripConfirmationModals'
import BusSeatMapPrint from '@/components/seats/BusSeatMapPrint'
import FloatingSeatsPanel from '@/components/seats/FloatingSeatsPanel'
import PackageAssignModal from '@/components/packages/PackageAssignModal'
import PackageDeliveryModal from '@/components/packages/PackageDeliveryModal'
import PackageReceptionModal from '@/components/packages/PackageReceptionModal'
import PackageRegistrationModal from '@/components/packages/PackageRegistrationModal'
import PackageReceiptModal from '@/components/packages/PackageReceiptModal'
import TicketReceiptModal from '@/components/tickets/TicketReceiptModal'
import { Button } from '@/components/ui/button'
import { Send, Check, FileText, Package } from 'lucide-react'

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const navigate = useNavigate()

  const currentUser = useAppSelector(selectUser)
  const page = useTripDetailPage(tripId)
  const { trip, loading, error, refreshTrip, seatMap, seatChange, floatPanel } = page

  const isDoubleDeck = (trip?.bus?.floors || 1) >= 2

  const shortcuts = useMemo(() => ({
    'escape': () => {
      page.ticketSale.close()
      if (seatChange.mode) seatChange.cancel()
    },
    'enter': () => {
      if (seatChange.showConfirm) seatChange.confirm()
    },
    'v': () => {
      if (!page.ticketSale.show && seatMap.selectedSeats.length > 0) {
        page.ticketSale.open(seatMap.selectedSeats)
      }
    },
    'r': () => {
      if (!page.ticketSale.show && seatMap.selectedSeats.length > 0) {
        page.ticketSale.openReserve(seatMap.selectedSeats)
      }
    },
    'c': () => {
      if (!page.ticketSale.show) {
        floatPanel.onClearSelection()
      }
    },
  }), [page, seatMap.selectedSeats, seatChange, floatPanel])

  useKeyboardShortcuts(shortcuts, true)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 text-red-400 mt-0.5">!</div>
            <div><p className="text-sm font-medium text-red-800">{error}</p><Button variant="link" onClick={refreshTrip} className="mt-2 h-auto p-0 text-sm text-red-600 underline">Reintentar</Button></div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="w-full">

      {/* Seat Change Banner */}
      {seatChange.mode && seatChange.ticket && (
        <div className="sticky top-0 z-20 bg-orange-500 shadow-md">
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
            <Button variant="ghost" onClick={seatChange.cancel} className="text-white hover:bg-white/20">
              Cancelar Cambio
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-3 pb-8 px-3 sm:px-4 lg:px-6">
        <div className="w-full space-y-6">
          <TripInfoCard
            trip={trip}
            ticketStats={page.ticketStats}
            formatDate={page.formatDate}
            drivers={page.drivers}
            assistants={page.assistants}
            staff={page.staff}
            actions={
              <>
                {(trip.status === 'scheduled' || trip.status === 'boarding') && (
                  <Button
                    size="sm"
                    variant={page.dispatch.canDispatch ? 'default' : 'ghost'}
                    disabled={!page.dispatch.canDispatch}
                    onClick={() => page.dispatch.canDispatch ? page.dispatch.setShow(true) : null}
                    title={!page.dispatch.canDispatch ? 'Aún no es la hora de salida' : 'Despachar Viaje'}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Despachar
                  </Button>
                )}
                {trip.status === 'departed' && (
                  <Button
                    size="sm"
                    onClick={() => page.finish.setShow(true)}
                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Terminar
                  </Button>
                )}
                <Link to={`/trips/${tripId}/passengers-manifest`} target="_blank">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Planilla de pasajeros
                  </Button>
                </Link>
                <Link to={`/trips/${tripId}/packages-manifest`} target="_blank">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    Manifiesto de encomiendas
                  </Button>
                </Link>
              </>
            }
          />

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
            onCancelReservation={page.seatMapHandlers.onCancelReservation}
            onConfirmSale={page.seatMapHandlers.onConfirmSale}
            onChangeSeat={page.seatMapHandlers.onChangeSeat}
            onPreviewTicket={page.seatMapHandlers.onPreviewTicket}
            onGoToTicketPage={(seat) => {
              const ticket = page.findTicketBySeat(seat)
              if (ticket) navigate(`/tickets/${ticket.id}`)
            }}
          />

          <TripPackagesSection
            tripPackages={page.packages.items}
            tripId={trip.id}
            isLoading={page.packages.loading}
            tripStatus={trip.status}
            onOpenAssignModal={page.packages.openAssignModal}
            onUnassignPackage={page.packages.unassign}
            onDeliverPackage={page.packages.deliver}
            onReceivePackage={page.packages.receive}
            onShowReceipt={page.packages.showReceipt}
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
      />

      {/* Package Modals */}
      <PackageAssignModal
        show={page.packages.assignModal.show}
        tripId={tripId}
        onClose={page.packages.assignModal.close}
        onPackagesAssigned={page.packages.assignModal.onAssigned}
        onOpenRegistration={page.packages.registrationModal.open}
      />
      <PackageDeliveryModal
        show={page.packages.deliveryModal.show}
        packageData={page.packages.deliveryModal.packageData}
        onClose={page.packages.deliveryModal.close}
        onConfirm={page.packages.deliveryModal.onConfirm}
      />
      <PackageReceptionModal
        show={page.packages.receptionModal.show}
        packageData={page.packages.receptionModal.packageData}
        onClose={page.packages.receptionModal.close}
        onConfirm={page.packages.receptionModal.onConfirm}
      />
      <PackageRegistrationModal
        show={page.packages.registrationModal.show}
        tripId={tripId}
        onClose={page.packages.registrationModal.close}
        onPackageRegistered={page.packages.registrationModal.onRegistered}
      />
      <PackageReceiptModal
        show={page.packages.receiptModal.show}
        packageData={page.packages.receiptModal.packageData}
        onClose={page.packages.receiptModal.close}
      />

      {/* Ticket Preview (printable receipt) */}
      <TicketReceiptModal
        show={page.ticketPreview.show}
        tickets={page.ticketPreview.ticket ? [page.ticketPreview.ticket] : []}
        trip={trip}
        onClose={page.ticketPreview.close}
      />
    </div>
  )
}
