<template>
  <div class="bus-seat-map-print">
    <div v-if="loading" class="flex justify-center py-6">
      <p>Cargando asientos...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>

    <div v-else class="print-layout bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <!-- Header Component -->
      <BusTripHeader 
        :trip="trip" 
        :occupied-seats-count="occupiedSeatsCount"
        :reserved-seats-count="reservedSeatsCount"
        :available-seats-count="availableSeatsCount"
      />

      <!-- Seat Grid Component -->
      <BusSeatGrid 
        :seats="seats"
        :selected-seat-ids="selectedSeatIds"
        :disabled="disabled"
        :max-selections="maxSelections"
        :tickets="tickets"
        @seat-selected="handleSeatSelected"
        @seat-deselected="handleSeatDeselected"
        @selection-change="handleSelectionChange"
        @context-menu="handleContextMenu"
      />

      <!-- Legend Component -->
      <BusSeatLegend />

      <!-- Selected Seats Panel Component -->
      <SelectedSeatsPanel 
        :selected-seats="selectedSeats"
        :selection-enabled="selectionEnabled"
        @sell-ticket="handleSellTicket"
        @reserve-seat="handleReserveSeat"
        @clear-selection="clearSelection"
        @remove-seat="toggleSeatSelection"
      />
    </div>
    
    <!-- Context Menu Component -->
    <SeatContextMenu 
      :visible="showContextMenu"
      :position="contextMenuPosition"
      :selected-seat="selectedSeatForContext"
      :enable-context-menu="enableContextMenu"
      @sell-ticket="sellTicket"
      @reserve-seat="reserveSeat"
      @view-details="viewSeatDetails"
      @cancel-reservation="cancelReservation"
      @confirm-sale="confirmSale"
      @change-seat="changeSeat"
      @reschedule-trip="rescheduleTrip"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import BusTripHeader from './BusTripHeader.vue'
import BusSeatGrid from './BusSeatGrid.vue'
import BusSeatLegend from './BusSeatLegend.vue'
import SelectedSeatsPanel from './SelectedSeatsPanel.vue'
import SeatContextMenu from './SeatContextMenu.vue'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  },
  tickets: {
    type: Array,
    default: () => []
  },
  occupiedSeats: {
    type: Array,
    default: () => []
  },
  reserved_seat_numbers: {
    type: Array,
    default: () => []
  },
  initialSelectedSeats: {
    type: Array,
    default: () => []
  },
  selectionEnabled: {
    type: Boolean,
    default: true
  },
  maxSelections: {
    type: Number,
    default: 0 // 0 significa sin límite
  },
  disabled: {
    type: Boolean,
    default: false
  },
  enableContextMenu: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'seat-selected', 
  'seat-deselected', 
  'selection-change', 
  'cancel-reservation',
  'confirm-sale',
  'view-details',
  'change-seat',
  'reschedule-trip',
  'sell-ticket',
  'reserve-seat'
])

const loading = ref(true)
const error = ref(null)
const seats = ref([])
const selectedSeatIds = ref([])

// Estado para el menú contextual
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedSeatForContext = ref(null)

// Asientos seleccionados
const selectedSeats = computed(() => {
  return seats.value.filter(seat => selectedSeatIds.value.includes(seat.id))
})


// Computed properties for seat statistics
const occupiedSeatsCount = computed(() => {
  if (!seats.value) return 0;
  return seats.value.filter(seat => seat.occupied).length;
})

const reservedSeatsCount = computed(() => {
  if (!seats.value) return 0;
  return seats.value.filter(seat => seat.status === 'reserved').length;
})

const availableSeatsCount = computed(() => {
  if (!props.trip || typeof props.trip.total_seats !== 'number') return 0;
  const occupiedCount = occupiedSeatsCount.value;
  const reservedCount = reservedSeatsCount.value;
  return props.trip.total_seats - occupiedCount - reservedCount;
})


