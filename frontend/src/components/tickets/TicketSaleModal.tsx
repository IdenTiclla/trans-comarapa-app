import type React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
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
  show, trip, selectedSeats = [], actionType, onClose, onTicketCreated,
}: TicketSaleModalProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const s = useTicketSale({ show, trip, selectedSeats, actionType, userId: user?.id })

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

        <div className="relative flex items-center justify-center min-h-screen p-4 pointer-events-none">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
            <SaleModalHeader
              actionType={actionType}
              selectedSeats={selectedSeats}
              origin={trip?.route?.origin}
              destination={trip?.route?.destination}
              onClose={onClose}
            />

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              <div className="w-full lg:w-1/2 p-4 lg:p-8 shrink-0 overflow-y-auto bg-gray-50">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 text-blue-600 mr-2" />
                      Información del Cliente
                    </h4>

                    <ClientTypePicker
                      value={clientSearch.clientType}
                      onChange={clientSearch.setClientType}
                    />

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
                      />
                    )}

                    {clientSearch.clientType === 'new' && (
                      <NewClientFields form={s.newClientForm} setForm={s.setNewClientForm} />
                    )}
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TicketIcon className="w-5 h-5 text-blue-600 mr-2" />
                      Información del Boleto
                    </h4>
                    <TicketFieldsForm
                      form={s.ticketForm}
                      setForm={s.setTicketForm}
                      hasTriedSubmit={s.hasTriedSubmit}
                    />
                  </div>

                  {s.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-800">{s.errorMessage}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6">
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={s.isSubmitting || !s.canSubmit}
                      className="px-6 bg-blue-600 hover:bg-blue-700"
                    >
                      {s.isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                      {s.isSubmitting ? 'Procesando...' : actionType === 'sell' ? '🎫 Vender Boleto' : '📝 Reservar'}
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
