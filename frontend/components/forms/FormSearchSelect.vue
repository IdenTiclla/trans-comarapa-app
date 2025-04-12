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
      <!-- Input de búsqueda -->
      <div 
        class="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border sm:text-sm"
        :class="[
          error ? 'border-red-300' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : '',
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        ]"
        @click="!disabled && toggleDropdown()"
      >
        <input
          :id="id"
          ref="searchInput"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="!searchable"
          :value="searchQuery"
          class="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none bg-transparent"
          :class="{ 'cursor-pointer': !searchable }"
          @input="onSearchInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.enter.prevent="onEnter"
          @keydown.esc="isOpen = false"
        />
        
        <span class="absolute inset-y-0 right-0 flex items-center pr-2">
          <button 
            v-if="modelValue && clearable" 
            type="button" 
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
            @click.stop="clearSelection"
            @mousedown.prevent
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
          <button 
            v-else
            type="button" 
            class="text-gray-400 focus:outline-none"
            @mousedown.prevent
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      
      <!-- Dropdown de opciones -->
      <div 
        v-show="isOpen" 
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <div v-if="loading" class="px-3 py-2 text-gray-500 text-center">
          <svg class="animate-spin h-5 w-5 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="mt-1 block">Cargando...</span>
        </div>
        
        <div v-else-if="filteredOptions.length === 0" class="px-3 py-2 text-gray-500 text-center">
          No se encontraron resultados
        </div>
        
        <div 
          v-else
          v-for="(option, index) in filteredOptions" 
          :key="getOptionValue(option)"
          :class="[
            'cursor-pointer select-none relative py-2 pl-3 pr-9',
            highlightedIndex === index ? 'bg-blue-100 text-blue-900' : 'text-gray-900',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
          ]"
          @mousedown.prevent="!option.disabled && selectOption(option)"
          @mouseover="highlightedIndex = index"
        >
          <span class="block truncate" :class="{ 'font-medium': isSelected(option) }">
            {{ getOptionLabel(option) }}
          </span>
          
          <span 
            v-if="isSelected(option)" 
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
    </div>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null
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
    default: () => `search-select-${Math.random().toString(36).substring(2, 9)}`
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
  searchable: {
    type: Boolean,
    default: true
  },
  clearable: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'search', 'focus', 'blur'])

// Referencias
const searchInput = ref(null)

// Estado
const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)

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

// Opciones filtradas basadas en la búsqueda
const filteredOptions = computed(() => {
  if (!searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option => {
    const label = getOptionLabel(option).toLowerCase()
    return label.includes(query)
  })
})

// Verificar si una opción está seleccionada
const isSelected = (option) => {
  if (props.modelValue === null) return false
  
  if (typeof props.modelValue === 'object' && props.modelValue !== null) {
    return getOptionValue(props.modelValue) === getOptionValue(option)
  }
  
  return props.modelValue === getOptionValue(option)
}

// Seleccionar una opción
const selectOption = (option) => {
  emit('update:modelValue', option)
  emit('change', option)
  isOpen.value = false
  
  // Actualizar el texto de búsqueda con la etiqueta seleccionada
  searchQuery.value = getOptionLabel(option)
}

// Limpiar la selección
const clearSelection = (event) => {
  event.stopPropagation()
  emit('update:modelValue', null)
  emit('change', null)
  searchQuery.value = ''
}

// Alternar el dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  
  if (isOpen.value && searchInput.value) {
    nextTick(() => {
      searchInput.value.focus()
    })
  }
}

// Manejar el input de búsqueda
const onSearchInput = (event) => {
  searchQuery.value = event.target.value
  highlightedIndex.value = 0
  
  if (!isOpen.value) {
    isOpen.value = true
  }
  
  emit('search', searchQuery.value)
}

// Manejar el focus
const onFocus = (event) => {
  emit('focus', event)
}

// Manejar el blur
const onBlur = (event) => {
  // Pequeño retraso para permitir que se procese el clic en una opción
  setTimeout(() => {
    isOpen.value = false
    
    // Si no hay selección, restaurar el texto de búsqueda
    if (props.modelValue === null) {
      searchQuery.value = ''
    } else {
      // Restaurar el texto de búsqueda a la etiqueta de la opción seleccionada
      const selectedOption = props.options.find(option => 
        getOptionValue(option) === (
          typeof props.modelValue === 'object' 
            ? getOptionValue(props.modelValue) 
            : props.modelValue
        )
      )
      
      if (selectedOption) {
        searchQuery.value = getOptionLabel(selectedOption)
      }
    }
  }, 200)
  
  emit('blur', event)
}

// Navegar hacia abajo en la lista
const onArrowDown = () => {
  if (!isOpen.value) {
    isOpen.value = true
    return
  }
  
  if (highlightedIndex.value < filteredOptions.value.length - 1) {
    highlightedIndex.value++
    scrollToOption()
  }
}

// Navegar hacia arriba en la lista
const onArrowUp = () => {
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
    scrollToOption()
  }
}

// Seleccionar la opción resaltada con Enter
const onEnter = () => {
  if (isOpen.value && filteredOptions.value.length > 0) {
    const option = filteredOptions.value[highlightedIndex.value]
    if (option && !option.disabled) {
      selectOption(option)
    }
  }
}

// Desplazarse a la opción resaltada
const scrollToOption = () => {
  nextTick(() => {
    const dropdown = document.querySelector(`#${props.id}`).nextElementSibling
    const highlighted = dropdown.children[highlightedIndex.value + 1] // +1 para el mensaje de "no se encontraron resultados"
    
    if (highlighted) {
      const dropdownRect = dropdown.getBoundingClientRect()
      const highlightedRect = highlighted.getBoundingClientRect()
      
      if (highlightedRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += highlightedRect.bottom - dropdownRect.bottom
      } else if (highlightedRect.top < dropdownRect.top) {
        dropdown.scrollTop -= dropdownRect.top - highlightedRect.top
      }
    }
  })
}

// Cerrar el dropdown al hacer clic fuera
const handleClickOutside = (event) => {
  const element = document.querySelector(`#${props.id}`).parentNode
  if (element && !element.contains(event.target)) {
    isOpen.value = false
  }
}

// Inicializar el texto de búsqueda con la opción seleccionada
const initializeSearchQuery = () => {
  if (props.modelValue !== null) {
    const selectedOption = props.options.find(option => 
      getOptionValue(option) === (
        typeof props.modelValue === 'object' 
          ? getOptionValue(props.modelValue) 
          : props.modelValue
      )
    )
    
    if (selectedOption) {
      searchQuery.value = getOptionLabel(selectedOption)
    }
  }
}

// Observar cambios en modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue === null) {
    searchQuery.value = ''
  } else {
    initializeSearchQuery()
  }
})

// Observar cambios en options
watch(() => props.options, () => {
  initializeSearchQuery()
})

// Ciclo de vida
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  initializeSearchQuery()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
  position: relative;
}
</style>
