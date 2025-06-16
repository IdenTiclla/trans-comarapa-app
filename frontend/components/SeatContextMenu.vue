<template>
  <div 
    v-if="visible && enableContextMenu" 
    class="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50"
    :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    @click.stop
  >
    <div class="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
      Asiento {{ selectedSeat?.number || '' }}
    </div>
    
    <!-- Opciones para asientos disponibles -->
    <template v-if="!selectedSeat?.status || selectedSeat?.status === 'available'">
      <button 
        @click="$emit('sell-ticket')"
        class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
      >
        Vender
      </button>
      <button 
        @click="$emit('reserve-seat')"
        class="w-full text-left block px-4 py-1.5 text-sm text-yellow-600 hover:bg-gray-100"
      >
        Reservar
      </button>
    </template>
    
    <!-- Opción común: Ver detalles -->
    <button 
      v-if="selectedSeat?.status === 'reserved' || selectedSeat?.occupied || selectedSeat?.status === 'occupied'"
      @click="$emit('view-details')"
      class="w-full text-left block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
    >
      Ver detalles
    </button>
    
    <!-- Opciones para asientos reservados -->
    <template v-if="selectedSeat?.status === 'reserved'">
      <button 
        @click="$emit('cancel-reservation')"
        class="w-full text-left block px-4 py-1.5 text-sm text-red-600 hover:bg-gray-100"
      >
        Cancelar reserva
      </button>
    </template>
    
    <!-- Opciones para asientos ocupados -->
    <template v-if="selectedSeat?.occupied || selectedSeat?.status === 'occupied'">
      <button 
        @click="$emit('change-seat')"
        class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
      >
        Cambiar asiento
      </button>
      <button 
        @click="$emit('reschedule-trip')"
        class="w-full text-left block px-4 py-1.5 text-sm text-green-600 hover:bg-gray-100"
      >
        Reprogramar viaje
      </button>
    </template>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  selectedSeat: {
    type: Object,
    default: null
  },
  enableContextMenu: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'sell-ticket',
  'reserve-seat',
  'view-details',
  'cancel-reservation',
  'change-seat',
  'reschedule-trip'
])
</script>