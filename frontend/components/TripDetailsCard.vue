<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
    <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Detalles del Viaje
        </h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          ID: {{ trip.id }}
        </p>
      </div>
      <div>
        <span
          class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
          :class="getStatusClass(trip.status)"
        >
          {{ getStatusText(trip.status) }}
        </span>
      </div>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Ruta</dt>
          <dd class="mt-1 text-sm text-gray-900">
            <div class="flex items-center space-x-4 text-base font-semibold">
              <span>{{ trip.route?.origin }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <span>{{ trip.route?.destination }}</span>
            </div>
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Fecha de salida</dt>
          <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ formatDate(trip.trip_datetime) }}</dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Hora de salida</dt>
          <dd class="mt-1 text-sm text-gray-900 font-semibold">{{ formatTime(trip.departure_time, trip.trip_datetime) }}</dd>
        </div>
        
        <div class="sm:col-span-2">
          <dt class="text-sm font-medium text-gray-500">Asientos</dt>
          <dd class="mt-2 text-sm text-gray-900">
            <div class="flex items-center space-x-4">
              <div class="flex items-center text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015.537-4.873 1 1 0 11-1.074 1.746A3 3 0 006 14v3H3v-1a5 5 0 013-4z" />
                </svg>
                <span class="font-bold">{{ trip.available_seats }}</span>
                <span class="ml-1">Disponibles</span>
              </div>
              <div class="flex items-center text-red-600">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <span class="font-bold">{{ trip.occupied_seat_numbers.length }}</span>
                <span class="ml-1">Ocupados</span>
              </div>
               <div class="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v-1h8v1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1h14z" />
                </svg>
                <span class="font-bold">{{ trip.total_seats }}</span>
                <span class="ml-1">Totales</span>
              </div>
            </div>
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Conductor</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ trip.driver ? `${trip.driver.firstname} ${trip.driver.lastname}` : 'No asignado' }}</dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Asistente</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ trip.assistant ? `${trip.assistant.firstname} ${trip.assistant.lastname}` : 'No asignado' }}</dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Bus</dt>
          <dd class="mt-1 text-sm text-gray-900">
             <span v-if="trip.bus" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ trip.bus.license_plate }}
            </span>
            <span v-if="!trip.bus">No asignado</span>
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500">Secretaria</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ trip.secretary ? `${trip.secretary.firstname} ${trip.secretary.lastname}` : 'No asignada' }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  formatTime: {
    type: Function,
    required: true
  },
  getStatusClass: {
    type: Function,
    required: true
  },
  getStatusText: {
    type: Function,
    required: true
  }
})
</script> 