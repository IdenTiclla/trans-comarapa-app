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
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxlength"
        :class="[
          'block w-full rounded-md sm:text-sm transition-colors duration-200 resize-y',
          error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white',
          'py-2 px-3'
        ]"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      ></textarea>
      
      <!-- Contador de caracteres (si maxlength está definido) -->
      <div 
        v-if="maxlength && showCharCount" 
        class="absolute bottom-2 right-2 text-xs text-gray-400"
      >
        {{ charCount }}/{{ maxlength }}
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: [String, Number],
    default: 4
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
  maxlength: {
    type: [String, Number],
    default: null
  },
  showCharCount: {
    type: Boolean,
    default: true
  },
  autoResize: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'input'])

// Contador de caracteres
const charCount = computed(() => {
  return props.modelValue ? props.modelValue.length : 0
})

// Manejar el input
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('input', event)
  
  // Auto-resize si está habilitado
  if (props.autoResize) {
    autoResize(event.target)
  }
}

// Función para auto-resize
const autoResize = (textarea) => {
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}

textarea {
  min-height: 2.5rem;
  line-height: 1.5;
}

textarea:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* Estilo para el contador de caracteres */
textarea + div {
  pointer-events: none;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0 0.25rem;
  border-radius: 0.25rem;
}
</style>
