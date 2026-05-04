import { useTicketsIndexPage } from '@/hooks/use-tickets-index'
import { Button } from '@/components/ui/button'
import { ViewToggle } from '@/components/ui/view-toggle'
import { LayoutGrid, List } from 'lucide-react'
import { TicketsStatsCards } from '@/components/tickets/TicketsStatsCards'
import { TicketsFilters } from '@/components/tickets/TicketsFilters'
import { TicketsTableView, TicketsCardGridView } from '@/components/tickets/TicketsListViews'
import { TicketFormModal } from '@/components/tickets/TicketFormModal'

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
    showCreateModal, showEditModal,
    _editingTicket, ticketForm, setTicketForm,
    stats, comparison,
    currentPage, setCurrentPage, totalPages,
    filteredTickets,
    getClientName, getTripInfo,
    exportData, clearAllFilters,
    handleCloseModal, submitTicketForm,
    handleEditTicket, handleCancelTicket,
  } = useTicketsIndexPage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Gestión de Boletos
        </h1>
        <p className="mt-2 text-gray-600">Administra los boletos de viaje de los pasajeros</p>
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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Lista de Boletos ({filteredTickets.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>Exportar</Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
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
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">No hay boletos</div>
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
          <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Siguiente
          </Button>
        </div>
      )}

      {(showCreateModal || showEditModal) && (
        <TicketFormModal
          mode={showCreateModal ? 'create' : 'edit'}
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
    </div>
  )
}

export default Component
