<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="mr-4 text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-semibold text-gray-800">Editar Encomienda ID: {{ packageId }}</h1>
      </div>

      <div v-if="pageLoading" class="text-center py-12">
        <p class="text-gray-500">Cargando datos de la encomienda...</p>
      </div>
      <div v-else-if="pageError" class="bg-red-50 border-red-200 text-red-700 p-3 rounded-md mb-4">
        <p>{{ pageError }}</p>
      </div>

      <form v-if="!pageLoading && currentPackageData" @submit.prevent="handleSubmitPackage" class="bg-white p-6 rounded-lg shadow space-y-6">
        <div v-if="packageStore.error" class="bg-red-50 border-red-200 text-red-700 p-3 rounded-md">
          <p>Error al guardar: {{ packageStore.error }}</p>
        </div>
        <div v-if="clientStore.error" class="bg-red-50 border-red-200 text-red-700 p-3 rounded-md">
          <p>Error (Cliente): {{ clientStore.error }}</p>
        </div>

        <!-- Sección Remitente -->
        <section>
          <h2 class="text-xl font-medium text-gray-700 mb-3">Remitente</h2>
          <ClientSelector 
            role="sender" 
            :client-store="clientStore"
            v-model:selected-client-id="formData.sender_id"
            v-model:client-details="formData.sender_details"
            @search-clients="(term) => clientStore.searchClients(term)"
          />
        </section>

        <!-- Sección Destinatario -->
        <section>
          <h2 class="text-xl font-medium text-gray-700 mb-3">Destinatario</h2>
          <ClientSelector 
            role="receiver"
            :client-store="clientStore" 
            v-model:selected-client-id="formData.receiver_id"
            v-model:client-details="formData.receiver_details"
            @search-clients="(term) => clientStore.searchClients(term)"
          />
        </section>
        
        <!-- Detalles de la Encomienda -->
        <section>
          <h2 class="text-xl font-medium text-gray-700 mb-3">Detalles de la Encomienda</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Descripción Corta</label>
              <input type="text" id="description" v-model="formData.description" required class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
            <div>
              <label for="package_type" class="block text-sm font-medium text-gray-700">Tipo de Paquete</label>
              <input type="text" id="package_type" v-model="formData.package_type" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
            <div>
              <label for="weight" class="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" id="weight" v-model.number="formData.weight" step="0.1" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
            <div>
              <label for="declared_value" class="block text-sm font-medium text-gray-700">Valor Declarado (Bs.)</label>
              <input type="number" id="declared_value" v-model.number="formData.declared_value" step="0.01" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
            <div class="md:col-span-2">
              <label for="status" class="block text-sm font-medium text-gray-700">Estado</label>
              <select id="status" v-model="formData.status" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="pending">Pendiente</option>
                <option value="in_transit">En Tránsito</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="notes" class="block text-sm font-medium text-gray-700">Notas Adicionales</label>
              <textarea id="notes" v-model="formData.notes" rows="3" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
            </div>
          </div>
        </section>

        <!-- Viaje Asociado (Opcional) -->
        <section>
          <h2 class="text-xl font-medium text-gray-700 mb-3">Viaje Asociado (Opcional)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="trip_id" class="block text-sm font-medium text-gray-700">Seleccionar Viaje</label>
              <select id="trip_id" v-model="formData.trip_id" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option :value="null">Ninguno</option>
                <option v-for="trip in availableTrips" :key="trip.id" :value="trip.id">
                  {{ trip.route.origin }} - {{ trip.route.destination }} ({{ formatDate(trip.departure_datetime || trip.departure_date) }})
                </option>
              </select>
            </div>
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700">Precio de Envío (Bs.)</label>
              <input type="number" id="price" v-model.number="formData.price" required step="0.01" class="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
          </div>
        </section>

        <div class="pt-5">
          <div class="flex justify-end space-x-3">
            <AppButton type="button" variant="secondary" @click="router.back()">Cancelar</AppButton>
            <AppButton type="submit" variant="primary" :is-loading="packageStore.isLoading">Guardar Cambios</AppButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import { useClientStore } from '~/stores/clientStore';
import { useTripStore } from '~/stores/tripStore';

const router = useRouter();
const route = useRoute();
const packageStore = usePackageStore();
const clientStore = useClientStore();
const tripStore = useTripStore();

