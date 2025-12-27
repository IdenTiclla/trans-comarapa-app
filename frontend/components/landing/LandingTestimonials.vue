<template>
  <section id="testimonios" class="py-16 sm:py-20 md:py-24 bg-comarapa-dark text-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10 sm:mb-12 md:mb-16">
        <div class="inline-flex items-center gap-2 bg-comarapa-light/20 px-3 sm:px-4 py-2 rounded-full mb-4">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-light" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span class="text-comarapa-light font-medium text-sm sm:text-base">Testimonios</span>
        </div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
          Lo que dicen nuestros <span class="text-comarapa-light">clientes</span>
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
          Más de 20 años construyendo confianza con nuestros pasajeros
        </p>
      </div>

      <!-- Testimonials Slider -->
      <div class="relative overflow-hidden">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-5xl mx-auto">
            <div 
              class="relative h-64 sm:h-72 md:h-80 lg:h-96 flex items-center justify-center"
              @mouseenter="isHovered = true"
              @mouseleave="isHovered = false"
            >
              <!-- Decorative quotes -->
              <div class="absolute top-2 sm:top-4 left-4 sm:left-8 text-comarapa-medium opacity-20 sm:opacity-30">
                <svg class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              <div class="absolute bottom-2 sm:bottom-4 right-4 sm:right-8 text-comarapa-medium opacity-20 sm:opacity-30 transform rotate-180">
                <svg class="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              <!-- Testimonials -->
              <div class="relative w-full">
                <div
                  v-for="(testimonial, index) in testimonials"
                  :key="testimonial.id"
                  class="absolute inset-0 transition-opacity duration-500"
                  :class="index === currentIndex ? 'opacity-100' : 'opacity-0'"
                >
                  <div class="text-center px-4 sm:px-8 md:px-12 lg:px-16">
                    <blockquote class="text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed mb-4 sm:mb-6 md:mb-8 italic font-medium">
                      "{{ testimonial.text }}"
                    </blockquote>
                    <div class="text-comarapa-medium">
                      <p class="text-sm sm:text-base md:text-lg font-bold">{{ testimonial.name }}</p>
                      <p class="text-xs sm:text-sm md:text-base text-white/80 mt-1">{{ testimonial.role }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dot indicators -->
            <div class="flex justify-center mt-6 sm:mt-8 gap-1 sm:gap-2">
              <button
                v-for="(_, index) in testimonials"
                :key="index"
                @click="goToSlide(index)"
                class="p-2 sm:p-2.5 touch-manipulation"
                :aria-label="`Ir a reseña ${index + 1}`"
              >
                <span
                  class="block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300"
                  :class="index === currentIndex
                    ? 'bg-comarapa-medium scale-125 shadow-lg'
                    : 'bg-gray-500 hover:bg-gray-400'"
                />
              </button>
            </div>
          </div>

          <!-- Decorative elements -->
          <div class="hidden sm:block absolute top-6 sm:top-10 left-6 sm:left-10 w-3 h-3 sm:w-4 sm:h-4 bg-comarapa-light rounded-full opacity-60"></div>
          <div class="hidden sm:block absolute top-12 sm:top-20 right-12 sm:right-20 w-4 h-4 sm:w-6 sm:h-6 bg-comarapa-medium rounded-full opacity-40"></div>
          <div class="hidden sm:block absolute bottom-6 sm:bottom-10 left-12 sm:left-20 w-2 h-2 sm:w-3 sm:h-3 bg-comarapa-light rounded-full opacity-50"></div>
          <div class="hidden sm:block absolute bottom-12 sm:bottom-20 right-6 sm:right-10 w-3 h-3 sm:w-5 sm:h-5 bg-comarapa-dark rounded-full opacity-30"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const testimonials = [
  {
    id: 1,
    text: "Viajo desde hace 3 años con Trans Comarapa y siempre llegó puntual. Los buses son cómodos y el personal muy amable.",
    name: "M.R.",
    role: "Comerciante de Comarapa"
  },
  {
    id: 2,
    text: "Excelente servicio de encomiendas. Mi familia en Santa Cruz siempre recibe mis paquetes en perfecto estado.",
    name: "J.C.",
    role: "Agricultor de San Isidro"
  },
  {
    id: 3,
    text: "Los horarios nocturnos me permiten viajar después del trabajo. Buses seguros y conductores responsables.",
    name: "A.V.",
    role: "Estudiante universitario"
  },
  {
    id: 4,
    text: "Contraté sus servicios para una excursión familiar a Comarapa. Todo salió perfecto, muy recomendable.",
    name: "L.S.",
    role: "Organizadora de eventos"
  },
  {
    id: 5,
    text: "Precios justos y atención personalizada. Me gusta que puedo reservar fácilmente por WhatsApp.",
    name: "C.M.",
    role: "Ama de casa"
  },
  {
    id: 6,
    text: "Como empresario necesito puntualidad, y Trans Comarapa nunca me ha fallado en mis viajes de negocios.",
    name: "R.H.",
    role: "Empresario de Santa Cruz"
  },
  {
    id: 7,
    text: "Mi abuela de 80 años viaja sola y siempre la cuidan muy bien. Personal muy atento con los adultos mayores.",
    name: "D.P.",
    role: "Nieta agradecida"
  },
  {
    id: 8,
    text: "Viajo con mi mascota y es la única empresa que me permite llevarla sin problemas. Muy flexible.",
    name: "S.T.",
    role: "Veterinaria"
  },
  {
    id: 9,
    text: "Los buses están siempre limpios y son cómodos para los viajes largos. Air acondicionado funcionando perfecto.",
    name: "F.G.",
    role: "Viajero frecuente"
  },
  {
    id: 10,
    text: "Envío productos de mi panadería a Santa Cruz y siempre llegan frescos. Servicio de encomiendas excelente.",
    name: "M.A.",
    role: "Panadera de Comarapa"
  }
]

const currentIndex = ref(0)
const isHovered = ref(false)
let slideInterval = null

const goToSlide = (index) => {
  currentIndex.value = index
}

const startAutoSlide = () => {
  slideInterval = setInterval(() => {
    if (!isHovered.value) {
      currentIndex.value = currentIndex.value === testimonials.length - 1 ? 0 : currentIndex.value + 1
    }
  }, 5000)
}

onMounted(() => {
  startAutoSlide()
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>


