<template>
  <div class="mt-8">
    <!-- Modern Header with Statistics -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
      <button
        @click="$emit('toggle-sold-tickets')"
        class="w-full px-6 py-4 hover:bg-black/10 focus:outline-none transition-colors duration-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5zM13 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-xl font-semibold text-white">
                Gestión de Boletos
              </h3>
              <p class="text-blue-100 text-sm">Gestión de tickets del viaje</p>
            </div>
          </div>
          <div class="flex items-center space-x-6">
            <!-- Statistics Cards -->
            <div class="hidden md:flex items-center space-x-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ soldTickets.length }}</div>
                <div class="text-xs text-blue-100">Total</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-300">{{ getTicketCountByState('confirmed') }}</div>
                <div class="text-xs text-blue-100">Confirmados</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-300">{{ getTicketCountByState('pending') }}</div>
                <div class="text-xs text-blue-100">Pendientes</div>
              </div>
            </div>
            <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg">
              <ChevronDownIcon v-if="!showSoldTickets" class="w-5 h-5 text-white" />
              <ChevronUpIcon v-else class="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </button>
    </div>

    <div v-if="showSoldTickets" class="mt-4">
      <div v-if="isLoadingSoldTickets" class="flex justify-center py-6">
        <p class="text-gray-500 italic">Cargando boletos vendidos...</p>
      </div>
      <div v-else-if="soldTicketsError" class="bg-red-50 border border-red-200 rounded-md p-4">
        <p class="text-red-700 text-sm">{{ soldTicketsError }}</p>
      </div>
      <div v-else-if="soldTickets.length === 0" class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p class="text-blue-700 text-sm">No hay boletos vendidos para este viaje aún.</p>
      </div>
      <!-- Iterate over grouped tickets -->
      <div v-else class="space-y-4">
        <div v-for="(ticketsInState, state) in groupedSoldTickets" :key="state" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            @click="$emit('toggle-tickets-by-state', state)"
            class="w-full flex justify-between items-center px-6 py-4 hover:bg-gray-50 focus:outline-none transition-colors duration-200"
          >
            <div class="flex items-center space-x-3">
              <div :class="getStateIconClass(state)" class="flex items-center justify-center w-10 h-10 rounded-lg">
                <component :is="getStateIcon(state)" class="w-5 h-5" />
              </div>
              <div class="text-left">
                <h4 class="text-lg font-semibold text-gray-900">
                  {{ getStateLabel(state) }}
                </h4>
                <p class="text-sm text-gray-600">{{ ticketsInState.length }} boleto{{ ticketsInState.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <ChevronDownIcon v-if="!showTicketsByState[state]" class="w-5 h-5 text-gray-400" />
            <ChevronUpIcon v-else class="w-5 h-5 text-gray-400" />
          </button>

          <div v-if="showTicketsByState[state]" class="p-6 bg-gray-50 border-t border-gray-200">
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="ticket in ticketsInState"
                :key="ticket.id"
                class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ease-in-out overflow-hidden group"
              >
                <!-- Ticket Header -->
                <div class="p-6 pb-4">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1v-3a2 2 0 00-2-2H5zM13 5a2 2 0 00-2 2v3a1 1 0 001 1h1a1 1 0 001-1V7a2 2 0 00-2-2h-1z" />
                        </svg>
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900">
                          Ticket #{{ ticket.id }}
                        </h4>
                        <span 
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getTicketStateClass(ticket.state)"
                        >
                          {{ getTicketStateLabel(ticket.state) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Ticket Details -->
                  <div class="space-y-4">
                    <!-- Passenger Info -->
                    <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                        <UserCircleIcon class="w-5 h-5 text-blue-600" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Pasajero</p>
                        <p class="text-sm text-gray-600">{{ ticket.client?.firstname }} {{ ticket.client?.lastname }}</p>
                      </div>
                    </div>

                    <!-- Seat and Price Row -->
                    <div class="grid grid-cols-2 gap-3">
                      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-xs font-medium text-gray-900">Asiento</p>
                          <p class="text-sm text-gray-600">{{ ticket.seat?.seat_number }}</p>
                        </div>
                      </div>
                      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mr-3">
                          <CurrencyDollarIcon class="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p class="text-xs font-medium text-gray-900">Precio</p>
                          <p class="text-sm font-semibold text-gray-900">Bs. {{ ticket.price?.toFixed(2) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div v-if="ticket.state === 'confirmed' || ticket.state === 'pending'" class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <AppButton size="sm" variant="danger-outline" @click="$emit('cancel-ticket', ticket)" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </AppButton>
                  <AppButton size="sm" variant="primary" @click="$emit('view-ticket-details', ticket)" class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/vue/24/outline/index.js'
import AppButton from '@/components/AppButton.vue'

const props = defineProps({
  soldTickets: {
    type: Array,
    required: true
  },
  isLoadingSoldTickets: {
    type: Boolean,
    required: true
  },
  soldTicketsError: {
    type: String,
    default: null
  },
  showSoldTickets: {
    type: Boolean,
    required: true
  },
  groupedSoldTickets: {
    type: Object,
    required: true
  },
  showTicketsByState: {
    type: Object,
    required: true
  }
})

defineEmits([
  'toggle-sold-tickets',
  'toggle-tickets-by-state',
  'cancel-ticket',
  'view-ticket-details',
])

// Helper functions for UI
const getTicketCountByState = (state) => {
  return props.soldTickets.filter(ticket => ticket.state === state).length
}

const getStateIcon = (state) => {
  const icons = {
    'confirmed': CheckCircleIcon,
    'pending': ClockIcon,
    'cancelled': XCircleIcon,
    'completed': CheckCircleIcon,
    'used': CheckCircleIcon
  }
  return icons[state] || ClockIcon
}

const getStateIconClass = (state) => {
  const classes = {
    'confirmed': 'bg-green-100 text-green-600',
    'pending': 'bg-yellow-100 text-yellow-600',
    'cancelled': 'bg-red-100 text-red-600',
    'completed': 'bg-blue-100 text-blue-600',
    'used': 'bg-gray-100 text-gray-600'
  }
  return classes[state] || 'bg-gray-100 text-gray-600'
}

const getStateLabel = (state) => {
  const labels = {
    'confirmed': 'Confirmados',
    'pending': 'Pendientes',
    'cancelled': 'Cancelados',
    'completed': 'Completados',
    'used': 'Usados'
  }
  return labels[state] || state.charAt(0).toUpperCase() + state.slice(1)
}

const getTicketStateClass = (state) => {
  const classes = {
    'confirmed': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
    'completed': 'bg-blue-100 text-blue-800',
    'used': 'bg-gray-100 text-gray-800'
  }
  return classes[state] || 'bg-gray-100 text-gray-800'
}

const getTicketStateLabel = (state) => {
  const labels = {
    'confirmed': 'Confirmado',
    'pending': 'Pendiente',
    'cancelled': 'Cancelado',
    'completed': 'Completado',
    'used': 'Usado'
  }
  return labels[state] || state?.charAt(0).toUpperCase() + state?.slice(1) || 'N/D'
}
</script> 