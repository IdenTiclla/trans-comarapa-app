<template>
  <nav class="bg-blue-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo y nombre -->
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <h1 class="text-xl md:text-2xl font-bold">Trans Comarapa</h1>
        </NuxtLink>
      </div>

      <!-- Botón de menú para móviles -->
      <button
        @click="isMenuOpen = !isMenuOpen"
        class="md:hidden focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          v-if="!isMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Menú de navegación para escritorio -->
      <div class="hidden md:flex space-x-4 items-center">
        <NuxtLink to="/" class="hover:underline px-2 py-1 rounded hover:bg-blue-700 transition-colors">Inicio</NuxtLink>
        <NuxtLink to="/about" class="hover:underline px-2 py-1 rounded hover:bg-blue-700 transition-colors">Acerca de</NuxtLink>
        <NuxtLink to="/services" class="hover:underline px-2 py-1 rounded hover:bg-blue-700 transition-colors">Servicios</NuxtLink>

        <!-- Opciones para usuario no autenticado -->
        <template v-if="!authStore.isAuthenticated">
          <NuxtLink
            to="/login"
            class="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors font-medium"
          >
            Iniciar sesión
          </NuxtLink>
        </template>

        <!-- Opciones para usuario autenticado -->
        <template v-else>
          <div class="flex items-center space-x-3">
            <span class="text-white hidden lg:inline-block">
              <template v-if="authStore.user && (authStore.user.firstname || authStore.user.lastname)">
                {{ authStore.user.firstname }} {{ authStore.user.lastname }}
              </template>
              <template v-else-if="authStore.fullName">
                {{ authStore.fullName }}
              </template>
              <template v-else>
                Usuario
              </template>

            </span>
            <NuxtLink
              to="/dashboard"
              class="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
            >
              Dashboard
            </NuxtLink>
            <button
              @click="handleLogout"
              class="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Menú móvil -->
    <div
      v-show="isMenuOpen"
      class="md:hidden mt-4 bg-blue-700 rounded-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
    >
      <div class="flex flex-col space-y-2 p-4">
        <NuxtLink
          to="/"
          class="hover:bg-blue-800 px-3 py-2 rounded transition-colors"
          @click="isMenuOpen = false"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="hover:bg-blue-800 px-3 py-2 rounded transition-colors"
          @click="isMenuOpen = false"
        >
          Acerca de
        </NuxtLink>
        <NuxtLink
          to="/services"
          class="hover:bg-blue-800 px-3 py-2 rounded transition-colors"
          @click="isMenuOpen = false"
        >
          Servicios
        </NuxtLink>

        <div class="border-t border-blue-500 my-2"></div>

        <!-- Opciones para usuario no autenticado (móvil) -->
        <template v-if="!authStore.isAuthenticated">
          <NuxtLink
            to="/login"
            class="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors font-medium text-center"
            @click="isMenuOpen = false"
          >
            Iniciar sesión
          </NuxtLink>
        </template>

        <!-- Opciones para usuario autenticado (móvil) -->
        <template v-else>
          <div class="flex flex-col space-y-2">
            <div class="text-white text-sm bg-blue-800 px-3 py-2 rounded-md">
              <template v-if="authStore.user && (authStore.user.firstname || authStore.user.lastname)">
                {{ authStore.user.firstname }} {{ authStore.user.lastname }}
              </template>
              <template v-else-if="authStore.fullName">
                {{ authStore.fullName }}
              </template>
              <template v-else>
                Usuario
              </template>
            </div>
            <NuxtLink
              to="/dashboard"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-center font-medium"
              @click="isMenuOpen = false"
            >
              Dashboard
            </NuxtLink>
            <button
              @click="handleLogoutMobile"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, watch, ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)

// Inicializar el estado de autenticación al montar el componente
onMounted(() => {
  // Verificar si estamos en el cliente (navegador)
  if (typeof window !== 'undefined') {
    authStore.initAuth()

    // Si el usuario está autenticado, intentar obtener información adicional
    if (authStore.isAuthenticated) {
      setTimeout(() => authStore.fetchUserInfo(), 500)
    }
  }

  // Cerrar el menú móvil cuando se redimensiona la ventana a tamaño de escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) { // 768px es el breakpoint md de Tailwind
      isMenuOpen.value = false
    }
  })
})

// Observar cambios en la ruta para actualizar el estado de autenticación
watch(
  () => router.currentRoute.value.path,
  () => {
    // Verificar si estamos en el cliente (navegador)
    if (typeof window !== 'undefined') {
      authStore.initAuth()
      // Cerrar el menú móvil al cambiar de ruta
      isMenuOpen.value = false
    }
  }
)

// Función para manejar el cierre de sesión (escritorio)
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Función para manejar el cierre de sesión (móvil)
const handleLogoutMobile = () => {
  authStore.logout()
  isMenuOpen.value = false
  router.push('/')
}


</script>
