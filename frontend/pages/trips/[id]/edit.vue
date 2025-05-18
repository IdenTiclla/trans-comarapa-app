<template>
  <div>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <button 
            @click="router.back()" 
            class="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver
          </button>
        </div>
        
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Editar Viaje</h1>
        
        <div v-if="formLoading" class="flex justify-center py-12">
          <p class="text-gray-500">Cargando información del viaje...</p>
        </div>
        
        <div v-else-if="pageError" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ pageError }}</h3>
            </div>
          </div>
        </div>
        
        <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <form @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Ruta -->
                <div class="sm:col-span-3">
                  <label for="route_id" class="block text-sm font-medium text-gray-700">Ruta</label>
                  <div class="mt-1">
                    <select 
                      id="route_id" 
                      v-model="formData.route_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option :value="null" disabled>Seleccione una ruta</option>
                      <option v-for="route_item in availableRoutes" :key="route_item.id" :value="route_item.id">
                        {{ route_item.origin }} - {{ route_item.destination }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Fecha de salida -->
                <div class="sm:col-span-3">
                  <label for="departure_date" class="block text-sm font-medium text-gray-700">Fecha de salida</label>
                  <div class="mt-1">
                    <input 
                      type="date" 
                      id="departure_date" 
                      v-model="formData.departure_date"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <!-- Hora de salida -->
                <div class="sm:col-span-3">
                  <label for="departure_time" class="block text-sm font-medium text-gray-700">Hora de salida</label>
                  <div class="mt-1">
                    <input 
                      type="time" 
                      id="departure_time" 
                      v-model="formData.departure_time"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <!-- Estado -->
                <div class="sm:col-span-3">
                  <label for="status" class="block text-sm font-medium text-gray-700">Estado</label>
                  <div class="mt-1">
                    <select 
                      id="status" 
                      v-model="formData.status"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="scheduled">Programado</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>
                
                <!-- Bus -->
                <div class="sm:col-span-3">
                  <label for="bus_id" class="block text-sm font-medium text-gray-700">Bus</label>
                  <div class="mt-1">
                    <select 
                      id="bus_id" 
                      v-model="formData.bus_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option v-for="bus in availableBuses" :key="bus.id" :value="bus.id">
                        {{ bus.plate }} - {{ bus.model }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Conductor -->
                <div class="sm:col-span-3">
                  <label for="driver_id" class="block text-sm font-medium text-gray-700">Conductor</label>
                  <div class="mt-1">
                    <select 
                      id="driver_id" 
                      v-model="formData.driver_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option v-for="driver in availableDrivers" :key="driver.id" :value="driver.id">
                        {{ driver.name }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Asistente -->
                <div class="sm:col-span-3">
                  <label for="assistant_id" class="block text-sm font-medium text-gray-700">Asistente</label>
                  <div class="mt-1">
                    <select 
                      id="assistant_id" 
                      v-model="formData.assistant_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option v-for="assistant in availableAssistants" :key="assistant.id" :value="assistant.id">
                        {{ assistant.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  @click="router.back()"
                  class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useTripStore } from '~/stores/tripStore'
import { useRouteStore } from '~/stores/routeStore'
import { useBusStore } from '~/stores/busStore'
import { useDriverStore } from '~/stores/driverStore'
import { useAssistantStore } from '~/stores/assistantStore'
// Location store might not be needed if routes are used directly
// import { useLocationStore } from '~/stores/locationStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tripStore = useTripStore()
const routeStore = useRouteStore()
const busStore = useBusStore()
const driverStore = useDriverStore()
const assistantStore = useAssistantStore()

const formLoading = ref(true) // For initial data load
const submitting = ref(false)
// Error will primarily be handled by tripStore.error, but a local one can be for specific form issues
const pageError = ref(null) 

// Data for select dropdowns
const availableRoutes = computed(() => routeStore.routes)
const availableBuses = computed(() => busStore.buses)
const availableDrivers = computed(() => driverStore.drivers)
const availableAssistants = computed(() => assistantStore.assistants)

// Form data
const formData = reactive({
  route_id: null,
  departure_date: '',
  departure_time: '',
  status: 'scheduled',
  bus_id: null,
  driver_id: null,
  assistant_id: null,
  price: 0, // Assuming price is part of trip editing
})

const tripId = route.params.id;

// Watch for currentTrip to populate form
watch(() => tripStore.currentTrip, (newTrip) => {
  if (newTrip && newTrip.id === tripId) { // Ensure it's the correct trip for this page
    formData.route_id = newTrip.route?.id || null;
    if (newTrip.departure_datetime || newTrip.departure_date) {
        // Handle if departure_datetime is available, or split departure_date
        const datetime = new Date(newTrip.departure_datetime || newTrip.departure_date);
        formData.departure_date = datetime.toISOString().split('T')[0];
        const hours = String(datetime.getHours()).padStart(2, '0');
        const minutes = String(datetime.getMinutes()).padStart(2, '0');
        formData.departure_time = `${hours}:${minutes}`;
    } else {
        formData.departure_date = '';
        formData.departure_time = '';
    }
    formData.status = newTrip.status || 'scheduled';
    formData.bus_id = newTrip.bus?.id || null;
    formData.driver_id = newTrip.driver?.id || null;
    formData.assistant_id = newTrip.assistant?.id || null;
    formData.price = newTrip.price_per_seat || newTrip.price || 0;
    pageError.value = null; // Clear page error if trip loads
  } else if (tripStore.error && !newTrip) {
    pageError.value = tripStore.error; // Show store error if trip failed to load
  }
}, { immediate: true, deep: true });

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  formLoading.value = true;
  pageError.value = null;
  tripStore.clearError(); // Clear previous errors

  try {
    // Fetch all necessary data in parallel
    await Promise.all([
      tripStore.fetchTripById(tripId),
      routeStore.fetchRoutes(),
      busStore.fetchBuses(),
      driverStore.fetchDrivers(),
      assistantStore.fetchAssistants(),
    ]);

    if (tripStore.error) {
        pageError.value = tripStore.error
    }
    // The watch effect will populate formData once tripStore.currentTrip is set

  } catch (err) {
    console.error('Error loading data for trip edit:', err);
    pageError.value = 'No se pudo cargar la información necesaria para editar el viaje.';
  } finally {
    formLoading.value = false;
  }
});

const handleSubmit = async () => {
  if (!tripId) {
    pageError.value = "ID de viaje no encontrado.";
    return;
  }
  submitting.value = true;
  tripStore.clearError();
  pageError.value = null;

  try {
    const payload = {
      ...formData,
      // Combine date and time if backend expects a single datetime field
      departure_datetime: `${formData.departure_date}T${formData.departure_time}:00`, 
    };
    // Remove individual date/time if combined
    delete payload.departure_date;
    delete payload.departure_time;

    await tripStore.updateExistingTrip(tripId, payload);

    if (tripStore.error) {
      pageError.value = tripStore.error;
    } else {
      router.push(`/trips/${tripId}`); // Navigate to trip detail page on success
    }
  } catch (err) {
    console.error('Error al guardar los cambios del viaje:', err);
    pageError.value = err.message || 'No se pudieron guardar los cambios.';
  } finally {
    submitting.value = false;
  }
};

// Definir la metadata de la página
definePageMeta({
  // middleware: ['auth'] // Aplicar middleware de autenticación - REMOVED as auth.global.ts handles this
});
</script>
