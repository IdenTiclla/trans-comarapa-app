import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Check, FileText, Package, Armchair, AlertCircle, RefreshCw } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import type { Trip as AppTrip } from '@/types/trip'
import type { TripPackage } from '@/components/trips/package-views/types'

const VALID_TABS = ['seats', 'packages'] as const
type TabValue = typeof VALID_TABS[number]

interface DetailTrip {
  id: number
  status?: string
  bus?: { floors?: number }
  [key: string]: unknown
}

interface SeatChangeTicket {
  client?: { firstname?: string; lastname?: string }
  seat?: { seat_number?: number | string }
}

export function Component() {
  const { id } = useParams()
  const tripId = Number(id)
  const navigate = useNavigate()

  const currentUser = useAppSelector(selectUser)
  const page = useTripDetailPage(tripId)
  const { trip, loading, error, refreshTrip, seatMap, seatChange, floatPanel } = page
  const detailTrip = trip as DetailTrip | null
  const tripStatus = typeof detailTrip?.status === 'string' ? detailTrip.status : ''
  const seatChangeTicket = seatChange.ticket as SeatChangeTicket | null

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabValue | null
  const activeTab: TabValue = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'seats'
  const setActiveTab = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'seats') next.delete('tab')
    else next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  const isDoubleDeck = (detailTrip?.bus?.floors ?? 1) >= 2

  const [seatsPanelExpanded, setSeatsPanelExpanded] = useState(false)

  const shortcuts = useMemo(() => ({
    'escape': () => {
      page.ticketSale.close()
      if (seatChange.mode) seatChange.cancel()
    },
    'enter': () => {
      if (seatChange.showConfirm) seatChange.confirm()
    },
    ' ': () => {
      if (!page.ticketSale.show && seatMap.selectedSeats.length > 0 && !seatChange.mode) {
        setSeatsPanelExpanded((v) => !v)
      }
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
      <div role="status" aria-live="polite" className="mx-auto max-w-[1500px] space-y-5 py-2">
        <span className="sr-only">Cargando viaje…</span>
        <Skeleton className="h-12 w-full max-w-sm" />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
          <Skeleton className="h-[560px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="destructive" className="items-start">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>No se pudo cargar el viaje</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={refreshTrip} className="mt-3 gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Seat Change Banner */}
      {seatChange.mode && seatChange.ticket && (
        <div className="sticky top-0 z-20 rounded-lg border border-status-medium/30 bg-status-medium/10 shadow-sm">
          <div className="px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center text-foreground">
              <RefreshCw className="h-5 w-5 mr-3 text-status-medium" aria-hidden="true" />
              <div>
                <p className="font-bold">Modo Cambio de Asiento</p>
                <p className="text-sm text-muted-foreground">Seleccione el nuevo asiento para {seatChangeTicket?.client?.firstname} {seatChangeTicket?.client?.lastname} (asiento actual: {seatChangeTicket?.seat?.seat_number})</p>
              </div>
            </div>
            <Button variant="outline" onClick={seatChange.cancel} className="w-full border-border sm:w-auto">
              Cancelar Cambio
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className={`sticky ${seatChange.mode ? 'top-[72px]' : 'top-0'} z-10 -mx-4 px-4 pt-1 pb-4 bg-background/95 backdrop-blur-md sm:mx-0 sm:px-0`}>
            <TabsList className="w-full rounded-lg border border-border bg-card shadow-sm sm:w-auto">
              <TabsTrigger value="seats" className="gap-1.5">
                <Armchair className="h-4 w-4" />
                Asientos & Venta
              </TabsTrigger>
              <TabsTrigger value="packages" className="gap-1.5">
                <Package className="h-4 w-4" />
                Encomiendas
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* Sidebar (rendered first in DOM to match mobile visual; pushed to right column on xl) */}
            <aside className="order-first xl:order-last">
              <div className={`xl:sticky ${seatChange.mode ? 'xl:top-[128px]' : 'xl:top-20'}`}>
                <TripInfoCard
                  trip={trip}
                  ticketStats={page.ticketStats}
                  drivers={page.drivers}
                  assistants={page.assistants}
                  staff={page.staff}
                  actions={
                    <>
                      {(tripStatus === 'scheduled' || tripStatus === 'boarding' || tripStatus === 'delayed') && (
                        <>
                          <Button
                            size="sm"
                            variant={page.dispatch.canDispatch ? 'default' : 'ghost'}
                            disabled={!page.dispatch.canDispatch}
                            aria-describedby={!page.dispatch.canDispatch ? 'dispatch-help' : undefined}
                            onClick={() => { if (page.dispatch.canDispatch) page.dispatch.setShow(true) }}
                            title={!page.dispatch.canDispatch ? 'Aún no es la hora de salida' : 'Despachar Viaje'}
                            className="w-full gap-1.5 justify-center"
                          >
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                            Despachar
                          </Button>
                          {!page.dispatch.canDispatch && (
                            <p id="dispatch-help" className="sr-only">
                              Aún no es la hora de salida del viaje
                            </p>
                          )}
                        </>
                      )}
                      {(tripStatus === 'departed' || tripStatus === 'in_progress') && (
                        <Button
                          size="sm"
                          onClick={() => page.finish.setShow(true)}
                          className="w-full gap-1.5 justify-center"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          Terminar
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" className="w-full justify-start gap-1.5 whitespace-normal border-border text-left">
                        <Link to={ROUTES.tripPassengersManifest(tripId)} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          Planilla pasajeros
                          <span className="sr-only"> (se abre en una nueva pestaña)</span>
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-full justify-start gap-1.5 whitespace-normal border-border text-left">
                        <Link to={ROUTES.tripPackagesManifest(tripId)} target="_blank" rel="noopener noreferrer">
                          <Package className="h-3.5 w-3.5" aria-hidden="true" />
                          Manifiesto encomiendas
                          <span className="sr-only"> (se abre en una nueva pestaña)</span>
                        </Link>
                      </Button>
                    </>
                  }
                />
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
              <TabsContent value="seats" className="mt-0">
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
                    if (ticket) navigate(ROUTES.ticketDetail(ticket.id))
                  }}
                />
              </TabsContent>

              <TabsContent value="packages" className="mt-0">
                <TripPackagesSection
                  tripPackages={page.packages.items as unknown as TripPackage[]}
                  tripId={trip.id}
                  isLoading={page.packages.loading}
                  tripStatus={tripStatus}
                  onOpenAssignModal={page.packages.openAssignModal}
                  onUnassignPackage={page.packages.unassign}
                  onDeliverPackage={page.packages.deliver}
                  onReceivePackage={page.packages.receive}
                  onShowReceipt={page.packages.showReceipt}
                />
              </TabsContent>
            </div>

          </div>
        </Tabs>
      </div>

      {/* Floating Seats Panel */}
      <FloatingSeatsPanel
        selectedSeats={seatMap.selectedSeats}
        selectionEnabled={!seatChange.mode}
        seatChangeMode={seatChange.mode}
        isDoubleDeck={isDoubleDeck}
        expanded={seatsPanelExpanded}
        onExpandedChange={setSeatsPanelExpanded}
        onSellTicket={floatPanel.onSellTicket}
        onReserveSeat={floatPanel.onReserveSeat}
        onClearSelection={floatPanel.onClearSelection}
        onRemoveSeat={floatPanel.onRemoveSeat}
      />

      {/* All Confirmation Modals */}
      <TripConfirmationModals
        trip={trip as unknown as AppTrip}
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
        trip={trip as unknown as AppTrip}
        onClose={page.ticketPreview.close}
      />
    </div>
  )
}
