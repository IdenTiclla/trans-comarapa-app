<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 w-full">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 w-full">
      <div class="w-full px-2 sm:px-4 lg:px-6 py-4">
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Tablero de Viajes</h1>
              <p class="text-gray-700">{{ formattedSelectedDate }}</p>
            </div>
          </div>

          <!-- Date Selector -->
          <div class="flex items-center flex-wrap gap-2">
            <!-- Quick date buttons -->
            <button
              @click="setDate('today')"
              :class="[
                isToday ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                'px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
              ]"
            >
              Hoy
            </button>
            <button
              @click="setDate('tomorrow')"
              :class="[
                isTomorrow ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                'px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
              ]"
            >
              Manana
            </button>
            <button
              @click="setDate('dayAfterTomorrow')"
              :class="[
                isDayAfterTomorrow ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                'px-3 py-2 text-sm font-medium rounded-lg border transition-colors'
              ]"
            >
              Pasado manana
            </button>

            <!-- Date input -->
            <div class="relative">
              <input
                type="date"
                v-model="selectedDate"
                class="pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                @change="loadData"
              />
            </div>

            <!-- New trip button -->
            <AppButton
              variant="primary"
              @click="navigateTo('/trips/new')"
              class="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Viaje
            </AppButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full px-2 sm:px-4 lg:px-6 py-6 overflow-x-hidden">
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-2xl font-bold text-indigo-600">{{ quickStats.totalSchedules }}</div>
          <div class="text-sm text-gray-600">Horarios del dia</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-2xl font-bold text-green-600">{{ quickStats.tripsCreated }}</div>
          <div class="text-sm text-gray-600">Viajes creados</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-2xl font-bold text-orange-600">{{ quickStats.emptySlots }}</div>
          <div class="text-sm text-gray-600">Sin viaje</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-2xl font-bold text-purple-600">{{ quickStats.totalRoutes }}</div>
          <div class="text-sm text-gray-600">Rutas activas</div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="hasError" class="mb-6">
        <div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">Error al cargar datos</h3>
              <p class="text-red-700 mt-1">{{ tripStore.error || routeStore.error }}</p>
              <button @click="loadData" class="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 font-medium px-4 py-2 rounded-lg transition-colors border border-red-300">
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Board -->
      <TripCardList
        :schedule-board="scheduleBoard"
        :loading="isLoading"
        :selected-date="selectedDate"
        @view-trip="handleViewTrip"
        @edit-trip="handleEditTrip"
        @create-trip="handleCreateTrip"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, navigateTo } from '#app';
import { useTripStore } from '~/stores/tripStore';
import { useRouteStore } from '~/stores/routeStore';
import TripCardList from '~/components/TripCardList.vue';

const router = useRouter();
const tripStore = useTripStore();
const routeStore = useRouteStore();

// Date helpers
const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getTodayStr = () => formatDateStr(new Date());

const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateStr(d);
};

const getDayAfterTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return formatDateStr(d);
};

// State
const selectedDate = ref(getTodayStr());

// Computed
const isToday = computed(() => selectedDate.value === getTodayStr());
const isTomorrow = computed(() => selectedDate.value === getTomorrowStr());
const isDayAfterTomorrow = computed(() => selectedDate.value === getDayAfterTomorrowStr());

const formattedSelectedDate = computed(() => {
  try {
    const parts = selectedDate.value.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const formatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return selectedDate.value;
  }
});

const isLoading = computed(() => tripStore.isLoading || routeStore.isLoading);
const hasError = computed(() => tripStore.error || routeStore.error);

// Build the schedule board: for each route, for each active schedule, find matching trip or null
const scheduleBoard = computed(() => {
  const routes = routeStore.routesWithSchedules || [];
  const trips = tripStore.trips || [];
  const board = [];

  for (const route of routes) {
    const activeSchedules = (route.schedules || []).filter(s => s.is_active);
    if (activeSchedules.length === 0) continue;

    const slots = activeSchedules.map(schedule => {
      // Normalize departure_time to "HH:MM"
      const timeParts = schedule.departure_time.split(':');
      const scheduleTimeHHMM = `${timeParts[0].padStart(2, '0')}:${timeParts[1]}`;

      // Find a matching trip for this route and time on the selected date
      const matchingTrip = trips.find(t => {
        if (t.route_id !== route.id) return false;
        try {
          const tripDate = new Date(t.trip_datetime);
          const tripHH = String(tripDate.getHours()).padStart(2, '0');
          const tripMM = String(tripDate.getMinutes()).padStart(2, '0');
          return `${tripHH}:${tripMM}` === scheduleTimeHHMM;
        } catch {
          return false;
        }
      });

      return {
        schedule,
        time: scheduleTimeHHMM,
        trip: matchingTrip || null,
        route: {
          id: route.id,
          origin: route.origin_location?.name || 'Desconocido',
          destination: route.destination_location?.name || 'Desconocido',
          price: route.price,
        }
      };
    });

    // Sort by time
    slots.sort((a, b) => a.time.localeCompare(b.time));

    board.push({
      route: {
        id: route.id,
        origin: route.origin_location?.name || 'Desconocido',
        destination: route.destination_location?.name || 'Desconocido',
        price: route.price,
      },
      slots,
    });
  }

  return board;
});

const quickStats = computed(() => {
  let totalSchedules = 0;
  let tripsCreated = 0;
  let emptySlots = 0;

  for (const group of scheduleBoard.value) {
    for (const slot of group.slots) {
      totalSchedules++;
      if (slot.trip) {
        tripsCreated++;
      } else {
        emptySlots++;
      }
    }
  }

  return {
    totalSchedules,
    tripsCreated,
    emptySlots,
    totalRoutes: scheduleBoard.value.length,
  };
});

// Methods
const setDate = (option) => {
  if (option === 'today') {
    selectedDate.value = getTodayStr();
  } else if (option === 'tomorrow') {
    selectedDate.value = getTomorrowStr();
  } else if (option === 'dayAfterTomorrow') {
    selectedDate.value = getDayAfterTomorrowStr();
  }
};

const loadData = async () => {
  const dateFrom = `${selectedDate.value}T00:00:00`;
  const dateTo = `${selectedDate.value}T23:59:59`;

  await Promise.all([
    routeStore.fetchRoutesWithSchedules(),
    tripStore.fetchTrips({
      page: 1,
      itemsPerPage: 100,
      sortBy: 'trip_datetime',
      sortDirection: 'asc',
      filters: {
        dateFrom,
        dateTo,
      }
    })
  ]);
};

const handleViewTrip = (tripId) => {
  router.push(`/trips/${tripId}`);
};

const handleEditTrip = (tripId) => {
  router.push(`/trips/${tripId}/edit`);
};

const handleCreateTrip = ({ routeId, date, time }) => {
  router.push(`/trips/new?route_id=${routeId}&date=${date}&time=${time}`);
};

// Watch date changes
watch(selectedDate, () => {
  loadData();
});

// Initial load
onMounted(() => {
  loadData();
});

// Page meta
useHead({
  title: 'Tablero de Viajes - Trans Comarapa',
  meta: [
    { name: 'description', content: 'Tablero de viajes diarios de Trans Comarapa' }
  ]
});
</script>
