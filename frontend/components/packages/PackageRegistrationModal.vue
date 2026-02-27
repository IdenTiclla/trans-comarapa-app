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
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl leading-6 font-medium text-white">
                Emisión de Encomienda
              </h3>
              <p class="mt-1 text-sm text-blue-100">
                Complete los datos del paquete y destinatarios
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-white text-right">
                <div class="text-xs font-medium">No.</div>
                <div class="text-xl font-bold tracking-wider">{{ packageNumber }}</div>
              </div>
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
        </div>

        <!-- Contenido del modal -->
        <div class="bg-white px-6 py-6 max-h-[80vh] overflow-y-auto">
          <form @submit.prevent="submitPackage">
            <!-- Información de fecha -->
            <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1">Lugar</label>
                <input
                  type="text"
                  v-model="packageData.origin"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Oficina de origen"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1">Fecha</label>
                <input
                  type="text"
                  :value="`${currentDay}/${currentMonth}/${currentYear}`"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  readonly
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-800 mb-1">Estado</label>
                <div class="flex items-center gap-2 mt-1">
                  <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <span class="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                    En oficina
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Columna izquierda: Información del envío -->
              <div class="space-y-6">
                <!-- Remitente -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    Remitente
                  </h4>
                  
                  <!-- Buscar remitente existente -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por CI o Nombre</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="senderSearchQuery"
                        @input="searchSenders"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Ingrese CI o nombre del remitente (mín. 2 caracteres)..."
                      />
                      <div class="absolute right-2 top-2">
                        <svg v-if="searchingSenders" class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Resultados de búsqueda de remitentes -->
                    <div v-if="foundSenders.length > 0" class="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                      <div 
                        v-for="sender in foundSenders" 
                        :key="sender.id"
                        @click="selectSender(sender)"
                        class="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p class="text-sm font-medium">{{ sender.firstname }} {{ sender.lastname }}</p>
                        <p class="text-xs text-gray-500">CI: {{ sender.document_id }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Campos del remitente -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        v-model="packageData.sender.firstname"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        v-model="packageData.sender.lastname"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                      <input
                        type="text"
                        v-model="packageData.sender.document_id"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        v-model="packageData.sender.phone"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Destinatario -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    Consignatario (Destinatario)
                  </h4>
                  
                  <!-- Buscar destinatario existente -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por CI o Nombre</label>
                    <div class="relative">
                      <input
                        type="text"
                        v-model="recipientSearchQuery"
                        @input="searchRecipients"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        placeholder="Ingrese CI o nombre del destinatario (mín. 2 caracteres)..."
                      />
                      <div class="absolute right-2 top-2">
                        <svg v-if="searchingRecipients" class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    <!-- Resultados de búsqueda de destinatarios -->
                    <div v-if="foundRecipients.length > 0" class="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                      <div 
                        v-for="recipient in foundRecipients" 
                        :key="recipient.id"
                        @click="selectRecipient(recipient)"
                        class="p-2 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p class="text-sm font-medium">{{ recipient.firstname }} {{ recipient.lastname }}</p>
                        <p class="text-xs text-gray-500">CI: {{ recipient.document_id }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Campos del destinatario -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        v-model="packageData.recipient.firstname"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        v-model="packageData.recipient.lastname"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Documento de Identidad</label>
                      <input
                        type="text"
                        v-model="packageData.recipient.document_id"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        v-model="packageData.recipient.phone"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <!-- Alerta de validación: misma persona -->
                <div v-if="isSamePerson" class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-red-800 font-medium">
                      ⚠️ Error: El remitente y el destinatario no pueden ser la misma persona
                    </p>
                  </div>
                </div>

                <!-- Destino -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    Destino
                  </h4>
                  <input
                    type="text"
                    v-model="packageData.destination"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    placeholder="Ciudad de destino"
                    required
                  />
                </div>
              </div>

              <!-- Columna derecha: Detalles del paquete -->
              <div class="space-y-6">
                <!-- Tabla de paquetes -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h10V5H5z" clip-rule="evenodd" />
                    </svg>
                    Detalle de Encomienda
                  </h4>

                  <!-- Tabla de paquetes -->
                  <div class="overflow-hidden border border-gray-200 rounded-lg">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-100">
                        <tr>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(item, index) in packageData.items" :key="index">
                          <td class="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              v-model.number="item.quantity"
                              min="1"
                              class="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </td>
                          <td class="px-4 py-4">
                            <input
                              type="text"
                              v-model="item.description"
                              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder="Descripción del artículo"
                            />
                          </td>
                          <td class="px-4 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <span class="text-gray-500 mr-1">Bs.</span>
                              <input
                                type="number"
                                v-model.number="item.unit_price"
                                min="0"
                                step="0.01"
                                class="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                          </td>
                          <td class="px-4 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              @click="removeItem(index)"
                              class="text-red-600 hover:text-red-800"
                              v-if="packageData.items.length > 1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Botón para agregar ítem -->
                  <button
                    type="button"
                    @click="addItem"
                    class="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar Artículo
                  </button>

                  <!-- Total -->
                  <div class="mt-4 bg-indigo-50 p-3 rounded-md border border-indigo-200">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-medium text-indigo-800">Total:</span>
                      <span class="text-xl font-bold text-indigo-900">Bs. {{ totalAmount.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Nota legal -->
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p class="text-sm text-yellow-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <strong>NOTA:</strong> Pasado los 30 días la empresa no se responsabiliza por su encomienda.
                  </p>
                </div>

                <!-- Recibí conforme -->
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="received_confirmation"
                      v-model="packageData.received_confirmation"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label for="received_confirmation" class="ml-2 block text-sm font-medium text-gray-700">
                      RECIBÍ CONFORME
                    </label>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Al marcar esta casilla, confirmo que he verificado los datos de la encomienda.
                  </p>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || !isFormValid"
                class="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? 'Registrando...' : 'Registrar Encomienda' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal del recibo -->
  <PackageReceiptModal
    :show-modal="showReceiptModal"
    :package-data="registeredPackageData"
    @close="closeReceiptModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePackageStore } from '~/stores/packageStore'
import apiFetch from '~/utils/api'
import PackageReceiptModal from './PackageReceiptModal.vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'package-registered'])

// Stores
const authStore = useAuthStore()
const packageStore = usePackageStore()

// Estados reactivos
const isSubmitting = ref(false)
const senderSearchQuery = ref('')
const recipientSearchQuery = ref('')
const foundSenders = ref([])
const foundRecipients = ref([])
const searchingSenders = ref(false)
const searchingRecipients = ref(false)

// Número de paquete (tracking number)
const packageNumber = ref('000000')

// Fecha actual
const now = new Date()
const currentDay = ref(now.getDate().toString().padStart(2, '0'))
const currentMonth = ref((now.getMonth() + 1).toString().padStart(2, '0'))
const currentYear = ref(now.getFullYear().toString())

// Datos del paquete — SIN trip_id ni driver
const packageData = ref({
  tracking_number: '',
  origin: '',
  destination: '',
  total_weight: 0,
  total_declared_value: 0,
  notes: '',
  sender: {
    firstname: '',
    lastname: '',
    document_id: '',
    phone: ''
  },
  recipient: {
    firstname: '',
    lastname: '',
    document_id: '',
    phone: ''
  },
  items: [
    {
      quantity: 1,
      description: '',
      unit_price: 0
    }
  ],
  received_confirmation: false
})

// Computed properties
const totalAmount = computed(() => {
  return packageData.value.items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price)
  }, 0)
})

const totalItemsCount = computed(() => {
  return packageData.value.items.reduce((total, item) => total + item.quantity, 0)
})

const isFormValid = computed(() => {
  const basicValidation = packageData.value.sender.firstname.trim() !== '' &&
         packageData.value.sender.lastname.trim() !== '' &&
         packageData.value.sender.document_id.trim() !== '' &&
         packageData.value.recipient.firstname.trim() !== '' &&
         packageData.value.recipient.lastname.trim() !== '' &&
         packageData.value.recipient.document_id.trim() !== '' &&
         packageData.value.destination.trim() !== '' &&
         packageData.value.items.length > 0 &&
         packageData.value.items.every(item => 
           item.description.trim() !== '' && 
           item.quantity > 0 && 
           item.unit_price >= 0
         ) &&
         packageData.value.received_confirmation

  // No se requiere trip_id

  const samePersonValidation = packageData.value.sender.document_id.trim() === '' ||
                               packageData.value.recipient.document_id.trim() === '' ||
                               packageData.value.sender.document_id.trim() !== packageData.value.recipient.document_id.trim()

  return basicValidation && samePersonValidation
})

const isSamePerson = computed(() => {
  return packageData.value.sender.document_id.trim() !== '' &&
         packageData.value.recipient.document_id.trim() !== '' &&
         packageData.value.sender.document_id.trim() === packageData.value.recipient.document_id.trim()
})

// Estados para el recibo
const showReceiptModal = ref(false)
const registeredPackageData = ref({})

// Métodos
const closeModal = () => {
  emit('close')
}

const addItem = () => {
  packageData.value.items.push({
    quantity: 1,
    description: '',
    unit_price: 0
  })
}

const removeItem = (index) => {
  if (packageData.value.items.length > 1) {
    packageData.value.items.splice(index, 1)
  }
}

// Funciones de búsqueda
const searchSenders = async () => {
  if (!senderSearchQuery.value.trim() || senderSearchQuery.value.trim().length < 2) {
    foundSenders.value = []
    return
  }

  searchingSenders.value = true
  try {
    const response = await apiFetch(`/clients/search?q=${encodeURIComponent(senderSearchQuery.value)}`, {
      method: 'GET'
    })
    foundSenders.value = response || []
  } catch (error) {
    console.error('Error searching senders:', error)
    foundSenders.value = []
  } finally {
    searchingSenders.value = false
  }
}

const searchRecipients = async () => {
  if (!recipientSearchQuery.value.trim() || recipientSearchQuery.value.trim().length < 2) {
    foundRecipients.value = []
    return
  }

  searchingRecipients.value = true
  try {
    const response = await apiFetch(`/clients/search?q=${encodeURIComponent(recipientSearchQuery.value)}`, {
      method: 'GET'
    })
    foundRecipients.value = response || []
  } catch (error) {
    console.error('Error searching recipients:', error)
    foundRecipients.value = []
  } finally {
    searchingRecipients.value = false
  }
}

const selectSender = (sender) => {
  packageData.value.sender = {
    firstname: sender.firstname || '',
    lastname: sender.lastname || '',
    document_id: sender.document_id || '',
    phone: sender.phone || ''
  }
  senderSearchQuery.value = `${sender.firstname} ${sender.lastname} (${sender.document_id})`
  foundSenders.value = []
  
  if (packageData.value.recipient.document_id === sender.document_id) {
    packageData.value.recipient = { firstname: '', lastname: '', document_id: '', phone: '' }
    recipientSearchQuery.value = ''
  }
}

const selectRecipient = (recipient) => {
  packageData.value.recipient = {
    firstname: recipient.firstname || '',
    lastname: recipient.lastname || '',
    document_id: recipient.document_id || '',
    phone: recipient.phone || ''
  }
  recipientSearchQuery.value = `${recipient.firstname} ${recipient.lastname} (${recipient.document_id})`
  foundRecipients.value = []
  
  if (packageData.value.sender.document_id === recipient.document_id) {
    packageData.value.sender = { firstname: '', lastname: '', document_id: '', phone: '' }
    senderSearchQuery.value = ''
  }
}

const submitPackage = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    // Crear o obtener clientes
    const senderData = await createOrGetClient(packageData.value.sender)
    const recipientData = await createOrGetClient(packageData.value.recipient)

    if (senderData.id === recipientData.id) {
      throw new Error('El remitente y el destinatario no pueden ser la misma persona.')
    }

    // Obtener el usuario autenticado
    if (!authStore.user || !authStore.user.id) {
      throw new Error('Debe iniciar sesión para registrar paquetes.')
    }
    
    // Obtener el secretary_id
    let secretaryId = null
    try {
      const secretaryResponse = await apiFetch(`/secretaries/by-user/${authStore.user.id}`, {
        method: 'GET'
      })
      secretaryId = secretaryResponse.id
    } catch (error) {
      console.error('Error obteniendo secretary_id:', error)
      throw new Error('No se pudo obtener la información del secretario. Verifique que tenga permisos.')
    }

    // Preparar datos del paquete SIN trip_id
    const packagePayload = {
      tracking_number: packageData.value.tracking_number,
      total_weight: packageData.value.total_weight || null,
      total_declared_value: packageData.value.total_declared_value || null,
      notes: packageData.value.notes || null,
      status: 'registered_at_office',
      sender_id: senderData.id,
      recipient_id: recipientData.id,
      secretary_id: secretaryId,
      // trip_id no se envía — la encomienda se registra sin viaje
      items: packageData.value.items.map(item => ({
        quantity: item.quantity,
        description: item.description,
        unit_price: item.unit_price
      }))
    }

    const response = await packageStore.createNewPackage(packagePayload)

    if (response) {
      registeredPackageData.value = {
        id: response.id,
        tracking_number: response.tracking_number,
        origin: packageData.value.origin,
        destination: packageData.value.destination,
        sender: {
          firstname: senderData.firstname,
          lastname: senderData.lastname,
          document_id: senderData.document_id,
          phone: senderData.phone
        },
        recipient: {
          firstname: recipientData.firstname,
          lastname: recipientData.lastname,
          document_id: recipientData.document_id,
          phone: recipientData.phone
        },
        items: response.items || packageData.value.items,
        total_amount: response.total_amount || totalAmount.value,
        total_items_count: response.total_items_count || totalItemsCount.value,
        created_at: response.created_at || new Date().toISOString()
      }

      showReceiptModal.value = true
      emit('package-registered', response)
      closeModal()
      resetForm()
    }
  } catch (error) {
    console.error('Error registering package:', error)
  } finally {
    isSubmitting.value = false
  }
}