const packageId = route.params.id;
const pageLoading = ref(true);
const pageError = ref(null);
const currentPackageData = computed(() => packageStore.currentPackage);

const formData = reactive({
  sender_id: null,
  sender_details: { name: '', phone: '', address: '', doc_id: '' },
  receiver_id: null,
  receiver_details: { name: '', phone: '', address: '', doc_id: '' },
  description: '',
  package_type: '',
  weight: null,
  declared_value: null,
  notes: '',
  trip_id: null,
  price: null,
  status: 'pending',
});

const availableTrips = computed(() => tripStore.trips);

const populateForm = (pkg) => {
  if (!pkg) return;
  formData.sender_id = pkg.sender_id || null;
  if (pkg.sender) {
    formData.sender_details = { name: pkg.sender.name, phone: pkg.sender.phone, address: pkg.sender.address, doc_id: pkg.sender.doc_id };
  } else if (pkg.sender_details) { // if sender was new and not an existing client
    formData.sender_details = { ...pkg.sender_details };
  }

  formData.receiver_id = pkg.receiver_id || null;
  if (pkg.receiver) {
    formData.receiver_details = { name: pkg.receiver.name, phone: pkg.receiver.phone, address: pkg.receiver.address, doc_id: pkg.receiver.doc_id };
  } else if (pkg.receiver_details) { // if receiver was new
    formData.receiver_details = { ...pkg.receiver_details };
  }
  
  formData.description = pkg.description || '';
  formData.package_type = pkg.package_type || '';
  formData.weight = pkg.weight || null;
  formData.declared_value = pkg.declared_value || null;
  formData.notes = pkg.notes || '';
  formData.trip_id = pkg.trip_id || pkg.trip?.id || null;
  formData.price = pkg.price || null;
  formData.status = pkg.status || 'pending';
};

onMounted(async () => {
  pageLoading.value = true;
  pageError.value = null;
  packageStore.clearError();
  clientStore.clearError();
  clientStore.clearSearchResults();
  tripStore.clearError();

  try {
    await packageStore.fetchPackageById(packageId);
    if (packageStore.error) {
      pageError.value = packageStore.error;
    } else if (currentPackageData.value) {
      populateForm(currentPackageData.value);
    } else {
      pageError.value = "No se pudo cargar la encomienda.";
    }

    // Fetch trips for dropdown if not already loaded
    if (!tripStore.trips || tripStore.trips.length === 0) {
      await tripStore.fetchTrips({ limit: 100, status: 'scheduled' }); // Fetch upcoming trips
    }
     if (tripStore.error) {
        console.warn("Error fetching trips for edit page:", tripStore.error)
        // Non-critical, form can still work without trips preloaded
    }
  } catch (err) {
    console.error('Error loading data for package edit:', err);
    pageError.value = err.message || 'Ocurrió un error al cargar los datos.';
  } finally {
    pageLoading.value = false;
  }
});

// Watch currentPackageData to repopulate form if it changes (e.g., after a failed save and re-fetch)
watch(currentPackageData, (newPkg) => {
  if (newPkg) {
    populateForm(newPkg);
  }
});

const handleSubmitPackage = async () => {
  try {
    const payload = { ...formData };
    if (!payload.sender_id && payload.sender_details.name) { 
      payload.sender_new = payload.sender_details;
    }
    delete payload.sender_details;

    if (!payload.receiver_id && payload.receiver_details.name) { 
      payload.receiver_new = payload.receiver_details;
    }
    delete payload.receiver_details;

    const updatedPackage = await packageStore.updateExistingPackage(packageId, payload);
    if (updatedPackage && !packageStore.error) {
      router.push(`/packages/${packageId}`); // Navigate to view page on success
    } else {
      // Error is already set in store and displayed in the template
      if(currentPackageData.value) populateForm(currentPackageData.value); // Repopulate with original data on failed update
    }
  } catch (error) {
    console.error('Error submitting package form for update:', error);
    // Error should be caught and set by store action, but as a fallback:
    packageStore.setError(error.message || 'Ocurrió un error inesperado al actualizar la encomienda.');
    if(currentPackageData.value) populateForm(currentPackageData.value); // Repopulate
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

import { onUnmounted } from 'vue';
onUnmounted(() => {
  packageStore.clearCurrentPackage();
  packageStore.clearError();
  clientStore.clearError();
  clientStore.clearSearchResults();
});

definePageMeta({
  // middleware: ['auth'] 
});
</script> 