// Alternar selección de asiento (usado principalmente desde SelectedSeatsPanel)
const toggleSeatSelection = (seat) => {
  if (seat.occupied || seat.status === 'reserved' || props.disabled) return

  const index = selectedSeatIds.value.indexOf(seat.id)

  if (index === -1) {
    // Si el asiento no está seleccionado, verificar si se puede seleccionar
    if (props.maxSelections > 0 && selectedSeatIds.value.length >= props.maxSelections) {
      return
    }

    // Seleccionar asiento
    selectedSeatIds.value.push(seat.id)
    console.log('Seat selected:', seat.number, 'Current selection:', selectedSeatIds.value)
    emit('seat-selected', seat)
  } else {
    // Deseleccionar asiento
    selectedSeatIds.value.splice(index, 1)
    console.log('Seat deselected:', seat.number, 'Current selection:', selectedSeatIds.value)
    emit('seat-deselected', seat)
  }

  // Emitir evento de cambio de selección
  emit('selection-change', selectedSeats.value)
}

// Cargar asientos
const loadSeats = async () => {
  loading.value = true
  error.value = null

  try {
    // No necesitamos hacer una llamada a la API porque ya tenemos los datos del viaje
    // Solo simulamos un breve retraso para mostrar el estado de carga
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!props.trip || !props.trip.seats_layout) {
      console.warn('BusSeatMapPrint: props.trip.seats_layout no está disponible.');
      seats.value = [];
      loading.value = false;
      error.value = 'No se pudo cargar la información de los asientos desde el viaje.';
      return;
    }

    // Utilizar los asientos proporcionados por el backend a través de props.trip.seats_layout
    const backendSeats = props.trip.seats_layout;
    const tickets = props.tickets || [];
    console.log('Estados de asientos:', backendSeats.map(seat => seat.status));
    console.log('Asientos reservados:', backendSeats.filter(seat => seat.status === 'reserved').length);
    
    // Obtener los tickets para identificar cuáles están en "pending" (reservados)
    const reservedSeatNumbers = props.reserved_seat_numbers || [];
    console.log('Números de asientos reservados:', reservedSeatNumbers);
    
    const generatedSeats = [];

    // Asumimos que el backend ya proporciona todos los detalles necesarios, 
    // incluyendo id (PK), seat_number, y status.
    // La lógica para determinar columna y posición (ventana/pasillo) 
    // puede necesitar ser adaptada o el backend podría proveerla.
    // Por ahora, intentaremos mantener la lógica de columna/posición del frontend si es posible,
    // o simplificarla si el backend no provee 'deck' o 'position' de forma consistente.

    for (const backendSeat of backendSeats) {
      // Determinar columna y posición basado en el número de asiento
      let column = 'unknown';
      let position = 'unknown'; // 'window' o 'aisle'
      const seatNumber = backendSeat.seat_number;
      
      // Verificar si el asiento está reservado (tiene un ticket en estado "pending")
      // En el backend actual, ambos pending y confirmed se marcan como 'occupied'
      // Así que usamos una lista de asientos reservados que pasamos como prop
      const isReserved = reservedSeatNumbers.includes(seatNumber);
      let status = backendSeat.status;
      
      // Si el asiento está ocupado pero también está en la lista de reservados,
      // lo marcamos como 'reserved' en lugar de 'occupied'
      if (status === 'occupied' && isReserved) {
        status = 'reserved';
      }

      const ticket = tickets.find(t => t.seat?.id === backendSeat.id);

      let passenger = null;
      if (ticket && ticket.client) {
        passenger = {
          name: `${ticket.client.firstname || ''} ${ticket.client.lastname || ''}`.trim(),
          phone: ticket.client.phone || ''
        };
      }

      // Define typicalSeatsPerRow. This value might eventually come from bus configuration data.
      // For common 2x2 layouts, this is 4.
      // For 2+1 layouts, this would be 3.
      // The logic below should adapt if this value changes.
      const typicalSeatsPerRow = 4; // Assuming 2 seats on left, 2 seats on right separated by aisle

      if (typicalSeatsPerRow > 0) {
        const idxInRowGroup = (seatNumber - 1) % typicalSeatsPerRow;

        // Determine column and position based on typical bus layout (2x2)
        if (idxInRowGroup < typicalSeatsPerRow / 2) { // First half of seats in a row group (e.g., 0, 1 for typicalSeatsPerRow=4)
          column = 'left';
          // For left column: odd is window, even is aisle
          if (seatNumber % 2 !== 0) { 
            position = 'window';
          } else { 
            position = 'aisle';
          }
        } else { // Second half of seats in a row group (e.g., 2, 3 for typicalSeatsPerRow=4)
          column = 'right';
          // For right column: odd is aisle, even is window
          if (seatNumber % 2 !== 0) { 
            position = 'aisle';
          } else { 
            position = 'window';
          }
        }
      } else {
        console.warn(`BusSeatMapPrint: typicalSeatsPerRow is ${typicalSeatsPerRow}. Cannot determine column/position for seat ${seatNumber}.`);
        // column and position will remain 'unknown' as initialized
      }
      
      // Si el backendSeat tiene 'deck', usarlo. Si no, el frontend no puede determinarlo fácilmente.
      const seatDeck = backendSeat.deck || 'main'; 

      generatedSeats.push({
        id: backendSeat.id, // ID Primario del backend
        number: backendSeat.seat_number, // Número de asiento del backend
        status: status, // 'occupied', 'reserved', o 'available'
        occupied: status === 'occupied', // Mantener 'occupied' para compatibilidad con getSeatClass
        position: position, // Inferido o del backend si disponible
        column: column,     // Inferido o del backend si disponible
        deck: seatDeck,      // Del backend, o default
        passenger: passenger
      });
    }

    seats.value = generatedSeats.sort((a, b) => a.number - b.number); // Asegurar orden por número de asiento

    // Reinicializar la selección basada en props.initialSelectedSeats después de cargar los asientos
    if (props.initialSelectedSeats && props.initialSelectedSeats.length > 0) {
      selectedSeatIds.value = props.initialSelectedSeats.map(seat => seat.id || seat.seat_id)
      console.log('Reinitialized selectedSeatIds after loading seats:', selectedSeatIds.value)
    }

  } catch (err) {
    console.error('Error al procesar los asientos:', err)
    error.value = 'No se pudieron procesar los asientos. Intente nuevamente.'
    seats.value = [];
  } finally {
    loading.value = false
  }
}


