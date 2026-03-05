<template>
  <div>
    <main class="py-6" role="main">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-10 text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Crear Nuevo Viaje</h1>
          <p class="mt-3 text-base text-gray-500 max-w-2xl mx-auto">
            Configura un nuevo viaje seleccionando la ruta, horario, vehículo asignado y el personal a bordo.
          </p>
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
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div class="px-8 py-10">
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
                        <FormSelect 
                          id="route_id" 
                          label="Ruta" 
                          v-model="formData.route_id"
                          :options="routeOptions"
                          placeholder="Seleccione una ruta"
                          required
                          aria-required="true"
                          :error="fieldErrors.route_id"
                        />
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

                        <!-- Detalle de la ruta seleccionada -->
                        <div v-if="selectedRoute" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div class="flex items-center gap-4 text-sm text-blue-800">
                            <span class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              {{ selectedRoute?.distance }} km
                            </span>
                            <span class="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {{ selectedRoute?.duration }}h
                            </span>
                            <span class="flex items-center gap-1 font-semibold">
                              {{ formatCurrency(selectedRoute?.price) }}
                            </span>
                          </div>
                        </div>
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
                        <FormInput 
                          type="date" 
                          id="departure_date" 
                          v-model="formData.departure_date"
                          :min="today"
                          required
                          aria-required="true"
                          :error="fieldErrors.departure_date"
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
                        <!-- Horarios de la ruta seleccionada -->
                        <div v-if="routeScheduleTimes.length > 0" class="mb-2">
                          <p class="text-xs text-gray-500 mb-1">Horarios programados de esta ruta:</p>
                          <div class="flex flex-wrap gap-1">
                            <button 
                              v-for="time in routeScheduleTimes" 
                              :key="time"
                              type="button"
                              @click="formData.departure_time = time"
                              class="px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors"
                              :class="formData.departure_time === time 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 inline mr-0.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {{ time }}
                            </button>
                          </div>
                        </div>
                        <div v-else-if="formData.route_id" class="mb-2">
                          <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                            Esta ruta no tiene horarios configurados. Ingrese la hora manualmente.
                          </p>
                        </div>
                        <!-- Grilla de horarios comunes (fallback) -->
                        <div v-if="routeScheduleTimes.length === 0" class="grid grid-cols-4 gap-1 mb-2">
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
                        <FormInput 
                          type="time" 
                          id="departure_time" 
                          v-model="formData.departure_time"
                          required
                          aria-required="true"
                          :error="fieldErrors.departure_time"
                        />
                        <p v-if="fieldErrors.departure_time" id="departure_time-error" class="mt-1 text-sm text-red-600" role="alert">
                          {{ fieldErrors.departure_time }}
                        </p>
                        <p v-else id="departure_time-help" class="mt-1 text-sm text-gray-500">
                          {{ routeScheduleTimes.length > 0 ? 'Seleccione un horario de la ruta o ingrese uno personalizado' : 'Seleccione un horario o ingrese uno personalizado' }}
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
                        <FormSelect 
                          id="bus_id" 
                          v-model="formData.bus_id"
                          :options="busOptions"
                          placeholder="Seleccione un bus"
                          required
                          aria-required="true"
                          :error="fieldErrors.bus_id"
                        />
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
                        <FormSelect 
                          id="driver_id" 
                          v-model="formData.driver_id"
                          :options="driverOptions"
                          placeholder="Sin asignar"
                        />
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
                        <FormSelect 
                          id="assistant_id" 
                          v-model="formData.assistant_id"
                          :options="assistantOptions"
                          placeholder="Sin asignar"
                        />
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

    <!-- Modals -->
    <ConfirmDialog
      v-model="showConfirmModal"
      title="Confirmar creación de viaje"
      message="¿Está seguro de que desea crear este viaje con los datos proporcionados?"
      type="info"
      confirmText="Crear viaje"
      cancelText="Cancelar"
      @confirm="executeTripCreation"
    />

    <NotificationModal
      :show="showSuccessModal"
      type="success"
      title="Viaje creado exitosamente"
      message="El viaje ha sido programado correctamente. Será redirigido al listado de viajes."
      @close="closeSuccessModal"
    />
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref, watch } from 'vue';
import { useRouter, useRoute } from '#app';
import { useTripStore } from '~/stores/tripStore';
import { useBusStore } from '~/stores/busStore';
import { useDriverStore } from '~/stores/driverStore';
import { useAssistantStore } from '~/stores/assistantStore';
import { useRouteStore } from '~/stores/routeStore';
import { useSecretaryStore } from '~/stores/secretaryStore';
import { useAuthStore } from '~/stores/auth';
import FormInput from '~/components/forms/FormInput.vue';
import FormSelect from '~/components/forms/FormSelect.vue';
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue';
import NotificationModal from '~/components/common/NotificationModal.vue';
import { useFormValidation, validators } from '~/composables/useFormValidation';

