<template>
  <div>
    <div class="py-6">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 border-b border-gray-200 bg-green-50">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-full p-2">
                <svg class="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">¡Venta completada con éxito!</h3>
                <p class="text-sm text-gray-500">Los boletos han sido emitidos correctamente.</p>
              </div>
            </div>
          </div>
          
          <div class="px-4 py-5 sm:p-6">
            <h4 class="text-base font-medium text-gray-900 mb-4">Detalles de la venta</h4>
            
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Número de referencia</dt>
                <dd class="mt-1 text-sm text-gray-900">T-{{ generateRandomReference() }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha de emisión</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(new Date()) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Cliente</dt>
                <dd class="mt-1 text-sm text-gray-900">Juan Pérez</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Método de pago</dt>
                <dd class="mt-1 text-sm text-gray-900">Efectivo</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Viaje</dt>
                <dd class="mt-1 text-sm text-gray-900">Santa Cruz → Comarapa</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Fecha y hora</dt>
                <dd class="mt-1 text-sm text-gray-900">15 de abril de 2023 - 08:30</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Asientos</dt>
                <dd class="mt-1 text-sm text-gray-900">5, 6</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Total</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">Bs. 300.00</dd>
              </div>
            </dl>
            
            <div class="mt-8 border-t border-gray-200 pt-6">
              <div class="flex justify-between">
                <button 
                  @click="printTicket"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir boleto
                </button>
                <button 
                  @click="router.push('/dashboard')"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver al dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-center">
          <button 
            @click="router.push('/trips')"
            class="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Volver a la lista de viajes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Comprobar autenticación
if (!authStore.isAuthenticated) {
  router.push('/login')
}

// Generar referencia aleatoria
const generateRandomReference = () => {
  return Math.floor(10000 + Math.random() * 90000)
}

// Formatear fecha
const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Imprimir boleto
const printTicket = () => {
  window.print()
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
