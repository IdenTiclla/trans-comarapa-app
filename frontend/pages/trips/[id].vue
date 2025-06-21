<template>
  <div>
    <div class="py-6">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Botón de volver -->
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

        <!-- Estados de carga y error -->
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

        <!-- Contenido principal -->
        <div v-else-if="displayedTrip">
          <!-- Countdown del viaje -->
          <TripCountdown
            :trip-date-time="displayedTrip.trip_datetime"
            :departure-time="displayedTrip.departure_time"
          />

          <!-- Detalles del viaje -->
          <TripDetailsCard
            :trip="displayedTrip"
            :format-date="formatDate"
            :format-time="formatTime"
            :get-status-class="getStatusClass"
            :get-status-text="getStatusText"
          />

        </div>
      </div>
    </div>

    <!-- Panel de ayuda flotante para modo de cambio de asiento -->
    <div v-if="seatChangeMode" class="fixed bottom-4 right-4 z-40 max-w-sm">
      <div class="bg-white rounded-xl shadow-2xl border border-orange-200 p-4 transform transition-all duration-300">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Guía rápida</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Asientos verdes: disponibles
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Asientos rojos: ocupados
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Asientos amarillos: reservados
              </li>
            </ul>
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs text-gray-500 mb-2">Atajos de teclado:</p>
              <div class="flex flex-wrap gap-1">
                <span class="keyboard-shortcut">ESC</span>
                <span class="text-xs text-gray-500">Cancelar</span>
              </div>
            </div>
          </div>
          <button 
            @click="showHelpPanel = false"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mapa de asientos - Ancho completo -->
    <div v-if="displayedTrip" class="mt-6 mb-8">
      <div class="px-4 sm:px-6 lg:px-8 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
      </div>

      <!-- Indicador de modo cambio de asiento mejorado -->
      <div v-if="seatChangeMode" class="px-4 sm:px-6 lg:px-8 mb-4">
        <div class="relative p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl shadow-lg">
          <!-- Icono animado de atención -->
          <div class="absolute -top-3 left-6">
            <div class="bg-orange-500 text-white p-2 rounded-full shadow-lg animate-pulse">
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-start space-x-4">
              <!-- Información del cambio -->
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <!-- Indicador de paso -->
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white mr-3">
                    Paso 1 de 2
                  </span>
                  <h3 class="text-lg font-bold text-orange-900">Cambio de Asiento en Progreso</h3>
                </div>
                
                <!-- Información del cliente y asiento actual -->
                <div class="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Cliente</p>
                        <p class="text-sm text-gray-600">{{ seatChangeTicket?.client?.firstname || 'Cliente' }} {{ seatChangeTicket?.client?.lastname || '' }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center">
                      <div class="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Asiento Actual</p>
                        <p class="text-sm text-gray-600">Asiento {{ seatChangeTicket?.seat?.seat_number }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Instrucciones con animación -->
                <div class="flex items-center space-x-2 text-orange-800">
                  <div class="animate-bounce">
                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 13l3 3 7-7" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium">Haz clic en un asiento libre (verde) para continuar</p>
                </div>
              </div>
            </div>
            
            <!-- Botón de cancelar mejorado -->
            <div class="flex flex-col items-end space-y-2">
              <button
                @click="cancelSeatChange"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-700 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              
              <!-- Atajo de teclado -->
              <span class="text-xs text-orange-600 bg-white/60 px-2 py-1 rounded">
                ESC para cancelar
              </span>
            </div>
          </div>
        </div>
      </div>

      <BusSeatMapPrint
        :key="`seat-map-${displayedTrip?.id}-${soldTickets?.length || 0}-${seatMapUpdateKey}`"
        :trip="displayedTrip" 
        :tickets="soldTickets"
        :selection-enabled="true"
        :reserved_seat_numbers="reservedSeatNumbers"
        :enable-context-menu="true"
        :initial-selected-seats="selectedSeatsForSale"
        :seat-change-mode="seatChangeMode"
        :seat-change-ticket="seatChangeTicket"
        :class="{ 'seat-change-active': seatChangeMode }"
        @cancel-reservation="handleCancelReservation"
        @confirm-sale="handleConfirmSale"
        @view-details="handleViewSeatDetails"
        @change-seat="handleChangeSeat"
        @reschedule-trip="handleRescheduleTrip"
        @sell-ticket="handleSellTicket"
        @reserve-seat="handleReserveSeat"
        @selection-change="handleSelectionChange"
      />
      
      <!-- Panel de acciones rápidas para selección de asientos -->
      <div v-if="selectedSeatsForSale.length > 0 && !seatChangeMode" class="mt-4 px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-medium text-blue-900">
                  {{ selectedSeatsForSale.length }} asiento{{ selectedSeatsForSale.length !== 1 ? 's' : '' }} seleccionado{{ selectedSeatsForSale.length !== 1 ? 's' : '' }}
                </h4>
                <p class="text-xs text-blue-700">
                  Asientos: {{ selectedSeatsForSale.map(seat => seat.number).join(', ') }}
                </p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Botones de acción rápida -->
              <button
                @click="handleSellTicket()"
                class="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Vender <span class="keyboard-shortcut ml-1">V</span>
              </button>
              
              <button
                @click="handleReserveSeat()"
                class="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-yellow-600 border border-transparent rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Reservar <span class="keyboard-shortcut ml-1">R</span>
              </button>
              
              <button
                @click="selectedSeatsForSale = []"
                class="inline-flex items-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar <span class="keyboard-shortcut ml-1">C</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resto del contenido -->
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="displayedTrip">
        <!-- Sección de boletos vendidos -->
          <SoldTicketsSection
            :sold-tickets="soldTickets"
            :is-loading-sold-tickets="isLoadingSoldTickets"
            :sold-tickets-error="soldTicketsError"
            :show-sold-tickets="showSoldTickets"
            :grouped-sold-tickets="groupedSoldTickets"
            :show-tickets-by-state="showTicketsByState"
            @toggle-sold-tickets="toggleSoldTickets"
            @toggle-tickets-by-state="toggleTicketsByState"
            @cancel-ticket="openCancelModal"
            @view-ticket-details="openDetailsModal"
          />

          <!-- Botón Ver Planilla de Pasajeros -->
          <div v-if="displayedTrip" class="mt-6 flex justify-center">
            <a
              :href="`/trips/${tripId}-sheet`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 no-underline"
            >
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ver Planilla de Pasajeros
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <!-- Sección de paquetes -->
          <PackagesSection
            :packages="packages"
            :is-loading-packages="isLoadingPackages"
            :packages-error="packagesError"
            :show-packages="showPackages"
            :grouped-packages="groupedPackages"
            :show-packages-by-status="showPackagesByStatus"
            :trip="displayedTrip"
            @toggle-packages="togglePackages"
            @toggle-packages-by-status="togglePackagesByStatus"
            @open-package-modal="openPackageModal"
          />

      </div>
    </div>
  </div>
  
  <!-- Modales -->
  <TicketModal
    v-if="showTicketModal"
    :show="showTicketModal"
    :ticket="selectedTicket"
    :trip="displayedTrip"
    :modal-type="modalType"
    :cancelling="cancellingReservation"
    @close="closeModal"
    @confirm-cancel="confirmCancelReservation"
    @print="printTicket"
  />

  <!-- Modal para registro de paquete -->
  <PackageRegistrationModal
    :showModal="showPackageModal"
    :trip="displayedTrip"
    @close="closePackageModal"
    @package-registered="handlePackageRegistered"
  />

  <!-- Modal de notificación general -->
  <NotificationModal
    v-if="showNotificationModal"
    :show="showNotificationModal"
    :type="notificationData.type"
    :title="notificationData.title"
    :message="notificationData.message"
    @close="closeNotificationModal"
  />

  <!-- Modal para venta/reserva de boleto -->
  <TicketSaleModal
    v-if="showTicketSaleModal"
    :show="showTicketSaleModal"
    :selected-seats="selectedSeatsForSale"
    :action-type="saleActionType"
    :trip="displayedTrip"
    @close="closeTicketSaleModal"
    @ticket-created="handleTicketCreated"
  />

  <!-- Modal de confirmación para cambio de asiento mejorado -->
  <teleport to="body">
    <div v-if="showSeatChangeConfirmModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100">
        <div class="p-8">
          <!-- Header con icono mejorado -->
          <div class="text-center mb-6">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mb-4">
              <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            
            <!-- Indicador de paso -->
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-3">
              <span class="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Paso 2 de 2
            </div>
            
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              Confirmar Cambio de Asiento
            </h3>
            <p class="text-gray-600">Revisa los detalles antes de confirmar</p>
          </div>
          
          <!-- Detalles del cambio con diseño mejorado -->
          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <!-- Información del cliente -->
            <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">Cliente</p>
                  <p class="text-sm text-gray-600">{{ seatChangeTicket?.client?.firstname }} {{ seatChangeTicket?.client?.lastname }}</p>
                </div>
              </div>
            </div>
            
            <!-- Comparación visual de asientos -->
            <div class="flex items-center justify-center space-x-8">
              <!-- Asiento actual -->
              <div class="text-center">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Asiento Actual</p>
                <div class="relative">
                  <!-- Componente visual del asiento actual -->
                  <div class="w-20 h-24 bg-gradient-to-b from-red-400 to-red-600 rounded-t-3xl rounded-b-lg shadow-lg border-2 border-red-700 mx-auto relative overflow-hidden">
                    <!-- Respaldo del asiento -->
                    <div class="absolute top-1 left-2 right-2 h-16 bg-gradient-to-b from-red-300 to-red-500 rounded-t-2xl border border-red-600"></div>
                    <!-- Asiento -->
                    <div class="absolute bottom-1 left-1 right-1 h-6 bg-gradient-to-b from-red-300 to-red-500 rounded border border-red-600"></div>
                    <!-- Número del asiento -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white font-bold text-lg drop-shadow-md">{{ seatChangeTicket?.seat?.seat_number }}</span>
                    </div>
                    <!-- Indicador de ocupado -->
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center border-2 border-white">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-sm font-medium text-red-600 mt-2">Ocupado</p>
                </div>
              </div>
              
              <!-- Flecha de cambio animada -->
              <div class="flex flex-col items-center">
                <div class="animate-pulse">
                  <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <p class="text-xs text-orange-600 font-medium mt-2">CAMBIAR A</p>
              </div>
              
              <!-- Nuevo asiento -->
              <div class="text-center">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Nuevo Asiento</p>
                <div class="relative">
                  <!-- Componente visual del nuevo asiento -->
                  <div class="w-20 h-24 bg-gradient-to-b from-green-400 to-green-600 rounded-t-3xl rounded-b-lg shadow-lg border-2 border-green-700 mx-auto relative overflow-hidden">
                    <!-- Respaldo del asiento -->
                    <div class="absolute top-1 left-2 right-2 h-16 bg-gradient-to-b from-green-300 to-green-500 rounded-t-2xl border border-green-600"></div>
                    <!-- Asiento -->
                    <div class="absolute bottom-1 left-1 right-1 h-6 bg-gradient-to-b from-green-300 to-green-500 rounded border border-green-600"></div>
                    <!-- Número del asiento -->
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-white font-bold text-lg drop-shadow-md">{{ newSelectedSeat?.number }}</span>
                    </div>
                    <!-- Indicador de disponible -->
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-700 rounded-full flex items-center justify-center border-2 border-white">
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-sm font-medium text-green-600 mt-2">Disponible</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Advertencia -->
          <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-orange-800">¿Confirmas este cambio?</p>
                <p class="text-xs text-orange-600 mt-1">Esta acción actualizará el boleto del cliente inmediatamente.</p>
              </div>
            </div>
          </div>
          
          <!-- Botones de acción mejorados -->
          <div class="flex space-x-4">
            <button
              @click="cancelSeatChange"
              :disabled="seatChangeLoading"
              class="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              <span class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </span>
            </button>
            
            <button
              @click="confirmSeatChange"
              :disabled="seatChangeLoading"
              class="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-transparent rounded-xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              <span v-if="seatChangeLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando cambio...
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Confirmar Cambio
              </span>
            </button>
          </div>
          
          <!-- Atajos de teclado -->
          <div class="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <span class="bg-gray-100 px-2 py-1 rounded">ESC para cancelar</span>
            <span class="bg-gray-100 px-2 py-1 rounded">Enter para confirmar</span>
          </div>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Modal de confirmación para confirmar venta -->
  <teleport to="body">
    <div v-if="showConfirmSaleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div class="text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
              Confirmar Venta
            </h3>
            <div class="text-sm text-gray-500 mb-6 space-y-2">
              <p><strong>Cliente:</strong> {{ ticketToConfirm?.client?.firstname }} {{ ticketToConfirm?.client?.lastname }}</p>
              <p><strong>Asiento:</strong> {{ ticketToConfirm?.seat?.seat_number }}</p>
              <p><strong>Precio:</strong> Bs. {{ ticketToConfirm?.price }}</p>
              <p class="text-green-600 font-medium">¿Confirmar esta venta? El estado del boleto cambiará de "Reservado" a "Confirmado".</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="closeConfirmSaleModal"
              :disabled="confirmingSale"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="executeConfirmSale"
              :disabled="confirmingSale"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <span v-if="confirmingSale" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirmando...
              </span>
              <span v-else>Confirmar Venta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTripStore } from '@/stores/tripStore'
import { useAuthStore } from '@/stores/auth'
import { useTripDetails } from '@/composables/useTripDetails'
import { changeSeat } from '@/services/ticketService'
import AppButton from '@/components/AppButton.vue'
import BusSeatMapPrint from '@/components/BusSeatMapPrint.vue'
import TripCountdown from '@/components/TripCountdown.vue'
import TripDetailsCard from '@/components/TripDetailsCard.vue'
import SoldTicketsSection from '@/components/SoldTicketsSection.vue'
import PackagesSection from '@/components/PackagesSection.vue'
import TicketModal from '@/components/TicketModal.vue'
import TicketSaleModal from '@/components/TicketSaleModal.vue'
import PackageRegistrationModal from '@/components/PackageRegistrationModal.vue'
import NotificationModal from '@/components/NotificationModal.vue'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()

const tripId = computed(() => parseInt(route.params.id))
const displayedTrip = computed(() => tripStore.currentTrip)

// Usar el composable para manejar los detalles del viaje
const {
  soldTickets,
  isLoadingSoldTickets,
  soldTicketsError,
  showSoldTickets,
  showTicketsByState,
  packages,
  isLoadingPackages,
  packagesError,
  showPackages,
  showPackagesByStatus,
  groupedSoldTickets,
  groupedPackages,
  reservedSeatNumbers,
  fetchSoldTickets,
  fetchPackages,
  toggleSoldTickets,
  toggleTicketsByState,
  togglePackages,
  togglePackagesByStatus,
  clearState,
  initializeAllSections,
  formatDate,
  formatTime,
  getStatusClass,
  getStatusText
} = useTripDetails()

// Estado para modales y selección de asientos
const showTicketModal = ref(false)
const showTicketSaleModal = ref(false)
const selectedTicket = ref(null)
const selectedSeatForSale = ref(null)
const saleActionType = ref('sell')
const modalType = ref('details')
const cancellingReservation = ref(false)
const selectedSeatsForSale = ref([])
const showPackageModal = ref(false)

// Estado para cambio de asiento
const seatChangeMode = ref(false)
const seatChangeTicket = ref(null)
const showSeatChangeConfirmModal = ref(false)
const newSelectedSeat = ref(null)
const seatChangeLoading = ref(false)
const seatMapUpdateKey = ref(0) // Key para forzar re-renderizado del mapa de asientos
const showHelpPanel = ref(true) // Panel de ayuda para el modo de cambio

// Estado para confirmación de venta
const showConfirmSaleModal = ref(false)
const ticketToConfirm = ref(null)
const confirmingSale = ref(false)

// Estado para notificaciones
const showNotificationModal = ref(false)
const notificationData = ref({
  type: 'success',
  title: 'Éxito',
  message: 'La operación se ha completado exitosamente.'
})

// Función para mostrar notificaciones
const showNotification = (type, title, message) => {
  notificationData.value = { type, title, message }
  showNotificationModal.value = true
}

// Manejo de atajos de teclado
const handleKeyPress = (event) => {
  // Solo manejar atajos si no estamos en un input o textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return
  }
  
  switch (event.key) {
    case 'Escape':
      if (seatChangeMode.value) {
        cancelSeatChange()
      } else if (showSeatChangeConfirmModal.value) {
        cancelSeatChange()
      } else if (showTicketSaleModal.value) {
        closeTicketSaleModal()
      } else if (showTicketModal.value) {
        closeModal()
      }
      break
    case 'Enter':
      if (showSeatChangeConfirmModal.value && !seatChangeLoading.value) {
        confirmSeatChange()
      }
      break
    case 'v':
    case 'V':
      if (event.ctrlKey || event.metaKey) return // Evitar conflicto con pegar
      if (selectedSeatsForSale.value.length > 0 && !seatChangeMode.value) {
        handleSellTicket()
      }
      break
    case 'r':
    case 'R':
      if (event.ctrlKey || event.metaKey) return // Evitar conflicto con recargar
      if (selectedSeatsForSale.value.length > 0 && !seatChangeMode.value) {
        handleReserveSeat()
      }
      break
    case 'c':
    case 'C':
      if (event.ctrlKey || event.metaKey) return // Evitar conflicto con copiar
      if (selectedSeatsForSale.value.length > 0 && !seatChangeMode.value) {
        selectedSeatsForSale.value = []
      }
      break
  }
}

