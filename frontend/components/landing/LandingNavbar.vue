<template>
  <header class="relative bg-white shadow-lg border-b border-comarapa-light/20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="bg-gradient-to-br from-comarapa-dark to-comarapa-medium p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
            <svg class="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 6v6m8-6v6m-10 0h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>
              <circle cx="6" cy="18" r="2"/>
              <circle cx="18" cy="18" r="2"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg sm:text-xl md:text-2xl font-bold text-comarapa-dark">Trans Comarapa</h1>
            <p class="text-comarapa-medium text-xs sm:text-sm font-medium hidden sm:block">Conectando el corazón de Bolivia</p>
          </div>
        </div>

        <!-- Navigation Desktop -->
        <nav class="hidden lg:flex space-x-6 xl:space-x-8">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            @click.prevent="scrollToSection(item.href)"
            class="text-comarapa-dark font-medium hover:text-comarapa-light transition-colors duration-300 relative group text-sm xl:text-base cursor-pointer"
          >
            {{ item.text }}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-comarapa-light transition-all duration-300 group-hover:w-full"></span>
          </a>
        </nav>

        <!-- CTA Buttons Desktop -->
        <div class="hidden lg:flex items-center gap-3">
          <NuxtLink 
            to="/login"
            class="text-comarapa-dark font-semibold hover:text-comarapa-medium transition-colors duration-300 px-4 py-2"
          >
            Iniciar Sesión
          </NuxtLink>
          <a
            href="#oficinas"
            @click.prevent="scrollToSection('#oficinas')"
            class="bg-green-500 text-white px-4 xl:px-6 py-2 xl:py-3 rounded-lg xl:rounded-xl font-semibold transition-all duration-300 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1 flex items-center gap-2 text-sm xl:text-base cursor-pointer"
          >
            <svg class="h-4 w-4 xl:h-5 xl:w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Reservar Ahora
          </a>
        </div>

        <!-- Mobile menu button -->
        <button 
          @click="isMenuOpen = !isMenuOpen"
          class="lg:hidden p-2 text-comarapa-dark touch-manipulation"
          style="min-width: 44px; min-height: 44px;"
          aria-label="Menú de navegación"
        >
          <svg v-if="!isMenuOpen" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMenuOpen" class="lg:hidden mt-4 pb-4 border-t border-comarapa-light/20 bg-white">
        <nav class="flex flex-col space-y-1 pt-4">
          <a
            v-for="item in navItems"
            :key="item.href"
            :href="item.href"
            @click.prevent="scrollToSection(item.href); isMenuOpen = false"
            class="text-comarapa-dark font-medium hover:text-comarapa-light transition-colors py-3 px-2 rounded-lg hover:bg-comarapa-gray text-base cursor-pointer"
            style="min-height: 44px;"
          >
            {{ item.text }}
          </a>
          <NuxtLink 
            to="/login"
            class="text-comarapa-dark font-semibold py-3 px-2 rounded-lg hover:bg-comarapa-gray text-base border-t border-comarapa-light/20 mt-2 pt-4"
            @click="isMenuOpen = false"
          >
            Iniciar Sesión
          </NuxtLink>
          <a
            href="#oficinas"
            @click.prevent="scrollToSection('#oficinas'); isMenuOpen = false"
            class="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-green-600 hover:shadow-lg flex items-center justify-center gap-2 mt-4 text-base cursor-pointer"
            style="min-height: 44px;"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Reservar WhatsApp
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const navItems = [
  { href: "#inicio", text: "Inicio" },
  { href: "#horarios-titulo", text: "Horarios" },
  { href: "#servicios", text: "Servicios" },
  { href: "#rutas", text: "Rutas" },
  { href: "#oficinas", text: "Oficinas" },
  { href: "#testimonios", text: "Reseñas" },
  { href: "#contacto", text: "Contacto" }
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
</script>


