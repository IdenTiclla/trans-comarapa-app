import { useTicketsIndexPage } from '@/hooks/use-tickets-index'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Pagination } from '@/components/ui/pagination'
import EmptyState from '@/components/common/EmptyState'
import { LayoutGrid, List } from 'lucide-react'
import { TicketsStatsCards } from '@/components/tickets/TicketsStatsCards'
import { TicketsFilters } from '@/components/tickets/TicketsFilters'
import { TicketsTableView, TicketsCardGridView } from '@/components/tickets/TicketsListViews'
import { TicketFormModal } from '@/components/tickets/TicketFormModal'
import TicketSaleModal from '@/components/tickets/TicketSaleModal'
import type { Trip } from '@/types'

export function Component() {
  const {
    tickets, availableTrips, clients, availableSeats,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    dateFromFilter, setDateFromFilter,
    dateToFilter, setDateToFilter,
    paymentMethodFilter, setPaymentMethodFilter,
    showAdvancedFilters, setShowAdvancedFilters,
    activeFiltersCount,
    isLoading, isSubmitting,
    viewMode, setViewMode,
    showCreateModal, showEditModal, editingTicket,
    ticketForm, setTicketForm,
    stats, comparison,
    currentPage, setCurrentPage, totalPages,
    filteredTickets,
    getClientName, getTripInfo,
    exportData, clearAllFilters,
    handleCloseModal, submitTicketForm, refetchTickets,
    handleEditTicket, handleCancelTicket,
  } = useTicketsIndexPage()

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Gestión de Boletos</h1>
        <p className="text-sm text-muted-foreground">Administra los boletos de viaje de los pasajeros</p>
      </div>

      <TicketsStatsCards stats={stats} comparison={comparison} />

      <TicketsFilters
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        dateFromFilter={dateFromFilter} setDateFromFilter={setDateFromFilter}
        dateToFilter={dateToFilter} setDateToFilter={setDateToFilter}
        paymentMethodFilter={paymentMethodFilter} setPaymentMethodFilter={setPaymentMethodFilter}
        showAdvancedFilters={showAdvancedFilters} setShowAdvancedFilters={setShowAdvancedFilters}
        activeFiltersCount={activeFiltersCount}
        onClearAll={clearAllFilters}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-foreground">Lista de Boletos ({filteredTickets.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>Exportar</Button>
          <ViewToggle
            value={viewMode}
            onChange={(val) => setViewMode(val as 'cards' | 'table')}
            options={[
              { value: 'cards', icon: <LayoutGrid className="h-4 w-4" />, label: 'Tarjetas', ariaLabel: 'Vista en tarjetas' },
              { value: 'table', icon: <List className="h-4 w-4" />, label: 'Lista', ariaLabel: 'Vista en tabla' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          title="No hay boletos"
          description="No se encontraron boletos con los filtros aplicados."
        />
      ) : viewMode === 'table' ? (
        <TicketsTableView
          tickets={tickets}
          getClientName={getClientName}
          getTripInfo={getTripInfo}
          onEdit={handleEditTicket}
          onCancel={handleCancelTicket}
        />
      ) : (
        <TicketsCardGridView
          tickets={tickets}
          getClientName={getClientName}
          getTripInfo={getTripInfo}
          onEdit={handleEditTicket}
          onCancel={handleCancelTicket}
        />
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />


      {showCreateModal && (
        <TicketFormModal
          mode="create"
          form={ticketForm}
          setForm={setTicketForm}
          availableTrips={availableTrips}
          clients={clients}
          availableSeats={availableSeats}
          isSubmitting={isSubmitting}
          onSubmit={submitTicketForm}
          onClose={handleCloseModal}
        />
      )}

      {showEditModal && editingTicket && (
        <TicketSaleModal
          show
          mode="edit"
          ticketId={editingTicket.id}
          existingTicket={editingTicket as unknown as Record<string, unknown>}
          trip={(editingTicket.trip as unknown as Trip) ?? ({ id: editingTicket.trip_id } as Trip)}
          selectedSeats={[{
            id: editingTicket.seat_id,
            number: (editingTicket.seat as { seat_number?: number | string } | undefined)?.seat_number ?? '?',
            deck: (editingTicket.seat as { deck?: string } | undefined)?.deck,
          }]}
          actionType="sell"
          onClose={handleCloseModal}
          onTicketCreated={() => {
            handleCloseModal()
            refetchTickets()
          }}
        />
      )}
    </div>
  )
}

export default Component
