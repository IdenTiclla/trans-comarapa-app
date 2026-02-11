<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div v-for="n in 2" :key="n" class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="m in 3" :key="m" class="bg-white shadow-md rounded-xl border border-gray-100 p-6 animate-pulse">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div class="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (no routes with schedules) -->
    <div v-else-if="!scheduleBoard || scheduleBoard.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div class="max-w-md mx-auto">
        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">No hay horarios configurados</h3>
        <p class="text-gray-600 mb-6">No se encontraron rutas con horarios activos. Configure horarios desde la administracion de rutas.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="navigateTo('/admin/routes')" class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurar Rutas
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Board -->
    <div v-else class="space-y-6">
      <div
        v-for="group in scheduleBoard"
        :key="group.route.id"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <!-- Route Group Header -->
        <button
          @click="toggleRouteGroup(group.route.id)"
          class="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 hover:from-indigo-100 hover:to-purple-100 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-bold text-gray-900">
                {{ group.route.origin }}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mx-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                {{ group.route.destination }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ group.slots.length }} horario{{ group.slots.length !== 1 ? 's' : '' }}
                &middot;
                {{ countTripsInGroup(group) }} viaje{{ countTripsInGroup(group) !== 1 ? 's' : '' }} creado{{ countTripsInGroup(group) !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <!-- Progress badge -->
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              :class="countTripsInGroup(group) === group.slots.length 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'"
            >
              {{ countTripsInGroup(group) }}/{{ group.slots.length }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': isRouteExpanded(group.route.id) }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <!-- Route Group Content -->
        <div v-if="isRouteExpanded(group.route.id)" class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <template v-for="slot in group.slots" :key="`${group.route.id}-${slot.time}`">
              <!-- Existing Trip Card -->
              <TripCard
                v-if="slot.trip"
                :trip="slot.trip"
                @view-trip="$emit('view-trip', $event)"
                @edit-trip="$emit('edit-trip', $event)"
              />

              <!-- Empty Slot Card -->
              <div
                v-else
                class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-4 lg:p-6 flex flex-col justify-between hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group cursor-pointer"
                @click="$emit('create-trip', { routeId: slot.route.id, date: selectedDate, time: slot.time })"
              >
                <!-- Time Header -->
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center space-x-3">
                      <div class="flex items-center justify-center w-10 h-10 bg-gray-100 group-hover:bg-indigo-100 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-2xl font-bold text-gray-900">{{ slot.time }}</p>
                        <p class="text-sm text-gray-500">Horario programado</p>
                      </div>
                    </div>
                    <span class="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full border bg-gray-50 text-gray-600 border-gray-200">
                      <span class="w-2 h-2 rounded-full mr-2 bg-gray-400"></span>
                      Sin viaje
                    </span>
                  </div>

                  <!-- Route info -->
                  <div class="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-4">
                    <div class="flex items-center space-x-2 text-sm text-gray-700">
                      <span class="font-medium">{{ slot.route.origin }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span class="font-medium">{{ slot.route.destination }}</span>
                    </div>
                    <p v-if="slot.route.price" class="text-xs text-gray-500 mt-1">
                      Precio: {{ formatCurrency(slot.route.price) }}
                    </p>
                  </div>
                </div>

                <!-- Create Trip Button -->
                <div class="pt-4 border-t border-gray-200 mt-auto">
                  <button
                    class="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 group-hover:bg-indigo-100 group-hover:border-indigo-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Crear Viaje
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { navigateTo } from '#app';
import TripCard from './TripCard.vue';

const props = defineProps({
  scheduleBoard: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['view-trip', 'edit-trip', 'create-trip']);

// Track explicitly collapsed routes (all expanded by default)
const collapsedRoutes = reactive({});

// Groups are expanded unless explicitly collapsed
const isRouteExpanded = (routeId) => {
  return collapsedRoutes[routeId] !== true;
};

const toggleRouteGroup = (routeId) => {
  collapsedRoutes[routeId] = !collapsedRoutes[routeId];
};

const countTripsInGroup = (group) => {
  return group.slots.filter(slot => slot.trip !== null).length;
};

const formatCurrency = (amount) => {
  if (!amount) return '';
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(amount);
};
</script>
