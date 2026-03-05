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
            <FormInput
              id="firstname"
              label="Nombre"
              v-model="form.firstname"
              type="text"
              :error="errors.firstname"
            />
          </div>
          
          <div>
            <FormInput
              id="lastname"
              label="Apellido"
              v-model="form.lastname"
              type="text"
              :error="errors.lastname"
            />
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
            <FormInput
              id="username"
              label="Nombre de Usuario"
              v-model="form.username"
              type="text"
              :error="errors.username"
            >
              <template #prefix>
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500">@</span>
                </div>
              </template>
            </FormInput>
          </div>
          
          <div>
            <FormInput
              id="email"
              label="Correo Electrónico"
              v-model="form.email"
              type="email"
              :error="errors.email"
            >
              <template #prefix>
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </template>
            </FormInput>
          </div>
          
          <div>
            <FormInput
              id="password"
              :label="isEditing ? 'Contraseña (dejar en blanco para mantener la actual)' : 'Contraseña'"
              v-model="form.password"
              type="password"
              :required="!isEditing"
              :error="errors.password"
            >
              <template #prefix>
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </template>
              <template v-if="form.password" #suffix>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div class="h-1 w-10 rounded-full overflow-hidden bg-gray-200">
                    <div 
                      class="h-full transition-all duration-300"
                      :class="passwordStrengthClass"
                      :style="{ width: `${passwordStrength * 10}%` }"
                    ></div>
                  </div>
                </div>
              </template>
            </FormInput>
            <p v-if="form.password && !errors.password" class="mt-1 text-xs text-gray-500">
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
            <FormSelect
              id="role"
              label="Rol"
              v-model="form.role"
              :options="roles.map(role => ({ value: role, label: getRoleLabel(role) }))"
              :error="errors.role"
            />
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
import FormInput from '~/components/forms/FormInput.vue'
import FormSelect from '~/components/forms/FormSelect.vue'
import { useFormValidation, validators } from '~/composables/useFormValidation'

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
const { errors, validateForm: runValidation, clearError } = useFormValidation()

const validationRules = computed(() => {
  return {
    firstname: [validators.required('El nombre es requerido')],
    lastname: [validators.required('El apellido es requerido')],
    username: [
      validators.required('El nombre de usuario es requerido'),
      validators.minLength(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    ],
    email: [
      validators.required('El correo electrónico es requerido'),
      validators.email('El correo electrónico no es válido')
    ],
    password: props.isEditing ? [
      val => (val && val.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null)
    ] : [
      validators.required('La contraseña es requerida'),
      validators.minLength(6, 'La contraseña debe tener al menos 6 caracteres')
    ],
    role: [validators.required('El rol es requerido')]
  }
})

// Limpiar error al escribir
watch(form, (newVal) => {
  Object.keys(newVal).forEach(key => {
    // Solo limpiamos el error si el campo tiene algún valor para dar feedback instantáneo positivo
    if (newVal[key] !== '' && newVal[key] !== null && newVal[key] !== undefined) {
      clearError(key)
    }
  })
}, { deep: true })

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
  if (runValidation(form.value, validationRules.value)) {
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
