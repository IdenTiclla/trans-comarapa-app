<template>
  <div>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <button
            @click="router.back()"
            class="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver
          </button>
        </div>

        <div v-if="tripStore.isLoading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando información del viaje...</p>
        </div>

        <div v-else-if="tripStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ tripStore.error }}</h3>
            </div>
          </div>
        </div>

        <div v-else-if="displayedTrip">
          <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Detalles del Viaje
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  ID: {{ displayedTrip.id }}
                </p>
              </div>
              <div>
                <span
                  class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                  :class="getStatusClass(displayedTrip.status)"
                >
                  {{ getStatusText(displayedTrip.status) }}
                </span>
              </div>
            </div>
            <div class="border-t border-gray-200">
              <dl class="divide-y divide-gray-200">
                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Ruta</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    <div class="flex items-center">
                      <span>{{ displayedTrip.route?.origin }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span>{{ displayedTrip.route?.destination }}</span>
                    </div>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Fecha de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ formatDate(displayedTrip.trip_datetime) }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Hora de salida</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-medium">
                    {{ formatTime(displayedTrip.departure_time, displayedTrip.trip_datetime) }}
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleAvailableSeats">
                          {{ displayedTrip.available_seats }} disponibles
                          <span v-if="!showAvailableSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>
                      <div v-if="displayedTrip.occupied_seat_numbers && displayedTrip.occupied_seat_numbers.length > 0" class="flex items-center">
                        <span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-medium cursor-pointer" @click="toggleOccupiedSeats">
                          {{ displayedTrip.occupied_seat_numbers.length }} ocupados
                          <span v-if="!showOccupiedSeats" class="ml-1">▼</span>
                          <span v-else class="ml-1">▲</span>
                        </span>
                      </div>
                      <div class="flex items-center">
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-medium">
                          {{ displayedTrip.total_seats }} totales
                        </span>
                      </div>
                    </div>
                    <div v-if="showAvailableSeats && sortedAvailableSeats.length > 0" class="mt-3 bg-green-50 p-3 rounded-md border border-green-100">
                      <h4 class="text-xs font-medium text-green-800 mb-2">Asientos disponibles:</h4>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="seatNumber in sortedAvailableSeats"
                          :key="seatNumber"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                        >
                          {{ seatNumber }}
                        </span>
                      </div>
                    </div>
                    <div v-if="showOccupiedSeats && sortedOccupiedSeats.length > 0" class="mt-3 bg-red-50 p-3 rounded-md border border-red-100">
                      <h4 class="text-xs font-medium text-red-800 mb-2">Asientos ocupados:</h4>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="seatNumber in sortedOccupiedSeats" 
                          :key="seatNumber" 
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                        >
                          {{ seatNumber }}
                        </span>
                      </div>
                    </div>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Conductor</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.driver" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.driver.firstname }} {{ displayedTrip.driver.lastname }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Asistente</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.assistant" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.assistant.firstname }} {{ displayedTrip.assistant.lastname }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt class="text-sm font-medium text-gray-500">Bus</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.bus" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">{{ displayedTrip.bus.license_plate }}</span>
                      <span class="text-gray-500">{{ displayedTrip.bus.model }}</span>
                    </div>
                    <span v-else>No asignado</span>
                  </dd>
                </div>

                <div class="px-4 py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-white">
                  <dt class="text-sm font-medium text-gray-500">Secretaria</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div v-if="displayedTrip.secretary" class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-gray-900">{{ displayedTrip.secretary.firstname }} {{ displayedTrip.secretary.lastname }}</span>
                    </div>
                    <span v-else>No asignada</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <!-- Mapa de asientos -->
          <div v-if="displayedTrip" class="mt-6 mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Mapa de Asientos</h3>
              <div class="mt-2 sm:mt-0 flex items-center space-x-4">
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.available_seats }} disponibles</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                </div>
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.occupied_seat_numbers ? displayedTrip.occupied_seat_numbers.length : 0 }} ocupados</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                </div>
                <div class="flex items-center">
                  <span class="text-xs text-gray-500 mr-2">{{ displayedTrip.total_seats }} totales</span>
                  <span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1"></span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
              <BusSeatMapPrint
                :trip="displayedTrip" 
                :selection-enabled="true"
                :reserved_seat_numbers="reservedSeatNumbers"
                :enable-context-menu="true"
                :initial-selected-seats="selectedSeatsForSale"
                @cancel-reservation="handleCancelReservation"
                @view-details="handleViewSeatDetails"
                @change-seat="handleChangeSeat"
                @reschedule-trip="handleRescheduleTrip"
                @sell-ticket="handleSellTicket"
                @reserve-seat="handleReserveSeat"
                @selection-change="handleSelectionChange"
              />
            </div>
          </div>

          <!-- Sold Tickets Section -->
          <div class="mt-8">
            <button
              @click="toggleSoldTickets"
              class="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow focus:outline-none transition-colors duration-150"
            >
              <h3 class="text-lg font-medium text-gray-800">
                Boletos Vendidos ({{ soldTickets.length }})
              </h3>
              <ChevronDownIcon v-if="!showSoldTickets" class="w-6 h-6 text-gray-600" />
              <ChevronUpIcon v-else class="w-6 h-6 text-gray-600" />
            </button>

            <div v-if="showSoldTickets" class="mt-4">
              <div v-if="isLoadingSoldTickets" class="flex justify-center py-6">
                <p class="text-gray-500 italic">Cargando boletos vendidos...</p>
                <!-- You can add a spinner here -->
              </div>
              <div v-else-if="soldTicketsError" class="bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-red-700 text-sm">{{ soldTicketsError }}</p>
              </div>
              <div v-else-if="soldTickets.length === 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p class="text-blue-700 text-sm">No hay boletos vendidos para este viaje aún.</p>
              </div>
              <!-- Iterate over grouped tickets -->
              <div v-else class="space-y-4">
                <div v-for="(ticketsInState, state) in groupedSoldTickets" :key="state">
                  <button
                    @click="toggleTicketsByState(state)"
                    class="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm focus:outline-none transition-colors duration-150 border border-gray-200"
                  >
                    <h4 class="text-md font-medium text-gray-700">
                      {{ state.charAt(0).toUpperCase() + state.slice(1) }} ({{ ticketsInState.length }})
                    </h4>
                    <ChevronDownIcon v-if="!showTicketsByState[state]" class="w-5 h-5 text-gray-500" />
                    <ChevronUpIcon v-else class="w-5 h-5 text-gray-500" />
                  </button>

                  <div v-if="showTicketsByState[state]" class="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="ticket in ticketsInState"
                      :key="ticket.id"
                      class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out"
                    >
                      <div class="p-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="text-md font-semibold text-green-700">
                            Boleto #{{ ticket.id }}
                          </h4>
                          <span 
                            class="px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="{
                              'bg-green-100 text-green-800': ticket.state === 'confirmed',
                              'bg-yellow-100 text-yellow-800': ticket.state === 'pending',
                              'bg-red-100 text-red-800': ticket.state === 'cancelled',
                              'bg-gray-100 text-gray-800': ticket.state === 'completed' || ticket.state === 'used' || ticket.state === 'unknown',
                            }"
                          >
                            {{ ticket.state ? ticket.state.charAt(0).toUpperCase() + ticket.state.slice(1) : 'N/D' }}
                          </span>
                        </div>

                        <div class="space-y-2.5 text-sm text-gray-600">
                          <div class="flex items-center">
                            <UserCircleIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Pasajero:</span> {{ ticket.client?.firstname }} {{ ticket.client?.lastname }}</p>
                          </div>
                          <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Asiento:</span> {{ ticket.seat?.seat_number }} ({{ ticket.seat?.deck }})</p>
                          </div>
                           <div class="flex items-center">
                             <CurrencyDollarIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                             <p><span class="font-medium text-gray-700">Precio:</span> Bs. {{ ticket.price?.toFixed(2) }}</p>
                          </div>
                          <div class="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM4 8h5v2H4V8z" clip-rule="evenodd" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Método Pago:</span> {{ ticket.payment_method || 'N/D' }}</p>
                          </div>
                          <div class="flex items-center">
                            <CalendarIcon class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Vendido:</span> {{ formatDate(ticket.created_at) }}</p>
                          </div>
                           <div v-if="ticket.secretary" class="flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-8-3a1 1 0 00-.867.5 1 1 0 01-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                             <p><span class="font-medium text-gray-700">Vendido por:</span> {{ ticket.secretary.firstname }} {{ ticket.secretary.lastname }}</p>
                          </div>
                        </div>
                      </div>
                      <div v-if="ticket.state === 'confirmed' || ticket.state === 'pending'" class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                        <AppButton size="sm" variant="danger-outline">Cancelar</AppButton>
                        <AppButton size="sm" variant="primary">Imprimir</AppButton> <!-- Placeholder for future actions -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Sold Tickets Section -->

          <!-- Packages Section -->
          <div class="mt-8">
            <button
              @click="togglePackages"
              class="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg shadow focus:outline-none transition-colors duration-150"
            >
              <h3 class="text-lg font-medium text-gray-800">
                Paquetes ({{ packages.length }})
              </h3>
              <ChevronDownIcon v-if="!showPackages" class="w-6 h-6 text-gray-600" />
              <ChevronUpIcon v-else class="w-6 h-6 text-gray-600" />
            </button>

            <div v-if="showPackages" class="mt-4">
              <div v-if="isLoadingPackages" class="flex justify-center py-6">
                <p class="text-gray-500 italic">Cargando paquetes...</p>
              </div>
              <div v-else-if="packagesError" class="bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-red-700 text-sm">{{ packagesError }}</p>
              </div>
              <div v-else-if="packages.length === 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p class="text-blue-700 text-sm">No hay paquetes para este viaje aún.</p>
              </div>
              <!-- Iterate over grouped packages -->
              <div v-else class="space-y-4">
                <div v-for="(packagesInStatus, status) in groupedPackages" :key="status">
                  <button
                    @click="togglePackagesByStatus(status)"
                    class="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm focus:outline-none transition-colors duration-150 border border-gray-200"
                  >
                    <h4 class="text-md font-medium text-gray-700">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }} ({{ packagesInStatus.length }})
                    </h4>
                    <ChevronDownIcon v-if="!showPackagesByStatus[status]" class="w-5 h-5 text-gray-500" />
                    <ChevronUpIcon v-else class="w-5 h-5 text-gray-500" />
                  </button>

                  <div v-if="showPackagesByStatus[status]" class="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="pkg in packagesInStatus"
                      :key="pkg.id"
                      class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out"
                    >
                      <div class="p-5">
                        <div class="flex justify-between items-start mb-3">
                          <h4 class="text-md font-semibold text-purple-700">
                            Paquete #{{ pkg.id }}
                          </h4>
                          <span 
                            class="px-2 py-0.5 text-xs font-medium rounded-full"
                            :class="{
                              'bg-green-100 text-green-800': pkg.status === 'delivered' || pkg.status === 'entregado',
                              'bg-yellow-100 text-yellow-800': pkg.status === 'in transit' || pkg.status === 'en transito',
                              'bg-blue-100 text-blue-800': pkg.status === 'pending' || pkg.status === 'pendiente',
                              'bg-red-100 text-red-800': pkg.status === 'cancelled' || pkg.status === 'cancelado',
                              'bg-gray-100 text-gray-800': pkg.status === 'unknown' || !pkg.status,
                            }"
                          >
                            {{ pkg.status ? pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1) : 'N/D' }}
                          </span>
                        </div>

                        <div class="space-y-2.5 text-sm text-gray-600">
                          <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clip-rule="evenodd" />
                            </svg>
                            <p><span class="font-medium text-gray-700">Nombre:</span> {{ pkg.name }}</p>
                          </div>
                          <div v-if="pkg.description" class="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H6a1 1 0 110-2V4z" clip-rule="evenodd" />
                            </svg>
                            <p><span class="font-medium text-gray-700">Descripción:</span> {{ pkg.description }}</p>
                          </div>
                          <div class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clip-rule="evenodd" />
                            </svg>
                            <p><span class="font-medium text-gray-700">Peso:</span> {{ pkg.weight }} kg</p>
                          </div>
                          <div class="flex items-center">
                            <CurrencyDollarIcon class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Precio:</span> Bs. {{ pkg.price?.toFixed(2) }}</p>
                          </div>
                          <div v-if="pkg.sender" class="flex items-center">
                            <UserCircleIcon class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Remitente:</span> {{ pkg.sender.firstname }} {{ pkg.sender.lastname }}</p>
                          </div>
                          <div v-if="pkg.recipient" class="flex items-center">
                            <UserCircleIcon class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Destinatario:</span> {{ pkg.recipient.firstname }} {{ pkg.recipient.lastname }}</p>
                          </div>
                          <div class="flex items-center">
                            <CalendarIcon class="w-5 h-5 mr-2 text-purple-500 flex-shrink-0" />
                            <p><span class="font-medium text-gray-700">Registrado:</span> {{ formatDate(pkg.created_at) }}</p>
                          </div>
                          <div v-if="pkg.secretary" class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fill-rule="evenodd" d="M18 8a6 6 0 11-12 0 6 6 0 0112 0zm-8-3a1 1 0 00-.867.5 1 1 0 01-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                            </svg>
                            <p><span class="font-medium text-gray-700">Registrado por:</span> {{ pkg.secretary.firstname }} {{ pkg.secretary.lastname }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                        <AppButton size="sm" variant="secondary">Ver Detalles</AppButton>
                        <AppButton v-if="pkg.status !== 'delivered' && pkg.status !== 'entregado'" size="sm" variant="primary">Actualizar Estado</AppButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Packages Section -->

          <div v-if="displayedTrip" class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <AppButton
              variant="secondary"
              @click="router.push(`/trips/${displayedTrip.id}/edit`)"
              class="w-full sm:w-auto order-2 sm:order-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </AppButton>
            <AppButton
              variant="primary"
              @click="goToSellTicket"
              class="w-full sm:w-auto order-1 sm:order-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Vender Boleto
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal para detalles o cancelación de ticket -->
  <div v-if="showTicketModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div v-if="modalType === 'cancel'" class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div v-else class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ modalType === 'cancel' ? 'Cancelar Reserva' : 'Detalles del Boleto' }}
              </h3>
              
              <!-- Contenido del modal -->
              <div class="mt-4">
                <!-- Detalles comunes -->
                <div v-if="selectedTicket" class="bg-gray-50 p-3 rounded-md mb-4">
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-gray-500">Boleto #:</p>
                      <p class="font-medium">{{ selectedTicket.id }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Estado:</p>
                      <p class="font-medium">{{ selectedTicket.state }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Asiento:</p>
                      <p class="font-medium">{{ selectedTicket.seat?.seat_number }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Precio:</p>
                      <p class="font-medium">Bs. {{ selectedTicket.price }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-gray-500">Cliente:</p>
                      <p class="font-medium">{{ selectedTicket.client?.firstname }} {{ selectedTicket.client?.lastname }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Mensaje de confirmación de cancelación -->
                <div v-if="modalType === 'cancel'" class="text-sm text-gray-500">
                  <p>¿Está seguro que desea cancelar la reserva del asiento {{ selectedTicket?.seat?.seat_number }}?</p>
                  <p class="mt-2 text-red-600">Esta acción no se puede deshacer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            v-if="modalType === 'cancel'"
            @click="confirmCancelReservation"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="cancellingReservation"
          >
            {{ cancellingReservation ? 'Cancelando...' : 'Confirmar Cancelación' }}
          </button>
          <button 
            @click="closeModal" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ modalType === 'cancel' ? 'Cancelar' : 'Cerrar' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para reserva de asiento -->
  <div v-if="showReservationModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeReservationModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-white">
              Reservar Asiento {{ selectedSeatForReservation?.number || '' }}
            </h3>
            <button 
              @click="closeReservationModal" 
              class="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-green-100">
            Por favor, completa los datos del cliente para realizar la reserva.
          </p>
        </div>
        
        <!-- Contenido del modal -->
        <div class="bg-white px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Primera columna: Datos personales -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2">Datos Personales</h4>
              <div>
                <label for="firstname" class="block text-sm font-medium text-gray-700">Nombre <span class="text-red-500">*</span></label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="firstname"
                    v-model="reservationClientData.firstname"
                    type="text"
                    required
                    class="block w-full pr-10 focus:ring-green-500 focus:border-green-500 pl-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    :class="{'border-red-300': reservationClientData.firstname.trim() === '' && formTouched}"
                    @focus="formTouched = true"
                    placeholder="Ej. Juan"
                  />
                  <div v-if="reservationClientData.firstname.trim() === '' && formTouched" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p v-if="reservationClientData.firstname.trim() === '' && formTouched" class="mt-1 text-xs text-red-600">El nombre es obligatorio</p>
              </div>
              
              <div>
                <label for="lastname" class="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="lastname"
                  v-model="reservationClientData.lastname"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Pérez"
                />
              </div>
              
              <div>
                <label for="document_id" class="block text-sm font-medium text-gray-700">CI <span class="text-red-500">*</span></label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="document_id"
                    v-model="reservationClientData.document_id"
                    type="text"
                    required
                    class="block w-full pr-10 focus:ring-green-500 focus:border-green-500 pl-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    :class="{'border-red-300': reservationClientData.document_id.trim() === '' && formTouched}"
                    @focus="formTouched = true"
                    placeholder="Ej. 1234567"
                  />
                  <div v-if="reservationClientData.document_id.trim() === '' && formTouched" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p v-if="reservationClientData.document_id.trim() === '' && formTouched" class="mt-1 text-xs text-red-600">El CI es obligatorio</p>
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  id="phone"
                  v-model="reservationClientData.phone"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. 70123456"
                />
              </div>
            </div>
            
            <!-- Segunda columna: Dirección y datos adicionales -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2">Datos de Contacto</h4>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  v-model="reservationClientData.email"
                  type="email"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  id="address"
                  v-model="reservationClientData.address"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Calle Principal #123"
                />
              </div>
              
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  id="city"
                  v-model="reservationClientData.city"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Comarapa"
                />
              </div>
              
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700">Departamento</label>
                <input
                  id="state"
                  v-model="reservationClientData.state"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Santa Cruz"
                />
              </div>
            </div>
          </div>
          
          <!-- Checkbox para menor de edad -->
          <div class="mt-4">
            <label for="is_minor" class="flex items-center">
              <input
                id="is_minor"
                v-model="reservationClientData.is_minor"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Menor de edad</span>
            </label>
          </div>
          
          <!-- Información del viaje -->
          <div class="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Datos de la Reserva</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="block text-gray-500">Viaje:</span>
                <span class="font-medium">{{ displayedTrip?.route?.origin }} → {{ displayedTrip?.route?.destination }}</span>
              </div>
              <div>
                <span class="block text-gray-500">Asiento:</span>
                <span class="font-medium">{{ selectedSeatForReservation?.number }}</span>
              </div>
              <div>
                <span class="block text-gray-500">Fecha:</span>
                <span class="font-medium">{{ formatDate(displayedTrip?.trip_datetime) }}</span>
              </div>
              <div>
                <span class="block text-gray-500">Hora:</span>
                <span class="font-medium">{{ formatTime(displayedTrip?.departure_time, displayedTrip?.trip_datetime) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pie del modal -->
        <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="confirmReservation"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            :disabled="reservationLoading || !isReservationFormValid"
            :class="{'opacity-50 cursor-not-allowed': reservationLoading || !isReservationFormValid}"
          >
            <svg v-if="reservationLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ reservationLoading ? 'Reservando...' : 'Confirmar Reserva' }}
          </button>
          <button 
            @click="closeReservationModal" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para venta de boleto -->
  <div v-if="showSaleModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeSaleModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-white">
              <span v-if="selectedSeatsForSaleModal.length === 1">
                Vender Boleto - Asiento {{ selectedSeatsForSaleModal[0]?.number || '' }}
              </span>
              <span v-else>
                Vender {{ selectedSeatsForSaleModal.length }} Boletos
              </span>
            </h3>
            <button 
              @click="closeSaleModal" 
              class="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-green-100">
            <span v-if="selectedSeatsForSaleModal.length === 1">
              Por favor, completa los datos del cliente para realizar la venta.
            </span>
            <span v-else>
              Por favor, completa los datos del cliente para vender {{ selectedSeatsForSaleModal.length }} asientos a su nombre.
            </span>
          </p>
        </div>
        
        <!-- Contenido del modal -->
        <div class="bg-white px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Primera columna: Datos personales -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2">Datos Personales</h4>
              <div>
                <label for="firstname" class="block text-sm font-medium text-gray-700">Nombre <span class="text-red-500">*</span></label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="firstname"
                    v-model="saleClientData.firstname"
                    type="text"
                    required
                    class="block w-full pr-10 focus:ring-green-500 focus:border-green-500 pl-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    :class="{'border-red-300': saleClientData.firstname.trim() === '' && saleFormTouched}"
                    @focus="saleFormTouched = true"
                    placeholder="Ej. Juan"
                  />
                  <div v-if="saleClientData.firstname.trim() === '' && saleFormTouched" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p v-if="saleClientData.firstname.trim() === '' && saleFormTouched" class="mt-1 text-xs text-red-600">El nombre es obligatorio</p>
              </div>
              
              <div>
                <label for="lastname" class="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="lastname"
                  v-model="saleClientData.lastname"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Pérez"
                />
              </div>
              
              <div>
                <label for="document_id" class="block text-sm font-medium text-gray-700">CI <span class="text-red-500">*</span></label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="document_id"
                    v-model="saleClientData.document_id"
                    type="text"
                    required
                    class="block w-full pr-10 focus:ring-green-500 focus:border-green-500 pl-3 py-2 sm:text-sm border-gray-300 rounded-md"
                    :class="{'border-red-300': saleClientData.document_id.trim() === '' && saleFormTouched}"
                    @focus="saleFormTouched = true"
                    placeholder="Ej. 1234567"
                  />
                  <div v-if="saleClientData.document_id.trim() === '' && saleFormTouched" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p v-if="saleClientData.document_id.trim() === '' && saleFormTouched" class="mt-1 text-xs text-red-600">El CI es obligatorio</p>
              </div>
              
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  id="phone"
                  v-model="saleClientData.phone"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. 70123456"
                />
              </div>
            </div>
            
            <!-- Segunda columna: Dirección y datos adicionales -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2">Datos de Contacto</h4>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  v-model="saleClientData.email"
                  type="email"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. correo@ejemplo.com"
                />
              </div>
              
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  id="address"
                  v-model="saleClientData.address"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Calle Principal #123"
                />
              </div>
              
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  id="city"
                  v-model="saleClientData.city"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Comarapa"
                />
              </div>
              
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700">Departamento</label>
                <input
                  id="state"
                  v-model="saleClientData.state"
                  type="text"
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Ej. Santa Cruz"
                />
              </div>
            </div>
          </div>
          
          <!-- Checkbox para menor de edad -->
          <div class="mt-4">
            <label for="is_minor" class="flex items-center">
              <input
                id="is_minor"
                v-model="saleClientData.is_minor"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">Menor de edad</span>
            </label>
          </div>
          
          <!-- Método de Pago -->
          <div class="mt-4">
            <label for="payment_method" class="block text-sm font-medium text-gray-700">Método de Pago <span class="text-red-500">*</span></label>
            <div class="mt-1 relative rounded-md shadow-sm">
              <select
                id="payment_method"
                v-model="saleClientData.payment_method"
                required
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                :class="{'border-red-300': saleClientData.payment_method.trim() === '' && saleFormTouched}"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="qr">QR</option>
              </select>
              <div v-if="saleClientData.payment_method.trim() === '' && saleFormTouched" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <p v-if="saleClientData.payment_method.trim() === '' && saleFormTouched" class="mt-1 text-xs text-red-600">El método de pago es obligatorio</p>
          </div>
          
          <!-- Información del viaje -->
          <div class="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Datos de la Venta</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="block text-gray-500">Viaje:</span>
                <span class="font-medium">{{ displayedTrip?.route?.origin }} → {{ displayedTrip?.route?.destination }}</span>
              </div>
              <div>
                <span class="block text-gray-500">Asiento(s):</span>
                <span v-if="selectedSeatsForSaleModal.length === 1" class="font-medium">
                  {{ selectedSeatsForSaleModal[0]?.number }}
                </span>
                <div v-else class="flex flex-wrap gap-1">
                  <span 
                    v-for="seat in selectedSeatsForSaleModal" 
                    :key="seat.id"
                    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    {{ seat.number }}
                  </span>
                </div>
              </div>
              <div>
                <span class="block text-gray-500">Fecha:</span>
                <span class="font-medium">{{ formatDate(displayedTrip?.trip_datetime) }}</span>
              </div>
              <div>
                <span class="block text-gray-500">Hora:</span>
                <span class="font-medium">{{ formatTime(displayedTrip?.departure_time, displayedTrip?.trip_datetime) }}</span>
              </div>
              <div>
                <span class="block text-gray-500">
                  <span v-if="selectedSeatsForSaleModal.length === 1">Precio:</span>
                  <span v-else>Precio Total:</span>
                </span>
                <span class="font-medium text-green-600">
                  Bs. {{ ((displayedTrip?.price || 0) * selectedSeatsForSaleModal.length).toFixed(2) }}
                  <span v-if="selectedSeatsForSaleModal.length > 1" class="text-xs text-gray-500">
                    ({{ selectedSeatsForSaleModal.length }} x Bs. {{ (displayedTrip?.price || 0).toFixed(2) }})
                  </span>
                </span>
              </div>
              <div>
                <span class="block text-gray-500">Método de Pago:</span>
                <span class="font-medium">{{ getPaymentMethodText(saleClientData.payment_method) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pie del modal -->
        <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="confirmSale"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
            :disabled="saleLoading || !isSaleFormValid"
            :class="{'opacity-50 cursor-not-allowed': saleLoading || !isSaleFormValid}"
          >
            <svg v-if="saleLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saleLoading ? 'Vendiendo...' : 'Confirmar Venta' }}
          </button>
          <button 
            @click="closeSaleModal" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para confirmación de venta -->
  <div v-if="showSaleConfirmationModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeSaleConfirmationModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10 mr-3">
                <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-lg leading-6 font-medium text-white">
                <span v-if="saleConfirmationData.success">¡Venta Exitosa!</span>
                <span v-else>Error en la Venta</span>
              </h3>
            </div>
            <button 
              @click="closeSaleConfirmationModal" 
              class="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-green-100">
            <span v-if="saleConfirmationData.success">
              <span v-if="saleConfirmationData.seats.length === 1">El boleto ha sido vendido exitosamente.</span>
              <span v-else>Los {{ saleConfirmationData.seats.length }} boletos han sido vendidos exitosamente.</span>
            </span>
            <span v-else>Ha ocurrido un error durante la venta.</span>
          </p>
        </div>
        
        <!-- Contenido del modal -->
        <div v-if="saleConfirmationData.success" class="bg-white px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Primera columna: Datos del cliente -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2 flex items-center">
                <UserCircleIcon class="w-5 h-5 mr-2 text-green-500" />
                Datos del Cliente
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre Completo</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ saleConfirmationData.client?.firstname }} {{ saleConfirmationData.client?.lastname }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Cédula de Identidad</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ saleConfirmationData.client?.document_id }}</p>
                </div>
                <div v-if="saleConfirmationData.client?.phone">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ saleConfirmationData.client?.phone }}</p>
                </div>
                <div v-if="saleConfirmationData.client?.email">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Correo Electrónico</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ saleConfirmationData.client?.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Segunda columna: Detalles de la venta -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-700 border-b pb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                </svg>
                Detalles de la Venta
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Ruta</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ displayedTrip?.route?.origin }} → {{ displayedTrip?.route?.destination }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha y Hora</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ formatDate(displayedTrip?.trip_datetime) }} - {{ formatTime(displayedTrip?.departure_time, displayedTrip?.trip_datetime) }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <span v-if="saleConfirmationData.seats.length === 1">Asiento</span>
                    <span v-else>Asientos ({{ saleConfirmationData.seats.length }})</span>
                  </label>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span 
                      v-for="seat in saleConfirmationData.seats" 
                      :key="seat.id"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {{ seat.number }}
                    </span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Método de Pago</label>
                  <p class="mt-1 text-sm font-semibold text-gray-900">{{ getPaymentMethodText(saleConfirmationData.payment_method) }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Precio Total</label>
                  <p class="mt-1 text-lg font-bold text-green-600">Bs. {{ saleConfirmationData.totalPrice.toFixed(2) }}</p>
                  <p v-if="saleConfirmationData.seats.length > 1" class="text-xs text-gray-500">
                    ({{ saleConfirmationData.seats.length }} x Bs. {{ (saleConfirmationData.totalPrice / saleConfirmationData.seats.length).toFixed(2) }})
                  </p>
                </div>
                <div v-if="saleConfirmationData.ticketIds.length > 0">
                  <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <span v-if="saleConfirmationData.ticketIds.length === 1">ID del Boleto</span>
                    <span v-else>IDs de Boletos</span>
                  </label>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span 
                      v-for="id in saleConfirmationData.ticketIds" 
                      :key="id"
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      #{{ id }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Contenido de error -->
        <div v-else class="bg-white px-4 py-5 sm:p-6">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Error en la Venta</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ saleConfirmationData.errorMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pie del modal -->
        <div class="bg-gray-50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            v-if="saleConfirmationData.success"
            @click="printTickets"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button 
            @click="closeSaleConfirmationModal" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/AppButton.vue'
import BusSeatMapPrint from '@/components/BusSeatMapPrint.vue'
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/vue/24/outline/index.js'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const tripId = computed(() => parseInt(route.params.id))
const displayedTrip = computed(() => tripStore.currentTrip)

const showAvailableSeats = ref(false)
const showOccupiedSeats = ref(false)

// New reactive properties for sold tickets
const soldTickets = ref([])
const isLoadingSoldTickets = ref(false)
const soldTicketsError = ref(null)
const showSoldTickets = ref(false) // To toggle visibility of the main sold tickets section

// New reactive state for toggling visibility of tickets grouped by state
const showTicketsByState = ref({});

// New reactive properties for packages
const packages = ref([])
const isLoadingPackages = ref(false)
const packagesError = ref(null)
const showPackages = ref(false) // To toggle visibility of the main packages section

// New reactive state for toggling visibility of packages grouped by status
const showPackagesByStatus = ref({});

const groupedSoldTickets = computed(() => {
  if (!soldTickets.value || soldTickets.value.length === 0) {
    return {};
  }
  return soldTickets.value.reduce((acc, ticket) => {
    const state = ticket.state || 'unknown'; // Group tickets with no state under 'unknown'
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(ticket);
    return acc;
  }, {});
});

const groupedPackages = computed(() => {
  if (!packages.value || packages.value.length === 0) {
    return {};
  }
  return packages.value.reduce((acc, pkg) => {
    const status = pkg.status || 'unknown'; // Group packages with no status under 'unknown'
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(pkg);
    return acc;
  }, {});
});

// Obtener los números de asientos que tienen tickets en estado "pending" (reservados)
const reservedSeatNumbers = computed(() => {
  if (!soldTickets.value || soldTickets.value.length === 0) {
    return [];
  }
  
  // Filtrar los tickets en estado "pending" y extraer los números de asiento
  return soldTickets.value
    .filter(ticket => ticket.state === 'pending' && ticket.seat)
    .map(ticket => ticket.seat.seat_number);
});

const sortedAvailableSeats = computed(() => {
  if (!displayedTrip.value || !displayedTrip.value.seats_layout) return []
  return displayedTrip.value.seats_layout
    .filter(seat => seat.status === 'available')
    .map(seat => seat.seat_number)
    .sort((a, b) => a - b)
})

const sortedOccupiedSeats = computed(() => {
  if (!displayedTrip.value || !displayedTrip.value.occupied_seat_numbers) return []
  return [...displayedTrip.value.occupied_seat_numbers].sort((a, b) => a - b)
})

onMounted(async () => {
  if (isNaN(tripId.value)) {
    console.error("Invalid trip ID")
    router.push('/trips')
    return
  }
  
  try {
    await tripStore.fetchTripById(tripId.value)
    
    // Use nextTick to ensure the trip is fully loaded and reactive
    await nextTick()
    
    // If trip details are successfully fetched, then fetch sold tickets and packages
    if (displayedTrip.value && displayedTrip.value.id) {
      console.log('Cargando datos para el viaje:', displayedTrip.value.id)
      await Promise.all([
        fetchSoldTickets(), // Call fetchSoldTickets on mount
        fetchPackages() // Call fetchPackages on mount to show correct count
      ])
    } else {
      console.error('Trip not loaded properly after fetchTripById')
    }
  } catch (error) {
    console.error('Error loading trip:', error)
  }
})

const getStatusClass = (status) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800'
    case 'boarding': return 'bg-yellow-100 text-yellow-800'
    case 'departed': return 'bg-indigo-100 text-indigo-800'
    case 'arrived': return 'bg-green-100 text-green-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    case 'delayed': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'scheduled': return 'Programado'
    case 'boarding': return 'Abordando'
    case 'departed': return 'En Ruta'
    case 'arrived': return 'Llegó'
    case 'cancelled': return 'Cancelado'
    case 'delayed': return 'Retrasado'
    default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Desconocido'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  try {
    return new Date(dateString).toLocaleDateString('es-ES', options)
  } catch (e) {
    return 'Fecha inválida'
  }
}

const formatTime = (timeString, dateString) => {
  if (!timeString) return 'Hora no especificada'
  if (timeString.includes('T')) {
    const date = new Date(timeString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  if (dateString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const [hours, minutes] = timeString.split(':')
    const date = new Date(dateString)
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
}

const goToSellTicket = () => {
  if (displayedTrip.value && displayedTrip.value.id) {
    router.push(`/tickets/new?trip=${displayedTrip.value.id}`); // Navigate directly
  } else {
    console.warn("Cannot navigate to sell ticket: Trip data not available.");
    // Optionally, show a notification to the user
  }
};

const toggleAvailableSeats = () => {
  showAvailableSeats.value = !showAvailableSeats.value
}

const toggleOccupiedSeats = () => {
  showOccupiedSeats.value = !showOccupiedSeats.value
}

// Method to fetch sold tickets
const fetchSoldTickets = async () => {
  if (!displayedTrip.value || !displayedTrip.value.id) {
    soldTicketsError.value = 'ID del viaje no disponible para cargar boletos.';
    return;
  }
  isLoadingSoldTickets.value = true;
  soldTicketsError.value = null;
  try {
    const apiUrl = `${config.public.apiBaseUrl}/tickets/trip/${displayedTrip.value.id}`;
    // Using $fetch as recommended for client-side fetching after mount
    const responseData = await $fetch(apiUrl, {
      method: 'GET',
      // headers: { ... } // Add any necessary headers, like Authorization if needed
    });

    if (responseData) {
        // Ensure plain objects for Pinia SSR/hydration
        soldTickets.value = JSON.parse(JSON.stringify(responseData));
        console.log('Tickets cargados:', soldTickets.value);
        console.log('Asientos reservados:', reservedSeatNumbers.value);
    } else {
        soldTickets.value = [];
    }
  } catch (err) { 
    console.error("API Error fetching sold tickets:", err);
    // $fetch errors often have a `data` property with more details from the server
    // Also, check err.response for more details if available
    let errorMessage = 'No se pudieron cargar los boletos vendidos. Intente más tarde.';
    if (err.response && err.response._data && err.response._data.detail) {
      errorMessage = err.response._data.detail;
    } else if (err.data && err.data.message) {
      errorMessage = err.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    soldTicketsError.value = errorMessage;
    soldTickets.value = [];
  }
  finally {
    isLoadingSoldTickets.value = false;
  }
}

// Method to fetch packages
const fetchPackages = async () => {
  if (!displayedTrip.value || !displayedTrip.value.id) {
    packagesError.value = 'ID del viaje no disponible para cargar paquetes.';
    return;
  }
  isLoadingPackages.value = true;
  packagesError.value = null;
  try {
    const apiUrl = `${config.public.apiBaseUrl}/packages/by-trip/${displayedTrip.value.id}`;
    const responseData = await $fetch(apiUrl, {
      method: 'GET',
    });

    if (responseData) {
        // Ensure plain objects for Pinia SSR/hydration
        packages.value = JSON.parse(JSON.stringify(responseData));
        console.log('Paquetes cargados:', packages.value);
    } else {
        packages.value = [];
    }
  } catch (err) { 
    console.error("API Error fetching packages:", err);
    let errorMessage = 'No se pudieron cargar los paquetes. Intente más tarde.';
    if (err.response && err.response._data && err.response._data.detail) {
      errorMessage = err.response._data.detail;
    } else if (err.data && err.data.message) {
      errorMessage = err.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    packagesError.value = errorMessage;
    packages.value = [];
  }
  finally {
    isLoadingPackages.value = false;
  }
}

// Method to toggle sold tickets display and fetch if needed
const toggleSoldTickets = () => {
  showSoldTickets.value = !showSoldTickets.value;
  if (showSoldTickets.value && (soldTickets.value.length === 0 || soldTicketsError.value) && !isLoadingSoldTickets.value) {
    fetchSoldTickets();
  }
  // When closing the main dropdown, also reset individual group visibility if desired
  // if (!showSoldTickets.value) {
  //   showTicketsByState.value = {}; 
  // }
}

// Method to toggle visibility of tickets for a specific state
const toggleTicketsByState = (state) => {
  showTicketsByState.value = {
    ...showTicketsByState.value,
    [state]: !showTicketsByState.value[state]
  }
}

// Method to toggle packages display and fetch if needed
const togglePackages = () => {
  showPackages.value = !showPackages.value;
  if (showPackages.value && (packages.value.length === 0 || packagesError.value) && !isLoadingPackages.value) {
    fetchPackages();
  }
}

// Method to toggle visibility of packages for a specific status
const togglePackagesByStatus = (status) => {
  showPackagesByStatus.value = {
    ...showPackagesByStatus.value,
    [status]: !showPackagesByStatus.value[status]
  }
}

// Watch for changes in displayedTrip.id if the section is already open
watch(() => displayedTrip.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId && showSoldTickets.value) {
    fetchSoldTickets();
  }
  if (newId && newId !== oldId && showPackages.value) {
    fetchPackages();
  }
});

// Watch for trip changes to ensure packages are loaded
watch(() => displayedTrip.value?.id, async (newId) => {
  if (newId) {
    console.log('Trip ID changed to:', newId, 'loading packages...')
    await fetchPackages()
  }
}, { immediate: false });

// Make sure definePageMeta is correctly placed if it's outside script setup
// For Nuxt 3, it's typically auto-imported or used in a separate <script> block if not setup.
// definePageMeta({ middleware: ['auth'] }); // Example, if auth middleware is needed

const handleCancelReservation = async (seat) => {
  // Buscar el ticket que corresponde a este asiento
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && t.state === 'pending'
  )
  
  if (!ticket) {
    alert('No se encontró un ticket reservado para este asiento.')
    return
  }
  
  // Mostrar modal de confirmación
  selectedTicket.value = ticket
  modalType.value = 'cancel'
  showTicketModal.value = true
}

const handleViewSeatDetails = (seat) => {
  // Buscar el ticket que corresponde a este asiento
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number
  )
  
  if (!ticket) {
    alert('No se encontró un ticket para este asiento.')
    return
  }
  
  // Mostrar modal de detalles
  selectedTicket.value = ticket
  modalType.value = 'details'
  showTicketModal.value = true
}

// Función para confirmar la cancelación de la reserva
const confirmCancelReservation = async () => {
  if (!selectedTicket.value) return
  
  cancellingReservation.value = true
  
  try {
    const config = useRuntimeConfig()
    const apiUrl = `${config.public.apiBaseUrl}/tickets/${selectedTicket.value.id}/cancel`
    
    await $fetch(apiUrl, {
      method: 'PUT'
    })
    
    // Actualizar el estado del ticket en el arreglo local
    const index = soldTickets.value.findIndex(t => t.id === selectedTicket.value.id)
    if (index !== -1) {
      soldTickets.value[index].state = 'cancelled'
      
      // Eliminar el número de asiento de reservedSeatNumbers
      const seatNumber = soldTickets.value[index].seat?.seat_number
      if (seatNumber) {
        const seatIndex = reservedSeatNumbers.value.indexOf(seatNumber)
        if (seatIndex !== -1) {
          // Crear una nueva referencia para el array para que sea reactivo
          const newReservedSeatNumbers = [...reservedSeatNumbers.value]
          newReservedSeatNumbers.splice(seatIndex, 1)
          reservedSeatNumbers.value = newReservedSeatNumbers
        }
      }
    }
    
    // Recargar los tickets para actualizar la vista
    await fetchSoldTickets()
    
    // Actualizar los datos del viaje para reflejar los cambios en los asientos
    if (tripId.value) {
      await tripStore.fetchTripById(tripId.value)
    }
    
    // Cerrar el modal
    showTicketModal.value = false
    selectedTicket.value = null
    
    // Mostrar mensaje de éxito
    alert('La reserva ha sido cancelada exitosamente.')
  } catch (error) {
    console.error('Error al cancelar la reserva:', error)
    alert('Error al cancelar la reserva. Por favor, intente nuevamente.')
  } finally {
    cancellingReservation.value = false
  }
}

// Función para cerrar el modal
const closeModal = () => {
  showTicketModal.value = false
  selectedTicket.value = null
  cancellingReservation.value = false
}

// Estado para mostrar modal de detalles o confirmación
const showTicketModal = ref(false)
const selectedTicket = ref(null)
const modalType = ref('details') // 'details', 'cancel', 'change-seat', 'reschedule'
const cancellingReservation = ref(false)

// Manejar el cambio de asiento
const handleChangeSeat = (seat) => {
  // Buscar el ticket que corresponde a este asiento ocupado
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && 
    (t.state === 'confirmed' || t.state === 'paid')
  )
  
  if (!ticket) {
    alert('No se encontró un ticket para este asiento.')
    return
  }
  
  // Por ahora, solo mostrar el modal de detalles
  selectedTicket.value = ticket
  modalType.value = 'details' // En el futuro, esto podría ser 'change-seat'
  showTicketModal.value = true
  
  // Aquí se podría implementar la lógica para cambiar el asiento
  console.log('Cambiar asiento:', seat)
}

// Manejar la reprogramación de viaje
const handleRescheduleTrip = (seat) => {
  // Buscar el ticket que corresponde a este asiento ocupado
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && 
    (t.state === 'confirmed' || t.state === 'paid')
  )
  
  if (!ticket) {
    alert('No se encontró un ticket para este asiento.')
    return
  }
  
  // Por ahora, solo mostrar el modal de detalles
  selectedTicket.value = ticket
  modalType.value = 'details' // En el futuro, esto podría ser 'reschedule'
  showTicketModal.value = true
  
  // Aquí se podría implementar la lógica para reprogramar el viaje
  console.log('Reprogramar viaje para el asiento:', seat)
}

// Estado para modal de venta
const showSaleModal = ref(false)
const saleLoading = ref(false)
const selectedSeatForSale = ref(null)
const selectedSeatsForSaleModal = ref([])
const saleFormTouched = ref(false)
const saleClientData = ref({
  firstname: '',
  lastname: '',
  document_id: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  is_minor: false,
  payment_method: 'cash'
})

// Estado para modal de confirmación de venta
const showSaleConfirmationModal = ref(false)
const saleConfirmationData = ref({
  success: false,
  client: null,
  seats: [],
  totalPrice: 0,
  ticketIds: [],
  errorMessage: ''
})

// Estado para selección múltiple de asientos
const selectedSeatsForSale = ref([])

// Función para manejar cambios en la selección de asientos
const handleSelectionChange = (selectedSeats) => {
  selectedSeatsForSale.value = selectedSeats
}

// Manejar la venta de boleto
const handleSellTicket = (seat) => {
  if (!displayedTrip.value || !displayedTrip.value.id) {
    alert('No se puede vender el boleto en este momento. Intente nuevamente.')
    return
  }
  
  // Determinar qué asientos vender
  // Si hay asientos seleccionados y el asiento del click derecho está entre ellos, usar todos los seleccionados
  // Si no, usar solo el asiento del click derecho
  let seatsToSell = []
  
  if (selectedSeatsForSale.value.length > 0 && 
      selectedSeatsForSale.value.some(s => s.id === seat.id)) {
    // Hay asientos seleccionados y el asiento clickeado está entre ellos
    seatsToSell = [...selectedSeatsForSale.value]
  } else {
    // No hay selección múltiple o el asiento clickeado no está seleccionado
    seatsToSell = [seat]
  }
  
  // Filtrar solo asientos disponibles
  seatsToSell = seatsToSell.filter(s => 
    !s.occupied && s.status !== 'reserved' && s.status !== 'occupied'
  )
  
  if (seatsToSell.length === 0) {
    alert('No hay asientos disponibles para vender.')
    return
  }
  
  // Inicializar el formulario de venta
  saleClientData.value = {
    firstname: '',
    lastname: '',
    document_id: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    is_minor: false,
    payment_method: 'cash'
  }
  
  // Guardar los asientos seleccionados y mostrar el modal
  selectedSeatsForSaleModal.value = seatsToSell
  showSaleModal.value = true
  saleFormTouched.value = false
}

// Función para validar los datos del cliente para la venta
const isSaleFormValid = computed(() => {
  return (
    saleClientData.value.firstname.trim() !== '' &&
    saleClientData.value.document_id.trim() !== '' &&
    saleClientData.value.payment_method.trim() !== ''
  )
})

// Confirmar la venta con los datos del modal
const confirmSale = async () => {
  if (!isSaleFormValid.value || !selectedSeatsForSaleModal.value || selectedSeatsForSaleModal.value.length === 0) {
    return
  }
  
  saleLoading.value = true
  
  try {
    const config = useRuntimeConfig()
    
    // Obtener el usuario autenticado para crear la venta
    if (!authStore.user || !authStore.user.id) {
      saleConfirmationData.value = {
        success: false,
        client: null,
        seats: [],
        totalPrice: 0,
        ticketIds: [],
        errorMessage: 'Debe iniciar sesión para vender un boleto.'
      }
      showSaleModal.value = false
      showSaleConfirmationModal.value = true
      saleLoading.value = false
      return
    }
    
    // Crear el cliente con los datos del formulario
    const clientApiUrl = `${config.public.apiBaseUrl}/clients`
    const clientResponse = await $fetch(clientApiUrl, {
      method: 'POST',
      body: {
        firstname: saleClientData.value.firstname,
        lastname: saleClientData.value.lastname,
        document_id: saleClientData.value.document_id,
        phone: saleClientData.value.phone,
        email: saleClientData.value.email,
        address: saleClientData.value.address,
        city: saleClientData.value.city,
        state: saleClientData.value.state,
        is_minor: saleClientData.value.is_minor
      }
    })
    
    if (!clientResponse || !clientResponse.id) {
      throw new Error('No se pudo crear el cliente para la venta.')
    }
    
    // Crear tickets para todos los asientos seleccionados
    const ticketPromises = selectedSeatsForSaleModal.value.map(seat => {
      const ticketData = {
        trip_id: displayedTrip.value.id,
        seat_id: seat.id,
        client_id: clientResponse.id,
        state: 'confirmed', // Estado "confirmed" para venta directa
        price: displayedTrip.value.price || 0,
        payment_method: saleClientData.value.payment_method,
        operator_user_id: authStore.user.id
      }
      
      return $fetch(`${config.public.apiBaseUrl}/tickets`, {
        method: 'POST',
        body: ticketData
      })
    })
    
    console.log('Creando tickets para asientos:', selectedSeatsForSaleModal.value.map(s => s.number))
    console.log('Usuario autenticado:', authStore.user)
    console.log('Viaje:', displayedTrip.value)
    
    // Esperar a que se creen todos los tickets
    const responses = await Promise.all(ticketPromises)
    
    if (responses.length > 0) {
      // Recargar los tickets para actualizar la vista
      await fetchSoldTickets()
      
      // Actualizar los datos del viaje para reflejar los cambios en los asientos
      if (tripId.value) {
        await tripStore.fetchTripById(tripId.value)
      }
      
      // Limpiar la selección
      selectedSeatsForSale.value = []
      
      // Preparar datos para el modal de confirmación
      const totalPrice = (displayedTrip.value.price || 0) * selectedSeatsForSaleModal.value.length
      const ticketIds = responses.map(response => response.id).filter(id => id)
      
      saleConfirmationData.value = {
        success: true,
        client: clientResponse,
        seats: [...selectedSeatsForSaleModal.value],
        totalPrice: totalPrice,
        ticketIds: ticketIds,
        payment_method: saleClientData.value.payment_method,
        errorMessage: ''
      }
      
      // Cerrar modal de venta y mostrar modal de confirmación
      showSaleModal.value = false
      showSaleConfirmationModal.value = true
    }
  } catch (error) {
    console.error('Error al vender el boleto:', error)
    
    // Mostrar mensaje de error específico si está disponible
    let errorMessage = 'Error al vender el boleto. Por favor, intente nuevamente.'
    
    if (error.response && error.response._data && error.response._data.detail) {
      errorMessage = error.response._data.detail
    } else if (error.message) {
      errorMessage = error.message
    }
    
    saleConfirmationData.value = {
      success: false,
      client: null,
      seats: [],
      totalPrice: 0,
      ticketIds: [],
      errorMessage: errorMessage
    }
    
    // Cerrar modal de venta y mostrar modal de error
    showSaleModal.value = false
    showSaleConfirmationModal.value = true
  } finally {
    saleLoading.value = false
  }
}

// Cerrar el modal de venta
const closeSaleModal = () => {
  showSaleModal.value = false
  selectedSeatForSale.value = null
  selectedSeatsForSaleModal.value = []
  saleLoading.value = false
  saleFormTouched.value = false
}

// Cerrar el modal de confirmación de venta
const closeSaleConfirmationModal = () => {
  showSaleConfirmationModal.value = false
  saleConfirmationData.value = {
    success: false,
    client: null,
    seats: [],
    totalPrice: 0,
    ticketIds: [],
    errorMessage: ''
  }
}

// Función para imprimir los tickets (placeholder para futura implementación)
const printTickets = () => {
  // Aquí se implementaría la lógica de impresión
  console.log('Imprimiendo tickets:', saleConfirmationData.value.ticketIds)
  
  // Por ahora, simplemente cerrar el modal
  closeSaleConfirmationModal()
  
  // En el futuro, esto podría:
  // 1. Generar un PDF con los boletos
  // 2. Enviar a una impresora térmica
  // 3. Mostrar una vista previa de impresión
  // 4. Etc.
}

// Estado para modal de reserva
const showReservationModal = ref(false)
const reservationLoading = ref(false)
const selectedSeatForReservation = ref(null)
const formTouched = ref(false)
const reservationClientData = ref({
  firstname: '',
  lastname: '',
  document_id: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  is_minor: false
})

// Función para validar los datos del cliente para la reserva
const isReservationFormValid = computed(() => {
  return (
    reservationClientData.value.firstname.trim() !== '' &&
    reservationClientData.value.document_id.trim() !== ''
  )
})

// Manejar la reserva de asiento
const handleReserveSeat = (seat) => {
  if (!displayedTrip.value || !displayedTrip.value.id) {
    alert('No se puede reservar el asiento en este momento. Intente nuevamente.')
    return
  }
  
  // Inicializar el formulario
  reservationClientData.value = {
    firstname: '',
    lastname: '',
    document_id: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    is_minor: false
  }
  
  // Guardar el asiento seleccionado y mostrar el modal
  selectedSeatForReservation.value = seat
  showReservationModal.value = true
}

// Confirmar la reserva con los datos del modal
const confirmReservation = async () => {
  if (!isReservationFormValid.value || !selectedSeatForReservation.value) {
    return
  }
  
  reservationLoading.value = true
  
  try {
    const config = useRuntimeConfig()
    
    // Obtener el usuario autenticado para crear la reserva
    if (!authStore.user || !authStore.user.id) {
      alert('Debe iniciar sesión para reservar un asiento.')
      showReservationModal.value = false
      reservationLoading.value = false
      return
    }
    
    // Crear el cliente con los datos del formulario
    const clientApiUrl = `${config.public.apiBaseUrl}/clients`
    const clientResponse = await $fetch(clientApiUrl, {
      method: 'POST',
      body: reservationClientData.value
    })
    
    if (!clientResponse || !clientResponse.id) {
      throw new Error('No se pudo crear el cliente para la reserva.')
    }
    
    // Datos del ticket (reserva)
    const ticketData = {
      trip_id: displayedTrip.value.id,
      seat_id: selectedSeatForReservation.value.id,
      client_id: clientResponse.id,
      state: 'pending', // Estado "pending" para indicar reserva
      price: displayedTrip.value.price,
      payment_method: 'pending', // Método de pago provisional para reservas
      operator_user_id: authStore.user.id
    }
    
    console.log('Datos del ticket a enviar:', ticketData)
    console.log('Usuario autenticado:', authStore.user)
    console.log('Asiento seleccionado:', selectedSeatForReservation.value)
    console.log('Viaje:', displayedTrip.value)
    
    // Crear un ticket en estado "pending" (reserva)
    const apiUrl = `${config.public.apiBaseUrl}/tickets`
    const response = await $fetch(apiUrl, {
      method: 'POST',
      body: ticketData
    })
    
    if (response) {
      // Recargar los tickets para actualizar la vista
      await fetchSoldTickets()
      
      // Actualizar los datos del viaje para reflejar los cambios en los asientos
      if (tripId.value) {
        await tripStore.fetchTripById(tripId.value)
      }
      
      // Cerrar modal y mostrar mensaje de éxito
      showReservationModal.value = false
      alert(`El asiento ${selectedSeatForReservation.value.number} ha sido reservado exitosamente a nombre de ${reservationClientData.value.firstname} ${reservationClientData.value.lastname}.`)
    }
  } catch (error) {
    console.error('Error al reservar el asiento:', error)
    
    // Mostrar mensaje de error específico si está disponible
    let errorMessage = 'Error al reservar el asiento. Por favor, intente nuevamente.'
    
    if (error.response && error.response._data && error.response._data.detail) {
      errorMessage = error.response._data.detail
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    reservationLoading.value = false
  }
}

// Cerrar el modal de reserva
const closeReservationModal = () => {
  showReservationModal.value = false
  selectedSeatForReservation.value = null
  reservationLoading.value = false
}

const getPaymentMethodText = (paymentMethod) => {
  switch (paymentMethod) {
    case 'cash': return 'Efectivo'
    case 'card': return 'Tarjeta'
    case 'transfer': return 'Transferencia'
    case 'qr': return 'QR'
    default: return 'Desconocido'
  }
}

</script>