// Observar cambios en las propiedades
watch(() => props.trip, (newTrip) => {
  if (newTrip && newTrip.seats_layout) {
    loadSeats();
  }
}, { deep: true, immediate: true }); // immediate: true para cargar al inicio

watch(() => props.occupiedSeats, () => {
  // Esta prop podría volverse obsoleta si props.trip.seats_layout es la única fuente de verdad
  // Si se mantiene, y se actualiza desde fuera, forzaría un reload de asientos 
  // pero loadSeats ahora depende de props.trip.seats_layout
  // loadSeats() 
}, { deep: true });

watch(() => props.initialSelectedSeats, (newVal, oldVal) => {
  // Solo actualizar si realmente cambió el contenido y no es una re-emisión de lo mismo
  const newIds = newVal ? newVal.map(seat => seat.id || seat.seat_id) : []
  const currentIds = selectedSeatIds.value
  
  // Verificar si realmente hay un cambio
  const hasChanged = newIds.length !== currentIds.length || 
    !newIds.every(id => currentIds.includes(id))
  
  if (hasChanged) {
    console.log('Props initialSelectedSeats changed from:', oldVal, 'to:', newVal)
    console.log('Updating selectedSeatIds from:', currentIds, 'to:', newIds)
    selectedSeatIds.value = newIds
  } else {
    console.log('Props initialSelectedSeats received but no real change detected')
  }
}, { immediate: true, deep: true })

// Añadir watcher para reserved_seat_numbers
watch(() => props.reserved_seat_numbers, () => {
  // Recargar los asientos cuando cambia la lista de asientos reservados
  if (props.trip && props.trip.seats_layout) {
    loadSeats();
  }
}, { deep: true });

// Event handlers for child components
const handleSeatSelected = (seat, newSelectedIds) => {
  selectedSeatIds.value = newSelectedIds
  console.log('Seat selected:', seat.number, 'Current selection:', selectedSeatIds.value)
  emit('seat-selected', seat)
}

