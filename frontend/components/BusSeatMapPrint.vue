<template>
  <div class="bus-seat-map-print">
    <div v-if="loading" class="flex justify-center py-6">
      <p>Cargando asientos...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 shadow-sm">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>

    <div v-else class="print-layout bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <!-- Cabecera -->
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
              <div class="text-white font-black text-lg">{{ trip.departure_time }}</div>
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

      <!-- Mapa de asientos -->
      <div class="seat-map-container px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
        <!-- Indicador de pasillo para móviles -->
        <div class="md:hidden flex justify-center mb-4">
          <div class="bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-lg">
            🚌 PASILLO CENTRAL
          </div>
        </div>

        <div class="relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6 lg:gap-8 bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-inner">
          <!-- Columna izquierda -->
          <div class="left-column md:pr-4">
            <div class="md:hidden mb-4 flex items-center justify-center space-x-2">
              <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <h3 class="text-sm font-bold text-gray-700">Lado Izquierdo</h3>
              <div class="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div v-for="seat in leftColumnSeats" :key="seat.id" class="seat-container group">
                <div class="seat-number flex items-center justify-center mb-2">
                  <div class="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {{ seat.number }}<span class="ml-1 opacity-75">{{ seat.position === 'window' ? '🪟' : '🚶' }}</span>
                  </div>
                </div>
                <div
                  class="seat-box relative rounded-2xl p-3 sm:p-4 flex flex-col justify-center text-center h-24 sm:h-28 transition-all duration-300 transform group-hover:scale-105 cursor-pointer shadow-lg border-2"
                  :class="getModernSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                  @contextmenu="handleContextMenu($event, seat)"
                >
                  <!-- Passenger info container -->
                  <div :class="{'invisible': !seat.occupied && seat.status !== 'reserved'}" class="mb-2">
                      <div class="text-xs sm:text-sm leading-tight font-bold text-gray-800 truncate" :title="seat.passenger?.name">
                          {{ seat.passenger?.name || '&nbsp;' }}
                      </div>
                      <div class="text-xs text-gray-600 font-medium">
                          {{ seat.passenger?.phone || '&nbsp;' }}
                      </div>
                  </div>

                  <!-- Status Indicator -->
                  <div class="absolute top-2 right-2">
                    <div class="w-3 h-3 rounded-full" :class="getStatusDotClass(seat)"></div>
                  </div>

                  <!-- Status Tag -->
                  <div class="mt-auto">
                      <span class="text-xs font-bold px-2 py-1 rounded-full inline-block" :class="getModernStatusClass(seat)">
                          {{ getSeatStatusText(seat) }}
                      </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pasillo central con logo (solo visible en escritorio) -->
          <div class="center-aisle hidden md:flex flex-col justify-center items-center px-4">
            <div class="relative">
              <div class="rotate-90 bg-gradient-to-r from-slate-600 to-gray-700 px-6 py-3 rounded-2xl text-white font-black text-sm tracking-[0.3em] shadow-xl whitespace-nowrap">
                🚌 PASILLO
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 rounded-2xl rotate-90 blur-sm"></div>
            </div>
          </div>

          <!-- Columna derecha -->
          <div class="right-column mt-6 sm:mt-8 md:mt-0 md:pl-4">
            <div class="md:hidden mb-4 flex items-center justify-center space-x-2">
              <div class="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
              <h3 class="text-sm font-bold text-gray-700">Lado Derecho</h3>
              <div class="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
            </div>
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div v-for="seat in rightColumnSeats" :key="seat.id" class="seat-container group">
                <div class="seat-number flex items-center justify-center mb-2">
                  <div class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {{ seat.number }}<span class="ml-1 opacity-75">{{ seat.position === 'window' ? '🪟' : '🚶' }}</span>
                  </div>
                </div>
                <div
                  class="seat-box relative rounded-2xl p-3 sm:p-4 flex flex-col justify-center text-center h-24 sm:h-28 transition-all duration-300 transform group-hover:scale-105 cursor-pointer shadow-lg border-2"
                  :class="getModernSeatClass(seat)"
                  @click="toggleSeatSelection(seat)"
                  @contextmenu="handleContextMenu($event, seat)"
                >
                  <!-- Passenger info container -->
                  <div :class="{'invisible': !seat.occupied && seat.status !== 'reserved'}" class="mb-2">
                      <div class="text-xs sm:text-sm leading-tight font-bold text-gray-800 truncate" :title="seat.passenger?.name">
                          {{ seat.passenger?.name || '&nbsp;' }}
                      </div>
                      <div class="text-xs text-gray-600 font-medium">
                          {{ seat.passenger?.phone || '&nbsp;' }}
                      </div>
                  </div>

                  <!-- Status Indicator -->
                  <div class="absolute top-2 right-2">
                    <div class="w-3 h-3 rounded-full" :class="getStatusDotClass(seat)"></div>
                  </div>

                  <!-- Status Tag -->
                  <div class="mt-auto">
                      <span class="text-xs font-bold px-2 py-1 rounded-full inline-block" :class="getModernStatusClass(seat)">
                          {{ getSeatStatusText(seat) }}
                      </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Leyenda -->
      <div class="legend mt-6 sm:mt-8 mb-6 px-4 sm:px-6 md:px-8">
        <div class="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-3xl shadow-xl border border-gray-200">
          <h4 class="text-center text-lg font-bold text-gray-800 mb-6 flex items-center justify-center space-x-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Leyenda de Estados</span>
          </h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-sm">✓</span>
              </div>
              <span class="text-sm font-bold text-gray-700">Disponible</span>
            </div>
            <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-sm">👆</span>
              </div>
              <span class="text-sm font-bold text-gray-700">Seleccionado</span>
            </div>
            <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-sm">⏳</span>
              </div>
              <span class="text-sm font-bold text-gray-700">Reservado</span>
            </div>
            <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div class="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-sm">🚫</span>
              </div>
              <span class="text-sm font-bold text-gray-700">Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Información de asientos seleccionados -->
      <div v-if="selectionEnabled && selectedSeats.length > 0" class="mt-1.5 sm:mt-2 mx-1 sm:mx-2 md:mx-3 mb-1 bg-blue-50 p-1 sm:p-1.5 md:p-2 rounded-lg border border-blue-100">
        <h4 class="text-[9px] sm:text-[10px] md:text-xs font-medium text-blue-800 mb-0.5 sm:mb-1 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 md:h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          Asientos sel: <span class="ml-1 bg-blue-200 text-blue-800 px-1 sm:px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px]">{{ selectedSeats.length }}</span>
        </h4>
        <div class="flex flex-wrap gap-0.5 sm:gap-1 mb-2">
          <span
            v-for="seat in selectedSeats" 
            :key="seat.id" 
            class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium bg-blue-100 text-blue-800 shadow-sm"
          >
            {{ seat.number }}{{ seat.position === 'window' ? 'V' : 'P' }}
            <button 
              @click="toggleSeatSelection(seat)"
              class="ml-0.5 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label="Quitar asiento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-2 w-2 sm:h-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        </div>
        
        <!-- Botones de acción profesionales -->
        <div class="flex gap-1 sm:gap-2">
          <button 
            @click="handleSellTicket"
            class="flex items-center px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] md:text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Vender
          </button>
          <button 
            @click="handleReserveSeat"
            class="flex items-center px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] md:text-xs bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Reservar
          </button>
          <button 
            @click="clearSelection"
            class="flex items-center px-2 sm:px-3 py-1 text-[8px] sm:text-[9px] md:text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Menú contextual -->
    <div 
      v-if="showContextMenu && enableContextMenu" 
      class="fixed bg-white shadow-lg rounded-md border border-gray-200 py-1 z-50"
      :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
      @click.stop
    >
      <div class="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100">
        Asiento {{ selectedSeatForContext?.number || '' }}
      </div>
      
      <!-- Opciones para asientos disponibles -->
      <template v-if="!selectedSeatForContext?.status || selectedSeatForContext?.status === 'available'">
        <button 
          @click="sellTicket"
          class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
        >
          Vender
        </button>
        <button 
          @click="reserveSeat"
          class="w-full text-left block px-4 py-1.5 text-sm text-yellow-600 hover:bg-gray-100"
        >
          Reservar
        </button>
      </template>
      
      <!-- Opción común: Ver detalles -->
      <button 
        v-if="selectedSeatForContext?.status === 'reserved' || selectedSeatForContext?.occupied || selectedSeatForContext?.status === 'occupied'"
        @click="viewSeatDetails"
        class="w-full text-left block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
      >
        Ver detalles
      </button>
      
      <!-- Opciones para asientos reservados -->
      <template v-if="selectedSeatForContext?.status === 'reserved'">
        <button 
          @click="cancelReservation"
          class="w-full text-left block px-4 py-1.5 text-sm text-red-600 hover:bg-gray-100"
        >
          Cancelar reserva
        </button>
      </template>
      
      <!-- Opciones para asientos ocupados -->
      <template v-if="selectedSeatForContext?.occupied || selectedSeatForContext?.status === 'occupied'">
        <button 
          @click="changeSeat"
          class="w-full text-left block px-4 py-1.5 text-sm text-blue-600 hover:bg-gray-100"
        >
          Cambiar asiento
        </button>
        <button 
          @click="rescheduleTrip"
          class="w-full text-left block px-4 py-1.5 text-sm text-green-600 hover:bg-gray-100"
        >
          Reprogramar viaje
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

