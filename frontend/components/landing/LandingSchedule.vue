<template>
  <section id="horarios" class="py-16 sm:py-20 md:py-24 bg-comarapa-gray">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12 sm:mb-16">
        <div id="horarios-titulo" class="inline-flex items-center gap-2 bg-comarapa-light/20 px-3 sm:px-4 py-2 rounded-full mb-4">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-comarapa-dark font-medium text-sm sm:text-base">Horarios de Salida</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-comarapa-dark mb-4 sm:mb-6">
          Salidas Diarias Programadas
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Conectamos 23 localidades con horarios confiables y puntuales
        </p>
      </div>
      
      <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
        <!-- Comarapa a Santa Cruz -->
        <div class="comarapa-card p-4 sm:p-6 md:p-8 border-t-4 border-comarapa-dark">
          <div class="text-center mb-6 sm:mb-8">
            <div class="bg-gradient-to-br from-comarapa-dark to-comarapa-medium rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-comarapa-dark mb-2">Comarapa → Santa Cruz</h3>
            <p class="text-sm sm:text-base text-gray-600 font-medium">Ruta completa (23 paradas)</p>
          </div>
          <div class="space-y-3 sm:space-y-4">
            <div v-for="schedule in comarapaTimes" :key="schedule.hora" 
                 class="flex items-center justify-between bg-comarapa-gray p-3 sm:p-4 rounded-xl hover:bg-comarapa-light/10 transition-colors">
              <div class="flex items-center gap-2 sm:gap-3">
                <svg v-if="schedule.tipo === 'dia'" class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
                <svg v-else class="h-5 w-5 sm:h-6 sm:w-6 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
                </svg>
                <span class="font-bold text-base sm:text-lg text-comarapa-dark">{{ schedule.hora }}</span>
              </div>
              <span class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    :class="schedule.tipo === 'dia' ? 'bg-yellow-100 text-yellow-700' : 'bg-comarapa-dark/10 text-comarapa-dark'">
                {{ schedule.tipo === 'dia' ? 'Día' : 'Noche' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- San Isidro a Santa Cruz -->
        <div class="comarapa-card p-4 sm:p-6 md:p-8 border-t-4 border-comarapa-light md:col-span-2 lg:col-span-1">
          <div class="text-center mb-6 sm:mb-8">
            <div class="bg-gradient-to-br from-comarapa-light to-green-400 rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-comarapa-dark mb-2">San Isidro → Santa Cruz</h3>
            <p class="text-sm sm:text-base text-gray-600 font-medium">Conexión directa nueva</p>
          </div>
          <div class="space-y-3 sm:space-y-4">
            <div v-for="schedule in sanIsidroTimes" :key="schedule.hora" 
                 class="flex items-center justify-between bg-comarapa-gray p-3 sm:p-4 rounded-xl hover:bg-comarapa-light/10 transition-colors">
              <div class="flex items-center gap-2 sm:gap-3">
                <svg v-if="schedule.tipo === 'dia'" class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
                </svg>
                <svg v-else class="h-5 w-5 sm:h-6 sm:w-6 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
                </svg>
                <span class="font-bold text-base sm:text-lg text-comarapa-dark">{{ schedule.hora }}</span>
              </div>
              <span class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    :class="schedule.tipo === 'dia' ? 'bg-yellow-100 text-yellow-700' : 'bg-comarapa-dark/10 text-comarapa-dark'">
                {{ schedule.tipo === 'dia' ? 'Día' : 'Noche' }}
              </span>
            </div>
          </div>
        </div>
      
        <!-- Santa Cruz a Comarapa -->
        <div class="comarapa-card p-4 sm:p-6 md:p-8 border-t-4 border-comarapa-medium">
          <div class="text-center mb-6 sm:mb-8">
            <div class="bg-gradient-to-br from-comarapa-medium to-comarapa-light rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-lg">
              <svg class="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-comarapa-dark mb-2">Santa Cruz → Comarapa</h3>
            <p class="text-sm sm:text-base text-gray-600 font-medium">Ruta completa (23 paradas)</p>
          </div>
          <div class="space-y-3 sm:space-y-4">
            <div v-for="schedule in santaCruzTimes" :key="schedule.hora" 
                 class="flex items-center justify-between bg-comarapa-gray p-3 sm:p-4 rounded-xl hover:bg-comarapa-light/10 transition-colors">
              <div class="flex items-center gap-2 sm:gap-3">
                <svg v-if="schedule.tipo === 'dia'" class="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
                </svg>
                <svg v-else class="h-5 w-5 sm:h-6 sm:w-6 text-comarapa-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd"/>
                </svg>
                <span class="font-bold text-base sm:text-lg text-comarapa-dark">{{ schedule.hora }}</span>
              </div>
              <span class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    :class="schedule.tipo === 'dia' ? 'bg-yellow-100 text-yellow-700' : 'bg-comarapa-dark/10 text-comarapa-dark'">
                {{ schedule.tipo === 'dia' ? 'Día' : 'Noche' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA de reserva -->
      <div class="text-center mt-12 sm:mt-16">
        <div class="comarapa-card p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
          <h3 class="text-lg sm:text-xl md:text-2xl font-bold text-comarapa-dark mb-3 sm:mb-4">
            ¿Necesitas reservar tu asiento?
          </h3>
          <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Contacta a cualquiera de nuestras oficinas por WhatsApp
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <a v-for="office in offices" :key="office.city"
               :href="`https://wa.me/${office.phone}`"
               target="_blank" 
               class="bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation"
               style="min-height: 44px;">
              <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              {{ office.city }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const comarapaTimes = [
  { hora: '08:30 AM', tipo: 'dia' },
  { hora: '02:00 AM', tipo: 'dia' },
  { hora: '08:30 PM', tipo: 'noche' },
  { hora: '11:30 PM', tipo: 'noche' }
]

const sanIsidroTimes = [
  { hora: '09:00 AM', tipo: 'dia' },
  { hora: '02:30 AM', tipo: 'dia' },
  { hora: '09:00 PM', tipo: 'noche' },
  { hora: '00:00 PM', tipo: 'noche' }
]

const santaCruzTimes = [
  { hora: '10:30 AM', tipo: 'dia' },
  { hora: '02:00 PM', tipo: 'dia' },
  { hora: '06:30 PM', tipo: 'noche' },
  { hora: '08:30 PM', tipo: 'noche' }
]

const offices = [
  { city: "Santa Cruz", phone: "59168921188" },
  { city: "Comarapa", phone: "59168921154" },
  { city: "Los Negros", phone: "59171651781" },
  { city: "San Isidro", phone: "59171641780" }
]
</script>