const createOrGetClient = async (clientData) => {
  try {
    if (clientData.document_id && clientData.document_id.trim().length >= 2) {
      const searchResponse = await apiFetch(`/clients/search?q=${encodeURIComponent(clientData.document_id)}`, {
        method: 'GET'
      })

      if (searchResponse && searchResponse.length > 0) {
        const existingClient = searchResponse.find(client => client.document_id === clientData.document_id)
        if (existingClient) {
          return existingClient
        }
      }
    }

    const newClient = await apiFetch('/clients', {
      method: 'POST',
      body: {
        firstname: clientData.firstname,
        lastname: clientData.lastname,
        document_id: clientData.document_id,
        phone: clientData.phone
      }
    })

    return newClient
  } catch (error) {
    console.error('Error creating/getting client:', error)
    throw error
  }
}

const resetForm = () => {
  const trackingNumber = generateTrackingNumber()
  packageData.value = {
    tracking_number: trackingNumber,
    origin: '',
    destination: '',
    total_weight: 0,
    total_declared_value: 0,
    notes: '',
    sender: { firstname: '', lastname: '', document_id: '', phone: '' },
    recipient: { firstname: '', lastname: '', document_id: '', phone: '' },
    items: [{ quantity: 1, description: '', unit_price: 0 }],
    received_confirmation: false
  }
  packageNumber.value = trackingNumber
  senderSearchQuery.value = ''
  recipientSearchQuery.value = ''
  foundSenders.value = []
  foundRecipients.value = []
}

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${timestamp}${random}`
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  registeredPackageData.value = {}
}

// Generar número de paquete al montar
onMounted(() => {
  const trackingNumber = generateTrackingNumber()
  packageNumber.value = trackingNumber
  packageData.value.tracking_number = trackingNumber
})
</script>