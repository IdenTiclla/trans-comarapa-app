<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full"
        @click.stop
      >
        <!-- Contenido del modal -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg class="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Recibir Encomienda
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 mb-3" v-if="packageData">
                  ¿Estás seguro de que deseas marcar la encomienda <strong>#{{ packageData.tracking_number || packageData.tracking_code }}</strong> como recibida en la oficina destino?
                </p>
                <div class="bg-gray-50 rounded p-3 text-sm text-gray-600 border border-gray-100" v-if="packageData">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="block text-xs font-medium text-gray-400">Remitente</span>
                      <span>{{ getSenderName(packageData) }}</span>
                    </div>
                    <div>
                      <span class="block text-xs font-medium text-gray-400">Destinatario</span>
                      <span>{{ getRecipientName(packageData) }}</span>
                    </div>
                  </div>
                  <div class="mt-2 pt-2 border-t border-gray-200">
                    <span class="block text-xs font-medium text-gray-400 mb-2">Contenido ({{ packageData.total_items_count || 0 }} items)</span>
                    <div class="bg-white rounded border border-gray-100 p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                      <ul v-if="packageData.items && packageData.items.length > 0" class="space-y-1">
                        <li v-for="item in packageData.items" :key="item.id" class="flex justify-between items-center text-xs py-1 border-b border-gray-50 last:border-0">
                          <span class="flex items-start min-w-0 pr-4">
                            <span class="font-bold text-gray-700 mr-2 flex-shrink-0">{{ item.quantity }}x</span>
                            <span class="text-gray-600 truncate" :title="item.description">{{ item.description }}</span>
                          </span>
                        </li>
                      </ul>
                      <div v-else class="text-xs text-gray-400 italic py-1 text-center">
                        Detalles de contenido no disponibles
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="confirmReception"
            :disabled="isSubmitting"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 flex items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Confirmando...' : 'Sí, Marcar Recibida' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  packageData: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['close', 'confirm'])
const isSubmitting = ref(false)

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    isSubmitting.value = false
  }
})

const getSenderName = (pkg) => {
  if (!pkg) return 'N/A'
  if (pkg.sender_name) return pkg.sender_name
  if (pkg.sender) return `${pkg.sender.firstname || ''} ${pkg.sender.lastname || ''}`.trim() || 'N/A'
  return 'N/A'
}

const getRecipientName = (pkg) => {
  if (!pkg) return 'N/A'
  if (pkg.receiver_name) return pkg.receiver_name
  if (pkg.recipient_name) return pkg.recipient_name
  if (pkg.recipient) return `${pkg.recipient.firstname || ''} ${pkg.recipient.lastname || ''}`.trim() || 'N/A'
  return 'N/A'
}

const closeModal = () => {
  emit('close')
}

const confirmReception = async () => {
  if (!props.packageData) return
  isSubmitting.value = true
  
  try {
    // Fire the event and pass exactly what's needed
    // Assuming the parent will make the API call and update UI appropriately
    emit('confirm', props.packageData.id)
  } catch (error) {
    console.error('Error confirming reception', error)
    isSubmitting.value = false
  }
}
</script>