// Asientos de la columna izquierda (1-21 ventana, 2-22 pasillo)
const leftColumnSeats = computed(() => {
  return seats.value.filter(seat => seat.column === 'left')
})

// Asientos de la columna derecha (23-43 ventana, 24-44 pasillo)
const rightColumnSeats = computed(() => {
  return seats.value.filter(seat => seat.column === 'right')
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

// Obtener clase CSS según el estado del asiento
const getSeatClass = (seat) => {
  if (seat.occupied) {
    return 'bg-red-50 border-red-400 cursor-not-allowed'
  } else if (seat.status === 'reserved') {
    return 'bg-yellow-50 border-yellow-400 cursor-not-allowed'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-blue-50 border-blue-400 cursor-pointer shadow-sm selected-seat-blink'
  } else {
    return 'bg-white border-green-400 hover:bg-green-50 cursor-pointer'
  }
}

// Nuevas funciones modernas para el diseño
const getModernSeatClass = (seat) => {
  if (seat.occupied) {
    return 'bg-gradient-to-br from-red-100 to-red-200 border-red-300 cursor-not-allowed hover:scale-100'
  } else if (seat.status === 'reserved') {
    return 'bg-gradient-to-br from-amber-100 to-orange-200 border-orange-300 cursor-not-allowed hover:scale-100'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-gradient-to-br from-blue-100 to-indigo-200 border-blue-400 cursor-pointer modern-seat-selected'
  } else {
    return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300 hover:from-emerald-100 hover:to-green-200 cursor-pointer hover:shadow-xl'
  }
}

const getModernStatusClass = (seat) => {
  if (seat.occupied) {
    return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
  } else if (seat.status === 'reserved') {
    return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
  } else {
    return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
  }
}

const getStatusDotClass = (seat) => {
  if (seat.occupied) {
    return 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg animate-pulse'
  } else if (seat.status === 'reserved') {
    return 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg animate-pulse'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg animate-pulse'
  } else {
    return 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg'
  }
}

const getSeatStatusText = (seat) => {
  if (seat.occupied) {
    return 'OCUPADO'
  } else if (seat.status === 'reserved') {
    return 'RESERVADO'
  } else if (selectedSeatIds.value.includes(seat.id)) {
    return 'SELECCIONADO'
  } else {
    return 'DISPONIBLE'
  }
}

// Función para sincronizar animaciones de asientos seleccionados
const synchronizeSelectedSeatsAnimation = () => {
  // Obtener todos los elementos con la clase de animación
  const selectedSeatElements = document.querySelectorAll('.selected-seat-blink')
  
  // Reiniciar la animación para todos los elementos
  selectedSeatElements.forEach(element => {
    // Remover temporalmente la clase de animación
    element.classList.remove('selected-seat-blink')
    // Forzar un reflow para asegurar que la animación se detenga
    element.offsetHeight
    // Volver a agregar la clase para reiniciar la animación
    element.classList.add('selected-seat-blink')
  })
}

// Alternar selección de asiento
const toggleSeatSelection = (seat) => {
  if (seat.occupied || seat.status === 'reserved' || props.disabled) return

  const index = selectedSeatIds.value.indexOf(seat.id)

  if (index === -1) {
    // Si el asiento no está seleccionado, verificar si se puede seleccionar
    if (props.maxSelections > 0 && selectedSeatIds.value.length >= props.maxSelections) {
      // Si ya se alcanzó el límite de selecciones, no hacer nada
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
  console.log('Emitting selection-change with:', selectedSeats.value)
  emit('selection-change', selectedSeats.value)
  
  // Sincronizar animaciones después de un pequeño delay para permitir que el DOM se actualice
  nextTick(() => {
    setTimeout(synchronizeSelectedSeatsAnimation, 10)
  })
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

// Abrir menú contextual con clic derecho
const handleContextMenu = (event, seat) => {
  if (!props.enableContextMenu) return
  
  // Mostrar menú contextual para todos los asientos
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

.seat-container {
  margin-bottom: 0.5rem;
}

.seat-box {
  min-height: 3rem;
  height: auto;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.seat-box:hover:not([class*="bg-red"]) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Nuevos estilos modernos */
.modern-seat-selected {
  animation: modern-seat-pulse 2s infinite;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
}

@keyframes modern-seat-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
  }
}

/* Animaciones de hover mejoradas */
.seat-container:hover .seat-box {
  transform: translateY(-2px);
}

/* Efectos de glassmorphism para la cabecera */
.header {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Transiciones suaves para todos los elementos interactivos */
.seat-box,
.seat-number div,
.legend div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animación para asientos seleccionados - Sincronizada */
@keyframes selected-seat-blink {
  0% {
    background-color: rgb(239 246 255); /* bg-blue-50 */
    border-color: rgb(96 165 250); /* border-blue-400 */
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
  25% {
    background-color: rgb(219 234 254); /* bg-blue-100 */
    border-color: rgb(59 130 246); /* border-blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  50% {
    background-color: rgb(147 197 253); /* bg-blue-300 */
    border-color: rgb(37 99 235); /* border-blue-600 */
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.8);
    transform: scale(1.03);
  }
  75% {
    background-color: rgb(219 234 254); /* bg-blue-100 */
    border-color: rgb(59 130 246); /* border-blue-500 */
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.6);
    transform: scale(1.01);
  }
  100% {
    background-color: rgb(239 246 255); /* bg-blue-50 */
    border-color: rgb(96 165 250); /* border-blue-400 */
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
}

/* Animación global sincronizada para todos los asientos seleccionados */
.selected-seat-blink {
  animation: selected-seat-blink 1.8s ease-in-out infinite;
  /* Usar animation-fill-mode para mantener consistencia */
  animation-fill-mode: both;
  /* Sincronizar todas las animaciones al mismo tiempo */
  animation-delay: 0s;
  /* Asegurar que todas las animaciones usen el mismo timeline */
  animation-timing-function: ease-in-out;
  /* Hacer la transición más suave */
  transition: all 0.1s ease;
}

/* Animación legacy mantenida para compatibilidad */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.bg-blue-50.border-blue-100 {
  animation: pulse 2s infinite;
}

/* Mejoras para dispositivos móviles - Versión moderna */
@media (max-width: 639px) {
  .print-layout {
    max-width: 100%;
    padding: 0;
    border-radius: 1rem;
  }

  .seat-number span {
    font-size: 0.6rem;
  }

  .seat-box .text-\[8px\] {
    font-size: 0.5rem;
  }
   .seat-box .text-\[9px\] { 
    font-size: 0.55rem;
  }

  .header h2 {
    font-size: 0.8rem;
  }

  .header p {
    font-size: 0.55rem;
  }

  /* Optimizaciones modernas para móviles */
  .modern-seat-selected {
    animation: modern-seat-pulse-mobile 1.5s infinite;
  }
  
  @keyframes modern-seat-pulse-mobile {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
    }
  }

  .seat-container:hover .seat-box {
    transform: translateY(-1px);
  }

  .header {
    border-radius: 1rem 1rem 0 0;
  }
}

/* Estilos para impresión */
@media print {
  .legend,
  button,
  .center-aisle {
    display: none !important;
  }

  .print-layout {
    padding: 0;
    max-width: 100%;
    box-shadow: none;
  }

  .seat-box {
    border: 1px solid #166534 !important;
    page-break-inside: avoid;
    box-shadow: none !important;
    animation: none !important;
    transform: none !important;
  }

  .header {
    background: none !important;
    border-bottom: 2px solid #166534 !important;
  }

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .seat-container {
    page-break-inside: avoid;
  }

  .md\:hidden {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .seat-box {
    transition: none;
  }
  .bg-blue-50.border-blue-100 {
    animation: none;
  }
  .selected-seat-blink {
    animation: none;
  }
}

/* Contenedor para sincronizar todas las animaciones de asientos */
.seat-map-container {
  /* Forzar repaint para sincronizar animaciones */
  animation-play-state: running;
}
</style>