// Cargar datos al montar el componente
onMounted(async () => {
  // Limpiar estado anterior
  clearState()
  
  // Agregar eventos de teclado
  document.addEventListener('keydown', handleKeyPress)
  
  if (isNaN(tripId.value)) {
    console.error("Invalid trip ID")
    router.push('/trips')
    return
  }
  
  try {
    await tripStore.fetchTripById(tripId.value)
    await nextTick()
    
    if (displayedTrip.value && displayedTrip.value.id) {
      console.log('Cargando datos para el viaje:', displayedTrip.value.id)
      await Promise.all([
        fetchSoldTickets(displayedTrip.value.id),
        fetchPackages(displayedTrip.value.id)
      ])
    } else {
      console.error('Trip not loaded properly after fetchTripById')
    }
  } catch (error) {
    console.error('Error loading trip:', error)
  }
})

// Limpiar estado al desmontar el componente
onBeforeUnmount(() => {
  clearState()
  // Remover eventos de teclado
  document.removeEventListener('keydown', handleKeyPress)
})

// Watchers para recargar datos cuando cambie el trip
watch(() => displayedTrip.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    if (showSoldTickets.value) {
      fetchSoldTickets(newId)
    }
    if (showPackages.value) {
      fetchPackages(newId)
    }
  }
}, { immediate: false })

