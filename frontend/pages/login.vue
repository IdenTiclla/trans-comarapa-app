<template>
  <div class="login-container" role="main" aria-labelledby="login-title">
    <div class="login-card">
      <!-- Header with brand -->
      <header class="login-header">
        <div class="brand-section">
          <div class="brand-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="brand-text">
            <h1 id="login-title" class="brand-title">Trans Comarapa</h1>
            <p class="brand-subtitle">Sistema de Gestión de Transporte</p>
          </div>
        </div>
        <div class="welcome-text">
          <h2 class="welcome-title">Bienvenido de vuelta</h2>
          <p class="welcome-subtitle">Ingresa tus credenciales para continuar</p>
        </div>
      </header>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form" aria-labelledby="login-title" novalidate>
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <div class="input-wrapper">
            <div class="input-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="form-input"
              :class="{
                'input-error': emailError,
                'input-success': email && !emailError && emailRegex.test(email)
              }"
              placeholder="usuario@transcomarapa.com"
              autofocus
              @blur="validateEmail"
              @input="clearEmailError"
              :aria-invalid="!!emailError"
              :aria-describedby="emailError ? 'email-error' : undefined"
            />
            <div v-if="email && !emailError && emailRegex.test(email)" class="input-success-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div v-if="emailError" id="email-error" class="error-message" role="alert" aria-live="polite">
            {{ emailError }}
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-wrapper">
            <div class="input-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="form-input"
              :class="{
                'input-error': passwordError,
                'input-success': password && !passwordError && password.length >= 6
              }"
              placeholder="Ingresa tu contraseña"
              @blur="validatePassword"
              @input="clearPasswordError"
              :aria-invalid="!!passwordError"
              :aria-describedby="passwordError ? 'password-error' : undefined"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
          <div v-if="passwordError" id="password-error" class="error-message" role="alert" aria-live="polite">
            {{ passwordError }}
          </div>
        </div>

        <!-- Server Error Message -->
        <div v-if="authStore.error" class="server-error" role="alert" aria-live="assertive">
          <div class="error-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.179 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="submit-button"
          :class="{
            'button-disabled': !isFormValid || authStore.loading,
            'button-enabled': isFormValid && !authStore.loading
          }"
          :disabled="!isFormValid || authStore.loading"
          :aria-describedby="!isFormValid ? 'form-validation-help' : undefined"
        >
          <div v-if="authStore.loading" class="loading-spinner" aria-hidden="true"></div>
          <span>{{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
        </button>

        <!-- Form validation help text -->
        <div v-if="!isFormValid" id="form-validation-help" class="form-help" aria-live="polite">
          Complete todos los campos correctamente para continuar
        </div>
      </form>

      <!-- Footer -->
      <footer class="login-footer">
        <p>&copy; {{ new Date().getFullYear() }} Trans Comarapa. Todos los derechos reservados.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Definir variables reactivas
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()
const router = useRouter()

// Expresiones regulares para validación
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Computed property para verificar si el formulario es válido
const isFormValid = computed(() => {
  return email.value && 
         password.value && 
         !emailError.value && 
         !passwordError.value &&
         emailRegex.test(email.value) &&
         password.value.length >= 6
})

// Funciones de validación
const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'El email es requerido'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Por favor ingresa un email válido'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    passwordError.value = ''
  }
}

// Funciones para limpiar errores mientras el usuario escribe
const clearEmailError = () => {
  if (emailError.value) {
    emailError.value = ''
  }
}

const clearPasswordError = () => {
  if (passwordError.value) {
    passwordError.value = ''
  }
}

// Validar todo el formulario
const validateForm = () => {
  validateEmail()
  validatePassword()
  return !emailError.value && !passwordError.value
}

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
  // Validar el formulario antes de enviar
  if (!validateForm()) {
    return
  }

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

