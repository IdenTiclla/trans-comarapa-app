<template>
  <!-- Compact mode: single line inline countdown -->
  <div v-if="compact" class="inline-flex items-center gap-1.5">
    <template v-if="!isPast && !isTimeToTravel">
      <div class="flex items-center gap-1 bg-white/80 backdrop-blur rounded-lg px-2.5 py-1.5 border border-gray-200 shadow-sm">
        <svg class="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-bold text-gray-700 font-mono tabular-nums">
          {{ String(timeLeft.days).padStart(2, '0') }}<span class="text-gray-400">d</span>
          {{ String(timeLeft.hours).padStart(2, '0') }}<span class="text-gray-400">h</span>
          {{ String(timeLeft.minutes).padStart(2, '0') }}<span class="text-gray-400">m</span>
          <span class="text-indigo-500">{{ String(timeLeft.seconds).padStart(2, '0') }}</span><span class="text-gray-400">s</span>
        </span>
      </div>
      <span v-if="isAlmostTime" class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
      </span>
    </template>
    <template v-else-if="isTimeToTravel">
      <span class="inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg animate-pulse">
        <span>🚌</span> En marcha
      </span>
    </template>
    <template v-else>
      <span v-if="tripStatus === 'departed' || tripStatus === 'en_route'" class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-blue-200">
        <span>🚌</span> En Ruta
      </span>
      <span v-else-if="tripStatus === 'arrived' || tripStatus === 'completed'" class="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200">
        <span>🏁</span> Finalizado
      </span>
      <span v-else-if="tripStatus === 'cancelled'" class="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200">
        <span>❌</span> Cancelado
      </span>
      <span v-else class="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-orange-200">
        <span>⚠️</span> Demorado
      </span>
    </template>
  </div>

  <!-- Full mode: original grid countdown -->
  <div v-else class="w-full max-w-2xl mx-auto mb-4">
    <!-- Header/Title -->
    <div class="text-center mb-3">
      <h3 class="text-base font-bold text-gray-800 uppercase tracking-wider">Tiempo Restante</h3>
      <div class="h-0.5 w-16 bg-indigo-600 mx-auto mt-1 rounded-full"></div>
    </div>

    <!-- Main Countdown Container -->
    <div v-if="!isPast && !isTimeToTravel" class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <!-- Days -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.days).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Días</span>
      </div>

      <!-- Hours -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.hours).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Horas</span>
      </div>

      <!-- Minutes -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.minutes).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Minutos</span>
      </div>

      <!-- Seconds -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-lg shadow-md p-2 sm:p-3 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-2xl sm:text-3xl md:text-4xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.seconds).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Segundos</span>
      </div>
    </div>

    <!-- Time to Travel State -->
    <div v-else-if="isTimeToTravel" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-4 text-center text-white animate-pulse">
      <div class="text-2xl mb-1">🚌</div>
      <h3 class="text-lg font-bold mb-1">¡Es Hora de Viajar!</h3>
      <p class="opacity-90 text-sm">Tu viaje está programado para salir ahora.</p>
    </div>

    <!-- Past State -->
    <div v-else class="bg-gray-100 rounded-lg border-2 border-gray-200 p-4 text-center text-gray-500">
      <template v-if="tripStatus === 'departed' || tripStatus === 'en_route'">
        <div class="text-2xl mb-1 text-blue-500">🚌</div>
        <h3 class="text-base font-bold mb-1 text-blue-600">En Ruta</h3>
        <p class="text-xs text-blue-400">Este viaje ha partido.</p>
      </template>
      <template v-else-if="tripStatus === 'arrived' || tripStatus === 'completed'">
        <div class="text-2xl mb-1">🏁</div>
        <h3 class="text-base font-bold mb-1">Viaje Finalizado</h3>
        <p class="text-xs">Este viaje ha concluido.</p>
      </template>
      <template v-else-if="tripStatus === 'cancelled'">
        <div class="text-2xl mb-1 text-red-500">❌</div>
        <h3 class="text-base font-bold mb-1 text-red-600">Cancelado</h3>
        <p class="text-xs text-red-400">Este viaje fue cancelado.</p>
      </template>
      <template v-else>
        <div class="text-2xl mb-1 text-orange-500">⚠️</div>
        <h3 class="text-base font-bold mb-1 text-orange-600">Demorado</h3>
        <p class="text-xs text-orange-400">El viaje está retrasado.</p>
      </template>
    </div>

    <!-- Almost Time Warning -->
    <div v-if="isAlmostTime && !isTimeToTravel && !isPast" class="mt-2 text-center">
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-ping"></span>
        ¡El viaje sale pronto!
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  tripDateTime: {
    type: String,
    required: true
  },
  departureTime: {
    type: String,
    required: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  tripStatus: {
    type: String,
    default: ''
  }
})

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

const isPast = ref(false)
const isTimeToTravel = ref(false)
const isAlmostTime = ref(false)
let intervalId = null

const targetDateTime = computed(() => {
  if (props.tripDateTime && props.departureTime) {
    const tripDate = new Date(props.tripDateTime)
    const [hours, minutes] = props.departureTime.split(':').map(Number)
    tripDate.setHours(hours, minutes, 0, 0)
    return tripDate
  }
  return new Date(props.tripDateTime)
})

const calculateTimeLeft = () => {
  const now = new Date()
  const target = targetDateTime.value
  const difference = target.getTime() - now.getTime()

  if (difference <= 60000 && difference > -60000) {
    isTimeToTravel.value = true
    isPast.value = false
    isAlmostTime.value = false
  }
  else if (difference <= -60000) {
    isPast.value = true
    isTimeToTravel.value = false
    isAlmostTime.value = false
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (intervalId) clearInterval(intervalId)
    return
  }
  else if (difference <= 300000) {
    isAlmostTime.value = true
    isTimeToTravel.value = false
    isPast.value = false
  }
  else {
    isPast.value = false
    isTimeToTravel.value = false
    isAlmostTime.value = false
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((difference % (1000 * 60)) / 1000)

  timeLeft.value = { days, hours, minutes, seconds }
}

onMounted(() => {
  calculateTimeLeft()
  intervalId = setInterval(calculateTimeLeft, 1000)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
