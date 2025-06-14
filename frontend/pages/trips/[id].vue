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
          <!-- Detalles del viaje -->
          <TripDetailsCard
            :trip="displayedTrip"
            :format-date="formatDate"
            :format-time="formatTime"
            :get-status-class="getStatusClass"
            :get-status-text="getStatusText"
          />

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

            <!-- Indicador de modo cambio de asiento -->
            <div v-if="seatChangeMode" class="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <svg class="h-5 w-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-orange-800">Modo Cambio de Asiento Activo</p>
                    <p class="text-xs text-orange-600">
                      Cambiando ticket de {{ seatChangeTicket?.client?.firstname || 'Cliente' }} 
                      del asiento {{ seatChangeTicket?.seat?.seat_number }}. Selecciona un asiento libre.
                    </p>
                  </div>
                </div>
                <button
                  @click="cancelSeatChange"
                  class="px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
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

          <!-- Botones de acción -->
          <div v-if="displayedTrip" class="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
            <AppButton
              variant="secondary"
              @click="router.push(`/trips/${displayedTrip.id}/edit`)"
              class="w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </AppButton>
          </div>
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

  <!-- Modal de confirmación para cambio de asiento -->
  <teleport to="body">
    <div v-if="showSeatChangeConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
              <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div class="text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
              Confirmar Cambio de Asiento
            </h3>
            <div class="text-sm text-gray-500 mb-6 space-y-2">
              <p><strong>Cliente:</strong> {{ seatChangeTicket?.client?.firstname }} {{ seatChangeTicket?.client?.lastname }}</p>
              <p><strong>Asiento actual:</strong> {{ seatChangeTicket?.seat?.seat_number }}</p>
              <p><strong>Nuevo asiento:</strong> {{ newSelectedSeat?.number }}</p>
              <p class="text-orange-600 font-medium">¿Estás seguro de realizar este cambio?</p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="cancelSeatChange"
              :disabled="seatChangeLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="confirmSeatChange"
              :disabled="seatChangeLoading"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <span v-if="seatChangeLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
              </span>
              <span v-else>Confirmar Cambio</span>
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

// Cargar datos al montar el componente
onMounted(async () => {
  // Limpiar estado anterior
  clearState()
  
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
        showSeatChangeConfirmModal.value = true
      } else {
        showNotification('error', 'Asiento no disponible', 'Este asiento ya está ocupado o reservado.')
      }
    } else if (selectedSeats.length > 1) {
      showNotification('error', 'Selección múltiple no permitida', 'Solo puedes seleccionar un asiento para el cambio.')
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
  
  showNotification('info', 'Modo Cambio de Asiento', 
    `Selecciona un asiento libre para cambiar el ticket de ${ticket.client?.firstname || 'Cliente'} del asiento ${seat.number}`
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
    
    showNotification('success', 'Asiento cambiado', 
      `El asiento se cambió exitosamente del asiento ${seatChangeTicket.value.seat?.seat_number} al asiento ${newSelectedSeat.value.number}. Actualizando vista...`
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
    cancelSeatChange()
  }
}

const cancelSeatChange = () => {
  seatChangeMode.value = false
  seatChangeTicket.value = null
  newSelectedSeat.value = null
  showSeatChangeConfirmModal.value = false
  selectedSeatsForSale.value = []
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
</script>

<style scoped>
/* Estilos específicos para el componente si son necesarios */
</style>




