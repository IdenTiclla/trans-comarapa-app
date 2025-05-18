<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="mb-6">
        <button @click="goBack" class="flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Volver
        </button>
      </div>

      <div v-if="packageStore.isLoading" class="text-center py-12">
        <p class="text-gray-500">Cargando detalles de la encomienda...</p>
        <!-- You can add a spinner here -->
      </div>

      <div v-else-if="packageStore.error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
        <p>Error al cargar la encomienda: {{ packageStore.error }}</p>
      </div>

      <div v-else-if="currentPackage" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Detalles de la Encomienda ID: {{ currentPackage.id }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Información detallada de la encomienda.
            </p>
          </div>
          <span :class="getStatusClass(currentPackage.status)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
            {{ getStatusText(currentPackage.status) }}
          </span>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <!-- Sender Details -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Remitente</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.sender?.name || currentPackage.sender_details?.name || 'N/A' }}
                <span v-if="currentPackage.sender?.phone || currentPackage.sender_details?.phone" class="block text-xs text-gray-500">
                  Tel: {{ currentPackage.sender?.phone || currentPackage.sender_details?.phone }}
                </span>
              </dd>
            </div>
            <!-- Receiver Details -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 sm:bg-white">
              <dt class="text-sm font-medium text-gray-500">Destinatario</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                 {{ currentPackage.receiver?.name || currentPackage.receiver_details?.name || 'N/A' }}
                <span v-if="currentPackage.receiver?.phone || currentPackage.receiver_details?.phone" class="block text-xs text-gray-500">
                  Tel: {{ currentPackage.receiver?.phone || currentPackage.receiver_details?.phone }}
                </span>
              </dd>
            </div>
            <!-- Description -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Descripción</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.description || 'N/A' }}
              </dd>
            </div>
            <!-- Package Type -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 sm:bg-white">
              <dt class="text-sm font-medium text-gray-500">Tipo de Paquete</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.package_type || 'N/A' }}
              </dd>
            </div>
            <!-- Weight -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Peso</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.weight ? currentPackage.weight + ' kg' : 'N/A' }}
              </dd>
            </div>
            <!-- Declared Value -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 sm:bg-white">
              <dt class="text-sm font-medium text-gray-500">Valor Declarado</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.declared_value ? 'Bs. ' + currentPackage.declared_value.toFixed(2) : 'N/A' }}
              </dd>
            </div>
             <!-- Price -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Precio de Envío</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.price ? 'Bs. ' + currentPackage.price.toFixed(2) : 'N/A' }}
              </dd>
            </div>
            <!-- Notes -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 sm:bg-white">
              <dt class="text-sm font-medium text-gray-500">Notas Adicionales</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ currentPackage.notes || 'Ninguna' }}
              </dd>
            </div>
            <!-- Associated Trip -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Viaje Asociado</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div v-if="currentPackage.trip">
                  ID: {{ currentPackage.trip.id }} <br>
                  Ruta: {{ currentPackage.trip.route?.origin }} - {{ currentPackage.trip.route?.destination }} <br>
                  Fecha: {{ formatDate(currentPackage.trip.departure_datetime || currentPackage.trip.departure_date) }}
                </div>
                <span v-else>No asociado a un viaje</span>
              </dd>
            </div>
            <!-- Creation Date -->
            <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50 sm:bg-white">
              <dt class="text-sm font-medium text-gray-500">Fecha de Registro</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(currentPackage.created_at) }}
              </dd>
            </div>
            <!-- Last Updated -->
             <div class="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Última Actualización</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(currentPackage.updated_at) }}
              </dd>
            </div>
          </dl>
        </div>
        <div class="px-4 py-3 sm:px-6 border-t border-gray-200 bg-gray-50 sm:bg-transparent flex flex-col sm:flex-row justify-end gap-3">
           <AppButton variant="secondary" @click="editPackage(currentPackage.id)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </AppButton>
          <AppButton variant="danger" @click="confirmDeletePackage(currentPackage.id)" :is-loading="packageStore.isLoading">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </AppButton>
        </div>
      </div>
      <div v-else class="text-center py-12">
        <p class="text-gray-500">No se encontró la encomienda.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import AppButton from '~/components/AppButton.vue';

const router = useRouter();
const route = useRoute();
const packageStore = usePackageStore();

const currentPackage = computed(() => packageStore.currentPackage);

onMounted(async () => {
  const packageId = route.params.id;
  if (packageId) {
    await packageStore.fetchPackageById(packageId);
  } else {
    packageStore.setError('ID de encomienda no proporcionado.');
  }
});

const goBack = () => {
  router.back();
};

const editPackage = (id) => {
  router.push(`/packages/${id}/edit`);
};

const confirmDeletePackage = async (id) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta encomienda? Esta acción no se puede deshacer.')) {
    try {
      await packageStore.deleteExistingPackage(id);
      if (!packageStore.error) {
        router.push('/packages'); // Navigate to list after successful deletion
      }
    } catch (error) {
      // Error is handled by the store and displayed.
      console.error('Failed to delete package:', error);
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    in_transit: 'En Tránsito',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };
  return texts[status] || 'Desconocido';
};

// Clear current package and error when component is unmounted
import { onUnmounted } from 'vue';
onUnmounted(() => {
  packageStore.clearCurrentPackage();
  packageStore.clearError();
});

definePageMeta({
  // middleware: ['auth'] // Ensure auth is handled globally or add role checks if needed
});
</script> 