// Funciones para manejar eventos del mapa de asientos
const handleSelectionChange = (selectedSeats) => {
  console.log('handleSelectionChange called with:', selectedSeats)
  
  // Si estamos en modo de cambio de asiento
  if (seatChangeMode.value) {
    if (selectedSeats.length === 1) {
      const selectedSeat = selectedSeats[0]
      // Verificar que el asiento esté disponible
      if (!selectedSeat.occupied && selectedSeat.status !== 'reserved') {
        newSelectedSeat.value = selectedSeat
        showHelpPanel.value = false // Ocultar panel de ayuda
        showSeatChangeConfirmModal.value = true
      } else {
        showNotification('error', 'Asiento no disponible', 
          'Este asiento ya está ocupado o reservado. Por favor selecciona un asiento verde (disponible).')
        // Limpiar selección automáticamente
        selectedSeatsForSale.value = []
      }
    } else if (selectedSeats.length > 1) {
      showNotification('error', 'Selección múltiple no permitida', 
        'Solo puedes seleccionar un asiento para el cambio. Haz clic en un solo asiento disponible.')
      // Limpiar selección automáticamente
      selectedSeatsForSale.value = []
    } else if (selectedSeats.length === 0) {
      // Si se deselecciona todo, solo registrar el evento
      console.log('Seat deselected in change mode')
    }
    return
  }
  
  // Comportamiento normal cuando no estamos en modo de cambio de asiento
  selectedSeatsForSale.value = selectedSeats
  console.log('Updated selectedSeatsForSale to:', selectedSeatsForSale.value)
}