const handleSeatDeselected = (seat, newSelectedIds) => {
  selectedSeatIds.value = newSelectedIds
  console.log('Seat deselected:', seat.number, 'Current selection:', selectedSeatIds.value)
  emit('seat-deselected', seat)
}

const handleSelectionChange = (selectedSeatsArray) => {
  console.log('Selection changed to:', selectedSeatsArray)
  emit('selection-change', selectedSeatsArray)
}

// Abrir menú contextual con clic derecho
const handleContextMenu = (event, seat) => {
  if (!props.enableContextMenu) return
  
  event.preventDefault()
  showContextMenu.value = true
  contextMenuPosition.value = { x: event.clientX, y: event.clientY }
  selectedSeatForContext.value = seat
}

// Cerrar menú contextual
const closeContextMenu = () => {
  showContextMenu.value = false
  selectedSeatForContext.value = null
}

// Cancelar reserva
const cancelReservation = () => {
  if (selectedSeatForContext.value) {
    emit('cancel-reservation', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Confirmar venta de reserva
const confirmSale = () => {
  if (selectedSeatForContext.value) {
    emit('confirm-sale', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Ver detalles del asiento
const viewSeatDetails = () => {
  if (selectedSeatForContext.value) {
    emit('view-details', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Cambiar asiento
const changeSeat = () => {
  if (selectedSeatForContext.value) {
    emit('change-seat', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Reprogramar viaje
const rescheduleTrip = () => {
  if (selectedSeatForContext.value) {
    emit('reschedule-trip', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Vender boleto
const sellTicket = () => {
  if (selectedSeatForContext.value) {
    emit('sell-ticket', selectedSeatForContext.value)
    closeContextMenu()
  }
}

// Reservar asiento
const reserveSeat = () => {
  if (selectedSeatForContext.value) {
    // Verificar que el asiento esté disponible para reservar
    if (!selectedSeatForContext.value.occupied && 
        selectedSeatForContext.value.status !== 'reserved' && 
        selectedSeatForContext.value.status !== 'occupied') {
      
      // Si hay asientos seleccionados globalmente, usar esos
      if (selectedSeats.value.length > 0) {
        const availableSelectedSeats = selectedSeats.value.filter(seat => 
          !seat.occupied && seat.status !== 'reserved' && seat.status !== 'occupied'
        );
        if (availableSelectedSeats.length > 0) {
          emit('reserve-seat', availableSelectedSeats);
        } else {
          // Si ninguno de los seleccionados está disponible, usar el del contexto
          emit('reserve-seat', [selectedSeatForContext.value]);
        }
      } else {
        // Si no hay selección global, usar solo el asiento del menú contextual
        emit('reserve-seat', [selectedSeatForContext.value]);
      }
    } else {
      console.warn('El asiento no está disponible para reservar');
    }
    closeContextMenu();
  }
};

// Cerrar el menú cuando se hace clic fuera
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (showContextMenu.value) {
      closeContextMenu()
    }
  })
})

// Funciones para botones de acción
const handleSellTicket = () => {
  if (selectedSeats.value.length > 0) {
    console.log('Selling tickets for seats:', selectedSeats.value);
    // Emitir todos los asientos seleccionados para vender
    emit('sell-ticket', selectedSeats.value);
  }
};

const handleReserveSeat = () => {
  if (selectedSeats.value.length > 0) {
    console.log('Reserving seats:', selectedSeats.value);
    // Emitir todos los asientos seleccionados para reservar
    emit('reserve-seat', selectedSeats.value);
  }
};

const clearSelection = () => {
  selectedSeatIds.value = [];
  emit('selection-change', []);
  console.log('Cleared selection manually');
};
</script>

<style scoped>
.print-layout {
  max-width: 100%;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 639px) {
  .print-layout {
    max-width: 100%;
    padding: 0;
    border-radius: 1rem;
  }
}

/* Estilos para impresión */
@media print {
  .print-layout {
    padding: 0;
    max-width: 100%;
    box-shadow: none;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
}
</style>
