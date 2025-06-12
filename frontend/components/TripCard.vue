<template>
  <div :class="[
    'bg-white rounded-2xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1',
    listMode ? 'p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center lg:space-x-6' : 'p-4 lg:p-6 flex flex-col justify-between shadow-lg',
    'focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2'
  ]">
    <div :class="listMode ? 'flex-1' : ''">
      <!-- Header Section -->
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-3 mb-2">
            <div class="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-bold text-gray-900 truncate">Viaje #{{ trip.id }}</h3>
              <div class="flex items-center space-x-2 text-sm text-gray-700">
                <span class="font-medium">{{ trip.route.origin }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span class="font-medium">{{ trip.route.destination }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-shrink-0 ml-4">
          <span
            :class="[
              'px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border shadow-sm',
              getStatusClass(trip.status)
            ]"
            :aria-label="`Estado del viaje: ${getStatusText(trip.status)}`"
          >
            <span :class="['w-2 h-2 rounded-full mr-2 flex-shrink-0', getStatusDotClass(trip.status)]"></span>
            {{ getStatusText(trip.status) }}
          </span>
        </div>
      </div>

      <!-- Trip Details Grid -->
      <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-gray-600 font-medium">Fecha</p>
          </div>
          <p class="text-gray-900 font-semibold">{{ formatDate(trip.trip_datetime) }}</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="flex items-center space-x-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 font-medium">Hora</p>
          </div>
          <p class="text-gray-900 font-semibold">{{ formatTime(trip.trip_datetime) }}</p>
        </div>
      </div>

      <!-- Staff and Bus Section -->
      <div class="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Personal y Unidad
        </h4>
        <div class="grid grid-cols-3 gap-3 text-center">
          <!-- Driver -->
          <div class="group">
            <div class="relative mb-2">
              <img 
                :src="trip.driver?.photoUrl || defaultPersonImage"
                :alt="`Foto del conductor ${trip.driver?.name || 'No asignado'}`"
                class="w-12 h-12 lg:w-14 lg:h-14 rounded-lg mx-auto object-cover border-2 border-white shadow-md bg-gray-100 group-hover:border-indigo-300 transition-colors"
                @error="setDefaultPersonImage"
              />
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <p class="text-xs text-gray-900 font-medium leading-tight truncate">{{ trip.driver?.name || 'No asignado' }}</p>
            <p class="text-xs text-gray-600 leading-tight">Conductor</p>
          </div>

          <!-- Assistant -->
          <div class="group">
            <div class="relative mb-2">
              <img 
                :src="trip.assistant?.photoUrl || defaultPersonImage"
                :alt="`Foto del asistente ${trip.assistant?.name || 'No asignado'}`"
                class="w-12 h-12 lg:w-14 lg:h-14 rounded-lg mx-auto object-cover border-2 border-white shadow-md bg-gray-100 group-hover:border-indigo-300 transition-colors"
                @error="setDefaultPersonImage"
              />
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full"></div>
            </div>
            <p class="text-xs text-gray-900 font-medium leading-tight truncate">{{ trip.assistant?.name || 'No asignado' }}</p>
            <p class="text-xs text-gray-600 leading-tight">Asistente</p>
          </div>

          <!-- Bus -->
          <div class="group">
            <div class="relative mb-2">
              <img 
                :src="trip.bus?.photoUrl || defaultBusImage"
                :alt="`Foto del bus con placa ${trip.bus?.plate || 'No asignado'}`"
                class="w-12 h-12 lg:w-14 lg:h-14 rounded-lg mx-auto object-cover border-2 border-white shadow-md bg-gray-100 group-hover:border-indigo-300 transition-colors"
                @error="setDefaultBusImage"
              />
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 border-2 border-white rounded-full"></div>
            </div>
            <p class="text-xs text-gray-900 font-medium leading-tight truncate">{{ trip.bus?.plate || 'No asignado' }}</p>
            <p class="text-xs text-gray-600 leading-tight">Unidad</p>
          </div>
        </div>
      </div>

      <!-- Seat Availability -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2" />
            </svg>
            <p class="text-sm text-gray-700 font-semibold">Disponibilidad de Asientos</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-gray-900">
              {{ trip.available_seats }}<span class="text-gray-600 font-normal"> / {{ trip.total_seats }}</span>
            </p>
            <p class="text-xs text-gray-600">
              {{ Math.round(seatAvailabilityPercent * 100) }}% disponible
            </p>
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="{
              'bg-gradient-to-r from-green-500 to-green-600': seatAvailabilityPercent > 0.5,
              'bg-gradient-to-r from-yellow-500 to-orange-500': seatAvailabilityPercent <= 0.5 && seatAvailabilityPercent > 0.2,
              'bg-gradient-to-r from-red-500 to-red-600': seatAvailabilityPercent <= 0.2,
            }"
            :style="{ width: `${Math.max(5, seatAvailabilityPercent * 100)}%` }"
            :aria-label="`${Math.round(seatAvailabilityPercent * 100)}% de asientos disponibles`"
          ></div>
        </div>
      </div>

      <!-- Occupied Seats (collapsible) -->
      <div v-if="trip.occupied_seats && trip.occupied_seats.length > 0" class="mb-4">
        <button
          @click="showOccupiedSeats = !showOccupiedSeats"
          class="w-full text-left text-sm text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-between border border-indigo-200"
          :aria-expanded="showOccupiedSeats"
          :aria-controls="`occupied-seats-${trip.id}`"
        >
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="font-medium">
              {{ showOccupiedSeats ? 'Ocultar' : 'Ver' }} Asientos Ocupados ({{ trip.occupied_seats.length }})
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'transform rotate-180': showOccupiedSeats }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          v-if="showOccupiedSeats"
          :id="`occupied-seats-${trip.id}`"
          class="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-inner max-h-32 overflow-y-auto"
        >
          <div class="flex flex-wrap gap-2">
            <span
              v-for="seatNumber in trip.occupied_seats"
              :key="seatNumber"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"
              :aria-label="`Asiento ${seatNumber} ocupado`"
            >
              {{ seatNumber }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div :class="[
      'pt-4 border-t border-gray-200',
      listMode ? 'lg:pt-0 lg:border-t-0 lg:border-l lg:border-gray-200 lg:pl-6 lg:flex-shrink-0' : 'mt-auto'
    ]">
      <div :class="[
        'flex gap-3',
        listMode ? 'lg:flex-col lg:space-y-3 lg:w-32' : 'justify-end'
      ]">
        <button
          @click="$emit('view-trip', trip.id)"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          :aria-label="`Ver detalles del viaje ${trip.id}`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Ver Detalles</span>
        </button>
        <button
          @click="$emit('edit-trip', trip.id)"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200"
          :aria-label="`Editar viaje ${trip.id}`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editar</span>
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
  listMode: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['view-trip', 'edit-trip']);

