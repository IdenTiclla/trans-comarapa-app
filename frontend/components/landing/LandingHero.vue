<template>
  <section id="inicio" class="relative min-h-screen flex items-center pt-16 sm:pt-20 md:pt-24 overflow-hidden">
    <!-- Background slider container -->
    <div class="absolute inset-0 w-full h-full z-0">
      <!-- Each slider image -->
      <div
        v-for="(image, index) in heroImages"
        :key="image"
        class="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        :class="index === currentSlide ? 'opacity-100' : 'opacity-0'"
        :style="{ backgroundImage: `url(${image})` }"
      />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 comarapa-gradient opacity-80"></div>
    </div>
    
    <!-- Subtle geometric pattern -->
    <div class="absolute inset-0 opacity-10 z-[5]" :style="patternStyle"></div>

    <!-- Slider indicators -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
      <button
        v-for="(_, index) in heroImages"
        :key="index"
        @click="currentSlide = index"
        class="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
        :class="index === currentSlide 
          ? 'bg-white shadow-lg scale-125' 
          : 'bg-white/50 hover:bg-white/70'"
        :aria-label="`Ir a imagen ${index + 1}`"
      />
    </div>

    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
      <div class="max-w-5xl mx-auto text-center">
        <!-- Regional badge -->
        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-comarapa-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
          </svg>
          <span class="text-xs sm:text-sm font-medium">Transporte Regional de Comarapa</span>
        </div>

        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          Unimos tus destinos en los
          <span class="text-comarapa-light"> Valles cruceños</span>
        </h1>
        
        <p class="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 max-w-4xl mx-auto leading-relaxed px-4">
          Trazamos la ruta que te importa. Desde el corazón de Comarapa hasta el dinamismo de Santa Cruz, tejemos una red que une 23 localidades.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-lg sm:max-w-none mx-auto">
          <a
            href="#horarios"
            @click.prevent="scrollToSection('#horarios')"
            class="bg-white text-comarapa-dark border-2 border-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-comarapa-light hover:border-comarapa-light hover:shadow-lg transform hover:-translate-y-1 flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base cursor-pointer"
            style="min-height: 44px;"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Ver Horarios
            <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </a>
          <a
            href="#oficinas"
            @click.prevent="scrollToSection('#oficinas')"
            class="bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-green-600 transition-all duration-300 flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-1 w-full sm:w-auto justify-center text-sm sm:text-base cursor-pointer"
            style="min-height: 44px;"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Reservar WhatsApp
          </a>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div v-for="(stat, index) in stats" :key="index" class="text-center">
            <div class="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 sm:mb-3 inline-flex">
              <component :is="stat.icon" class="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div class="text-lg sm:text-xl md:text-2xl font-bold">{{ stat.number }}</div>
            <div class="text-xs sm:text-sm text-white/80 leading-tight">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, h } from 'vue'

const heroImages = [
  '/images/buses_challa.jpeg',
  '/images/flota_blanca_rene.png',
  '/images/doble_piso_verde.png'
]

const currentSlide = ref(0)
let slideInterval = null

const patternStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20l10-10v20l-10-10z'/%3E%3C/g%3E%3C/svg%3E")`
}

// Icon components as render functions
const MapPinIcon = {
  render() {
    return h('svg', { class: 'h-5 w-5 sm:h-6 sm:w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  }
}

const AwardIcon = {
  render() {
    return h('svg', { class: 'h-5 w-5 sm:h-6 sm:w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
    ])
  }
}

const GlobeIcon = {
  render() {
    return h('svg', { class: 'h-5 w-5 sm:h-6 sm:w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' })
    ])
  }
}

const stats = [
  { number: "23", label: "Localidades", icon: MapPinIcon },
  { number: "20+", label: "Años de experiencia", icon: AwardIcon },
  { number: "4", label: "Oficinas", icon: GlobeIcon }
]

const scrollToSection = (href) => {
  const targetId = href.replace('#', '')
  const targetElement = document.getElementById(targetId)

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

onMounted(() => {
  slideInterval = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroImages.length
  }, 5000)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>