const handleCancelReservation = async (seat) => {
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && t.state === 'pending'
  )
  
  if (!ticket) {
    showNotification('error', 'Ticket no encontrado', 'No se encontró un ticket reservado para este asiento.')
    return
  }
  
  selectedTicket.value = ticket
  modalType.value = 'cancel'
  showTicketModal.value = true
}

const handleConfirmSale = async (seat) => {
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && t.state === 'pending'
  )
  
  if (!ticket) {
    showNotification('error', 'Ticket no encontrado', 'No se encontró un ticket reservado para este asiento.')
    return
  }
  
  // Guardar el ticket y mostrar el modal de confirmación
  ticketToConfirm.value = ticket
  showConfirmSaleModal.value = true
}

const handleViewSeatDetails = (seat) => {
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number
  )
  
  if (!ticket) {
    showNotification('error', 'Ticket no encontrado', 'No se encontró un ticket para este asiento.')
    return
  }
  
  selectedTicket.value = ticket
  modalType.value = 'details'
  showTicketModal.value = true
}

const handleChangeSeat = (seat) => {
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && 
    (t.state === 'confirmed' || t.state === 'sold' || t.state === 'paid')
  )
  
  if (!ticket) {
    showNotification('error', 'Ticket no encontrado', 'No se encontró un ticket vendido para este asiento.')
    return
  }
  
  // Activar modo de cambio de asiento
  seatChangeMode.value = true
  seatChangeTicket.value = ticket
  showHelpPanel.value = true
  
  // Limpiar cualquier selección anterior
  selectedSeatsForSale.value = []
  
  // Mostrar notificación mejorada
  showNotification('info', 'Modo Cambio de Asiento Activado', 
    `Ahora puedes seleccionar un asiento disponible (verde) para cambiar el ticket de ${ticket.client?.firstname || 'Cliente'}.`
  )
}