<style scoped>
/* Modern Login Container */
.login-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Header Styles */
.login-header {
  margin-bottom: 2rem;
  text-align: center;
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.brand-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.brand-icon .icon {
  width: 32px;
  height: 32px;
  color: white;
}

.brand-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.welcome-text {
  margin-top: 1rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.welcome-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  z-index: 1;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.input-icon .icon {
  width: 20px;
  height: 20px;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:focus + .input-icon {
  color: #667eea;
}

.form-input.input-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-input.input-success {
  border-color: #10b981;
  background-color: #ecfdf5;
}

.input-success-icon {
  position: absolute;
  right: 1rem;
  color: #10b981;
}

.input-success-icon .icon {
  width: 20px;
  height: 20px;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle .icon {
  width: 20px;
  height: 20px;
}

.error-message {
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.server-error {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #dc2626;
  font-weight: 500;
  font-size: 0.875rem;
}

.error-icon {
  flex-shrink: 0;
}

.error-icon .icon {
  width: 20px;
  height: 20px;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button-enabled {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.4);
}

.button-enabled:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 rgba(102, 126, 234, 0.5);
}

.button-enabled:active {
  transform: translateY(0);
}

.button-disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-top: -0.5rem;
}

/* Footer */
.login-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.login-footer p {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

/* Responsive Design - Mobile First */
@media (max-width: 768px) {
  .login-container {
    width: 100vw;
    max-width: none;
    height: 100vh;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .login-card {
    width: 100%;
    height: 100vh;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
    border: none;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    position: relative;
    overflow-y: auto;
  }
  
  .login-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  
  .login-header {
    margin-bottom: 2.5rem;
  }
  
  .brand-icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  }
  
  .brand-icon .icon {
    width: 36px;
    height: 36px;
  }
  
  .brand-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
    color: #64748b;
  }
  
  .login-form {
    gap: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .form-input {
    padding: 1rem 1rem 1rem 3.5rem;
    font-size: 1rem;
    border-radius: 16px;
    height: 56px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
  
  .input-icon {
    left: 1.25rem;
  }
  
  .input-icon .icon {
    width: 22px;
    height: 22px;
  }
  
  .password-toggle .icon {
    width: 22px;
    height: 22px;
  }
  
  .submit-button {
    padding: 1.25rem;
    font-size: 1.125rem;
    height: 56px;
    border-radius: 16px;
    font-weight: 700;
    letter-spacing: 0.025em;
  }
  
  .login-footer {
    margin-top: auto;
    padding-top: 2rem;
    border-top: 1px solid rgba(148, 163, 184, 0.3);
  }
  
  .login-footer p {
    font-size: 0.875rem;
    color: #64748b;
  }
}

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem 1rem;
  }
  
  .brand-title {
    font-size: 1.75rem;
  }
  
  .welcome-title {
    font-size: 1.375rem;
  }
  
  .form-input {
    padding: 0.875rem 0.875rem 0.875rem 3rem;
  }
  
  .input-icon {
    left: 1rem;
  }
  
  .submit-button {
    padding: 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 1rem 0.75rem;
  }
  
  .brand-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }
  
  .brand-icon .icon {
    width: 32px;
    height: 32px;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .brand-subtitle {
    font-size: 0.875rem;
  }
  
  .welcome-title {
    font-size: 1.25rem;
  }
  
  .welcome-subtitle {
    font-size: 0.875rem;
  }
  
  .login-form {
    gap: 1.5rem;
  }
  
  .form-input {
    height: 52px;
    padding: 0.75rem 0.75rem 0.75rem 2.75rem;
    font-size: 0.875rem;
  }
  
  .input-icon {
    left: 0.875rem;
  }
  
  .input-icon .icon,
  .password-toggle .icon {
    width: 20px;
    height: 20px;
  }
  
  .submit-button {
    height: 52px;
    padding: 0.875rem;
    font-size: 0.875rem;
  }
}

/* Landscape orientation on mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .login-card {
    padding: 1rem;
    justify-content: flex-start;
  }
  
  .login-header {
    margin-bottom: 1.5rem;
  }
  
  .brand-section {
    margin-bottom: 1rem;
  }
  
  .welcome-text {
    margin-top: 0.5rem;
  }
  
  .login-form {
    gap: 1.25rem;
  }
  
  .login-footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .login-card {
    border: 2px solid #000;
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .form-input:focus {
    border-width: 3px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .login-card,
  .form-input,
  .submit-button,
  .password-toggle {
    transition: none;
  }
  
  .login-card:hover {
    transform: none;
  }
  
  .button-enabled:hover {
    transform: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}

/* Focus visible for better keyboard navigation */
.form-input:focus-visible,
.submit-button:focus-visible,
.password-toggle:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
