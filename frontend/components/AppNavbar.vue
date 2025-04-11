<template>
  <nav class="bg-blue-600 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold">Trans Comarapa</h1>
      </div>

      <div class="flex space-x-4 items-center">
        <NuxtLink to="/" class="hover:underline">Inicio</NuxtLink>
        <NuxtLink to="/about" class="hover:underline">Acerca de</NuxtLink>
        <NuxtLink to="/services" class="hover:underline">Servicios</NuxtLink>

        <!-- Opciones para usuario no autenticado -->
        <template v-if="!authStore.isAuthenticated">
          <NuxtLink
            to="/login"
            class="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
          >
            Iniciar sesión
          </NuxtLink>
        </template>

        <!-- Opciones para usuario autenticado -->
        <template v-else>
          <div class="flex items-center space-x-4">
            <span class="text-white">{{ authStore.fullName }}</span>
            <NuxtLink
              to="/dashboard"
              class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Dashboard
            </NuxtLink>
            <button
              @click="handleLogout"
              class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
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
import { onMounted, watch } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

// Inicializar el estado de autenticación al montar el componente
onMounted(() => {
  // Verificar si estamos en el cliente (navegador)
  if (typeof window !== 'undefined') {
    authStore.initAuth()
  }
})

// Observar cambios en la ruta para actualizar el estado de autenticación
watch(
  () => router.currentRoute.value.path,
  () => {
    // Verificar si estamos en el cliente (navegador)
    if (typeof window !== 'undefined') {
      authStore.initAuth()
    }
  }
)

// Función para manejar el cierre de sesión
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