const handleRescheduleTrip = (seat) => {
  const ticket = soldTickets.value.find(t => 
    t.seat && t.seat.seat_number === seat.number && 
    (t.state === 'confirmed' || t.state === 'paid')
  )
  
  if (!ticket) {
    showNotification('error', 'Ticket no encontrado', 'No se encontró un ticket para este asiento.')
    return
  }
  
  selectedTicket.value = ticket
  modalType.value = 'details'
  showTicketModal.value = true
}

const handleSellTicket = (seatOrSeats) => {
  // Manejar tanto asiento individual como array de asientos
  const seats = Array.isArray(seatOrSeats) ? seatOrSeats : [seatOrSeats]
  console.log('handleSellTicket called with:', seats)
  console.log('Current selectedSeatsForSale:', selectedSeatsForSale.value)
  
  // Si ya hay asientos seleccionados, mantenerlos, sino usar los que vienen del evento
  if (selectedSeatsForSale.value.length === 0) {
    selectedSeatsForSale.value = seats
  }
  
  saleActionType.value = 'sell'
  showTicketSaleModal.value = true
}

const handleReserveSeat = (seatOrSeats) => {
  // Manejar tanto asiento individual como array de asientos
  const seats = Array.isArray(seatOrSeats) ? seatOrSeats : [seatOrSeats]
  console.log('handleReserveSeat called with:', seats)
  console.log('Current selectedSeatsForSale:', selectedSeatsForSale.value)
  
  // Si ya hay asientos seleccionados, mantenerlos, sino usar los que vienen del evento
  if (selectedSeatsForSale.value.length === 0) {
    selectedSeatsForSale.value = seats
  }
  
  saleActionType.value = 'reserve'
  showTicketSaleModal.value = true
}

