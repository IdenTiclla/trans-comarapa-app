<template>
  <div class="form-control">
    <div v-if="groupLabel" class="mb-2">
      <span 
        class="block text-sm font-medium text-gray-700"
        :class="{ 'text-red-600': error }"
      >
        {{ groupLabel }}
        <span v-if="required" class="text-red-500 ml-1">*</span>
      </span>
    </div>
    
    <div class="space-y-2">
      <div 
        v-for="option in options" 
        :key="getOptionValue(option)"
        class="flex items-start"
      >
        <div class="flex items-center h-5">
          <input
            :id="`${id}-${getOptionValue(option)}`"
            type="radio"
            :name="name || id"
            :value="getOptionValue(option)"
            :checked="modelValue === getOptionValue(option)"
            :disabled="disabled || option.disabled"
            :required="required"
            :class="[
              'h-4 w-4 transition-colors duration-200',
              error 
                ? 'border-red-300 text-red-600 focus:ring-red-500' 
                : 'border-gray-300 text-blue-600 focus:ring-blue-500',
              disabled || option.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            ]"
            @change="$emit('update:modelValue', getOptionValue(option))"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
          />
        </div>
        <div class="ml-3 text-sm">
          <label 
            :for="`${id}-${getOptionValue(option)}`" 
            class="font-medium text-gray-700 cursor-pointer"
            :class="{ 
              'text-red-600': error,
              'text-gray-500 cursor-not-allowed': disabled || option.disabled
            }"
          >
            {{ getOptionLabel(option) }}
          </label>
          <p v-if="option.helpText" class="text-gray-500">{{ option.helpText }}</p>
        </div>
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda general -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  groupLabel: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `radio-group-${Math.random().toString(36).substring(2, 9)}`
  },
  name: {
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
  inline: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

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
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}

input[type="radio"] {
  cursor: pointer;
}

input[type="radio"]:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

input[type="radio"]:disabled {
  opacity: 0.5;
}

/* Estilo para opciones en línea */
.space-y-2.inline {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.space-y-2.inline > div {
  margin-top: 0 !important;
}
</style>
