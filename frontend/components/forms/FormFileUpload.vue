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
    
    <div 
      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md"
      :class="[
        error ? 'border-red-300' : isDragOver ? 'border-blue-300 bg-blue-50' : 'border-gray-300',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
      ]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="!disabled && triggerFileInput"
    >
      <div class="space-y-1 text-center">
        <svg 
          class="mx-auto h-12 w-12"
          :class="error ? 'text-red-400' : isDragOver ? 'text-blue-400' : 'text-gray-400'"
          stroke="currentColor" 
          fill="none" 
          viewBox="0 0 48 48" 
          aria-hidden="true"
        >
          <path 
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
          />
        </svg>
        
        <div class="flex text-sm text-gray-600">
          <label
            :for="id"
            class="relative cursor-pointer rounded-md font-medium"
            :class="error ? 'text-red-500' : isDragOver ? 'text-blue-600' : 'text-blue-500'"
          >
            <span>{{ uploadText }}</span>
            <input 
              :id="id" 
              ref="fileInput"
              type="file" 
              class="sr-only"
              :accept="accept"
              :multiple="multiple"
              :disabled="disabled"
              @change="onFileChange"
            />
          </label>
          <p class="pl-1">o arrastra y suelta</p>
        </div>
        
        <p class="text-xs text-gray-500">
          {{ helperText }}
        </p>
      </div>
    </div>
    
    <!-- Lista de archivos seleccionados -->
    <div v-if="files.length > 0" class="mt-2">
      <h4 class="text-sm font-medium text-gray-700 mb-1">Archivos seleccionados:</h4>
      <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
        <li 
          v-for="(file, index) in files" 
          :key="index"
          class="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
        >
          <div class="w-0 flex-1 flex items-center">
            <!-- Icono según tipo de archivo -->
            <svg v-if="isImage(file)" class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="isPDF(file)" class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
            </svg>
            
            <span class="ml-2 flex-1 w-0 truncate">
              {{ file.name }}
            </span>
          </div>
          
          <div class="ml-4 flex-shrink-0 flex items-center space-x-2">
            <!-- Tamaño del archivo -->
            <span class="text-xs text-gray-500">
              {{ formatFileSize(file.size) }}
            </span>
            
            <!-- Vista previa (solo para imágenes) -->
            <button 
              v-if="isImage(file) && !disabled" 
              type="button" 
              class="text-blue-600 hover:text-blue-800 focus:outline-none"
              @click.stop="previewImage(file)"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Eliminar archivo -->
            <button 
              v-if="!disabled" 
              type="button" 
              class="text-red-600 hover:text-red-800 focus:outline-none"
              @click.stop="removeFile(index)"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </li>
      </ul>
    </div>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
    
    <!-- Modal de vista previa de imagen -->
    <div 
      v-if="previewSrc" 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="previewSrc = null"
    >
      <div class="max-w-3xl max-h-[90vh] p-2 bg-white rounded-lg shadow-xl">
        <img 
          :src="previewSrc" 
          class="max-w-full max-h-[80vh] object-contain" 
          alt="Vista previa" 
        />
        <div class="mt-2 flex justify-end">
          <button 
            type="button" 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            @click.stop="previewSrc = null"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [File, Array],
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `file-upload-${Math.random().toString(36).substring(2, 9)}`
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
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
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB por defecto
  },
  maxFiles: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

// Referencias
const fileInput = ref(null)

// Estado
const isDragOver = ref(false)
const files = ref([])
const previewSrc = ref(null)

// Texto para el botón de carga
const uploadText = computed(() => {
  return props.multiple ? 'Subir archivos' : 'Subir archivo'
})

// Texto de ayuda para los tipos de archivo
const helperText = computed(() => {
  let text = props.multiple 
    ? `Máximo ${props.maxFiles} archivos` 
    : 'Solo un archivo'
  
  text += ` (máx. ${formatFileSize(props.maxSize)})`
  
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => {
      return type.trim().replace('.', '').toUpperCase()
    }).join(', ')
    
    text += ` - ${acceptTypes}`
  }
  
  return text
})

// Inicializar archivos desde modelValue
const initFiles = () => {
  if (!props.modelValue) {
    files.value = []
    return
  }
  
  if (Array.isArray(props.modelValue)) {
    files.value = [...props.modelValue]
  } else {
    files.value = [props.modelValue]
  }
}

// Verificar si un archivo es una imagen
const isImage = (file) => {
  return file.type.startsWith('image/')
}