// Set page metadata
definePageMeta({
  title: 'Crear Nuevo Viaje',
  layout: 'default'
});

const router = useRouter();
const route = useRoute();
const tripStore = useTripStore();
const busStore = useBusStore();
const driverStore = useDriverStore();
const assistantStore = useAssistantStore();
const routeStore = useRouteStore();
const secretaryStore = useSecretaryStore();
const authStore = useAuthStore();

// Read query params for pre-filling from schedule board
const queryRouteId = route.query.route_id ? Number(route.query.route_id) : null;
const queryDate = route.query.date || '';
const queryTime = route.query.time || '';

// Reactive state
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const validationErrors = ref([]);
const { errors: fieldErrors, validateForm: runValidation, clearError } = useFormValidation();

const validationRules = computed(() => ({
  route_id: [validators.required('La ruta es requerida')],
  departure_date: [
    validators.required('La fecha de salida es requerida'),
    (val) => val && val < today.value ? 'La fecha no puede ser anterior a hoy' : null
  ],
  departure_time: [validators.required('La hora de salida es requerida')],
  bus_id: [validators.required('El bus es requerido')]
}));

// Form data (pre-filled from query params if available)
const formData = reactive({
  route_id: queryRouteId,
  trip_datetime: '',
  departure_date: queryDate,
  departure_time: queryTime,
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

// Selected route and its schedules
const selectedRoute = computed(() => {
  if (!formData.route_id) return null;
  return routeStore.routesWithSchedules.find(r => r.id === formData.route_id) || null;
});

const routeOptions = computed(() => {
  return (routeStore.routesWithSchedules || []).map(route => ({
    value: route.id,
    label: `${route.origin_location?.name} -> ${route.destination_location?.name} (${formatCurrency(route.price)})`
  }));
});

const busOptions = computed(() => {
  return (busStore.buses || []).map(bus => {
    const pisosText = bus.floors === 2 ? '2 pisos' : '1 piso';
    return {
      value: bus.id,
      label: `${bus.license_plate} - ${bus.model} (${bus.capacity} asientos, ${pisosText})`
    };
  });
});

const driverOptions = computed(() => {
  const options = [{ value: null, label: 'Sin asignar' }];
  const drivers = (driverStore.drivers || []).map(driver => ({
    value: driver.id,
    label: `${driver.firstname} ${driver.lastname}${driver?.license_number ? ` (${driver.license_number})` : ''}`
  }));
  return [...options, ...drivers];
});

const assistantOptions = computed(() => {
  const options = [{ value: null, label: 'Sin asignar' }];
  const assistants = (assistantStore.assistants || []).map(assistant => ({
    value: assistant.id,
    label: `${assistant.firstname} ${assistant.lastname}`
  }));
  return [...options, ...assistants];
});

const routeScheduleTimes = computed(() => {
  if (!selectedRoute.value || !selectedRoute.value.schedules) return [];
  return selectedRoute.value.schedules
    .filter(s => s.is_active)
    .map(s => {
      // Convert "HH:MM:SS" or "HH:MM" to "HH:MM"
      const parts = s.departure_time.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    })
    .sort();
});

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
         // Check if not less than today
         formData.departure_date >= today.value &&
         formData.departure_time && 
         formData.bus_id && 
         Object.keys(fieldErrors).length === 0 &&
         !Object.values(fieldErrors).some(err => err !== null);
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
  validationErrors.value = [];
  return runValidation(formData, validationRules.value);
};

// Event handlers
const handleSubmit = async () => {
  // Clear previous errors
  tripStore.error = null;
  validationErrors.value = [];

  if (!validateForm()) {
    return;
  }

  // Show confirmation modal instead of creating right away
  showConfirmModal.value = true;
};

const executeTripCreation = async () => {
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
      showSuccessModal.value = true;
    }
  } catch (err) {
    console.error("Error creating trip:", err);
    // Error is handled by the store
  }
};

const closeSuccessModal = () => {
  showSuccessModal.value = false;
  router.push('/trips');
};

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      routeStore.fetchRoutesWithSchedules(),
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
    fieldErrors.departure_date = 'La fecha no puede ser anterior a hoy';
  } else {
    clearError('departure_date');
  }
});

watch(() => formData.route_id, () => {
  if (formData.route_id) clearError('route_id');
});

watch(() => formData.departure_time, () => {
  if (formData.departure_time) clearError('departure_time');
});

watch(() => formData.bus_id, () => {
  if (formData.bus_id) clearError('bus_id');
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
