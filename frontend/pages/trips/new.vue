<template>
  <div>
    <!-- Navigation Header with Breadcrumb -->
    <nav class="bg-gray-50 border-b border-gray-200" aria-label="Breadcrumb">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-4 py-4">
          <button 
            @click="router.back()" 
            class="flex items-center text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md p-1"
            aria-label="Volver a la página anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver
          </button>
          <span class="text-gray-400" aria-hidden="true">/</span>
          <span class="text-sm font-medium text-gray-500">Viajes</span>
          <span class="text-gray-400" aria-hidden="true">/</span>
          <span class="text-sm font-medium text-gray-900">Nuevo Viaje</span>
        </div>
      </div>
    </nav>

    <main class="py-6" role="main">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Crear Nuevo Viaje</h1>
          <p class="mt-2 text-sm text-gray-600">
            Seleccione la ruta, fecha, hora y bus para programar un nuevo viaje.
          </p>
        </div>

        <!-- Success Message -->
        <div 
          v-if="showSuccessMessage" 
          class="mb-6 bg-green-50 border border-green-200 rounded-md p-4"
          role="alert"
          aria-live="polite"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Viaje creado exitosamente!</h3>
              <p class="text-sm text-green-700 mt-1">El viaje ha sido programado correctamente.</p>
            </div>
          </div>
        </div>
        
        <!-- Error Messages -->
        <div 
          v-if="hasErrors" 
          class="mb-6 bg-red-50 border border-red-200 rounded-md p-4"
          role="alert"
          aria-live="assertive"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error al procesar el formulario</h3>
              <ul class="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                <li v-if="tripStore.error">{{ tripStore.error }}</li>
                <li v-if="busStore.error">{{ busStore.error }}</li>
                <li v-if="driverStore.error">{{ driverStore.error }}</li>
                <li v-if="assistantStore.error">{{ assistantStore.error }}</li>
                <li v-for="error in validationErrors" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Loading States -->
        <div v-if="isLoadingData" class="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4" role="status" aria-live="polite">
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3" aria-hidden="true"></div>
            <span class="text-sm text-blue-800">Cargando datos necesarios para el formulario...</span>
          </div>
        </div>
        
        <!-- Main Form -->
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="px-6 py-8">
            <form @submit.prevent="handleSubmit" novalidate>
              <fieldset :disabled="tripStore.isLoading || isLoadingData">
                <legend class="sr-only">Informacion del viaje</legend>
                
                <div class="space-y-8">
                  <!-- Route and Schedule Section -->
                  <div>
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Ruta y Horario</h2>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <!-- Ruta (ocupa ancho completo) -->
                      <div class="sm:col-span-2">
                        <label for="route_id" class="block text-sm font-medium text-gray-700 mb-1">
                          Ruta <span class="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <select 
                          id="route_id" 
                          v-model="formData.route_id"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          :class="{
                            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.route_id
                          }"
                          required
                          aria-required="true"
                          :aria-invalid="fieldErrors.route_id ? 'true' : 'false'"
                          :aria-describedby="fieldErrors.route_id ? 'route_id-error' : 'route_id-help'"
                        >
                          <option value="">Seleccione una ruta</option>
                          <option v-for="route in routeStore.routes" :key="route.id" :value="route.id">
                            {{ route.origin_location?.name }} -> {{ route.destination_location?.name }}
                            ({{ formatCurrency(route.price) }})
                          </option>
                        </select>
                        <p v-if="fieldErrors.route_id" id="route_id-error" class="mt-1 text-sm text-red-600" role="alert">
                          {{ fieldErrors.route_id }}
                        </p>
                        <p v-else id="route_id-help" class="mt-1 text-sm text-gray-500">
                          <span v-if="routeStore.isLoading" class="flex items-center">
                            <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></span>
                            Cargando rutas...
                          </span>
                          <span v-else>Seleccione la ruta de origen y destino del viaje</span>
                        </p>
                      </div>
                      
                      <!-- Fecha de salida -->
                      <div>
                        <label for="departure_date" class="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de salida <span class="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <!-- Botones rapidos de fecha -->
                        <div class="flex flex-wrap gap-2 mb-2">
                          <button 
                            v-for="opt in dateOptions" 
                            :key="opt.value"
                            type="button" 
                            @click="formData.departure_date = opt.value"
                            class="px-3 py-1 text-xs font-medium rounded-full border transition-colors"
                            :class="formData.departure_date === opt.value 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                          >
                            {{ opt.label }}
                          </button>
                        </div>
                        <input 
                          type="date" 
                          id="departure_date" 
                          v-model="formData.departure_date"
                          :min="today"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          :class="{
                            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.departure_date
                          }"
                          required
                          aria-required="true"
                          :aria-invalid="fieldErrors.departure_date ? 'true' : 'false'"
                          :aria-describedby="fieldErrors.departure_date ? 'departure_date-error' : 'departure_date-help'"
                        />
                        <p v-if="fieldErrors.departure_date" id="departure_date-error" class="mt-1 text-sm text-red-600" role="alert">
                          {{ fieldErrors.departure_date }}
                        </p>
                        <p v-else id="departure_date-help" class="mt-1 text-sm text-gray-500">
                          La fecha no puede ser anterior a hoy
                        </p>
                      </div>
                      
                      <!-- Hora de salida -->
                      <div>
                        <label for="departure_time" class="block text-sm font-medium text-gray-700 mb-1">
                          Hora de salida <span class="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <!-- Grilla de horarios comunes -->
                        <div class="grid grid-cols-4 gap-1 mb-2">
                          <button 
                            v-for="time in commonTimes" 
                            :key="time"
                            type="button"
                            @click="formData.departure_time = time"
                            class="px-2 py-1 text-xs font-medium rounded border transition-colors"
                            :class="formData.departure_time === time 
                              ? 'bg-blue-600 text-white border-blue-600' 
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                          >
                            {{ time }}
                          </button>
                        </div>
                        <input 
                          type="time" 
                          id="departure_time" 
                          v-model="formData.departure_time"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          :class="{
                            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.departure_time
                          }"
                          required
                          aria-required="true"
                          :aria-invalid="fieldErrors.departure_time ? 'true' : 'false'"
                          :aria-describedby="fieldErrors.departure_time ? 'departure_time-error' : 'departure_time-help'"
                        />
                        <p v-if="fieldErrors.departure_time" id="departure_time-error" class="mt-1 text-sm text-red-600" role="alert">
                          {{ fieldErrors.departure_time }}
                        </p>
                        <p v-else id="departure_time-help" class="mt-1 text-sm text-gray-500">
                          Seleccione un horario o ingrese uno personalizado
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Vehicle and Staff Section -->
                  <div>
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Vehiculo y Personal</h2>
                    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <!-- Bus -->
                      <div class="sm:col-span-2">
                        <label for="bus_id" class="block text-sm font-medium text-gray-700 mb-1">
                          Bus <span class="text-red-500" aria-label="requerido">*</span>
                        </label>
                        <select 
                          id="bus_id" 
                          v-model="formData.bus_id"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          :class="{
                            'border-red-300 focus:ring-red-500 focus:border-red-500': fieldErrors.bus_id
                          }"
                          required
                          aria-required="true"
                          :aria-invalid="fieldErrors.bus_id ? 'true' : 'false'"
                          :aria-describedby="fieldErrors.bus_id ? 'bus_id-error' : 'bus_id-help'"
                        >
                          <option value="">Seleccione un bus</option>
                          <option v-for="bus in busStore.buses" :key="bus.id" :value="bus.id">
                            {{ bus.license_plate }} - {{ bus.model }} ({{ bus.capacity }} asientos)
                          </option>
                        </select>
                        <p v-if="fieldErrors.bus_id" id="bus_id-error" class="mt-1 text-sm text-red-600" role="alert">
                          {{ fieldErrors.bus_id }}
                        </p>
                        <p v-else id="bus_id-help" class="mt-1 text-sm text-gray-500">
                          <span v-if="busStore.isLoading" class="flex items-center">
                            <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></span>
                            Cargando buses...
                          </span>
                          <span v-else>Seleccione el vehiculo para este viaje</span>
                        </p>
                      </div>
                      
                      <!-- Conductor (opcional) -->
                      <div>
                        <label for="driver_id" class="block text-sm font-medium text-gray-700 mb-1">
                          Conductor <span class="text-gray-400 text-xs font-normal">(opcional)</span>
                        </label>
                        <select 
                          id="driver_id" 
                          v-model="formData.driver_id"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option :value="null">Sin asignar</option>
                          <option v-for="driver in driverStore.drivers" :key="driver.id" :value="driver.id">
                            {{ driver.firstname }} {{ driver.lastname }}
                            <template v-if="driver.license_number"> ({{ driver.license_number }})</template>
                          </option>
                        </select>
                        <p class="mt-1 text-sm text-gray-500">
                          <span v-if="driverStore.isLoading" class="flex items-center">
                            <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></span>
                            Cargando conductores...
                          </span>
                          <span v-else>Puede asignar el conductor luego desde el detalle del viaje</span>
                        </p>
                      </div>
                      
                      <!-- Asistente (opcional) -->
                      <div>
                        <label for="assistant_id" class="block text-sm font-medium text-gray-700 mb-1">
                          Asistente <span class="text-gray-400 text-xs font-normal">(opcional)</span>
                        </label>
                        <select 
                          id="assistant_id" 
                          v-model="formData.assistant_id"
                          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option :value="null">Sin asignar</option>
                          <option v-for="assistant in assistantStore.assistants" :key="assistant.id" :value="assistant.id">
                            {{ assistant.firstname }} {{ assistant.lastname }}
                          </option>
                        </select>
                        <p class="mt-1 text-sm text-gray-500">
                          <span v-if="assistantStore.isLoading" class="flex items-center">
                            <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></span>
                            Cargando asistentes...
                          </span>
                          <span v-else>Puede asignar el asistente luego desde el detalle del viaje</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
              
              <!-- Form Actions -->
              <div class="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  type="button"
                  @click="router.back()"
                  class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="tripStore.isLoading"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="tripStore.isLoading || isLoadingData || !isFormValid"
                  :aria-describedby="!isFormValid ? 'submit-help' : undefined"
                >
                  <div v-if="tripStore.isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {{ tripStore.isLoading ? 'Creando viaje...' : 'Crear Viaje' }}
                </button>
              </div>
              
              <p v-if="!isFormValid" id="submit-help" class="mt-2 text-sm text-gray-500">
                Complete los campos de ruta, fecha, hora y bus para continuar
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref, watch } from 'vue';
import { useRouter } from '#app';
import { useTripStore } from '~/stores/tripStore';
import { useBusStore } from '~/stores/busStore';
import { useDriverStore } from '~/stores/driverStore';
import { useAssistantStore } from '~/stores/assistantStore';
import { useRouteStore } from '~/stores/routeStore';
import { useSecretaryStore } from '~/stores/secretaryStore';
import { useAuthStore } from '~/stores/auth';

