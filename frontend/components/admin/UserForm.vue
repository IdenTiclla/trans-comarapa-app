<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 class="text-lg font-semibold text-gray-900">{{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}</h3>
      <button 
        @click="$emit('cancel')" 
        class="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        title="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <form @submit.prevent="handleSubmit" class="p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Información personal -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Información Personal
          </h4>
          
          <div>
            <label for="firstname" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              id="firstname" 
              v-model="form.firstname" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              :class="{ 'border-red-500': errors.firstname }"
            />
            <p v-if="errors.firstname" class="mt-1 text-sm text-red-600">{{ errors.firstname }}</p>
          </div>
          
          <div>
            <label for="lastname" class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input 
              id="lastname" 
              v-model="form.lastname" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              :class="{ 'border-red-500': errors.lastname }"
            />
            <p v-if="errors.lastname" class="mt-1 text-sm text-red-600">{{ errors.lastname }}</p>
          </div>
        </div>
        
        <!-- Información de cuenta -->
        <div class="space-y-4">
          <h4 class="font-medium text-gray-700 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Información de Cuenta
          </h4>
          
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">@</span>
              </div>
              <input 
                id="username" 
                v-model="form.username" 
                type="text" 
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                :class="{ 'border-red-500': errors.username }"
              />
            </div>
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                id="email" 
                v-model="form.email" 
                type="email" 
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                :class="{ 'border-red-500': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              {{ isEditing ? 'Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña' }}
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                id="password" 
                v-model="form.password" 
                type="password" 
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                :class="{ 'border-red-500': errors.password }"
                :required="!isEditing"
              />
              <div v-if="form.password" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div class="h-1 w-10 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    class="h-full transition-all duration-300"
                    :class="passwordStrengthClass"
                    :style="{ width: `${passwordStrength * 10}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            <p v-else-if="form.password" class="mt-1 text-xs text-gray-500">
              Fortaleza: 
              <span :class="passwordStrengthTextClass">{{ passwordStrengthText }}</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Configuración de rol y estado -->
      <div class="mt-6 space-y-4">
        <h4 class="font-medium text-gray-700 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuración de Rol y Estado
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select 
              id="role" 
              v-model="form.role" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              :class="{ 'border-red-500': errors.role }"
            >
              <option v-for="role in roles" :key="role" :value="role">
                {{ getRoleLabel(role) }}
              </option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
          </div>
          
          <div class="flex items-center space-x-6 mt-6">
            <div class="flex items-center">
              <input 
                id="is_active" 
                v-model="form.is_active" 
                type="checkbox" 
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label for="is_active" class="ml-2 block text-sm text-gray-700">Usuario Activo</label>
            </div>
            
            <div class="flex items-center">
              <input 
                id="is_admin" 
                v-model="form.is_admin" 
                type="checkbox" 
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label for="is_admin" class="ml-2 block text-sm text-gray-700">Permisos de Administrador</label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de acción -->
      <div class="mt-8 flex justify-end space-x-3">
        <button 
          type="button" 
          @click="$emit('cancel')" 
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          :disabled="loading" 
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span v-if="loading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
          <span v-else>{{ isEditing ? 'Actualizar Usuario' : 'Crear Usuario' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  roles: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Formulario
const form = ref({
  firstname: '',
  lastname: '',
  username: '',
  email: '',
  password: '',
  role: props.roles.length > 0 ? props.roles[0] : 'client',
  is_active: true,
  is_admin: false
})

// Errores de validación
const errors = ref({})

// Cargar datos del usuario si estamos editando
watch(() => props.user, (newUser) => {
  if (newUser && Object.keys(newUser).length > 0) {
    form.value = {
      firstname: newUser.firstname || '',
      lastname: newUser.lastname || '',
      username: newUser.username || '',
      email: newUser.email || '',
      password: '', // No cargar la contraseña por seguridad
      role: newUser.role || (props.roles.length > 0 ? props.roles[0] : 'client'),
      is_active: newUser.is_active !== undefined ? newUser.is_active : true,
      is_admin: newUser.is_admin !== undefined ? newUser.is_admin : false
    }
  }
}, { immediate: true })

// Funciones auxiliares
const getRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'secretary':
      return 'Secretaria'
    case 'driver':
      return 'Conductor'
    case 'assistant':
      return 'Asistente'
    case 'client':
      return 'Cliente'
    default:
      return role
  }
}

// Validar formulario
const validateForm = () => {
  const newErrors = {}
  
  if (!form.value.firstname.trim()) {
    newErrors.firstname = 'El nombre es requerido'
  }
  
  if (!form.value.lastname.trim()) {
    newErrors.lastname = 'El apellido es requerido'
  }
  
  if (!form.value.username.trim()) {
    newErrors.username = 'El nombre de usuario es requerido'
  } else if (form.value.username.length < 3) {
    newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
  }
  
  if (!form.value.email.trim()) {
    newErrors.email = 'El correo electrónico es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    newErrors.email = 'El correo electrónico no es válido'
  }
  
  if (!props.isEditing && !form.value.password) {
    newErrors.password = 'La contraseña es requerida'
  } else if (form.value.password && form.value.password.length < 6) {
    newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
  }
  
  if (!form.value.role) {
    newErrors.role = 'El rol es requerido'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Calcular fortaleza de la contraseña
const passwordStrength = computed(() => {
  if (!form.value.password) return 0
  
  let strength = 0
  const password = form.value.password
  
  // Longitud
  if (password.length >= 8) strength += 2
  else if (password.length >= 6) strength += 1
  
  // Letras minúsculas
  if (/[a-z]/.test(password)) strength += 1
  
  // Letras mayúsculas
  if (/[A-Z]/.test(password)) strength += 1
  
  // Números
  if (/[0-9]/.test(password)) strength += 1
  
  // Caracteres especiales
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1
  
  // Variedad de caracteres
  const uniqueChars = new Set(password.split('')).size
  if (uniqueChars >= 5) strength += 2
  else if (uniqueChars >= 3) strength += 1
  
  return Math.min(strength, 10)
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return 'No evaluada'
  if (strength < 4) return 'Débil'
  if (strength < 7) return 'Media'
  return 'Fuerte'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 4) return 'bg-red-500'
  if (strength < 7) return 'bg-yellow-500'
  return 'bg-green-500'
})

const passwordStrengthTextClass = computed(() => {
  const strength = passwordStrength.value
  if (strength < 4) return 'text-red-600'
  if (strength < 7) return 'text-yellow-600'
  return 'text-green-600'
})

// Manejar envío del formulario
const handleSubmit = () => {
  if (validateForm()) {
    // Crear objeto de datos a enviar
    const userData = {
      firstname: form.value.firstname,
      lastname: form.value.lastname,
      username: form.value.username,
      email: form.value.email,
      role: form.value.role,
      is_active: form.value.is_active,
      is_admin: form.value.is_admin
    }
    
    // Incluir contraseña solo si se ha proporcionado
    if (form.value.password) {
      userData.password = form.value.password
    }
    
    // Emitir evento con los datos del formulario
    emit('submit', userData)
  }
}
</script>