// Verificar si un archivo es un PDF
const isPDF = (file) => {
  return file.type === 'application/pdf'
}

// Formatear tamaño de archivo
const formatFileSize = (size) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  } else {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Validar archivos
const validateFiles = (fileList) => {
  const validFiles = []
  let errorMessage = ''
  
  // Verificar número máximo de archivos
  if (props.multiple && fileList.length + files.value.length > props.maxFiles) {
    errorMessage = `No puedes subir más de ${props.maxFiles} archivos.`
    emit('error', errorMessage)
    return { validFiles, errorMessage }
  }
  
  // Validar cada archivo
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    
    // Verificar tamaño máximo
    if (file.size > props.maxSize) {
      errorMessage = `El archivo "${file.name}" excede el tamaño máximo de ${formatFileSize(props.maxSize)}.`
      emit('error', errorMessage)
      continue
    }
    
    // Verificar tipo de archivo
    if (props.accept && !isFileTypeAccepted(file)) {
      errorMessage = `El archivo "${file.name}" no es de un tipo permitido.`
      emit('error', errorMessage)
      continue
    }
    
    validFiles.push(file)
  }
  
  return { validFiles, errorMessage }
}

// Verificar si el tipo de archivo es aceptado
const isFileTypeAccepted = (file) => {
  const acceptedTypes = props.accept.split(',').map(type => type.trim())
  
  return acceptedTypes.some(type => {
    // Si es una extensión (ej: .jpg)
    if (type.startsWith('.')) {
      const extension = `.${file.name.split('.').pop().toLowerCase()}`
      return extension === type.toLowerCase()
    }
    
    // Si es un tipo MIME (ej: image/jpeg)
    if (type.includes('/')) {
      // Soporte para wildcards (ej: image/*)
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return file.type.startsWith(`${category}/`)
      }
      
      return file.type === type
    }
    
    return false
  })
}

// Manejar cambio de archivos
const onFileChange = (event) => {
  if (props.disabled) return
  
  const fileList = event.target.files
  if (!fileList.length) return
  
  const { validFiles, errorMessage } = validateFiles(fileList)
  
  if (validFiles.length) {
    if (props.multiple) {
      // Agregar a la lista existente
      const newFiles = [...files.value, ...validFiles]
      files.value = newFiles
      emit('update:modelValue', newFiles)
      emit('change', newFiles)
    } else {
      // Reemplazar el archivo existente
      files.value = [validFiles[0]]
      emit('update:modelValue', validFiles[0])
      emit('change', validFiles[0])
    }
  }
  
  // Limpiar input para permitir seleccionar el mismo archivo nuevamente
  event.target.value = null
}

// Manejar arrastrar sobre el área
const onDragOver = () => {
  if (props.disabled) return
  isDragOver.value = true
}

// Manejar salir del área de arrastre
const onDragLeave = () => {
  isDragOver.value = false
}

// Manejar soltar archivos
const onDrop = (event) => {
  if (props.disabled) return
  
  isDragOver.value = false
  const fileList = event.dataTransfer.files
  
  if (!fileList.length) return
  
  const { validFiles, errorMessage } = validateFiles(fileList)
  
  if (validFiles.length) {
    if (props.multiple) {
      // Agregar a la lista existente
      const newFiles = [...files.value, ...validFiles]
      files.value = newFiles
      emit('update:modelValue', newFiles)
      emit('change', newFiles)
    } else {
      // Reemplazar el archivo existente
      files.value = [validFiles[0]]
      emit('update:modelValue', validFiles[0])
      emit('change', validFiles[0])
    }
  }
}

// Activar el input de archivo
const triggerFileInput = () => {
  if (props.disabled) return
  fileInput.value.click()
}

// Eliminar un archivo
const removeFile = (index) => {
  if (props.disabled) return
  
  const newFiles = [...files.value]
  newFiles.splice(index, 1)
  files.value = newFiles
  
  if (props.multiple) {
    emit('update:modelValue', newFiles)
    emit('change', newFiles)
  } else {
    emit('update:modelValue', null)
    emit('change', null)
  }
}

// Vista previa de imagen
const previewImage = (file) => {
  if (!isImage(file)) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previewSrc.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// Observar cambios en modelValue
watch(() => props.modelValue, () => {
  initFiles()
}, { immediate: true })
</script>

<style scoped>
.form-control {
  margin-bottom: 1rem;
}
</style>
