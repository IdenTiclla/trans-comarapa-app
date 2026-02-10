<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Barra superior compacta -->
    <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div class="flex items-center justify-between h-14">
          <!-- Izquierda: Volver + info de ruta -->
          <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              @click="router.back()"
              class="flex-shrink-0 p-1.5 -ml-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Volver"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Info de ruta compacta -->
            <div v-if="displayedTrip" class="flex items-center gap-1.5 min-w-0">
              <span class="text-sm font-bold text-gray-800 truncate hidden sm:inline">{{ displayedTrip.route?.origin }}</span>
              <span class="text-sm font-bold text-gray-800 truncate sm:hidden">{{ displayedTrip.route?.origin?.substring(0, 3) }}</span>
              <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span class="text-sm font-bold text-gray-800 truncate hidden sm:inline">{{ displayedTrip.route?.destination }}</span>
              <span class="text-sm font-bold text-gray-800 truncate sm:hidden">{{ displayedTrip.route?.destination?.substring(0, 3) }}</span>
              <span class="hidden md:inline-flex items-center ml-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {{ displayedTrip.departure_time ? formatTimeAmPm(displayedTrip.departure_time) : '' }}
              </span>
            </div>
          </div>

          <!-- Centro: Countdown compacto -->
          <div v-if="displayedTrip" class="hidden sm:flex items-center">
            <TripCountdown
              :trip-date-time="displayedTrip.trip_datetime"
              :departure-time="displayedTrip.departure_time"
              :compact="true"
            />
          </div>

          <!-- Derecha: Acciones -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <a
              v-if="displayedTrip"
              :href="`/trips/${tripId}-sheet`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors no-underline"
            >
              <svg class="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="hidden sm:inline">Planilla</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Countdown movil (solo visible en sm y menor) -->
    <div v-if="displayedTrip" class="sm:hidden px-3 pt-3">
      <TripCountdown
        :trip-date-time="displayedTrip.trip_datetime"
        :departure-time="displayedTrip.departure_time"
        :compact="true"
      />
    </div>

    <!-- Estados de carga y error -->
    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
      <div v-if="tripStore.isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500 text-sm">Cargando viaje...</p>
      </div>

      <div v-else-if="tripStore.error" class="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium text-red-800">{{ tripStore.error }}</p>
        </div>
      </div>
    </div>

    <!-- Contenido principal: Mapa de asientos -->
    <div v-if="displayedTrip && !tripStore.isLoading" class="pt-3 pb-8">

      <!-- Panel de ayuda flotante para modo de cambio de asiento -->
      <div v-if="seatChangeMode" class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-40 w-auto sm:w-full sm:max-w-sm">
        <div class="bg-white rounded-xl shadow-2xl border border-orange-200 p-4">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900 mb-1">Cambio de asiento</h4>
              <p class="text-xs text-gray-600 mb-2">Selecciona un asiento disponible (verde)</p>
              <div class="flex flex-wrap gap-1">
                <span class="keyboard-shortcut">ESC</span>
                <span class="text-xs text-gray-500">Cancelar</span>
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

      <!-- Indicador de modo cambio de asiento -->
      <div v-if="seatChangeMode" class="px-3 sm:px-4 lg:px-6 mb-3">
        <div class="max-w-screen-2xl mx-auto">
          <div class="relative p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="flex-shrink-0 bg-orange-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">Paso 1 de 2</span>
                    <h3 class="text-sm sm:text-base font-bold text-orange-900">Cambio de Asiento</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-orange-700">
                    <strong>{{ seatChangeTicket?.client?.firstname }} {{ seatChangeTicket?.client?.lastname }}</strong>
                    - Asiento {{ seatChangeTicket?.seat?.seat_number }}
                    <span class="hidden sm:inline">| Selecciona un asiento libre para continuar</span>
                  </p>
                </div>
              </div>
              <button
                @click="cancelSeatChange"
                class="self-start sm:self-center inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-700 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all shadow-sm flex-shrink-0"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mapa de asientos con edicion de personal integrada -->
      <div class="px-3 sm:px-4 lg:px-6">
        <div class="max-w-screen-2xl mx-auto">
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
            :editable="true"
            :drivers="driverStore.drivers"
            :assistants="assistantStore.assistants"
            :editing-driver="editingDriver"
            :editing-assistant="editingAssistant"
            :selected-driver-id="selectedDriverId"
            :selected-assistant-id="selectedAssistantId"
            :saving-driver="savingDriver"
            :saving-assistant="savingAssistant"
            @start-edit-driver="startEditDriver"
            @save-driver="saveDriver"
            @cancel-edit-driver="cancelEditDriver"
            @start-edit-assistant="startEditAssistant"
            @save-assistant="saveAssistant"
            @cancel-edit-assistant="cancelEditAssistant"
            @update:selectedDriverId="selectedDriverId = $event"
            @update:selectedAssistantId="selectedAssistantId = $event"
            @cancel-reservation="handleCancelReservation"
            @confirm-sale="handleConfirmSale"
            @view-details="handleViewSeatDetails"
            @change-seat="handleChangeSeat"
            @reschedule-trip="handleRescheduleTrip"
            @sell-ticket="handleSellTicket"
            @reserve-seat="handleReserveSeat"
            @selection-change="handleSelectionChange"
          />
        </div>
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
import { useDriverStore } from '@/stores/driverStore'
import { useAssistantStore } from '@/stores/assistantStore'
import { useTripDetails } from '@/composables/useTripDetails'
import { changeSeat } from '@/services/ticketService'
import { updateTrip, getTripById } from '@/services/tripService'
import BusSeatMapPrint from '@/components/BusSeatMapPrint.vue'
import TripCountdown from '@/components/TripCountdown.vue'
import TicketModal from '@/components/TicketModal.vue'
import TicketSaleModal from '@/components/TicketSaleModal.vue'
import NotificationModal from '@/components/NotificationModal.vue'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()
const authStore = useAuthStore()
const driverStore = useDriverStore()
const assistantStore = useAssistantStore()

