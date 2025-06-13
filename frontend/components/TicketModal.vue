<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="$emit('close')">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-white">
              {{ modalType === 'cancel' ? 'Cancelar Reserva' : 'Detalles del Boleto' }}
            </h3>
            <button 
              @click="$emit('close')" 
              class="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p class="mt-1 text-sm text-blue-100">
            {{ modalType === 'cancel' ? 'Confirma la cancelación de la reserva' : 'Vista previa del boleto oficial' }}
          </p>
        </div>

        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div v-if="modalType === 'details'" class="w-full">
            <!-- Mostrar el ticket con el diseño oficial -->
            <TicketDisplay 
              :ticket="ticket" 
              :trip="trip"
              v-if="ticket"
            />
          </div>
          
          <!-- Modal de cancelación -->
          <div v-else-if="modalType === 'cancel'" class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Cancelar Reserva
              </h3>
              
              <!-- Contenido del modal -->
              <div class="mt-4">
                <!-- Detalles del ticket a cancelar -->
                <div v-if="ticket" class="bg-gray-50 p-3 rounded-md mb-4">
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-gray-500">Boleto #:</p>
                      <p class="font-medium">{{ ticket.id }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Estado:</p>
                      <p class="font-medium">{{ ticket.state }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Asiento:</p>
                      <p class="font-medium">{{ ticket.seat?.seat_number }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Precio:</p>
                      <p class="font-medium">Bs. {{ ticket.price }}</p>
                    </div>
                    <div class="col-span-2">
                      <p class="text-gray-500">Cliente:</p>
                      <p class="font-medium">{{ ticket.client?.firstname }} {{ ticket.client?.lastname }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Mensaje de confirmación de cancelación -->
                <div class="text-sm text-gray-500">
                  <p>¿Está seguro que desea cancelar la reserva del asiento {{ ticket?.seat?.seat_number }}?</p>
                  <p class="mt-2 text-red-600">Esta acción no se puede deshacer.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <!-- Botón de imprimir para detalles -->
          <button 
            v-if="modalType === 'details'"
            @click="$emit('print')"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Boleto
          </button>
          
          <!-- Botón de confirmación para cancelación -->
          <button 
            v-if="modalType === 'cancel'"
            @click="$emit('confirm-cancel')"
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            :disabled="cancelling"
          >
            {{ cancelling ? 'Cancelando...' : 'Confirmar Cancelación' }}
          </button>
          
          <!-- Botón de cerrar -->
          <button 
            @click="$emit('close')" 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ modalType === 'cancel' ? 'Cancelar' : 'Cerrar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TicketDisplay from '@/components/TicketDisplay.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  ticket: {
    type: Object,
    default: null
  },
  trip: {
    type: Object,
    default: null
  },
  modalType: {
    type: String,
    default: 'details' // 'details' or 'cancel'
  },
  cancelling: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close', 'confirm-cancel', 'print'])
</script> 