<template>
  <div>
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">
          <button 
            @click="router.back()" 
            class="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver
          </button>
        </div>
        
        <h1 class="text-2xl font-semibold text-gray-900 mb-6">Nuevo Viaje</h1>
        
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <form @submit.prevent="handleSubmit">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <!-- Origen -->
                <div class="sm:col-span-3">
                  <label for="origin" class="block text-sm font-medium text-gray-700">Origen</label>
                  <div class="mt-1">
                    <select 
                      id="origin" 
                      v-model="formData.origin"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione origen</option>
                      <option v-for="location in locations" :key="location" :value="location">
                        {{ location }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Destino -->
                <div class="sm:col-span-3">
                  <label for="destination" class="block text-sm font-medium text-gray-700">Destino</label>
                  <div class="mt-1">
                    <select 
                      id="destination" 
                      v-model="formData.destination"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione destino</option>
                      <option v-for="location in locations" :key="location" :value="location">
                        {{ location }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Fecha de salida -->
                <div class="sm:col-span-3">
                  <label for="departure_date" class="block text-sm font-medium text-gray-700">Fecha de salida</label>
                  <div class="mt-1">
                    <input 
                      type="date" 
                      id="departure_date" 
                      v-model="formData.departure_date"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <!-- Hora de salida -->
                <div class="sm:col-span-3">
                  <label for="departure_time" class="block text-sm font-medium text-gray-700">Hora de salida</label>
                  <div class="mt-1">
                    <input 
                      type="time" 
                      id="departure_time" 
                      v-model="formData.departure_time"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <!-- Bus -->
                <div class="sm:col-span-3">
                  <label for="bus_id" class="block text-sm font-medium text-gray-700">Bus</label>
                  <div class="mt-1">
                    <select 
                      id="bus_id" 
                      v-model="formData.bus_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione bus</option>
                      <option v-for="bus in buses" :key="bus.id" :value="bus.id">
                        {{ bus.plate }} - {{ bus.model }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Conductor -->
                <div class="sm:col-span-3">
                  <label for="driver_id" class="block text-sm font-medium text-gray-700">Conductor</label>
                  <div class="mt-1">
                    <select 
                      id="driver_id" 
                      v-model="formData.driver_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione conductor</option>
                      <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                        {{ driver.name }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Asistente -->
                <div class="sm:col-span-3">
                  <label for="assistant_id" class="block text-sm font-medium text-gray-700">Asistente</label>
                  <div class="mt-1">
                    <select 
                      id="assistant_id" 
                      v-model="formData.assistant_id"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Seleccione asistente</option>
                      <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.id">
                        {{ assistant.name }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Precio -->
                <div class="sm:col-span-3">
                  <label for="price" class="block text-sm font-medium text-gray-700">Precio (Bs.)</label>
                  <div class="mt-1">
                    <input 
                      type="number" 
                      id="price" 
                      v-model="formData.price"
                      min="0"
                      step="0.5"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  @click="router.back()"
                  class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Creando...' : 'Crear Viaje' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const submitting = ref(false)
const error = ref(null)

// Datos para los selectores
const locations = [
  'Santa Cruz',
  'Comarapa',
  'Cochabamba',
  'La Paz',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Trinidad',
  'Cobija'
]

const buses = [
  { id: 1, plate: 'ABC-123', model: 'Mercedes Benz O-500' },
  { id: 2, plate: 'DEF-456', model: 'Volvo 9800' },
  { id: 3, plate: 'GHI-789', model: 'Scania K410' }
]

const drivers = [
  { id: 1, name: 'Juan Pérez' },
  { id: 2, name: 'Carlos Rodríguez' },
  { id: 3, name: 'Roberto Gómez' }
]

const assistants = [
  { id: 1, name: 'María López' },
  { id: 2, name: 'Ana Martínez' },
  { id: 3, name: 'Laura Sánchez' }
]

// Datos del formulario
const formData = reactive({
  origin: '',
  destination: '',
  departure_date: '',
  departure_time: '',
  bus_id: '',
  driver_id: '',
  assistant_id: '',
  price: 150
})

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Establecer fecha por defecto (mañana)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.departure_date = tomorrow.toISOString().split('T')[0]
})

// Manejar envío del formulario
const handleSubmit = async () => {
  // Validar que origen y destino sean diferentes
  if (formData.origin === formData.destination) {
    error.value = 'El origen y el destino no pueden ser iguales'
    return
  }
  
  submitting.value = true
  
  try {
    // En un entorno real, aquí se haría una llamada a la API
    // const response = await fetch('/api/trips', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(formData)
    // })
    
    // Simulación para desarrollo
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirigir a la lista de viajes
    router.push('/trips')
    
  } catch (err) {
    console.error('Error al crear el viaje:', err)
    error.value = 'No se pudo crear el viaje. Intente nuevamente.'
  } finally {
    submitting.value = false
  }
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
