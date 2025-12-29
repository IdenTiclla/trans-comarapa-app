<template>
  <div class="w-full" role="main" aria-labelledby="login-title">
    <!-- Mobile Header (visible only on mobile) -->
    <div class="lg:hidden text-center mb-8">
      <div class="inline-flex items-center justify-center bg-gradient-to-br from-comarapa-dark to-comarapa-medium p-4 rounded-2xl shadow-lg mb-4">
        <svg class="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 6v6m8-6v6m-10 0h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>
          <circle cx="6" cy="18" r="2"/>
          <circle cx="18" cy="18" r="2"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-comarapa-dark">Trans Comarapa</h1>
      <p class="text-comarapa-medium text-sm">Sistema de Gestión de Transporte</p>
    </div>

    <!-- Login Card -->
    <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-comarapa-gray">
      <!-- Header -->
      <header class="mb-6 text-center lg:text-left">
        <h2 id="login-title" class="text-2xl font-bold text-comarapa-dark mb-2">Bienvenido de vuelta</h2>
        <p class="text-gray-500">Ingresa tus credenciales para continuar</p>
      </header>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-5" aria-labelledby="login-title" novalidate>
        <!-- Email Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-semibold text-gray-700">
            Correo Electrónico
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="w-full pl-12 pr-4 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
              :class="[
                emailError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : email && emailRegex.test(email)
                    ? 'border-green-400 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    : 'border-gray-200 bg-gray-50 focus:border-comarapa-medium focus:ring-2 focus:ring-comarapa-light/30 focus:bg-white'
              ]"
              placeholder="usuario@transcomarapa.com"
              autofocus
              @blur="validateEmail"
              @input="clearEmailError"
              :aria-invalid="!!emailError"
              :aria-describedby="emailError ? 'email-error' : undefined"
            />
            <!-- Success icon -->
            <div v-if="email && !emailError && emailRegex.test(email)" class="absolute inset-y-0 right-0 pr-4 flex items-center">
              <svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p v-if="emailError" id="email-error" class="text-sm text-red-500 flex items-center gap-1" role="alert">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ emailError }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-semibold text-gray-700">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="w-full pl-12 pr-12 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none"
              :class="[
                passwordError
                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                  : password && password.length >= 6
                    ? 'border-green-400 bg-green-50 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                    : 'border-gray-200 bg-gray-50 focus:border-comarapa-medium focus:ring-2 focus:ring-comarapa-light/30 focus:bg-white'
              ]"
              placeholder="Ingresa tu contraseña"
              @blur="validatePassword"
              @input="clearPasswordError"
              :aria-invalid="!!passwordError"
              :aria-describedby="passwordError ? 'password-error' : undefined"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <p v-if="passwordError" id="password-error" class="text-sm text-red-500 flex items-center gap-1" role="alert">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ passwordError }}
          </p>
        </div>

        <!-- Server Error Message -->
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3" role="alert" aria-live="assertive">
          <svg class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span class="text-red-700 text-sm">{{ authStore.error }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 min-h-[48px]"
          :class="[
            isFormValid && !authStore.loading
              ? 'bg-gradient-to-r from-comarapa-dark to-comarapa-medium hover:from-comarapa-medium hover:to-comarapa-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 cursor-not-allowed'
          ]"
          :disabled="!isFormValid || authStore.loading"
        >
          <svg v-if="authStore.loading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
        </button>

        <!-- Form validation help -->
        <p v-if="!isFormValid" class="text-center text-sm text-gray-500">
          Complete todos los campos correctamente para continuar
        </p>
      </form>

      <!-- Back to Home Link -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-comarapa-medium hover:text-comarapa-dark transition-colors text-sm font-medium"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </NuxtLink>
      </div>

      <!-- Footer -->
      <footer class="mt-8 pt-6 border-t border-gray-100 text-center">
        <p class="text-xs text-gray-400">&copy; {{ new Date().getFullYear() }} Trans Comarapa. Todos los derechos reservados.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Reactive variables
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()
const router = useRouter()

// Regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return email.value &&
         password.value &&
         !emailError.value &&
         !passwordError.value &&
         emailRegex.test(email.value) &&
         password.value.length >= 6
})

// Validation functions
const validateEmail = () => {
  if (email.value.length > 0) {
    if (!emailRegex.test(email.value)) {
      emailError.value = 'Por favor ingresa un email válido'
    } else {
      emailError.value = ''
    }
  }
}

const validatePassword = () => {
  if (password.value.length > 0) {
    if (password.value.length < 6) {
      passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    } else {
      passwordError.value = ''
    }
  }
}

// Clear error functions
const clearEmailError = () => {
  if (emailError.value) {
    emailError.value = ''
  }
  if (authStore.error) {
    authStore.clearError()
  }
}

const clearPasswordError = () => {
  if (passwordError.value) {
    passwordError.value = ''
  }
  if (authStore.error) {
    authStore.clearError()
  }
}

// Validate entire form
const validateForm = () => {
  if (!email.value) {
    emailError.value = 'El email es requerido'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Por favor ingresa un email válido'
  } else {
    emailError.value = ''
  }

  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    passwordError.value = ''
  }

  return !emailError.value && !passwordError.value
}

// Check authentication on mount
onMounted(() => {
  if (authStore.isAuthenticated) {
    redirectToDashboard(authStore.userRole)
  }
})

// Redirect function based on role
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

// Handle login
const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const response = await authStore.login(email.value, password.value)
    redirectToDashboard(response.role)
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
  }
}

// Page metadata
definePageMeta({
  layout: 'login',
})
</script>
