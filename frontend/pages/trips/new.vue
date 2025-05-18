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
        
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Nuevo Viaje</h1>
        
        <div v-if="tripStore.error || locationStore.error || busStore.error || driverStore.error || assistantStore.error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al procesar el formulario:</h3>
              <ul class="list-disc list-inside text-sm text-red-700">
                <li v-if="tripStore.error">{{ tripStore.error }}</li>
                <li v-if="locationStore.error">{{ locationStore.error }}</li>
                <li v-if="busStore.error">{{ busStore.error }}</li>
                <li v-if="driverStore.error">{{ driverStore.error }}</li>
                <li v-if="assistantStore.error">{{ assistantStore.error }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <form @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Ruta -->
                <div class="sm:col-span-3">
                  <label for="route_id" class="block text-sm font-medium text-gray-700">Ruta (Origen - Destino)</label>
                  <div class="mt-1">
                    <select 
                      id="route_id" 
                      v-model="formData.route_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione ruta</option>
                      <option v-for="route in routeStore.routes" :key="route.id" :value="route.id">
                        {{ route.origin_location?.name }} - {{ route.destination_location?.name }} ({{ route.name }})
                      </option>
                    </select>
                    <p v-if="routeStore.isLoading" class="text-xs text-gray-500">Cargando rutas...</p>
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
                      <option value="">Seleccione bus</option>
                      <option v-for="bus in busStore.buses" :key="bus.id" :value="bus.id">
                        {{ bus.license_plate }} - {{ bus.model }} (Cap: {{bus.capacity}})
                      </option>
                    </select>
                    <p v-if="busStore.isLoading" class="text-xs text-gray-500">Cargando buses...</p>
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
                      <option value="">Seleccione conductor</option>
                      <option v-for="driver in driverStore.drivers" :key="driver.id" :value="driver.id">
                        {{ driver.first_name }} {{ driver.last_name }}
                      </option>
                    </select>
                    <p v-if="driverStore.isLoading" class="text-xs text-gray-500">Cargando conductores...</p>
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
                      <option value="">Seleccione asistente</option>
                      <option v-for="assistant in assistantStore.assistants" :key="assistant.id" :value="assistant.id">
                        {{ assistant.first_name }} {{ assistant.last_name }}
                      </option>
                    </select>
                    <p v-if="assistantStore.isLoading" class="text-xs text-gray-500">Cargando asistentes...</p>
                  </div>
                </div>
                
                <!-- Precio del Boleto (Opcional, podría definirse en la ruta o promo) -->
                <div class="sm:col-span-3">
                  <label for="ticket_price" class="block text-sm font-medium text-gray-700">Precio Base del Boleto (Bs.)</label>
                  <div class="mt-1">
                    <input 
                      type="number" 
                      id="ticket_price" 
                      v-model="formData.ticket_price"
                      min="0"
                      step="0.50"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Este precio se usará para los boletos de este viaje. Puede ser sobrescrito por promociones o precios de ruta específicos.</p>
                </div>

                <!-- Estado del Viaje -->
                 <div class="sm:col-span-3">
                  <label for="status" class="block text-sm font-medium text-gray-700">Estado del Viaje</label>
                  <div class="mt-1">
                    <select 
                      id="status" 
                      v-model="formData.status"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="scheduled">Programado</option>
                      <option value="on_time">A Tiempo</option>
                      <option value="delayed">Retrasado</option>
                      <option value="departed">En Curso</option>
                      <option value="arrived">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  @click="router.back()"
                  class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="tripStore.isLoading"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="tripStore.isLoading"
                >
                  {{ tripStore.isLoading ? 'Creando...' : 'Crear Viaje' }}
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
import { reactive, onMounted, computed } from 'vue';
import { useRouter, navigateTo } from '#app';
import { useTripStore } from '~/stores/tripStore';
import { useLocationStore } from '~/stores/locationStore'; // To be created if not already
import { useBusStore } from '~/stores/busStore';
import { useDriverStore } from '~/stores/driverStore';
import { useAssistantStore } from '~/stores/assistantStore';
import { useRouteStore } from '~/stores/routeStore'; // For route selection

const router = useRouter();
const tripStore = useTripStore();
const locationStore = useLocationStore();
const busStore = useBusStore();
const driverStore = useDriverStore();
const assistantStore = useAssistantStore();
const routeStore = useRouteStore();


// Datos del formulario
const formData = reactive({
  route_id: null, // Changed from origin/destination to route_id
  trip_datetime: '', // Will be combined from departure_date and departure_time
  departure_date: '', 
  departure_time: '',
  bus_id: null,
  driver_id: null,
  assistant_id: null,
  ticket_price: 150, // Default or null
  status: 'scheduled', // Default status
});

// Fetch data for select dropdowns
onMounted(async () => {
  // No auth check needed here if auth.global.ts is active
  // await locationStore.fetchLocations(); // Locations are part of routes
  await routeStore.fetchRoutes();
  await busStore.fetchBuses();
  await driverStore.fetchDrivers();
  await assistantStore.fetchAssistants();
});

const handleSubmit = async () => {
  if (!formData.departure_date || !formData.departure_time) {
    tripStore.error = "Por favor, seleccione fecha y hora de salida."; // Or use a more sophisticated validation
    return;
  }
  formData.trip_datetime = `${formData.departure_date}T${formData.departure_time}:00`; // Assuming seconds are :00

  // Remove date and time from main object if backend expects only trip_datetime
  const submissionData = { ...formData };
  delete submissionData.departure_date;
  delete submissionData.departure_time;
  
  try {
    await tripStore.createNewTrip(submissionData);
    if (!tripStore.error) {
      router.push('/trips'); // Navigate to trips list on success
    }
    // Error will be displayed by the template via tripStore.error
  } catch (err) {
    // Error is already set in the store by createNewTrip action
    console.error("Error caught in component handleSubmit:", err);
  }
};

// Define the metadata of the page if not relying solely on global middleware
// definePageMeta({
//   middleware: ['auth']
// })
</script>
