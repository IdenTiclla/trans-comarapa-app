<template>
  <div class="header border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 md:p-8 overflow-hidden">
    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-1.5 sm:gap-2 md:gap-3">
      <!-- Logo y Nombre Empresa -->
      <div class="flex items-center flex-grow min-w-0">
        <div class="bus-icon mr-3 sm:mr-4 bg-gradient-to-br from-indigo-100 to-blue-100 p-2 sm:p-3 rounded-2xl flex-shrink-0 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 md:h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 .553-.894L9 2l6 3 6-3v13l-6 3-6-3z" />
          </svg>
        </div>
        <div class="flex-shrink min-w-0">
          <h2 class="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-gray-800 tracking-tight truncate bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">TRANS COMARAPA</h2>
          <p class="text-xs sm:text-sm md:text-base text-gray-600 truncate font-medium">SINDICATO MIXTO DE TRANSPORTISTAS</p>
          <p class="text-xs sm:text-sm md:text-base text-gray-600 truncate font-medium">"MANUEL MARÍA CABALLERO"</p>
        </div>
      </div>
      <!-- Origen/Destino -->
      <div class="w-full md:w-auto md:max-w-[450px] lg:max-w-[500px] mt-3 md:mt-0 flex-shrink-0">
        <div class="flex gap-3">
          <!-- Origen -->
          <div class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 p-3 sm:p-4 text-center rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span class="text-xs sm:text-sm font-semibold text-white opacity-90">ORIGEN</span>
            <p class="text-sm sm:text-base md:text-lg font-bold text-white break-words mt-1">{{ trip.route ? trip.route.origin : 'N/D' }}</p>
          </div>
          <!-- Destino -->
          <div class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 text-center rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <span class="text-xs sm:text-sm font-semibold text-white opacity-90">DESTINO</span>
            <p class="text-sm sm:text-base md:text-lg font-bold text-white break-words mt-1">{{ trip.route ? trip.route.destination : 'N/D' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Conductor/Placa y Fecha/Hora -->
    <div class="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 text-sm sm:text-base">
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span class="font-medium text-gray-600">Conductor:</span> 
            <span class="font-bold text-gray-800">{{ trip.driver ? trip.driver.firstname + ' ' + trip.driver.lastname : 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="font-medium text-gray-600">Placa:</span> 
            <span class="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">{{ trip.bus ? trip.bus.license_plate : 'N/A' }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span class="font-medium text-gray-600">Asistente:</span> 
            <span class="font-bold text-gray-800">{{ trip.assistant ? trip.assistant.firstname + ' ' + trip.assistant.lastname : 'N/A' }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3 text-sm">
        <div class="bg-gradient-to-b from-purple-500 to-purple-600 rounded-2xl p-4 text-center shadow-xl">
          <div class="text-white font-bold opacity-90 text-xs mb-2">DÍA</div>
          <div class="text-white font-black text-lg">{{ getDayName(trip.trip_datetime) }}</div>
        </div>
        <div class="bg-gradient-to-b from-pink-500 to-rose-600 rounded-2xl p-4 text-center shadow-xl">
          <div class="text-white font-bold opacity-90 text-xs mb-2">FECHA</div>
          <div class="text-white font-black text-lg">{{ formatShortDate(trip.trip_datetime) }}</div>
        </div>
        <div class="bg-gradient-to-b from-orange-500 to-red-600 rounded-2xl p-4 text-center shadow-xl">
          <div class="text-white font-bold opacity-90 text-xs mb-2">HORA</div>
          <div class="text-white font-black text-lg">{{ formatTimeWithAmPm(trip.departure_time) }}</div>
        </div>
      </div>
    </div>

    <!-- Planilla de Pasajeros -->
    <div class="mt-6 sm:mt-8 text-center">
      <div class="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 rounded-2xl shadow-xl">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
        <h3 class="text-base sm:text-lg md:text-xl font-black text-white tracking-wide">PLANILLA DE PASAJEROS</h3>
      </div>
      <div v-if="trip.total_seats" class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 justify-center max-w-4xl mx-auto">
        <!-- Capacidad Total -->
        <div class="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-transform duration-200">
          <span class="text-2xl font-black text-indigo-600">{{ trip.total_seats }}</span>
          <p class="text-sm text-gray-600 font-medium">Capacidad Total</p>
        </div>
        
        <!-- Ocupados -->
        <div class="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-transform duration-200">
          <span class="text-2xl font-black text-red-600">{{ occupiedSeatsCount }}</span>
          <p class="text-sm text-gray-600 font-medium">Ocupados</p>
        </div>
        
        <!-- Reservados -->
        <div class="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-transform duration-200">
          <span class="text-2xl font-black text-amber-600">{{ reservedSeatsCount }}</span>
          <p class="text-sm text-gray-600 font-medium">Reservados</p>
        </div>
        
        <!-- Disponibles -->
        <div class="bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-transform duration-200">
          <span class="text-2xl font-black text-emerald-600">{{ availableSeatsCount }}</span>
          <p class="text-sm text-gray-600 font-medium">Disponibles</p>
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