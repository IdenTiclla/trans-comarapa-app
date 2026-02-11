<template>
  <!-- Skeleton loader mientras carga -->
  <ProfileSkeleton v-if="loading && !profile.id" />
  
  <!-- Contenido principal -->
  <div v-else class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header de perfil -->
      <div class="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
          <div class="flex flex-col sm:flex-row items-center">
            <!-- Avatar -->
            <div class="relative">
              <div class="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
                <img
                  v-if="profile.avatar_url"
                  :src="profile.avatar_url"
                  :alt="`Avatar de ${profile.firstname} ${profile.lastname}`"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold"
                >
                  {{ getInitials(profile.firstname, profile.lastname) }}
                </div>
              </div>
              <!-- Botón para cambiar avatar -->
              <button
                @click="triggerFileInput"
                class="absolute bottom-0 right-0 h-8 w-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors"
                title="Cambiar avatar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <!-- Input file oculto -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                class="hidden"
              />
            </div>
            
            <!-- Información del usuario -->
            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl font-bold text-white">
                {{ profile.firstname }} {{ profile.lastname }}
              </h1>
              <p class="text-blue-100 text-lg">@{{ profile.username }}</p>
              <div class="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span class="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {{ getRoleLabel(profile.role) }}
                </span>
                <span
                  v-if="profile.is_active"
                  class="bg-green-500 bg-opacity-20 text-green-100 px-3 py-1 rounded-full text-sm font-medium"
                >
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-800">{{ successMessage }}</p>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs de navegación -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-6 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <div class="flex items-center">
                <svg v-if="tab.id === 'personal'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg v-if="tab.id === 'security'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <svg v-if="tab.id === 'settings'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ tab.name }}
              </div>
            </button>
          </nav>
        </div>

        <!-- Contenido de los tabs -->
        <div class="p-6">
          <!-- Tab: Información Personal -->
          <div v-if="activeTab === 'personal'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <form @submit.prevent="updateProfile" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="firstname" class="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      id="firstname"
                      v-model="editableProfile.firstname"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      :disabled="loading"
                    />
                  </div>
                  <div>
                    <label for="lastname" class="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      id="lastname"
                      v-model="editableProfile.lastname"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      :disabled="loading"
                    />
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    v-model="editableProfile.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="loading"
                  />
                </div>

                <div>
                  <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    v-model="editableProfile.phone"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="loading"
                  />
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                    <span v-else>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Tab: Seguridad -->
          <div v-if="activeTab === 'security'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
              <form @submit.prevent="changePassword" class="space-y-4">
                <div>
                  <label for="current-password" class="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    id="current-password"
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="loading"
                  />
                </div>

                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="loading"
                  />
                </div>

                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    id="confirm-password"
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    :disabled="loading"
                  />
                </div>

                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loading || !isPasswordFormValid"
                    class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cambiando...
                    </span>
                    <span v-else>Cambiar Contraseña</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Tab: Configuración -->
          <div v-if="activeTab === 'settings'" class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Configuración de Cuenta</h3>
              <div class="space-y-4">
                <!-- Información de la cuenta -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Información de la Cuenta</h4>
                  <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt class="text-sm text-gray-500">Usuario</dt>
                      <dd class="text-sm font-medium text-gray-900">{{ profile.username }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Rol</dt>
                      <dd class="text-sm font-medium text-gray-900">{{ getRoleLabel(profile.role) }}</dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Estado</dt>
                      <dd class="text-sm font-medium text-gray-900">
                        <span v-if="profile.is_active" class="text-green-600">Activo</span>
                        <span v-else class="text-red-600">Inactivo</span>
                      </dd>
                    </div>
                    <div>
                      <dt class="text-sm text-gray-500">Fecha de registro</dt>
                      <dd class="text-sm font-medium text-gray-900">
                        {{ formatDate(profile.created_at) }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <!-- Gestión de avatar -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-3">Avatar</h4>
                  <div class="flex items-center space-x-4">
                    <div class="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                      <img
                        v-if="profile.avatar_url"
                        :src="profile.avatar_url"
                        :alt="`Avatar de ${profile.firstname} ${profile.lastname}`"
                        class="h-full w-full object-cover"
                      />
                      <div
                        v-else
                        class="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold"
                      >
                        {{ getInitials(profile.firstname, profile.lastname) }}
                      </div>
                    </div>
                    <div class="space-x-3">
                      <button
                        @click="triggerFileInput"
                        class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Cambiar Avatar
                      </button>
                      <button
                        v-if="profile.avatar_url"
                        @click="removeAvatar"
                        class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import profileService from '~/services/profileService'

// Metadatos de la página
definePageMeta({
  layout: 'default'
})

// Store y variables reactivas
const authStore = useAuthStore()
const profile = ref({})
const editableProfile = ref({})
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const activeTab = ref('personal')
const fileInput = ref(null)

// Formulario de cambio de contraseña
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Configuración de tabs
const tabs = [
  {
    id: 'personal',
    name: 'Información Personal'
  },
  {
    id: 'security',
    name: 'Seguridad'
  },
  {
    id: 'settings',
    name: 'Configuración'
  }
]

// Computed properties
const isPasswordFormValid = computed(() => {
  return passwordForm.currentPassword &&
         passwordForm.newPassword &&
         passwordForm.confirmPassword &&
         passwordForm.newPassword === passwordForm.confirmPassword &&
         passwordForm.newPassword.length >= 6
})

// Funciones de utilidad
const getInitials = (firstname, lastname) => {
  const first = firstname ? firstname.charAt(0).toUpperCase() : ''
  const last = lastname ? lastname.charAt(0).toUpperCase() : ''
  return `${first}${last}` || 'U'
}

const getRoleLabel = (role) => {
  const roles = {
    admin: 'Administrador',
    secretary: 'Secretario',
    driver: 'Conductor',
    assistant: 'Asistente',
    client: 'Cliente'
  }
  return roles[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return 'No disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const showSuccess = (message) => {
  clearMessages()
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  clearMessages()
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

// Funciones principales
const loadProfile = async () => {
  try {
    loading.value = true
    
    // Intentar cargar desde el servicio de perfil
    try {
      const data = await profileService.getProfile()
      profile.value = data
      editableProfile.value = { ...data }
    } catch (apiError) {
      console.warn('Error al cargar desde API, usando datos del store:', apiError.message)
      
      // Fallback: usar datos del store de autenticación
      if (authStore.user) {
        profile.value = { ...authStore.user }
        editableProfile.value = { ...authStore.user }
      } else {
        throw new Error('No se pudo cargar la información del perfil')
      }
    }
  } catch (error) {
    showError('Error al cargar el perfil: ' + error.message)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  try {
    loading.value = true
    clearMessages()
    
    const updatedProfile = await profileService.updateProfile(editableProfile.value)
    profile.value = updatedProfile
    editableProfile.value = { ...updatedProfile }
    
    // Actualizar el store de autenticación
    authStore.user = { ...authStore.user, ...updatedProfile }
    
    showSuccess('Perfil actualizado exitosamente')
  } catch (error) {
    showError('Error al actualizar el perfil: ' + error.message)
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  try {
    loading.value = true
    clearMessages()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Las contraseñas no coinciden')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    
    await profileService.changePassword({
      current_password: passwordForm.currentPassword,
      new_password: passwordForm.newPassword
    })
    
    // Limpiar el formulario
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    showSuccess('Contraseña cambiada exitosamente')
  } catch (error) {
    showError('Error al cambiar la contraseña: ' + error.message)
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    showError('Por favor selecciona un archivo de imagen válido')
    return
  }
  
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('El archivo es demasiado grande. Máximo 5MB permitido')
    return
  }
  
  try {
    loading.value = true
    clearMessages()
    
    const formData = new FormData()
    formData.append('avatar', file)
    
    const updatedProfile = await profileService.uploadAvatar(formData)
    profile.value = { ...profile.value, avatar_url: updatedProfile.avatar_url }
    editableProfile.value = { ...editableProfile.value, avatar_url: updatedProfile.avatar_url }
    
    showSuccess('Avatar actualizado exitosamente')
  } catch (error) {
    showError('Error al subir el avatar: ' + error.message)
  } finally {
    loading.value = false
    // Limpiar el input file
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeAvatar = async () => {
  if (!confirm('¿Estás seguro de que quieres eliminar tu avatar?')) {
    return
  }
  
  try {
    loading.value = true
    clearMessages()
    
    await profileService.deleteAvatar()
    profile.value = { ...profile.value, avatar_url: null }
    editableProfile.value = { ...editableProfile.value, avatar_url: null }
    
    showSuccess('Avatar eliminado exitosamente')
  } catch (error) {
    showError('Error al eliminar el avatar: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
/* Añadir cualquier estilo específico si es necesario */
</style> 