const tripId = computed(() => parseInt(route.params.id))
const displayedTrip = computed(() => tripStore.currentTrip)

// Formatear hora con AM/PM para la barra compacta
const formatTimeAmPm = (timeString) => {
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

// Usar el composable para manejar los detalles del viaje
const {
  soldTickets,
  reservedSeatNumbers,
  fetchSoldTickets,
  clearState,
  formatDate,
  formatTime,
  getStatusClass,
  getStatusText
} = useTripDetails()

// Estado para modales y selección de asientos
const showTicketModal = ref(false)
const showTicketSaleModal = ref(false)
const selectedTicket = ref(null)
const saleActionType = ref('sell')
const modalType = ref('details')
const cancellingReservation = ref(false)
const selectedSeatsForSale = ref([])

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

// Estado para edicion inline de conductor/asistente
const editingDriver = ref(false)
const editingAssistant = ref(false)
const selectedDriverId = ref(null)
const selectedAssistantId = ref(null)
const savingDriver = ref(false)
const savingAssistant = ref(false)

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

// Funciones para edicion inline de conductor/asistente
const startEditDriver = () => {
  selectedDriverId.value = displayedTrip.value?.driver_id || null
  editingDriver.value = true
}

const cancelEditDriver = () => {
  editingDriver.value = false
  selectedDriverId.value = null
}

const refreshTripSilently = async () => {
  // Refrescar datos del viaje sin activar isLoading global
  const updatedTrip = await getTripById(tripId.value)
  tripStore.currentTrip = updatedTrip
}

const saveDriver = async () => {
  savingDriver.value = true
  try {
    await updateTrip(tripId.value, {
      driver_id: selectedDriverId.value || null
    })
    await refreshTripSilently()
    editingDriver.value = false
    showNotification('success', 'Conductor actualizado', 'El conductor ha sido asignado correctamente.')
  } catch (error) {
    console.error('Error al actualizar conductor:', error)
    showNotification('error', 'Error', error.data?.detail || error.message || 'No se pudo actualizar el conductor.')
  } finally {
    savingDriver.value = false
  }
}

const startEditAssistant = () => {
  selectedAssistantId.value = displayedTrip.value?.assistant_id || null
  editingAssistant.value = true
}

const cancelEditAssistant = () => {
  editingAssistant.value = false
  selectedAssistantId.value = null
}

const saveAssistant = async () => {
  savingAssistant.value = true
  try {
    await updateTrip(tripId.value, {
      assistant_id: selectedAssistantId.value || null
    })
    await refreshTripSilently()
    editingAssistant.value = false
    showNotification('success', 'Asistente actualizado', 'El asistente ha sido asignado correctamente.')
  } catch (error) {
    console.error('Error al actualizar asistente:', error)
    showNotification('error', 'Error', error.data?.detail || error.message || 'No se pudo actualizar el asistente.')
  } finally {
    savingAssistant.value = false
  }
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
    // Cargar datos del viaje y listas de personal en paralelo
    await Promise.all([
      tripStore.fetchTripById(tripId.value),
      driverStore.fetchDrivers(),
      assistantStore.fetchAssistants()
    ])
    await nextTick()
    
    if (displayedTrip.value && displayedTrip.value.id) {
      console.log('Cargando datos para el viaje:', displayedTrip.value.id)
      await Promise.all([
        fetchSoldTickets(displayedTrip.value.id)
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
    fetchSoldTickets(newId)
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
        fetchSoldTickets(displayedTrip.value.id)         // Actualizar tickets vendidos
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




