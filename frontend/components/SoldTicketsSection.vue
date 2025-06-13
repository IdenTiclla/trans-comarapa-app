<template>
  <div class="mt-8">
    <button
      @click="$emit('toggle-sold-tickets')"
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
            @click="$emit('toggle-tickets-by-state', state)"
            class="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm focus:outline-none transition-colors duration-150 border border-gray-200"
          >
            <h4 class="text-md font-medium text-gray-700">
              {{ state.charAt(0).toUpperCase() + state.slice(1) }} ({{ ticketsInState.length }})
            </h4>
            <ChevronDownIcon v-if="!showTicketsByState[state]" class="w-5 h-5 text-gray-500" />
            <ChevronUpIcon v-else class="w-5 h-5 text-gray-500" />
          </button>

          <div v-if="showTicketsByState[state]" class="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="ticket in ticketsInState"
              :key="ticket.id"
              class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col"
            >
              <div class="p-5 flex-grow">
                <div class="flex justify-between items-start mb-4">
                  <h4 class="text-md font-semibold text-gray-800">
                    Boleto #{{ ticket.id }}
                  </h4>
                  <span 
                    class="px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide"
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

                <div class="space-y-3 text-sm text-gray-600">
                  <div class="flex items-center">
                    <UserCircleIcon class="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                    <div>
                      <p class="font-medium text-gray-800">Pasajero</p>
                      <p>{{ ticket.client?.firstname }} {{ ticket.client?.lastname }}</p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                     <div>
                      <p class="font-medium text-gray-800">Asiento</p>
                      <p>{{ ticket.seat?.seat_number }} ({{ ticket.seat?.deck }})</p>
                    </div>
                  </div>
                   <div class="flex items-center">
                     <CurrencyDollarIcon class="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                     <div>
                      <p class="font-medium text-gray-800">Precio</p>
                      <p>Bs. {{ ticket.price?.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="ticket.state === 'confirmed' || ticket.state === 'pending'" class="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex justify-end space-x-2">
                <AppButton size="sm" variant="danger-outline" @click="$emit('cancel-ticket', ticket)">Cancelar</AppButton>
                <AppButton size="sm" variant="primary" @click="$emit('view-ticket-details', ticket)">Imprimir</AppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDownIcon, ChevronUpIcon, UserCircleIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline/index.js'
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
  'view-ticket-details'
])
</script> 