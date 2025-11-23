<template>
  <div class="w-full max-w-4xl mx-auto mb-8">
    <!-- Header/Title -->
    <div class="text-center mb-6">
      <h3 class="text-xl font-bold text-gray-800 uppercase tracking-wider">Tiempo Restante</h3>
      <div class="h-1 w-20 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
    </div>

    <!-- Main Countdown Container -->
    <div v-if="!isPast && !isTimeToTravel" class="grid grid-cols-4 gap-4 sm:gap-6">
      <!-- Days -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-4xl sm:text-5xl md:text-6xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.days).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-3 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Días</span>
      </div>

      <!-- Hours -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-4xl sm:text-5xl md:text-6xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.hours).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-3 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Horas</span>
      </div>

      <!-- Minutes -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-4xl sm:text-5xl md:text-6xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.minutes).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-3 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Minutos</span>
      </div>

      <!-- Seconds -->
      <div class="flex flex-col items-center">
        <div class="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group">
          <div class="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span class="text-4xl sm:text-5xl md:text-6xl font-black text-indigo-600 relative z-10 font-mono">
            {{ String(timeLeft.seconds).padStart(2, '0') }}
          </span>
        </div>
        <span class="mt-3 text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest">Segundos</span>
      </div>
    </div>

    <!-- Time to Travel State -->
    <div v-else-if="isTimeToTravel" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 text-center text-white animate-pulse">
      <div class="text-4xl mb-2">🚌</div>
      <h3 class="text-2xl font-bold mb-2">¡Es Hora de Viajar!</h3>
      <p class="opacity-90">Tu viaje está programado para salir ahora.</p>
    </div>

    <!-- Past State -->
    <div v-else class="bg-gray-100 rounded-xl border-2 border-gray-200 p-8 text-center text-gray-500">
      <div class="text-4xl mb-2">🏁</div>
      <h3 class="text-xl font-bold mb-1">Viaje Finalizado</h3>
      <p class="text-sm">Este viaje ya ha partido.</p>
    </div>

    <!-- Almost Time Warning (Overlay or specialized view could be added, but keeping simple for now) -->
    <div v-if="isAlmostTime && !isTimeToTravel && !isPast" class="mt-4 text-center">
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <span class="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-ping"></span>
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