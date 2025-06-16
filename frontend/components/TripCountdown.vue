<template>
  <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 mb-6">
    <div class="text-center">
      <h3 class="text-lg font-semibold mb-2">Tiempo restante para el viaje</h3>
      
      <!-- Countdown display -->
      <div v-if="!isPast" class="flex justify-center items-center gap-4">
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

  if (difference <= 0) {
    isPast.value = true
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    return
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