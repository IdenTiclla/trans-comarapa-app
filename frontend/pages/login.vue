<template>
  <div class="forced-login-form">
    <div class="text-center mb-8">
      <div class="flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        <h1 class="text-3xl font-bold text-gray-800">Trans Comarapa</h1>
      </div>
      <p class="text-gray-600">Iniciar sesión</p>
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
          placeholder="usuario@transcomarapa.com"
          autofocus
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

    <div class="mt-6 text-center text-sm text-gray-500">
      &copy; {{ new Date().getFullYear() }} Trans Comarapa
    </div>
  </div>
</template>

<script setup>
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
  // Si el usuario ya está autenticado, redirigir al dashboard correspondiente
  if (authStore.isAuthenticated) {
    redirectToDashboard(authStore.userRole)
  }
})

// Función para redirigir al usuario al dashboard correspondiente según su rol
const redirectToDashboard = (role) => {
  switch (role) {
    case 'admin':
      router.push('/dashboards/dashboard-admin')
      break
    case 'secretary':
      router.push('/dashboards/dashboard-secretary')
      break
    case 'driver':
      router.push('/dashboards/dashboard-driver')
      break
    case 'assistant':
      router.push('/dashboards/dashboard-assistant')
      break
    case 'client':
      router.push('/dashboards/dashboard-client')
      break
    default:
      router.push('/dashboard')
  }
}

// Función para manejar el inicio de sesión
const handleLogin = async () => {
  try {
    const response = await authStore.login(email.value, password.value)

    // Redireccionar al dashboard correspondiente según el rol del usuario
    redirectToDashboard(response.role)
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
  }
}

// Definir la metadata de la página
definePageMeta({
  // Usar el layout de login para esta página
  layout: 'login',
  // No aplicamos el middleware aquí porque queremos que la página de login sea accesible
})
</script>

<style>
.forced-login-form {
  width: 400px;
  max-width: 90vw;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 0 auto;
}

/* Resetear todos los estilos para asegurar que no haya conflictos */
.forced-login-form * {
  box-sizing: border-box;
}

.forced-login-form h1 {
  font-size: 30px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.forced-login-form p {
  color: #6b7280;
  margin: 0 0 32px 0;
}

.forced-login-form input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
  margin-top: 4px;
  font-size: 14px;
}

.forced-login-form button {
  width: 100%;
  padding: 8px 16px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  box-sizing: border-box;
  font-size: 14px;
}

.forced-login-form button:hover {
  background-color: #4338ca;
}

.forced-login-form label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.forced-login-form .text-center { text-align: center; }
.forced-login-form .mb-8 { margin-bottom: 32px; }
.forced-login-form .mb-4 { margin-bottom: 16px; }
.forced-login-form .mb-2 { margin-bottom: 8px; }
.forced-login-form .mt-6 { margin-top: 24px; }
.forced-login-form .mt-1 { margin-top: 4px; }
.forced-login-form .flex { display: flex; }
.forced-login-form .items-center { align-items: center; }
.forced-login-form .justify-center { justify-content: center; }
.forced-login-form .mr-2 { margin-right: 8px; }
.forced-login-form .space-y-6 > * + * { margin-top: 24px; }
</style>
