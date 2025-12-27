<template>
  <section id="contacto" class="py-16 sm:py-20 md:py-24 bg-comarapa-gray">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10 sm:mb-12 md:mb-16">
        <div class="inline-flex items-center gap-2 bg-comarapa-light/20 px-3 sm:px-4 py-2 rounded-full mb-4">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="text-comarapa-dark font-medium text-sm sm:text-base">Contacto</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-comarapa-dark mb-4 sm:mb-6">
          Estamos Aquí para Ayudarte
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Atención personalizada en horarios de oficina
        </p>
      </div>

      <div class="max-w-5xl mx-auto">
        <div class="comarapa-card p-4 sm:p-6 md:p-8 comarapa-gradient text-white">
          <div class="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">Información de Contacto</h3>
              <div class="space-y-4 sm:space-y-6">
                <div class="flex items-start gap-3 sm:gap-4">
                  <div class="bg-white/20 rounded-lg p-2.5 sm:p-3 flex-shrink-0">
                    <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-base sm:text-lg mb-1">Teléfonos principales:</p>
                    <p class="text-white/90 text-sm sm:text-base">Santa Cruz: 68921188 | Comarapa: 68921154</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 sm:gap-4">
                  <div class="bg-white/20 rounded-lg p-2.5 sm:p-3 flex-shrink-0">
                    <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-base sm:text-lg mb-1">WhatsApp:</p>
                    <p class="text-white/90 text-sm sm:text-base">Disponible en horarios de oficina</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 sm:gap-4">
                  <div class="bg-white/20 rounded-lg p-2.5 sm:p-3 flex-shrink-0">
                    <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="font-bold text-base sm:text-lg mb-1">Atención al cliente:</p>
                    <p class="text-white/90 text-sm sm:text-base">Respuesta rápida en horarios de oficina</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8">Reserva Inmediata</h3>
              <div class="space-y-4 sm:space-y-6">
                <p class="text-white/90 text-base sm:text-lg">
                  Contáctanos por WhatsApp para reservar tu asiento de manera fácil y rápida.
                </p>
                <div class="grid grid-cols-2 gap-3 sm:gap-4">
                  <a
                    v-for="office in offices"
                    :key="office.city"
                    :href="`https://wa.me/${office.phone}`"
                    target="_blank"
                    class="bg-green-500 hover:bg-green-600 px-3 sm:px-4 py-3 sm:py-4 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 text-sm sm:text-base touch-manipulation"
                    style="min-height: 44px;"
                  >
                    <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    {{ office.city }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const offices = [
  { city: "Santa Cruz", phone: "59168921188" },
  { city: "Comarapa", phone: "59168921154" },
  { city: "Los Negros", phone: "59171651781" },
  { city: "San Isidro", phone: "59171641780" }
]
</script>


