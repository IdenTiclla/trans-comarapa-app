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
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-xl leading-6 font-medium text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Entregar Encomienda
            </h3>
            <button 
              @click="closeModal" 
              class="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="bg-white px-6 py-6">
          <div v-if="packageData" class="space-y-6">
            
            <!-- Resumen de paquete -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
              <div class="absolute right-0 top-0 h-full w-2 flex flex-col justify-between">
                <div v-for="i in 10" :key="i" class="h-1 w-full bg-gray-300"></div>
              </div>
              
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h4 class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Nº Tracking</h4>
                  <p class="text-xl font-bold text-gray-900 tracking-wide">#{{ packageData.tracking_number || packageData.tracking_code }}</p>
                </div>
                <div class="text-right">
                  <h4 class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total</h4>
                  <p class="text-2xl font-black text-green-600">Bs. {{ (packageData.total_amount || packageData.price || 0).toFixed(2) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-1">Remitente</p>
                  <p class="text-sm font-semibold text-gray-800">{{ getSenderName(packageData) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 font-medium mb-1">Destinatario</p>
                  <p class="text-sm font-semibold text-gray-800">{{ getRecipientName(packageData) }}</p>
                </div>
              </div>

              <!-- Detalles de items -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <p class="text-xs text-gray-500 font-medium mb-2">Contenido ({{ packageData.total_items_count || 0 }} items)</p>
                <div class="bg-white rounded border border-gray-100 p-2 max-h-32 overflow-y-auto overflow-x-hidden">
                  <ul v-if="packageData.items && packageData.items.length > 0" class="space-y-1">
                    <li v-for="item in packageData.items" :key="item.id" class="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                      <span class="flex items-start min-w-0 pr-4">
                        <span class="font-bold text-gray-700 mr-2 flex-shrink-0">{{ item.quantity }}x</span>
                        <span class="text-gray-600 truncate" :title="item.description">{{ item.description }}</span>
                      </span>
                      <span class="text-gray-500 text-xs font-medium flex-shrink-0">
                        Bs. {{ (item.total_price || 0).toFixed(2) }}
                      </span>
                    </li>
                  </ul>
                  <div v-else class="text-sm text-gray-400 italic py-1 text-center">
                    Detalles de contenido no disponibles
                  </div>
                </div>
              </div>
            </div>

            <!-- Información de Pago -->
            <div>
              <h4 class="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Detalles del Pago
              </h4>
              
              <!-- Si ya está pagado -->
              <div v-if="packageData.payment_status === 'paid_on_send'" class="bg-green-50 rounded-lg p-5 border border-green-200 flex items-start">
                <div class="flex-shrink-0 mt-0.5">
                  <svg class="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-bold text-green-800">Pagado al Enviar</h3>
                  <div class="mt-1 text-sm text-green-700">
                    <p>Este paquete ya fue pagado en origen mediante <strong>{{ packageData.payment_method === 'qr' ? 'QR' : 'Efectivo' }}</strong>.</p>
                    <p class="mt-1">No se requiere cobrar ningún monto al destinatario.</p>
                  </div>
                </div>
              </div>

              <!-- Si es por cobrar -->
              <div v-else-if="packageData.payment_status === 'collect_on_delivery'" class="bg-orange-50 rounded-lg p-5 border border-orange-200">
                <div class="flex items-start mb-4">
                  <div class="flex-shrink-0 mt-0.5">
                    <svg class="h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-bold text-orange-800">Por Cobrar en Destino</h3>
                    <p class="mt-1 text-sm text-orange-700">Debe cobrar <strong class="text-lg">Bs. {{ (packageData.total_amount || packageData.price || 0).toFixed(2) }}</strong> al entregar la encomienda.</p>
                  </div>
                </div>

                <div class="mt-4 border-t border-orange-200 pt-4">
                  <label class="block text-sm font-medium text-orange-900 mb-2">Seleccione el método de pago recibido:</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      @click="paymentMethod = 'cash'"
                      :class="['cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all', paymentMethod === 'cash' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300']"
                    >
                      <svg class="h-8 w-8 mb-2" :class="paymentMethod === 'cash' ? 'text-orange-600' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span class="text-sm font-bold" :class="paymentMethod === 'cash' ? 'text-orange-800' : 'text-gray-600'">Efectivo</span>
                    </div>
                    
                    <div
                      @click="paymentMethod = 'qr'"
                      :class="['cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center transition-all', paymentMethod === 'qr' ? 'border-orange-500 bg-orange-100 shadow-md transform scale-105' : 'border-gray-200 bg-white hover:border-orange-300']"
                    >
                      <svg class="h-8 w-8 mb-2" :class="paymentMethod === 'qr' ? 'text-orange-600' : 'text-gray-400'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span class="text-sm font-bold" :class="paymentMethod === 'qr' ? 'text-orange-800' : 'text-gray-600'">Transferencia QR</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback -->
              <div v-else class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <p class="text-gray-500 text-sm italic">Estado de pago no definido apropiadamente. Se asumirá pago en efectivo.</p>
              </div>
            </div>
            
          </div>
        </div>

        <!-- Mensaje de Error -->
        <div v-if="errorMessage" class="mx-6 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-700 font-medium">{{ errorMessage }}</p>
        </div>

        <!-- Botones de acción -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmDelivery"
            :disabled="isSubmitting || !isReadyToDeliver"
            class="px-5 py-2 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
          >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ isSubmitting ? 'Confirmando...' : 'Confirmar Entrega' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePackageStore } from '~/stores/packageStore'

const packageStore = usePackageStore()

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
const errorMessage = ref('')
const paymentMethod = ref('cash')

// Resetear método de pago cuando se abre el modal
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    paymentMethod.value = 'cash'
    isSubmitting.value = false
    errorMessage.value = ''
  }
})

// Verificar si está listo para entregar
const isReadyToDeliver = computed(() => {
  if (!props.packageData) return false
  
  if (props.packageData.payment_status === 'collect_on_delivery') {
    return paymentMethod.value !== null
  }
  
  return true
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

const confirmDelivery = async () => {
  if (!isReadyToDeliver.value) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    const defaultMethod = 'cash'
    let finalPaymentMethod = defaultMethod
    
    // Si era por cobrar, enviamos el método seleccionado
    if (props.packageData.payment_status === 'collect_on_delivery') {
        finalPaymentMethod = paymentMethod.value
    } else {
        // Mantenemos el que tenía originariamente (que fue por defecto 'cash' o 'qr')
        finalPaymentMethod = props.packageData.payment_method || defaultMethod
    }
    
    await packageStore.deliverPackage(props.packageData.id, finalPaymentMethod)
    
    emit('confirm', {
      packageId: props.packageData.id
    })
    
  } catch (error) {
    console.error('Error in confirm delivery wrapper:', error)
    errorMessage.value = error.response?.data?.detail || error.message || 'Error al confirmar la entrega. Por favor, intente nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