// Set page metadata
definePageMeta({
  title: 'Crear Nuevo Viaje',
  layout: 'default'
});

const router = useRouter();
const tripStore = useTripStore();
const busStore = useBusStore();
const driverStore = useDriverStore();
const assistantStore = useAssistantStore();
const routeStore = useRouteStore();
const secretaryStore = useSecretaryStore();
const authStore = useAuthStore();

// Reactive state
const showSuccessMessage = ref(false);
const validationErrors = ref([]);
const fieldErrors = ref({});

// Form data
const formData = reactive({
  route_id: null,
  trip_datetime: '',
  departure_date: '',
  departure_time: '',
  bus_id: null,
  driver_id: null,
  assistant_id: null,
  status: 'scheduled',
});

// Helper: format date as YYYY-MM-DD
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Computed properties
const today = computed(() => formatDateStr(new Date()));

const dateOptions = computed(() => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);

  return [
    { label: 'Hoy', value: formatDateStr(now) },
    { label: 'Manana', value: formatDateStr(tomorrow) },
    { label: 'Pasado manana', value: formatDateStr(dayAfter) },
  ];
});

const commonTimes = [
  '05:00', '06:00', '07:00', '08:00',
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00',
];

const isLoadingData = computed(() => {
  return routeStore.isLoading || busStore.isLoading || driverStore.isLoading || 
         assistantStore.isLoading;
});

