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
    
    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :multiple="multiple"
        :size="size"
        :class="[
          'block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200',
          error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : '',
          disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '',
          !modelValue && placeholder ? 'text-gray-400' : ''
        ]"
        @change="handleChange"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <option v-if="placeholder" value="" disabled selected hidden>{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
          :disabled="option.disabled"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
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
    type: [String, Number, Array, Object],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
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
  valueKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  size: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus'])

// Función para obtener el valor de una opción
const getOptionValue = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.valueKey]
  }
  return option
}

// Función para obtener la etiqueta de una opción
const getOptionLabel = (option) => {
  if (typeof option === 'object' && option !== null) {
    return option[props.labelKey]
  }
  return option
}

// Manejar el cambio de selección
const handleChange = (event) => {
  let value
  
  if (props.multiple) {
    // Para selección múltiple, obtener todos los valores seleccionados
    const selectedOptions = Array.from(event.target.selectedOptions)
    value = selectedOptions.map(option => option.value)
  } else {
    value = event.target.value
  }
  
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

select:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

select[multiple] {
  padding-right: 0.75rem;
  background-image: none;
}

select[multiple] option {
  padding: 0.5rem;
  margin: 0.25rem 0;
}

/* Estilo para la opción de placeholder */
select option[value=""][disabled] {
  color: #9ca3af;
}
</style>
