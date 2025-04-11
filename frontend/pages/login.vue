<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Trans Comarapa</h1>
        <p class="text-gray-600 mt-2">Iniciar sesión como secretaria</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="secretaria@transcomarapa.com"
          />
        </div>

        <!-- Password input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Error message -->
        <div v-if="authStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ authStore.error }}</span>
        </div>

        <!-- Submit button -->
        <div>
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">Iniciando sesión...</span>
            <span v-else>Iniciar sesión</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Definir variables reactivas
const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario ya está autenticado, redirigir al dashboard
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})

// Función para manejar el inicio de sesión
const handleLogin = async () => {
  try {
    const success = await authStore.login(email.value, password.value)

    if (success) {
      // Redireccionar al dashboard
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
  }
}

// Definir la metadata de la página
definePageMeta({
  layout: 'auth',
  // No aplicamos el middleware aquí porque queremos que la página de login sea accesible
})
</script>
