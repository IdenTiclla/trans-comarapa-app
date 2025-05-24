<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal del recibo -->
      <div 
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        @click.stop
      >
        <!-- Mensaje de confirmación de éxito -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 border-b border-green-600">
          <div class="flex items-center justify-center">
            <div class="flex items-center">
              <!-- Ícono de éxito -->
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Mensaje -->
              <div class="ml-3">
                <h3 class="text-xl font-bold text-white tracking-wide">
                  ¡Encomienda Registrada con Éxito!
                </h3>
                <p class="text-green-100 text-sm font-medium">
                  Tu paquete ha sido registrado correctamente en el sistema
                </p>
              </div>
              
              <!-- Animación de confetti -->
              <div class="ml-4 flex space-x-1">
                <div class="animate-bounce text-yellow-300 text-lg">🎉</div>
                <div class="animate-bounce text-yellow-300 text-lg" style="animation-delay: 0.1s;">✨</div>
                <div class="animate-bounce text-yellow-300 text-lg" style="animation-delay: 0.2s;">🎊</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido del recibo -->
        <div id="receipt-content" class="bg-white">
          <!-- Recibo principal -->
          <div class="p-6 max-w-4xl mx-auto bg-white border-4 border-blue-800 rounded-lg" style="font-family: Arial, sans-serif;">
            
            <!-- Header principal -->
            <div class="flex items-center justify-between mb-4">
              <!-- Logo y título -->
              <div class="flex items-center">
                <!-- Logo mejorado -->
                <div class="relative mr-6">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <!-- Bus icon más detallado -->
                    <svg class="w-12 h-12 text-white" viewBox="0 0 100 100" fill="currentColor">
                      <!-- Cuerpo del bus -->
                      <rect x="10" y="35" width="80" height="30" rx="8" fill="currentColor"/>
                      <!-- Ventanas -->
                      <rect x="15" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="35" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="55" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="75" y="40" width="10" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <!-- Ruedas -->
                      <circle cx="25" cy="70" r="8" fill="currentColor"/>
                      <circle cx="75" cy="70" r="8" fill="currentColor"/>
                      <circle cx="25" cy="70" r="4" fill="rgba(255,255,255,0.9)"/>
                      <circle cx="75" cy="70" r="4" fill="rgba(255,255,255,0.9)"/>
                      <!-- Sol -->
                      <circle cx="80" cy="20" r="10" fill="#FFD700"/>
                      <path d="M70,15 L75,10 M85,10 L90,15 M95,20 L100,20 M90,25 L95,30 M85,30 L80,35 M75,30 L70,25 M65,20 L60,20 M70,25 L65,30" stroke="#FFD700" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                
                <!-- Título con styling mejorado -->
                <div>
                  <h1 class="text-4xl font-black text-blue-800 tracking-wide" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">TRANS</h1>
                  <h2 class="text-5xl font-black text-blue-900 -mt-2 tracking-wider" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">Comarapa</h2>
                </div>
              </div>
              
              <!-- Información de fecha y número con diseño mejorado -->
              <div class="text-right">
                <!-- Headers de fecha -->
                <div class="grid grid-cols-4 gap-1 mb-1">
                  <div class="bg-blue-800 text-white px-3 py-2 text-xs font-bold text-center rounded-t">LUGAR</div>
                  <div class="bg-blue-800 text-white px-3 py-2 text-xs font-bold text-center rounded-t">DÍA</div>
                  <div class="bg-blue-800 text-white px-3 py-2 text-xs font-bold text-center rounded-t">MES</div>
                  <div class="bg-blue-800 text-white px-3 py-2 text-xs font-bold text-center rounded-t">AÑO</div>
                </div>
                <!-- Valores de fecha -->
                <div class="grid grid-cols-4 gap-1 mb-4">
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ packageData.origin?.slice(0, 3) || 'SCZ' }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentDay }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentMonth }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentYear }}</div>
                </div>
                
                <!-- Horarios con styling real -->
                <div class="text-right mb-2">
                  <span class="text-sm text-gray-700 font-medium">Hrs. Dep. ..................... Hrs. Sal. ..................</span>
                </div>
              </div>
            </div>

            <!-- Título principal con número de recibo -->
            <div class="text-center mb-6">
              <h3 class="text-3xl font-black text-blue-800 mb-3 tracking-wide" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">EMISIÓN DE ENCOMIENDA</h3>
              <div class="flex justify-end">
                <div class="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-red-700">
                  <span class="text-xl font-black tracking-wider">N° {{ String(packageData.id || packageNumber).padStart(6, '0') }}</span>
                </div>
              </div>
            </div>

            <!-- Información de contacto con styling mejorado -->
            <div class="text-xs text-blue-700 mb-6 font-medium leading-relaxed">
              <p>📍 <strong>Of. Santa Cruz:</strong> Av. Doble Vía La Guardia 4to. Anillo • <strong>Cel.:</strong> 68921188</p>
              <p>📍 <strong>Of. Comarapa:</strong> Av. Comarapa • <strong>Cel.:</strong> 68921154</p>
              <p>📍 <strong>Of. San Isidro:</strong> <strong>Cel.:</strong> 71641780</p>
              <p>📍 <strong>Of. Los Negros:</strong> <strong>Cel.:</strong> 71641781</p>
            </div>

            <!-- Información del envío con líneas punteadas reales -->
            <div class="space-y-3 mb-6">
              <!-- Remitente -->
              <div class="flex items-center">
                <span class="text-blue-800 font-bold w-28 text-base">Remitente:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10 font-medium">{{ packageData.sender?.firstname }} {{ packageData.sender?.lastname }} (CI: {{ packageData.sender?.document_id }})</span>
                  <div class="absolute inset-x-0 bottom-0 border-b-2 border-dotted border-gray-400"></div>
                </div>
              </div>

              <!-- Consignatario -->
              <div class="flex items-center">
                <span class="text-blue-800 font-bold w-28 text-base">Consignatario:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10 font-medium">{{ packageData.recipient?.firstname }} {{ packageData.recipient?.lastname }} (CI: {{ packageData.recipient?.document_id }})</span>
                  <div class="absolute inset-x-0 bottom-0 border-b-2 border-dotted border-gray-400"></div>
                </div>
              </div>

              <!-- Destino -->
              <div class="flex items-center">
                <span class="text-blue-800 font-bold w-28 text-base">Destino:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10 font-medium">{{ packageData.destination }}</span>
                  <div class="absolute inset-x-0 bottom-0 border-b-2 border-dotted border-gray-400"></div>
                </div>
              </div>

              <!-- Conductor -->
              <div class="flex items-center">
                <span class="text-blue-800 font-bold w-28 text-base">Conductor:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10 font-medium">{{ packageData.driver_name }}</span>
                  <div class="absolute inset-x-0 bottom-0 border-b-2 border-dotted border-gray-400"></div>
                </div>
              </div>
            </div>

            <!-- Tabla de detalles con diseño real -->
            <div class="border-4 border-blue-800 rounded-lg mb-6 overflow-hidden">
              <!-- Header de la tabla con curvatura -->
              <div class="relative">
                <!-- Curva decorativa -->
                <div class="absolute inset-x-0 bottom-0 h-6">
                  <svg viewBox="0 0 400 24" class="w-full h-full">
                    <path d="M0,0 Q200,24 400,0 L400,24 L0,24 Z" fill="#1e3a8a" opacity="0.1"/>
                  </svg>
                </div>
                
                <div class="grid grid-cols-12 bg-gradient-to-r from-blue-800 to-blue-700 relative z-10">
                  <div class="col-span-2 text-white p-4 text-center font-black text-sm tracking-wider">CANTIDAD</div>
                  <div class="col-span-7 text-white p-4 text-center font-black text-sm tracking-[0.3em]">D E T A L L E</div>
                  <div class="col-span-3 text-white p-4 text-center font-black text-sm tracking-[0.2em]">M O N T O</div>
                </div>
              </div>

              <!-- Contenido de la tabla -->
              <div class="bg-gray-50">
                <!-- Items del paquete -->
                <div v-for="(item, index) in packageData.items" :key="index" class="grid grid-cols-12 border-b border-gray-300 hover:bg-gray-100 transition-colors">
                  <div class="col-span-2 p-4 text-center font-semibold text-lg">{{ item.quantity }}</div>
                  <div class="col-span-7 p-4 font-medium">{{ item.description }}</div>
                  <div class="col-span-3 p-4 text-center font-semibold text-lg">Bs. {{ (item.quantity * item.price).toFixed(2) }}</div>
                </div>
                
                <!-- Líneas vacías para completar el espacio -->
                <div v-for="n in Math.max(0, 4 - packageData.items.length)" :key="'empty-' + n" class="grid grid-cols-12 border-b border-gray-200">
                  <div class="col-span-2 p-4 text-center">&nbsp;</div>
                  <div class="col-span-7 p-4">&nbsp;</div>
                  <div class="col-span-3 p-4 text-center">&nbsp;</div>
                </div>
              </div>

              <!-- Total con diseño prominente -->
              <div class="grid grid-cols-12 bg-gradient-to-r from-blue-100 to-blue-50 border-t-4 border-blue-800">
                <div class="col-span-9 p-4 text-right font-black text-lg text-blue-900">TOTAL:</div>
                <div class="col-span-3 p-4 text-center font-black text-2xl text-blue-900">Bs. {{ totalAmount.toFixed(2) }}</div>
              </div>
            </div>

            <!-- Nota legal con diseño mejorado -->
            <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-lg p-4 mb-6 shadow-sm">
              <p class="text-sm text-yellow-800 font-semibold flex items-center">
                <svg class="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <strong>NOTA:</strong> Pasado los 30 días la empresa no se responsabiliza por su encomienda.
              </p>
            </div>

            <!-- Buses con diseño más realista -->
            <div class="flex justify-center items-center space-x-2 mb-6">
              <div v-for="n in 6" :key="n" class="relative">
                <div class="w-16 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-2 border-blue-700 shadow-md flex items-center justify-center transform hover:scale-105 transition-transform">
                  <!-- Bus detallado -->
                  <svg class="w-12 h-8 text-white" viewBox="0 0 60 30" fill="currentColor">
                    <!-- Cuerpo principal -->
                    <rect x="5" y="10" width="50" height="15" rx="3" fill="currentColor"/>
                    <!-- Ventanas -->
                    <rect x="8" y="13" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
                    <rect x="18" y="13" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
                    <rect x="28" y="13" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
                    <rect x="38" y="13" width="8" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
                    <rect x="48" y="13" width="5" height="6" rx="1" fill="rgba(255,255,255,0.9)"/>
                    <!-- Ruedas -->
                    <circle cx="15" cy="27" r="3" fill="currentColor"/>
                    <circle cx="45" cy="27" r="3" fill="currentColor"/>
                    <circle cx="15" cy="27" r="1.5" fill="rgba(255,255,255,0.9)"/>
                    <circle cx="45" cy="27" r="1.5" fill="rgba(255,255,255,0.9)"/>
                  </svg>
                </div>
              </div>
              
              <!-- Línea punteada decorativa -->
              <div class="flex-1 ml-4">
                <div class="border-b-2 border-dotted border-gray-400"></div>
              </div>
            </div>

            <!-- Recibí conforme con diseño profesional -->
            <div class="text-right">
              <div class="inline-block">
                <div class="border-b-2 border-dotted border-gray-500 w-64 mb-2"></div>
                <p class="text-blue-800 font-black text-lg tracking-wide">RECIBÍ CONFORME</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción con diseño mejorado -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            @click="printReceipt"
            class="w-full sm:w-auto px-6 py-3 border-2 border-blue-600 rounded-lg shadow-sm text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Recibo
          </button>
          <button
            type="button"
            @click="closeModal"
            class="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  packageData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

