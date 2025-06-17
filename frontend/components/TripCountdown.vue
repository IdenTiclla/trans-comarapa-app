<template>
  <div :class="[
    'text-white rounded-lg p-4 mb-6 transition-all duration-500',
    isTimeToTravel ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg transform scale-105' :
    isAlmostTime ? 'bg-gradient-to-r from-yellow-500 to-orange-600 shadow-md' :
    isPast ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
    'bg-gradient-to-r from-blue-500 to-purple-600'
  ]">
    <div class="text-center">
      <h3 class="text-lg font-semibold mb-2">Tiempo restante para el viaje</h3>
      
      <!-- Time to travel message -->
      <div v-if="isTimeToTravel" class="text-center">
        <div class="text-3xl font-bold text-yellow-200 animate-pulse">🚌 ¡Ya es hora de viajar! 🚌</div>
        <div class="text-lg opacity-90 mt-2">El viaje está programado para ahora</div>
        <div class="text-sm opacity-75 mt-1">Dirígete al punto de partida</div>
      </div>

      <!-- Almost time message -->
      <div v-else-if="isAlmostTime && !isPast && !isTimeToTravel" class="text-center">
        <div class="text-2xl font-bold text-yellow-200 mb-3">⏰ ¡Último momento!</div>
        <div class="flex justify-center items-center gap-2">
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-300">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
            <div class="text-xs opacity-75">min</div>
          </div>
          <div class="text-xl font-bold">:</div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-300">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
            <div class="text-xs opacity-75">seg</div>
          </div>
        </div>
        <div class="text-sm opacity-90 mt-2">Prepárate para el viaje</div>
      </div>

      <!-- Normal countdown display -->
      <div v-else-if="!isPast && !isTimeToTravel" class="flex justify-center items-center gap-4">
        <div class="text-center">
          <div class="text-3xl font-bold">{{ timeLeft.days }}</div>
          <div class="text-sm opacity-75">{{ timeLeft.days === 1 ? 'día' : 'días' }}</div>
        </div>
        <div class="text-2xl font-bold">:</div>
        <div class="text-center">
          <div class="text-3xl font-bold">{{ String(timeLeft.hours).padStart(2, '0') }}</div>
          <div class="text-sm opacity-75">horas</div>
        </div>
        <div class="text-2xl font-bold">:</div>
        <div class="text-center">
          <div class="text-3xl font-bold">{{ String(timeLeft.minutes).padStart(2, '0') }}</div>
          <div class="text-sm opacity-75">minutos</div>
        </div>
        <div class="text-2xl font-bold">:</div>
        <div class="text-center">
          <div class="text-3xl font-bold">{{ String(timeLeft.seconds).padStart(2, '0') }}</div>
          <div class="text-sm opacity-75">segundos</div>
        </div>
      </div>
      
      <!-- Past trip message -->
      <div v-else class="text-center">
        <div class="text-2xl font-bold text-red-200">¡Viaje ya realizado!</div>
        <div class="text-sm opacity-75 mt-1">Este viaje ya ha partido</div>
      </div>
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
  // If we have both trip_datetime and departure_time, combine them
  if (props.tripDateTime && props.departureTime) {
    const tripDate = new Date(props.tripDateTime)
    const [hours, minutes] = props.departureTime.split(':').map(Number)
    tripDate.setHours(hours, minutes, 0, 0)
    return tripDate
  }
  
  // Otherwise, use just the trip_datetime
  return new Date(props.tripDateTime)
})

const calculateTimeLeft = () => {
  const now = new Date()
  const target = targetDateTime.value
  const difference = target.getTime() - now.getTime()

  // Check if it's exactly time to travel (within 1 minute of departure)
  if (difference <= 60000 && difference > -60000) {
    isTimeToTravel.value = true
    isPast.value = false
    isAlmostTime.value = false
  }
  // Check if trip has already passed (more than 1 minute ago)
  else if (difference <= -60000) {
    isPast.value = true
    isTimeToTravel.value = false
    isAlmostTime.value = false
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    return
  }
  // Check if it's almost time (within 5 minutes)
  else if (difference <= 300000) {
    isAlmostTime.value = true
    isTimeToTravel.value = false
    isPast.value = false
  }
  // Normal countdown state
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
  
  // Update every second
  intervalId = setInterval(calculateTimeLeft, 1000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>