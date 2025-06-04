<template>
  <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl flex flex-col justify-between">
    <div>
      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Viaje #{{ trip.id }}</h3>
          <p class="text-sm text-gray-500">
            {{ trip.route.origin }} <span class="text-blue-500 mx-1">&rarr;</span> {{ trip.route.destination }}
          </p>
        </div>
        <span
          class="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full shadow-sm border whitespace-nowrap"
          :class="getStatusClass(trip.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDotClass(trip.status)"></span>
          {{ getStatusText(trip.status) }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-sm">
        <div>
          <p class="text-gray-500 font-medium">Fecha:</p>
          <p class="text-gray-700">{{ formatDate(trip.trip_datetime) }}</p>
        </div>
        <div>
          <p class="text-gray-500 font-medium">Hora:</p>
          <p class="text-gray-700">{{ formatTime(trip.trip_datetime) }}</p>
        </div>
      </div>

      <!-- Personal y Bus -->
      <div class="my-3 border-t border-gray-200 pt-3">
        <h4 class="text-xs font-semibold text-gray-600 mb-2 text-center">Staff y Unidad</h4>
        <div class="grid grid-cols-3 gap-2 text-center items-start">
          <div>
            <img 
              :src="trip.driver?.photoUrl || defaultPersonImage"
              alt="Foto del Conductor"
              class="w-16 h-16 rounded-full mx-auto object-cover border border-gray-200 shadow-sm bg-gray-100 mb-1"
              @error="setDefaultPersonImage"
            />
            <p class="text-xxs text-gray-600 font-medium leading-tight">{{ trip.driver?.name || 'N/A' }}</p>
            <p class="text-xxs text-gray-500 leading-tight">Conductor</p>
          </div>
          <div>
            <img 
              :src="trip.assistant?.photoUrl || defaultPersonImage"
              alt="Foto del Asistente"
              class="w-16 h-16 rounded-full mx-auto object-cover border border-gray-200 shadow-sm bg-gray-100 mb-1"
              @error="setDefaultPersonImage"
            />
            <p class="text-xxs text-gray-600 font-medium leading-tight">{{ trip.assistant?.name || 'N/A' }}</p>
            <p class="text-xxs text-gray-500 leading-tight">Asistente</p>
          </div>
          <div>
            <img 
              :src="trip.bus?.photoUrl || defaultBusImage"
              alt="Foto del Bus"
              class="w-16 h-16 rounded-md mx-auto object-cover border border-gray-200 shadow-sm bg-gray-100 mb-1"
               @error="setDefaultBusImage"
            />
            <p class="text-xxs text-gray-600 font-medium leading-tight">{{ trip.bus?.plate || 'N/A' }}</p>
            <p class="text-xxs text-gray-500 leading-tight">Bus</p>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <p class="text-sm text-gray-500 font-medium">Asientos Disponibles:</p>
          <p class="text-sm font-semibold text-gray-700">
            {{ trip.available_seats }} / {{ trip.total_seats }}
          </p>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="h-3 rounded-full transition-all duration-300"
            :class="{
              'bg-green-500': seatAvailabilityPercent > 0.5,
              'bg-yellow-500': seatAvailabilityPercent <= 0.5 && seatAvailabilityPercent > 0.2,
              'bg-red-500': seatAvailabilityPercent <= 0.2,
            }"
            :style="{ width: `${seatAvailabilityPercent * 100}%` }"
          ></div>
        </div>
      </div>

      <div v-if="trip.occupied_seats && trip.occupied_seats.length > 0" class="mb-4">
        <button
          @click="showOccupiedSeats = !showOccupiedSeats"
          class="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors duration-200 flex items-center w-full justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ showOccupiedSeats ? 'Ocultar' : 'Ver' }} Asientos Ocupados ({{ trip.occupied_seats.length }})
        </button>
        <div
          v-if="showOccupiedSeats"
          class="mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 shadow-sm max-h-32 overflow-y-auto"
        >
          <div class="flex flex-wrap gap-1">
            <span
              v-for="seatNumber in trip.occupied_seats"
              :key="seatNumber"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              {{ seatNumber }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-auto pt-4 border-t border-gray-200">
      <div class="flex space-x-3 justify-end">
        <button
          @click="$emit('view-trip', trip.id)"
          class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
          aria-label="Ver detalles del viaje"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver
        </button>
        <button
          @click="$emit('edit-trip', trip.id)"
          class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center"
          aria-label="Editar viaje"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
});

defineEmits(['view-trip', 'edit-trip']);

const showOccupiedSeats = ref(false);

const defaultPersonImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDNkNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXVzZXItY2lyY2xlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjxwYXRoIGQ9Ik03IDE4LjVWMjJhMiAyIDAgMCAwIDIgMmg2YTIgMiAwIDAgMCAyLTJ2LTMuNSIvPjwvc3ZnPg=='; // Simple SVG placeholder
const defaultBusImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDNkNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJ1cyI+PHBhdGggZD0iTTIgNmExIDEgMCAwIDEgMS0xaDEzbDEuOTYgMi4zNUEyIDIgMCAwIDEgMTkgN3YxMGEyIDIgMCAwIDEtMiAyaC00YTIgMiAwIDAgMS0yLTJ2LTJIODRhMiAyIDAgMCAxLTItMnYtMWEyIDIgMCAwIDEtMi0yaC0yYTEgMSAwIDAgMS0xLTFoMFoiLz48cGF0aCBkPSJNMCA1aDE4Ii8+PGNpcmNsZSBjeD0iNy41IiBjeT0iMTguNSIgcj0iMi41Ii8+PGNpcmNsZSBjeD0iMTYuNSIgY3k9IjE4LjUiIHI9IjIuNSIvPjwvc3ZnPg=='; // Simple SVG placeholder

const setDefaultPersonImage = (event) => {
  event.target.src = defaultPersonImage;
};

const setDefaultBusImage = (event) => {
  event.target.src = defaultBusImage;
};

const seatAvailabilityPercent = computed(() => {
  if (!props.trip.total_seats || props.trip.total_seats === 0) {
    return 0;
  }
  return Math.max(0, props.trip.available_seats / props.trip.total_seats);
});

const formatDate = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long', // Using 'long' for better readability in card
    year: 'numeric',
  }).format(date);
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

const getStatusText = (status) => {
  const statusMap = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    // Add other statuses if they exist
  };
  return statusMap[status] || status_text_default(status);
};

const status_text_default = (status) => {
  if (!status) return 'Desconocido';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}


const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    // default
  };
  return classes[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

const getStatusDotClass = (status) => {
  const dotClasses = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };
  return dotClasses[status] || 'bg-gray-500';
};
</script>

<style scoped>
/* Add any card-specific styles here if needed */
.max-h-32 {
  max-height: 8rem; /* 128px */
}
.text-xxs {
  font-size: 0.65rem; /* 10.4px - Tailwind doesn't have text-xxs by default */
  line-height: 0.85rem;
}
</style> 