// Número de paquete
const packageNumber = ref('000000')

// Fecha actual
const now = new Date()
const currentDay = ref(now.getDate().toString().padStart(2, '0'))
const currentMonth = ref((now.getMonth() + 1).toString().padStart(2, '0'))
const currentYear = ref(now.getFullYear().toString())

// Computed properties
const totalAmount = computed(() => {
  if (!props.packageData.items) return 0
  return props.packageData.items.reduce((total, item) => {
    return total + (item.quantity * item.price)
  }, 0)
})

// Métodos
const closeModal = () => {
  emit('close')
}

const printReceipt = () => {
  const printContent = document.getElementById('receipt-content')
  const printWindow = window.open('', '_blank')
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo de Encomienda - Trans Comarapa</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .receipt-container { max-width: 800px; margin: 0 auto; }
        
        /* Utilidades de layout */
        .grid { display: grid; }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
        .col-span-2 { grid-column: span 2; }
        .col-span-3 { grid-column: span 3; }
        .col-span-7 { grid-column: span 7; }
        .col-span-9 { grid-column: span 9; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        /* Espaciado */
        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mr-6 { margin-right: 1.5rem; }
        .-mt-2 { margin-top: -0.5rem; }
        
        /* Colores y fondos */
        .bg-white { background-color: white; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-800 { background-color: #1e40af; }
        .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .bg-gradient-blue-header { background: linear-gradient(to right, #1e40af, #1d4ed8); }
        .bg-gradient-blue-light { background: linear-gradient(to right, #dbeafe, #eff6ff); }
        .bg-gradient-yellow { background: linear-gradient(to right, #fefce8, #fef3c7); }
        .bg-red-600 { background-color: #dc2626; }
        .text-white { color: white; }
        .text-blue-700 { color: #1d4ed8; }
        .text-blue-800 { color: #1e40af; }
        .text-blue-900 { color: #1e3a8a; }
        .text-yellow-800 { color: #92400e; }
        
        /* Bordes */
        .border-4 { border-width: 4px; }
        .border-2 { border-width: 2px; }
        .border-blue-800 { border-color: #1e40af; }
        .border-gray-600 { border-color: #4b5563; }
        .border-gray-300 { border-color: #d1d5db; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-yellow-500 { border-color: #eab308; }
        .border-l-4 { border-left-width: 4px; }
        .border-t-4 { border-top-width: 4px; }
        .border-b { border-bottom-width: 1px; }
        .border-b-2 { border-bottom-width: 2px; }
        .border-dotted { border-style: dotted; }
        .border-gray-400 { border-color: #9ca3af; }
        .border-gray-500 { border-color: #6b7280; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
        .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
        
        /* Tipografía */
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-base { font-size: 1rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-4xl { font-size: 2.25rem; }
        .text-5xl { font-size: 3rem; }
        .tracking-wide { letter-spacing: 0.025em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .leading-relaxed { line-height: 1.625; }
        
        /* Tamaños */
        .w-20 { width: 5rem; }
        .w-28 { width: 7rem; }
        .w-64 { width: 16rem; }
        .h-20 { height: 5rem; }
        .w-full { width: 100%; }
        .flex-1 { flex: 1; }
        
        /* Sombras y efectos */
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-x-0 { left: 0; right: 0; }
        .bottom-0 { bottom: 0; }
        .z-10 { z-index: 10; }
        
        /* Logo específico */
        .logo-container {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        /* Número de recibo */
        .receipt-number {
          background-color: #dc2626;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 2px solid #b91c1c;
        }
        
        /* Tabla específica */
        .table-header {
          background: linear-gradient(to right, #1e40af, #1d4ed8);
          color: white;
        }
        
        .table-total {
          background: linear-gradient(to right, #dbeafe, #eff6ff);
          border-top: 4px solid #1e40af;
        }
        
        /* Líneas punteadas mejoradas */
        .dotted-line {
          border-bottom: 2px dotted #9ca3af;
          position: relative;
        }
        
        .dotted-line-thick {
          border-bottom: 2px dotted #6b7280;
        }
        
        /* Print specific styles */
        @media print {
          body { margin: 0; color: black; }
          .receipt-container { max-width: none; }
          .shadow-lg, .shadow-sm { box-shadow: none; }
          .bg-gradient-blue { background: #1e40af !important; }
          .bg-gradient-blue-header { background: #1e40af !important; }
          .bg-gradient-blue-light { background: #eff6ff !important; }
          .bg-gradient-yellow { background: #fefce8 !important; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        ${printContent.innerHTML}
      </div>
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
  printWindow.close()
}

// Generar número de paquete al montar
onMounted(() => {
  packageNumber.value = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
})
</script> 