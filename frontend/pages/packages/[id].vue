<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div class="max-w-screen-2xl mx-auto px-4 lg:px-6">
        <div class="flex items-center justify-between h-14">
          <div class="flex items-center gap-4">
            <button @click="router.back()" class="p-1.5 -ml-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <h1 class="text-lg font-bold text-gray-900 truncate">
              Encomienda #{{ packageStore.currentPackage?.tracking_number }}
            </h1>
            <span v-if="packageStore.currentPackage" :class="[getStatusBg(packageStore.currentPackage.status), getStatusText(packageStore.currentPackage.status), 'px-2.5 py-1 text-xs font-semibold rounded-full hidden sm:inline-block']">
              {{ getStatusLabel(packageStore.currentPackage.status) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="packageStore.currentPackage?.status === 'registered_at_office'"
              @click="router.push(`/packages/${packageStore.currentPackage.id}/edit`)"
              class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              v-if="packageStore.currentPackage?.status === 'in_transit' && packageStore.currentPackage?.trip?.status === 'arrived'"
              @click="showReceptionModal = true"
              class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors mr-2"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Marcar Recibido
            </button>
            <button
              v-if="packageStore.currentPackage?.status === 'arrived_at_destination'"
              @click="showDeliveryModal = true"
              class="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Entregar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="max-w-screen-xl mx-auto px-4 lg:px-6 py-6" v-if="!packageStore.isLoading && packageStore.currentPackage">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Principal (Info + Viaje) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Card de Información -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detalles de Encomienda
              </h2>
              <span :class="[getPaymentStatusBg(packageStore.currentPackage.payment_status), getPaymentStatusTextClass(packageStore.currentPackage.payment_status), 'px-2 py-1 text-xs font-semibold rounded-md border text-center']">
                {{ getPaymentStatusLabel(packageStore.currentPackage.payment_status) }}
              </span>
            </div>
            <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Remitente</p>
                <p class="text-sm font-medium text-gray-900">{{ packageStore.currentPackage.sender?.firstname }} {{ packageStore.currentPackage.sender?.lastname }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ packageStore.currentPackage.sender?.phone }} <span v-if="packageStore.currentPackage.sender?.ci">· CI: {{ packageStore.currentPackage.sender?.ci }}</span></p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Destinatario</p>
                <p class="text-sm font-medium text-gray-900">{{ packageStore.currentPackage.recipient?.firstname }} {{ packageStore.currentPackage.recipient?.lastname }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ packageStore.currentPackage.recipient?.phone }} <span v-if="packageStore.currentPackage.recipient?.ci">· CI: {{ packageStore.currentPackage.recipient?.ci }}</span></p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Items Totales</p>
                <p class="text-sm text-gray-900">{{ packageStore.currentPackage.total_items_count }} ({{ packageStore.currentPackage.total_weight ? packageStore.currentPackage.total_weight + ' kg' : 'Peso no esp.' }})</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Costo Total</p>
                <p class="text-sm font-bold text-gray-900">Bs. {{ (packageStore.currentPackage.total_amount || 0).toFixed(2) }}</p>
              </div>
            </div>
            <!-- Lista de items -->
            <div class="px-5 pb-5">
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Contenido</p>
              <div class="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden text-sm">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                    <tr>
                      <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th scope="col" class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cant</th>
                      <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                      <th scope="col" class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="item in packageStore.currentPackage.items" :key="item.id">
                      <td class="px-3 py-2 whitespace-nowrap text-gray-900">{{ item.description }}</td>
                      <td class="px-3 py-2 whitespace-nowrap text-center text-gray-500">{{ item.quantity }}</td>
                      <td class="px-3 py-2 whitespace-nowrap text-right text-gray-500">Bs. {{ (item.unit_price || 0).toFixed(2) }}</td>
                      <td class="px-3 py-2 whitespace-nowrap text-right font-medium text-gray-900">Bs. {{ (item.total_price || 0).toFixed(2) }}</td>
                    </tr>
                    <tr v-if="!packageStore.currentPackage.items || packageStore.currentPackage.items.length === 0">
                      <td colspan="4" class="px-3 py-4 text-center text-gray-500 italic">No hay items en este paquete</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Card de Viaje -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-5 border-b border-gray-100 bg-gray-50">
              <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Información de Viaje
              </h2>
            </div>
            <div class="p-5">
              <div v-if="packageStore.currentPackage.trip" class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="font-bold text-gray-900">{{ packageStore.currentPackage.trip.route?.origin_location?.name || 'Origen' }}</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span class="font-bold text-gray-900">{{ packageStore.currentPackage.trip.route?.destination_location?.name || 'Destino' }}</span>
                  </div>
                  <p class="text-sm text-gray-500">
                    Fecha de salida: {{ formatDateTime(packageStore.currentPackage.trip.departure_date || packageStore.currentPackage.trip.trip_datetime) }} <br>
                    Estado: <span class="font-medium text-gray-700">{{ formatTripStatus(packageStore.currentPackage.trip.status) }}</span>
                  </p>
                </div>
                <NuxtLink
                  :to="`/trips/${packageStore.currentPackage.trip.id}`"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex-shrink-0"
                >
                  Ver Viaje →
                </NuxtLink>
              </div>
              <div v-else class="text-center py-6 text-gray-500">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Sin viaje asignado</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Secundaria (Timeline) -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
            <div class="p-5 border-b border-gray-100 bg-gray-50">
              <h2 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de Estados
              </h2>
            </div>
            <div class="p-5">
              <div v-if="packageStore.currentPackage.state_history && packageStore.currentPackage.state_history.length > 0" class="flow-root">
                <ul role="list" class="-mb-8">
                  <li v-for="(event, eventIdx) in [...packageStore.currentPackage.state_history].reverse()" :key="event.id">
                    <div class="relative pb-8">
                      <!-- Vertical line -->
                      <span v-if="eventIdx !== packageStore.currentPackage.state_history.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      <div class="relative flex space-x-3">
                        <div>
                          <span :class="[getTimelineIconBg(event.new_state), 'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white shadow-sm']">
                            <span v-if="event.new_state === 'registered_at_office'">📦</span>
                            <span v-else-if="event.new_state === 'assigned_to_trip'">🏷️</span>
                            <span v-else-if="event.new_state === 'in_transit'">🚚</span>
                            <span v-else-if="event.new_state === 'arrived_at_destination'">📍</span>
                            <span v-else-if="event.new_state === 'delivered'">✅</span>
                            <span v-else>⏱️</span>
                          </span>
                        </div>
                        <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p class="text-sm font-medium text-gray-900">{{ getStatusLabel(event.new_state) }}</p>
                            <p v-if="event.notes" class="text-xs text-gray-500 mt-1">{{ event.notes }}</p>
                          </div>
                          <div class="whitespace-nowrap text-right text-xs text-gray-500">
                            {{ formatDateTime(event.changed_at) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else class="text-center py-4 text-gray-500 text-sm">
                No hay historial disponible
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="packageStore.isLoading" class="flex justify-center items-center py-20">
      <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
    <div v-else class="max-w-screen-md mx-auto px-4 py-20 text-center">
      <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Encomienda no encontrada</h3>
      <p class="mt-2 text-gray-500">No se pudo encontrar la encomienda solicitada o ha ocurrido un error.</p>
      <div class="mt-6">
        <button @click="router.back()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Volver atrás
        </button>
      </div>
    </div>

    <PackageDeliveryModal
      v-if="packageStore.currentPackage"
      :show-modal="showDeliveryModal"
      :package-data="packageStore.currentPackage"
      @close="showDeliveryModal = false"
      @confirm="onDeliverPackageConfirm"
    />

    <PackageReceptionModal
      v-if="packageStore.currentPackage"
      :show-modal="showReceptionModal"
      :package-data="packageStore.currentPackage"
      @close="showReceptionModal = false"
      @confirm="onReceivePackageConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePackageStore } from '~/stores/packageStore'
import PackageDeliveryModal from '~/components/packages/PackageDeliveryModal.vue'
import PackageReceptionModal from '~/components/packages/PackageReceptionModal.vue'

import { usePackageStatus } from '~/composables/usePackageStatus'

const router = useRouter()
const route = useRoute()
const packageStore = usePackageStore()

const {
  getStatusLabel,
  getStatusBg,
  getTimelineIconBg,
  getStatusText,
  getPaymentStatusLabel,
  getPaymentStatusBg,
  getPaymentStatusTextClass
} = usePackageStatus()

const showDeliveryModal = ref(false)
const packageId = route.params.id

onMounted(async () => {
  if (packageId) {
    await packageStore.fetchPackageById(packageId)
  }
})

onUnmounted(() => {
  packageStore.clearCurrentPackage()
  packageStore.clearError()
})

const onDeliverPackageConfirm = async ({ packageId: id }) => {
  showDeliveryModal.value = false
  // Refresh to show delivered state
  await packageStore.fetchPackageById(id)
}

const showReceptionModal = ref(false)

const onReceivePackageConfirm = async (id) => {
  try {
    await packageStore.updateStatus(id, 'arrived_at_destination')
    showReceptionModal.value = false
    // Refresh to show arrived state
    await packageStore.fetchPackageById(id)
  } catch (error) {
    console.error('Error al marcar paquete como recibido:', error)
    alert(error.response?.data?.detail || error.message || 'Error al actualizar el estado del paquete')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('es-BO')
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-BO', { 
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatTripStatus = (status) => {
  const map = {
    scheduled: 'Programado',
    boarding: 'Abordando',
    departed: 'En camino',
    arrived: 'Llegó',
    cancelled: 'Cancelado',
    delayed: 'Retrasado',
  }
  return map[status] || status
}


</script>