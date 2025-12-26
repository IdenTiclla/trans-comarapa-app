<template>
  <section id="rutas" class="py-16 sm:py-20 md:py-24 bg-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12 sm:mb-16">
        <div class="inline-flex items-center gap-2 bg-comarapa-light/20 px-3 sm:px-4 py-2 rounded-full mb-4">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <span class="text-comarapa-dark font-medium text-sm sm:text-base">Nuestra Ruta</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-comarapa-dark mb-4 sm:mb-6">
          Conectamos 23 Localidades
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Un recorrido completo desde Comarapa hasta Santa Cruz por el hermoso paisaje del Valle
        </p>
      </div>

      <!-- Route Map Component -->
      <div class="w-full">
        <!-- Section title -->
        <div class="text-center mb-6 md:mb-8 px-4">
          <h3 class="text-xl md:text-2xl lg:text-3xl font-bold text-comarapa-dark mb-3 md:mb-4">
            Nuestra Ruta Completa
          </h3>
          <p class="text-sm md:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Conectando 23 localidades desde Comarapa hasta Santa Cruz, 
            ahora con salidas directas desde San Isidro
          </p>
        </div>

        <!-- Route container with horizontal scroll -->
        <div class="relative overflow-x-auto pb-6 md:pb-8">
          <!-- Mobile scroll indicator -->
          <div class="block md:hidden text-center mb-4">
            <p class="text-xs text-gray-500 flex items-center justify-center gap-2">
              <span>👈 Desliza para ver toda la ruta 👉</span>
            </p>
          </div>
          
          <div class="flex items-center justify-start min-w-max px-4 md:px-8 lg:px-12" style="min-width: 1600px;">
            <template v-for="(locality, index) in routeLocalities" :key="index">
              <!-- Locality node -->
              <div class="flex flex-col items-center relative touch-manipulation">
                <!-- Numbered circle -->
                <div
                  class="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full flex items-center justify-center font-bold text-white border-4 border-white shadow-lg relative z-10 transition-all duration-300 hover:scale-110 cursor-pointer"
                  :class="locality.type === 'principal' 
                    ? 'bg-comarapa-dark text-base sm:text-lg md:text-xl lg:text-2xl' 
                    : 'bg-comarapa-light text-sm sm:text-base md:text-lg lg:text-xl'"
                  :title="`${locality.name} - Parada ${index + 1}`"
                >
                  {{ index + 1 }}
                </div>
                
                <!-- Locality name -->
                <div class="mt-2 sm:mt-3 text-center max-w-16 sm:max-w-20 md:max-w-24 lg:max-w-28">
                  <p 
                    class="text-xs sm:text-sm md:text-base font-semibold leading-tight"
                    :class="locality.type === 'principal' ? 'text-comarapa-dark' : 'text-gray-700'"
                  >
                    {{ locality.name }}
                  </p>
                </div>

                <!-- Principal city indicator -->
                <div v-if="locality.type === 'principal'" class="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 z-20">
                  <div class="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-2 h-2 sm:w-3 sm:h-3 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Connector line (don't show after last element) -->
              <div 
                v-if="index < routeLocalities.length - 1" 
                class="flex-1 h-1 sm:h-1.5 bg-comarapa-light mx-2 sm:mx-3 md:mx-4 lg:mx-6 min-w-12 sm:min-w-16 md:min-w-20 lg:min-w-24 relative"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-comarapa-light to-comarapa-medium rounded-full shadow-sm"></div>
              </div>
            </template>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8 mb-6 md:mb-8 px-4">
          <div class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <div class="w-3 h-3 sm:w-4 sm:h-4 bg-comarapa-dark rounded-full"></div>
            <span class="text-xs sm:text-sm text-gray-600 font-medium">Ciudades Principales</span>
          </div>
          <div class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <div class="w-3 h-3 sm:w-4 sm:h-4 bg-comarapa-light rounded-full"></div>
            <span class="text-xs sm:text-sm text-gray-600 font-medium">Localidades</span>
          </div>
          <div class="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <div class="w-4 h-1 sm:w-4 sm:h-1 bg-comarapa-light rounded-full"></div>
            <span class="text-xs sm:text-sm text-gray-600 font-medium">Conexión</span>
          </div>
        </div>

        <!-- Google Maps button -->
        <div class="text-center mt-6 md:mt-8 px-4">
          <a 
            href="https://maps.app.goo.gl/sTTbpF179E2ZnpyV9"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 sm:gap-3 bg-comarapa-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-comarapa-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 touch-manipulation text-sm sm:text-base"
            style="min-height: 44px;"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="whitespace-nowrap">Ver ruta en Google Maps</span>
            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>

        <!-- Additional route info -->
        <div class="mt-6 md:mt-8 mx-4 p-4 sm:p-6 bg-comarapa-gray rounded-2xl">
          <div class="text-center">
            <h4 class="text-base sm:text-lg md:text-xl font-bold text-comarapa-dark mb-4 md:mb-6">
              Información Importante de la Ruta
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm md:text-base text-gray-600">
              <div class="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-comarapa-light rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span class="text-white font-bold text-sm sm:text-base">23</span>
                </div>
                <span class="font-semibold text-comarapa-dark">Localidades</span>
                <span class="text-xs sm:text-sm">Conectadas</span>
              </div>
              <div class="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-comarapa-medium rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span class="text-white font-bold text-sm sm:text-base">3</span>
                </div>
                <span class="font-semibold text-comarapa-dark">Ciudades</span>
                <span class="text-xs sm:text-sm">Principales</span>
              </div>
              <div class="flex flex-col items-center p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-comarapa-dark rounded-full flex items-center justify-center mb-2 sm:mb-3">
                  <span class="text-white font-bold text-sm sm:text-base">4</span>
                </div>
                <span class="font-semibold text-comarapa-dark">Oficinas</span>
                <span class="text-xs sm:text-sm">Disponibles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Route info cards -->
      <div class="grid md:grid-cols-3 gap-8 mt-16">
        <div class="text-center">
          <div class="bg-comarapa-light/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg class="h-8 w-8 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-comarapa-dark mb-2">Tiempo de Viaje</h3>
          <p class="text-gray-600">Aproximadamente 6-7 horas de Santa Cruz a Comarapa</p>
        </div>
        <div class="text-center">
          <div class="bg-comarapa-light/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg class="h-8 w-8 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-comarapa-dark mb-2">Distancia Total</h3>
          <p class="text-gray-600">235 kilómetros de recorrido seguro y confortable</p>
        </div>
        <div class="text-center">
          <div class="bg-comarapa-light/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg class="h-8 w-8 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-comarapa-dark mb-2">Seguridad</h3>
          <p class="text-gray-600">Conductores profesionales y buses inspeccionados</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Las 23 localidades en orden: Comarapa → Santa Cruz
const routeLocalities = [
  { name: 'Comarapa', type: 'principal' },
  { name: 'Tambo', type: 'normal' },
  { name: 'San Isidro', type: 'principal' },
  { name: 'La Palizada', type: 'normal' },
  { name: 'El Quiñe', type: 'normal' },
  { name: 'Mataral', type: 'normal' },
  { name: 'Los Negros', type: 'principal' },
  { name: 'Agua Clara', type: 'normal' },
  { name: 'Hierba Buena', type: 'normal' },
  { name: 'Mairana', type: 'normal' },
  { name: 'Samaipata', type: 'normal' },
  { name: 'Achiras', type: 'normal' },
  { name: 'Cuevas', type: 'normal' },
  { name: 'La Angostura', type: 'normal' },
  { name: 'San Luis', type: 'normal' },
  { name: 'Taruma', type: 'normal' },
  { name: 'Jorochito', type: 'normal' },
  { name: 'Limoncito', type: 'normal' },
  { name: 'El Torno', type: 'normal' },
  { name: 'Santa Rita', type: 'normal' },
  { name: 'San José', type: 'normal' },
  { name: 'La Guardia', type: 'normal' },
  { name: 'Santa Cruz', type: 'principal' }
]
</script>