// Funciones para cambio de asiento
const confirmSeatChange = async () => {
  if (!seatChangeTicket.value || !newSelectedSeat.value) {
    return
  }
  
  seatChangeLoading.value = true
  
  try {
    await changeSeat(seatChangeTicket.value.id, newSelectedSeat.value.id)
    
    showNotification('success', '¡Cambio exitoso!', 
      `El asiento de ${seatChangeTicket.value.client?.firstname || 'Cliente'} se cambió del asiento ${seatChangeTicket.value.seat?.seat_number} al asiento ${newSelectedSeat.value.number}.`
    )
    
    // Pequeño delay para asegurar que la BD se haya actualizado
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Recargar completamente los datos del viaje
    if (displayedTrip.value?.id) {
      await Promise.all([
        tripStore.fetchTripById(displayedTrip.value.id), // Actualizar datos del viaje
        fetchSoldTickets(displayedTrip.value.id),        // Actualizar tickets vendidos
        fetchPackages(displayedTrip.value.id)            // Actualizar paquetes por si acaso
      ])
      
      // Forzar re-renderizado del mapa de asientos
      seatMapUpdateKey.value++
    }
    
  } catch (error) {
    console.error('Error al cambiar asiento:', error)
    showNotification('error', 'Error al cambiar asiento', 
      error.message || 'No se pudo cambiar el asiento. Por favor intenta nuevamente.'
    )
  } finally {
    seatChangeLoading.value = false
    clearSeatChangeState() // Usar función de limpieza sin notificación
  }
}