const showOccupiedSeats = ref(false);

// Improved default images with better contrast
const defaultPersonImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMzIiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMjAiIHk9IjIwIj4KPHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0zIDIwIDEuNS0xLjVhMiAyIDAgMCAwIDAtMi44MjhsLTEuNS0xLjVhMiAyIDAgMCAwLTIuODI4IDBMMSAxNWEyIDIgMCAwIDAgMCAyLjgyOGwxLjUgMS41YTIgMiAwIDAgMCAyLjgyOCAwWm03IDE3YzQuNTcgMCA5LTQuNTcgOS05YzAtNC41Ny00LjU3LTktOS05Yy00LjU3IDAtOSA0LjU3LTkgOWMwIDQuNTcgNC41NyA5IDkgOVoiLz48cGF0aCBkPSJNMTYgM3Y0bC0yLTFzLS0xIDAtMWgyWk0xNiA3djRsLTItMXMtLTEgMC0xaDJaIi8+PC9zdmc+Cjwvc3ZnPgo=';

const defaultBusImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8c3ZnIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNOCAzSDIwTDIxIDVWMTlBMiAyIDAgMCAxIDE5IDIxSDE1QTIgMiAwIDAgMSAxMyAxOVYxN0g3VjE5QTIgMiAwIDAgMSA1IDIxSDFBMiAyIDAgMCAxIC0xIDE5VjVMMCA0SDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0wIDVIMjEiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iNyIgY3k9IjE4IiByPSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTgiIHI9IjIiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPgo=';

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
  if (!dateTimeString) return 'Fecha no disponible';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return 'Hora no disponible';
  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch (error) {
    return 'Hora inválida';
  }
};

const getStatusText = (status) => {
  const statusMap = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    delayed: 'Retrasado',
    boarding: 'Abordando',
  };
  return statusMap[status] || status?.charAt(0).toUpperCase() + status?.slice(1).replace(/_/g, ' ') || 'Estado desconocido';
};

const getStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-blue-50 text-blue-800 border-blue-200',
    in_progress: 'bg-orange-50 text-orange-800 border-orange-200',
    completed: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    delayed: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    boarding: 'bg-purple-50 text-purple-800 border-purple-200',
  };
  return classes[status] || 'bg-gray-50 text-gray-800 border-gray-200';
};

const getStatusDotClass = (status) => {
  const dotClasses = {
    scheduled: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500',
    delayed: 'bg-yellow-500',
    boarding: 'bg-purple-500',
  };
  return dotClasses[status] || 'bg-gray-500';
};
</script>

<style scoped>
/* Enhanced focus styles for accessibility */
.focus-within\:ring-2:focus-within {
  --tw-ring-shadow: 0 0 0 2px var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow, 0 0 #0000);
}

/* Smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

/* Enhanced hover effects */
.group:hover .group-hover\:border-indigo-300 {
  border-color: rgb(165 180 252);
}

/* Custom scrollbar for occupied seats */
.max-h-32::-webkit-scrollbar {
  width: 4px;
}

.max-h-32::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.max-h-32::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.max-h-32::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 