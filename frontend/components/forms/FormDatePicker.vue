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
      <div 
        class="relative w-full cursor-default rounded-md bg-white text-left border sm:text-sm"
        :class="[
          error ? 'border-red-300' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : '',
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        ]"
      >
        <input
          :id="id"
          ref="dateInput"
          type="text"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="true"
          :value="displayValue"
          class="w-full border-none py-2 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:outline-none bg-transparent cursor-pointer"
          @click="!disabled && toggleCalendar()"
          @keydown.esc="isOpen = false"
        />
        
        <!-- Icono de calendario -->
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <!-- Botón para limpiar -->
        <span v-if="modelValue && clearable" class="absolute inset-y-0 right-0 flex items-center pr-2">
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
            @click.stop="clearDate"
            @mousedown.prevent
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
      
      <!-- Calendario -->
      <div 
        v-show="isOpen" 
        class="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 p-2"
      >
        <!-- Cabecera del calendario -->
        <div class="flex justify-between items-center mb-2">
          <button 
            type="button"
            class="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            @click="prevMonth"
          >
            <svg class="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div class="text-sm font-medium text-gray-700">
            {{ currentMonthName }} {{ currentYear }}
          </div>
          
          <button 
            type="button"
            class="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            @click="nextMonth"
          >
            <svg class="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <!-- Días de la semana -->
        <div class="grid grid-cols-7 gap-1 mb-1">
          <div 
            v-for="day in daysOfWeek" 
            :key="day"
            class="text-xs font-medium text-gray-500 text-center py-1"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- Días del mes -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            :class="[
              'text-sm rounded-full w-8 h-8 flex items-center justify-center focus:outline-none',
              day.isCurrentMonth ? 'text-gray-700' : 'text-gray-400',
              day.isToday ? 'bg-blue-100' : '',
              day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-gray-100',
              day.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            ]"
            :disabled="day.isDisabled"
            @click="!day.isDisabled && selectDate(day.date)"
          >
            {{ day.day }}
          </button>
        </div>
        
        <!-- Botones de acciones rápidas -->
        <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between">
          <button 
            type="button"
            class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
            @click="selectToday"
          >
            Hoy
          </button>
          
          <button 
            type="button"
            class="text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
            @click="isOpen = false"
          >
            Cerrar
          </button>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Date, String, null],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `date-picker-${Math.random().toString(36).substring(2, 9)}`
  },
  placeholder: {
    type: String,
    default: 'Seleccionar fecha'
  },
  format: {
    type: String,
    default: 'dd/MM/yyyy'
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
  clearable: {
    type: Boolean,
    default: true
  },
  minDate: {
    type: [Date, String],
    default: null
  },
  maxDate: {
    type: [Date, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Referencias
const dateInput = ref(null)

// Estado
const isOpen = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Días de la semana
const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

// Nombres de los meses
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

// Nombre del mes actual
const currentMonthName = computed(() => {
  return monthNames[currentMonth.value]
})

// Fecha seleccionada como objeto Date
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  
  if (props.modelValue instanceof Date) {
    return props.modelValue
  }
  
  return new Date(props.modelValue)
})

// Valor a mostrar en el input
const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  
  return formatDate(selectedDate.value, props.format)
})

// Días del calendario
const calendarDays = computed(() => {
  const days = []
  
  // Primer día del mes actual
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  
  // Último día del mes actual
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // Día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  // Días del mes anterior para completar la primera semana
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      isDisabled: isDateDisabled(date)
    })
  }
  
  // Días del mes actual
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    
    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      isDisabled: isDateDisabled(date)
    })
  }
  
  // Días del mes siguiente para completar la última semana
  const remainingDays = 42 - days.length // 6 semanas x 7 días = 42
  
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, day)
    
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: selectedDate.value && isSameDay(date, selectedDate.value),
      isDisabled: isDateDisabled(date)
    })
  }
  
  return days
})

// Verificar si una fecha está deshabilitada
const isDateDisabled = (date) => {
  if (props.minDate) {
    const minDate = props.minDate instanceof Date ? props.minDate : new Date(props.minDate)
    if (date < new Date(minDate.setHours(0, 0, 0, 0))) {
      return true
    }
  }
  
  if (props.maxDate) {
    const maxDate = props.maxDate instanceof Date ? props.maxDate : new Date(props.maxDate)
    if (date > new Date(maxDate.setHours(23, 59, 59, 999))) {
      return true
    }
  }
  
  return false
}

// Verificar si dos fechas son el mismo día
const isSameDay = (date1, date2) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

// Formatear fecha
const formatDate = (date, format) => {
  if (!date) return ''
  
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('yy', year.toString().slice(-2))
}

// Alternar el calendario
const toggleCalendar = () => {
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    // Si hay una fecha seleccionada, mostrar ese mes
    if (selectedDate.value) {
      currentMonth.value = selectedDate.value.getMonth()
      currentYear.value = selectedDate.value.getFullYear()
    } else {
      // Si no, mostrar el mes actual
      const now = new Date()
      currentMonth.value = now.getMonth()
      currentYear.value = now.getFullYear()
    }
  }
}

// Seleccionar una fecha
const selectDate = (date) => {
  emit('update:modelValue', date)
  emit('change', date)
  isOpen.value = false
}

// Seleccionar la fecha de hoy
const selectToday = () => {
  const today = new Date()
  
  if (!isDateDisabled(today)) {
    selectDate(today)
  }
}

// Limpiar la fecha
const clearDate = (event) => {
  event.stopPropagation()
  emit('update:modelValue', null)
  emit('change', null)
}

// Ir al mes anterior
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// Ir al mes siguiente
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Cerrar el calendario al hacer clic fuera
const handleClickOutside = (event) => {
  const element = document.querySelector(`#${props.id}`).parentNode.parentNode
  if (element && !element.contains(event.target)) {
    isOpen.value = false
  }
}

// Observar cambios en modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && (newValue instanceof Date || typeof newValue === 'string')) {
    const date = newValue instanceof Date ? newValue : new Date(newValue)
    
    if (!isNaN(date.getTime())) {
      currentMonth.value = date.getMonth()
      currentYear.value = date.getFullYear()
    }
  }
})

// Ciclo de vida
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Inicializar con la fecha seleccionada si existe
  if (selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth()
    currentYear.value = selectedDate.value.getFullYear()
  }
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