// Función para limpiar el estado sin mostrar notificación
const clearSeatChangeState = () => {
  seatChangeMode.value = false
  seatChangeTicket.value = null
  newSelectedSeat.value = null
  showSeatChangeConfirmModal.value = false
  showHelpPanel.value = false
  selectedSeatsForSale.value = []
}

const cancelSeatChange = () => {
  clearSeatChangeState()
  
  // Mostrar notificación de cancelación solo cuando se cancela manualmente
  showNotification('info', 'Cambio de asiento cancelado', 'Has salido del modo de cambio de asiento.')
}

// Funciones para confirmación de venta
const executeConfirmSale = async () => {
  if (!ticketToConfirm.value) return
  
  confirmingSale.value = true
  
  try {
    // Importar el servicio
    const { confirmSale } = await import('@/services/ticketService')
    
    // Confirmar la venta
    await confirmSale(ticketToConfirm.value.id)
    
    // Actualizar el estado local del ticket
    const index = soldTickets.value.findIndex(t => t.id === ticketToConfirm.value.id)
    if (index !== -1) {
      soldTickets.value[index].state = 'confirmed'
    }
    
    // Recargar los datos para asegurar consistencia
    await fetchSoldTickets(tripId.value)
    
    // Actualizar los datos del viaje
    if (tripId.value) {
      await tripStore.fetchTripById(tripId.value)
    }
    
    // Forzar re-renderizado del mapa de asientos
    seatMapUpdateKey.value++
    
    // Mostrar mensaje de éxito
    showNotification('success', 'Venta confirmada', 
      `La reserva del asiento ${ticketToConfirm.value.seat?.seat_number} ha sido confirmada como venta exitosamente.`)
    
    // Cerrar el modal
    closeConfirmSaleModal()
    
  } catch (error) {
    console.error('Error al confirmar la venta:', error)
    showNotification('error', 'Error al confirmar venta', 
      'No se pudo confirmar la venta. Por favor intenta nuevamente.')
  } finally {
    confirmingSale.value = false
  }
}

const closeConfirmSaleModal = () => {
  showConfirmSaleModal.value = false
  ticketToConfirm.value = null
  confirmingSale.value = false
}

// Funciones para modales
const openCancelModal = (ticket) => {
  selectedTicket.value = ticket
  modalType.value = 'cancel'
  showTicketModal.value = true
}

const openDetailsModal = (ticket) => {
  selectedTicket.value = ticket
  modalType.value = 'details'
  showTicketModal.value = true
}

