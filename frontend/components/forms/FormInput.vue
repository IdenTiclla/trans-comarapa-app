<template>
  <div class="form-control">
    <label 
      v-if="label" 
      :for="id" 
      class="block text-sm font-medium text-gray-700 mb-1"
      :class="{ 'text-red-600': error }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative rounded-md shadow-sm">
      <!-- Icono izquierdo (si existe) -->
      <div 
        v-if="leftIcon" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component 
          :is="leftIcon" 
          class="h-5 w-5 text-gray-400"
          :class="{ 'text-red-400': error }"
        />
      </div>
      
      <!-- Input -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        :pattern="pattern"
        :readonly="readonly"
        :class="[
          'block w-full rounded-md sm:text-sm transition-colors duration-200',
          error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
          leftIcon ? 'pl-10' : 'pl-3',
          rightIcon || clearable ? 'pr-10' : 'pr-3',
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white',
          'py-2'
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="$emit('keydown', $event)"
        @keyup="$emit('keyup', $event)"
        @keypress="$emit('keypress', $event)"
      />
      
      <!-- Botón para limpiar el input -->
      <div 
        v-if="clearable && modelValue" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
        @click="clearInput"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5 text-gray-400 hover:text-gray-600" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fill-rule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clip-rule="evenodd" 
          />
        </svg>
      </div>
      
      <!-- Icono derecho (si existe) -->
      <div 
        v-else-if="rightIcon" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <component 
          :is="rightIcon" 
          class="h-5 w-5 text-gray-400"
          :class="{ 'text-red-400': error }"
        />
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'password', 'email', 'number', 'tel', 'url', 
      'search', 'date', 'time', 'datetime-local', 'month', 
      'week', 'color'
    ].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  leftIcon: {
    type: [Object, Function],
    default: null
  },
  rightIcon: {
    type: [Object, Function],
    default: null
  },
  clearable: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  pattern: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'update:modelValue', 
  'blur', 
  'focus', 
  'keydown', 
  'keyup', 
  'keypress',
  'clear'
])

// Función para limpiar el input
const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}

/* Estilos para autocompletado */
input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset;
  transition: background-color 5000s ease-in-out 0s;
}

/* Estilos para inputs de tipo number (ocultar flechas) */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
