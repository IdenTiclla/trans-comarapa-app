<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center mb-6">
        <button @click="router.back()" class="mr-4 text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-semibold text-gray-800">Registrar Nueva Encomienda</h1>
      </div>

      <form @submit.prevent="handleSubmitPackage" class="bg-white p-6 rounded-lg shadow space-y-6">
        <div v-if="packageStore.error" class="bg-red-50 border-red-200 text-red-700 p-3 rounded-md">
          <p>Error: {{ packageStore.error }}</p>
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
            <AppButton type="submit" variant="primary" :is-loading="packageStore.isLoading">Registrar Encomienda</AppButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import { useClientStore } from '~/stores/clientStore';
import { useTripStore } from '~/stores/tripStore';
import AppButton from '~/components/AppButton.vue';
import ClientSelector from '~/components/ClientSelector.vue'; // Assuming this component exists or will be created

const router = useRouter();
const packageStore = usePackageStore();
const clientStore = useClientStore();
const tripStore = useTripStore();

const formData = reactive({
  sender_id: null,
  sender_details: { name: '', phone: '', address: '' }, // For new sender
  receiver_id: null,
  receiver_details: { name: '', phone: '', address: '' }, // For new receiver
  description: '',
  package_type: '',
  weight: null,
  declared_value: null,
  notes: '',
  trip_id: null,
  price: null, // Price for the package shipment
  status: 'pending', // Default status
});

const availableTrips = computed(() => tripStore.trips);

onMounted(async () => {
  packageStore.clearError();
  clientStore.clearError();
  clientStore.clearSearchResults(); 
  tripStore.clearError();
  // Fetch trips for the dropdown. Only fetch if not already loaded or filter for relevant (e.g., upcoming) trips.
  if (!tripStore.trips || tripStore.trips.length === 0) {
      await tripStore.fetchTrips({ limit: 100, status: 'scheduled' }); // Fetch upcoming trips for selection
  }
});

const handleSubmitPackage = async () => {
  try {
    // Prepare payload, decide if sender/receiver are existing or new
    const payload = { ...formData };
    if (!payload.sender_id) { // New sender
      payload.sender_new = payload.sender_details;
    }
    delete payload.sender_details;

    if (!payload.receiver_id) { // New receiver
      payload.receiver_new = payload.receiver_details;
    }
    delete payload.receiver_details;

    const newPackage = await packageStore.createNewPackage(payload);
    if (newPackage && newPackage.id) {
      // Optionally navigate to package detail page or confirmation
      router.push(`/packages`); // Or /packages/${newPackage.id} or a confirmation page
    } else if (packageStore.error) {
        // Error is already set in store, form will display it.
        console.error("Failed to create package, store error:", packageStore.error)
    }
  } catch (error) {
    // Error should be caught and set by store action, but as a fallback:
    console.error('Error submitting package form:', error);
    packageStore.error = error.message || 'Ocurrió un error inesperado al registrar la encomienda.';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

definePageMeta({
  // middleware: ['auth'] 
});
</script> 