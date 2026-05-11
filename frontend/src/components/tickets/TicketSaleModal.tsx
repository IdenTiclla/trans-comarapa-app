import type React from 'react'
import { useAppSelector } from '@/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, Ticket as TicketIcon, User } from 'lucide-react'
import TicketReceiptModal from './TicketReceiptModal'
import { useTicketSale } from './ticket-sale/use-ticket-sale'
import { SaleModalHeader } from './ticket-sale/SaleModalHeader'
import { ClientTypePicker } from './ticket-sale/ClientTypePicker'
import { ExistingClientPanel } from './ticket-sale/ExistingClientPanel'
import { NewClientFields } from './ticket-sale/NewClientFields'
import { TicketFieldsForm } from './ticket-sale/TicketFieldsForm'
import { TicketPreviewPanel } from './ticket-sale/TicketPreviewPanel'
import type { TicketSaleModalProps } from './ticket-sale/types'

export default function TicketSaleModal({
  show, trip, selectedSeats = [], actionType, mode = 'create', ticketId = null, existingTicket = null, onClose, onTicketCreated,
}: TicketSaleModalProps) {
  const { user } = useAppSelector((state) => state.auth)
  const s = useTicketSale({
    show, trip, selectedSeats, actionType, userId: user?.id,
    mode, ticketId, existingTicket,
    onEditSuccess: (updated) => {
      onTicketCreated([updated])
      onClose()
    },
  })

  const { clientSearch } = s

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    s.submit()
  }

  const closeReceiptModal = () => {
    s.setShowReceiptModal(false)
    onTicketCreated(s.createdTicketsData)
    s.setCreatedTicketsData([])
    onClose()
  }

  if (!show && !s.showReceiptModal) return null

  return (
    <>
      <div className={cn(
        'fixed inset-0 z-50 overflow-hidden font-sans transition-all duration-300 backdrop-blur-sm',
        s.showReceiptModal ? 'hidden' : 'opacity-100',
      )}>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute inset-0 h-full w-full rounded-none cursor-default bg-transparent hover:bg-transparent modal-overlay-bokeh"
        />

        <div className="relative flex min-h-dvh items-end justify-center p-0 pointer-events-none sm:items-center sm:p-4">
          <div className="relative flex max-h-dvh w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl pointer-events-auto sm:max-w-7xl sm:max-h-[92vh] sm:rounded-2xl">
            <SaleModalHeader
              actionType={actionType}
              selectedSeats={selectedSeats}
              origin={trip?.route?.origin}
              destination={trip?.route?.destination}
              isEditMode={s.isEditMode}
              onClose={onClose}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/30 lg:flex-row lg:overflow-hidden">
              <div className="w-full shrink-0 p-3 sm:p-4 lg:w-1/2 lg:overflow-y-auto lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <h4 className="mb-4 flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <User className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
                      Información del Cliente
                    </h4>

                    {!s.isEditMode && (
                      <ClientTypePicker
                        value={clientSearch.clientType}
                        onChange={clientSearch.setClientType}
                      />
                    )}

                    {clientSearch.clientType === 'existing' && (
                      <ExistingClientPanel
                        searchTerm={clientSearch.clientSearchQuery}
                        onSearchChange={clientSearch.searchClients}
                        searching={clientSearch.searchingClients}
                        hasSearched={clientSearch.hasSearched}
                        foundClients={clientSearch.foundClients}
                        selectedClient={clientSearch.selectedExistingClient}
                        hasSelected={clientSearch.hasSelectedExistingClient}
                        onSelect={clientSearch.selectExistingClient}
                        onClear={clientSearch.clearExistingClientSelection}
                        locked={s.isEditMode}
                      />
                    )}

                    {!s.isEditMode && clientSearch.clientType === 'new' && (
                      <NewClientFields form={s.newClientForm} setForm={s.setNewClientForm} />
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                    <h4 className="mb-4 flex items-center text-base font-semibold text-foreground sm:text-lg">
                      <TicketIcon className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
                      Información del Boleto
                    </h4>
                    <TicketFieldsForm
                      form={s.ticketForm}
                      setForm={s.setTicketForm}
                      hasTriedSubmit={s.hasTriedSubmit}
                    />
                  </div>

                  {s.errorMessage && (
                    <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
                      <p className="text-sm font-medium text-destructive">{s.errorMessage}</p>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end sm:pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto sm:px-6">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={s.isSubmitting || !s.canSubmit}
                      className="w-full sm:w-auto sm:px-6"
                    >
                      {s.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                      {s.isSubmitting ? 'Procesando...' : s.isEditMode ? 'Guardar Cambios' : actionType === 'sell' ? 'Vender Boleto' : 'Reservar'}
                    </Button>
                  </div>
                </form>
              </div>

              <TicketPreviewPanel previewTicket={s.previewTicket} trip={trip} />
            </div>
          </div>
        </div>
      </div>

      <TicketReceiptModal
        show={s.showReceiptModal}
        tickets={s.createdTicketsData}
        trip={trip}
        onClose={closeReceiptModal}
      />
    </>
  )
}