const hasErrors = computed(() => {
  return tripStore.error || busStore.error || 
         driverStore.error || assistantStore.error ||
         validationErrors.value.length > 0;
});

const isFormValid = computed(() => {
  return formData.route_id && 
         formData.departure_date && 
         formData.departure_time && 
         formData.bus_id && 
         Object.keys(fieldErrors.value).length === 0;
});

// Utility functions
const formatCurrency = (amount) => {
  if (!amount) return 'Precio no definido';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(amount);
};

const validateForm = () => {
  const errors = {};
  validationErrors.value = [];

  // Required field validation
  if (!formData.route_id) {
    errors.route_id = 'La ruta es requerida';
  }

  if (!formData.departure_date) {
    errors.departure_date = 'La fecha de salida es requerida';
  } else if (formData.departure_date < today.value) {
    errors.departure_date = 'La fecha no puede ser anterior a hoy';
  }

  if (!formData.departure_time) {
    errors.departure_time = 'La hora de salida es requerida';
  }

  if (!formData.bus_id) {
    errors.bus_id = 'El bus es requerido';
  }

  fieldErrors.value = errors;
  return Object.keys(errors).length === 0 && validationErrors.value.length === 0;
};

// Event handlers
const handleSubmit = async () => {
  // Clear previous errors
  tripStore.error = null;
  fieldErrors.value = {};
  validationErrors.value = [];

  if (!validateForm()) {
    return;
  }

  // Combine date and time
  formData.trip_datetime = `${formData.departure_date}T${formData.departure_time}:00`;

  // Prepare submission data
  const submissionData = { ...formData };
  delete submissionData.departure_date;
  delete submissionData.departure_time;

  // Auto-assign secretary_id from the logged-in user
  const personId = authStore.user?.person?.id;
  if (personId) {
    submissionData.secretary_id = personId;
  } else {
    // Fallback: find secretary by user_id in the secretaries list
    const currentUserId = authStore.user?.id;
    const secretary = secretaryStore.secretaries.find(s => s.user_id === currentUserId);
    if (secretary) {
      submissionData.secretary_id = secretary.id;
    }
  }

  // Send null for unselected optional fields
  if (!submissionData.driver_id) submissionData.driver_id = null;
  if (!submissionData.assistant_id) submissionData.assistant_id = null;

  try {
    await tripStore.createNewTrip(submissionData);
    if (!tripStore.error) {
      showSuccessMessage.value = true;
      
      // Hide success message and redirect after 2 seconds
      setTimeout(() => {
        showSuccessMessage.value = false;
        router.push('/trips');
      }, 2000);
    }
  } catch (err) {
    console.error("Error creating trip:", err);
    // Error is handled by the store
  }
};

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      routeStore.fetchRoutes(),
      busStore.fetchBuses(),
      driverStore.fetchDrivers(),
      assistantStore.fetchAssistants(),
      secretaryStore.fetchSecretaries()
    ]);
  } catch (error) {
    console.error("Error loading form data:", error);
  }
});

// Watchers for real-time validation
watch(() => formData.departure_date, (newDate) => {
  if (newDate && newDate < today.value) {
    fieldErrors.value.departure_date = 'La fecha no puede ser anterior a hoy';
  } else {
    delete fieldErrors.value.departure_date;
  }
});

watch(() => formData.route_id, () => {
  if (formData.route_id) {
    delete fieldErrors.value.route_id;
  }
});

watch(() => formData.departure_time, () => {
  if (formData.departure_time) {
    delete fieldErrors.value.departure_time;
  }
});

watch(() => formData.bus_id, () => {
  if (formData.bus_id) {
    delete fieldErrors.value.bus_id;
  }
});
</script>

<style scoped>
/* Custom focus styles for better accessibility */
.focus\:ring-2:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Improved button hover states */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.1s ease-in-out;
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Better select dropdown styling */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
  
  .sm\:flex-row {
    flex-direction: column;
  }
  
  .sm\:space-x-3 > :not([hidden]) ~ :not([hidden]) {
    margin-left: 0;
    margin-top: 0.75rem;
  }
}
</style>
