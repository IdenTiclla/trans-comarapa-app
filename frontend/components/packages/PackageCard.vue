<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <div class="p-5">
      <div class="flex justify-between items-start mb-3 cursor-pointer group" @click="$emit('viewPackage', pkg.id)">
        <h3 class="text-lg font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors">Encomienda #{{ pkg.tracking_number || pkg.id }}</h3>
        <span :class="[getStatusBg(pkg.status), getStatusText(pkg.status)]" class="px-3 py-1 text-xs font-semibold rounded-full border border-opacity-20 border-gray-400">
          {{ getStatusLabel(pkg.status) }}
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
        <div>
          <strong class="font-medium text-gray-700">Remitente:</strong>
          <p>{{ pkg.sender_name || 'N/A' }}</p>
        </div>
        <div>
          <strong class="font-medium text-gray-700">Destinatario:</strong>
          <p>{{ pkg.recipient_name || 'N/A' }}</p>
        </div>
        <div class="col-span-1 md:col-span-2">
          <strong class="font-medium text-gray-700">Descripción:</strong>
          <p class="truncate">{{ pkg.description || 'Sin descripción' }}</p>
        </div>
        <div>
          <strong class="font-medium text-gray-700">Fecha Creación:</strong>
          <p>{{ formatDate(pkg.created_at) }}</p>
        </div>
         <div>
          <strong class="font-medium text-gray-700">Peso:</strong>
          <p>{{ pkg.total_weight ? `${pkg.total_weight} kg` : 'N/A' }}</p>
        </div>
        <div>
          <strong class="font-medium text-gray-700">Items:</strong>
          <p>{{ pkg.total_items_count || 0 }}</p>
        </div>
        <div>
          <strong class="font-medium text-gray-700">Monto Total:</strong>
          <p>Bs. {{ pkg.total_amount || '0.00' }}</p>
        </div>
        <div>
          <strong class="font-medium text-gray-700">Pago:</strong>
          <p :class="[getPaymentStatusTextClass(pkg.payment_status), 'font-semibold']">
            {{ getPaymentStatusLabel(pkg.payment_status) }}
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
        <AppButton v-if="pkg.status === 'arrived_at_destination'" size="sm" class="bg-indigo-600 text-white hover:bg-indigo-700 font-medium" @click="$emit('deliverPackage', pkg.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Entregar
        </AppButton>
        <AppButton size="sm" variant="outline" @click="$emit('viewPackage', pkg.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver
        </AppButton>
        <AppButton size="sm" variant="secondary" @click="$emit('editPackage', pkg.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </AppButton>
        <AppButton size="sm" variant="danger-outline" @click="$emit('deletePackage', pkg.id)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePackageStatus } from '~/composables/usePackageStatus'

const { getStatusLabel, getStatusBg, getStatusText, getPaymentStatusLabel, getPaymentStatusTextClass } = usePackageStatus()

const props = defineProps({
  pkg: {
    type: Object,
    required: true,
  },
});

defineEmits(['viewPackage', 'editPackage', 'deletePackage', 'deliverPackage']);



const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(amount);
};

</script>

<style scoped>
/* Add any specific styles for the card if needed */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px; /* Adjust as needed */
}
</style> 