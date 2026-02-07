<template>
  <div class="header border-b border-gray-200 pb-3 mb-4 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 overflow-hidden">
    <!-- Primera fila: Logo + Empresa -->
    <div class="flex items-center mb-4">
      <div class="bus-icon mr-3 bg-gradient-to-br from-indigo-100 to-blue-100 p-2 rounded-xl flex-shrink-0 shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
        </svg>
      </div>
      <div>
        <h2 class="text-base md:text-lg font-black text-gray-800 tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">TRANS COMARAPA</h2>
        <p class="text-xs text-gray-600 font-medium leading-tight">SINDICATO MIXTO DE TRANSPORTISTAS "MANUEL MARÍA CABALLERO"</p>
      </div>
    </div>

    <!-- Segunda fila: Origen, Destino, Día, Fecha y Hora -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
      <!-- Origen -->
      <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-2 text-center rounded-lg shadow-md">
        <span class="text-xs font-semibold text-white opacity-90 block">ORIGEN</span>
        <p class="text-sm font-bold text-white truncate">{{ trip.route ? trip.route.origin : 'N/D' }}</p>
      </div>

      <!-- Destino -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-center rounded-lg shadow-md">
        <span class="text-xs font-semibold text-white opacity-90 block">DESTINO</span>
        <p class="text-sm font-bold text-white truncate">{{ trip.route ? trip.route.destination : 'N/D' }}</p>
      </div>

      <!-- Día -->
      <div class="bg-gradient-to-b from-purple-500 to-purple-600 rounded-lg px-2 py-2 text-center shadow-md">
        <div class="text-white font-bold text-xs opacity-90">DÍA</div>
        <div class="text-white font-black text-sm capitalize">{{ getDayName(trip.trip_datetime) }}</div>
      </div>

      <!-- Fecha -->
      <div class="bg-gradient-to-b from-pink-500 to-rose-600 rounded-lg px-2 py-2 text-center shadow-md">
        <div class="text-white font-bold text-xs opacity-90">FECHA</div>
        <div class="text-white font-black text-sm">{{ formatShortDate(trip.trip_datetime) }}</div>
      </div>

      <!-- Hora -->
      <div class="bg-gradient-to-b from-orange-500 to-red-600 rounded-lg px-2 py-2 text-center shadow-md">
        <div class="text-white font-bold text-xs opacity-90">HORA</div>
        <div class="text-white font-black text-sm">{{ formatTimeWithAmPm(trip.departure_time) }}</div>
      </div>
    </div>

    <!-- Tercera fila: Conductor, Placa, Asistente -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
      <!-- Conductor -->
      <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 flex-shrink-0"></div>
          <span class="text-xs text-gray-600 mr-1 flex-shrink-0">Conductor:</span>
          <span class="text-xs font-bold text-gray-800 truncate">{{ trip.driver ? trip.driver.firstname + ' ' + trip.driver.lastname : 'N/A' }}</span>
        </div>
      </div>

      <!-- Placa -->
      <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
          <span class="text-xs text-gray-600 mr-1 flex-shrink-0">Placa:</span>
          <span class="text-xs font-bold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{{ trip.bus ? trip.bus.license_plate : 'N/A' }}</span>
        </div>
      </div>

      <!-- Asistente -->
      <div class="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center">
          <div class="w-1.5 h-1.5 bg-teal-500 rounded-full mr-2 flex-shrink-0"></div>
          <span class="text-xs text-gray-600 mr-1 flex-shrink-0">Asistente:</span>
          <span class="text-xs font-bold text-gray-800 truncate">{{ trip.assistant ? trip.assistant.firstname + ' ' + trip.assistant.lastname : 'N/A' }}</span>
        </div>
      </div>
    </div>

    <!-- Cuarta fila: Estadísticas de asientos -->
    <div v-if="trip.total_seats" class="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <span class="text-sm font-bold text-gray-700">PLANILLA DE PASAJEROS</span>
      </div>

      <div class="flex items-center space-x-4">
        <div class="text-center">
          <span class="text-lg font-black text-indigo-600">{{ trip.total_seats }}</span>
          <p class="text-xs text-gray-500">Total</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-lg font-black text-red-600">{{ occupiedSeatsCount }}</span>
          <p class="text-xs text-gray-500">Ocupados</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-lg font-black text-amber-600">{{ reservedSeatsCount }}</span>
          <p class="text-xs text-gray-500">Reservados</p>
        </div>
        <div class="w-px h-8 bg-gray-200"></div>
        <div class="text-center">
          <span class="text-lg font-black text-emerald-600">{{ availableSeatsCount }}</span>
          <p class="text-xs text-gray-500">Disponibles</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  occupiedSeatsCount: {
    type: Number,
    default: 0
  },
  reservedSeatsCount: {
    type: Number,
    default: 0
  },
  availableSeatsCount: {
    type: Number,
    default: 0
  }
})

// Obtener nombre del día
const getDayName = (dateString) => {
  if (!dateString) return 'Día no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
}

// Formatear fecha corta
const formatShortDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(date);
}

// Formatear hora con AM/PM
const formatTimeWithAmPm = (timeString) => {
  if (!timeString) return 'Hora no especificada'
  
  const parts = timeString.split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes} ${period}`
  }
  return timeString
}
</script>

<style scoped>
/* Efectos de glassmorphism para la cabecera */
.header {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Mejoras para dispositivos móviles */
@media (max-width: 639px) {
  .header h2 {
    font-size: 0.8rem;
  }

  .header p {
    font-size: 0.55rem;
  }

  .header {
    border-radius: 1rem 1rem 0 0;
  }
}

/* Estilos para impresión */
@media print {
  .header {
    background: none !important;
    border-bottom: 2px solid #166534 !important;
  }
}
</style>