const closeModal = () => {
  showTicketModal.value = false
  selectedTicket.value = null
  cancellingReservation.value = false
}

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
    }
    
    // Recargar los tickets para actualizar la vista
    await fetchSoldTickets(tripId.value)
    
    // Actualizar los datos del viaje
    if (tripId.value) {
      await tripStore.fetchTripById(tripId.value)
    }
    
    // Forzar re-renderizado del mapa de asientos
    seatMapUpdateKey.value++
    
    // Cerrar el modal
    showTicketModal.value = false
    selectedTicket.value = null
    
    // Mostrar mensaje de éxito
    showNotification('success', 'Reserva cancelada', 'La reserva ha sido cancelada exitosamente.')
  } catch (error) {
    console.error('Error al cancelar la reserva:', error)
    showNotification('error', 'Error al cancelar', 'Error al cancelar la reserva. Por favor, intente nuevamente.')
  } finally {
    cancellingReservation.value = false
  }
}

const printTicket = () => {
  if (!selectedTicket.value) {
    console.error('No hay ticket seleccionado para imprimir')
    return
  }
  
  window.print()
}

// Funciones para paquetes
const openPackageModal = () => {
  showPackageModal.value = true
}

const closePackageModal = () => {
  showPackageModal.value = false
}

const handlePackageRegistered = async (newPackage) => {
  console.log('Paquete registrado exitosamente:', newPackage)
  
  await fetchPackages(displayedTrip.value.id)
  
  if (!showPackages.value) {
    showPackages.value = true
  }
}

// Funciones para notificaciones
const closeNotificationModal = () => {
  showNotificationModal.value = false
}

const closeTicketSaleModal = () => {
  console.log('closeTicketSaleModal called, selectedSeatsForSale before:', selectedSeatsForSale.value)
  showTicketSaleModal.value = false
  // Don't clear selectedSeatsForSale when closing modal - keep selection
  console.log('closeTicketSaleModal called, selectedSeatsForSale after:', selectedSeatsForSale.value)
}

const handleTicketCreated = async (ticket) => {
  // Recargar los tickets vendidos
  await fetchSoldTickets(tripId.value)
  
  // Actualizar los datos del viaje
  if (tripId.value) {
    await tripStore.fetchTripById(tripId.value)
  }
  
  // Forzar re-renderizado del mapa de asientos
  seatMapUpdateKey.value++
  
  // Limpiar la selección de asientos después de la venta exitosa
  selectedSeatsForSale.value = []
  
  // Mostrar mensaje de éxito
  const actionText = saleActionType.value === 'sell' ? 'vendido' : 'reservado'
  showNotification('success', 'Éxito', `El boleto ha sido ${actionText} exitosamente.`)
}


// Función para ir a la planilla de pasajeros
const goToPassengerSheet = () => {
  console.log('goToPassengerSheet called, tripId:', tripId.value)
  console.log('Navigating to:', `/trips/${tripId.value}/passenger-sheet`)
  router.push(`/trips/${tripId.value}/passenger-sheet`)
}
</script>

<style scoped>
/* Estilos para el modo de cambio de asiento */
.seat-change-active {
  position: relative;
  overflow: hidden;
}

.seat-change-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 165, 0, 0.05) 25%, transparent 25%), 
              linear-gradient(-45deg, rgba(255, 165, 0, 0.05) 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, rgba(255, 165, 0, 0.05) 75%), 
              linear-gradient(-45deg, transparent 75%, rgba(255, 165, 0, 0.05) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  animation: moveStripes 3s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes moveStripes {
  0% {
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }
  100% {
    background-position: 20px 20px, 20px 30px, 30px 10px, 10px 20px;
  }
}

/* Animación suave para los elementos del modal */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Estilos para resaltar los asientos disponibles en modo cambio */
:deep(.seat-change-active .seat-available) {
  animation: pulseGreen 2s ease-in-out infinite;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
}

@keyframes pulseGreen {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.6);
  }
}

/* Mejoras de accesibilidad */
.seat-change-active :deep(.seat) {
  transition: all 0.2s ease;
}

.seat-change-active :deep(.seat:hover) {
  transform: scale(1.1);
  z-index: 10;
}

/* Indicadores visuales para atajos de teclado */
.keyboard-shortcut {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
  margin: 0 2px;
}
</style>




