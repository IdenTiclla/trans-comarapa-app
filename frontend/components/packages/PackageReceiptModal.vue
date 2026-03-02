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
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
        @click.stop
      >
        <!-- Mensaje de confirmación de éxito -->
        <div class="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 border-b border-green-600">
          <div class="flex items-center justify-center">
            <div class="flex items-center">
              <!-- Ícono de éxito -->
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <!-- Mensaje -->
              <div class="ml-2">
                <h3 class="text-lg font-bold text-white tracking-wide">
                  ¡Encomienda Registrada!
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido del recibo -->
        <div id="receipt-content" class="bg-white">
          <!-- Recibo principal -->
          <div class="p-4 max-w-3xl mx-auto bg-white border-2 border-blue-800 rounded-lg" style="font-family: Arial, sans-serif;">
            
            <!-- Header principal -->
            <div class="flex items-center justify-between mb-2">
              <!-- Logo y título -->
              <div class="flex items-center">
                <!-- Logo -->
                <div class="relative mr-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                    <!-- Bus icon -->
                    <svg class="w-8 h-8 text-white" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="10" y="35" width="80" height="30" rx="4" fill="currentColor"/>
                      <rect x="15" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="35" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <rect x="55" y="40" width="15" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
                      <circle cx="25" cy="70" r="6" fill="currentColor"/>
                      <circle cx="75" cy="70" r="6" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                
                <!-- Título -->
                <div>
                  <h1 class="text-2xl font-black text-blue-800 tracking-wide">TRANS</h1>
                  <h2 class="text-3xl font-black text-blue-900 -mt-1 tracking-wider">Comarapa</h2>
                </div>
              </div>
              
              <!-- Información de fecha -->
              <div class="text-right">
                <div class="grid grid-cols-4 gap-1 mb-1">
                  <div class="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">LUGAR</div>
                  <div class="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">DÍA</div>
                  <div class="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">MES</div>
                  <div class="bg-blue-800 text-white px-2 py-1 text-[10px] font-bold text-center rounded-t">AÑO</div>
                </div>
                <div class="grid grid-cols-4 gap-1 mb-2">
                  <div class="border border-gray-600 px-2 py-1 text-xs font-semibold text-center bg-gray-50">{{ packageData.origin?.slice(0, 3) || 'SCZ' }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentDay }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentMonth }}</div>
                  <div class="border-2 border-gray-600 px-3 py-2 text-sm font-semibold text-center bg-gray-50">{{ currentYear }}</div>
                </div>
              </div>
            </div>

            <!-- Título principal con número de recibo -->
            <div class="flex items-center justify-between mb-4 mt-2">
              <h3 class="text-lg font-black text-blue-800 tracking-wide">EMISIÓN DE ENCOMIENDA</h3>
              <div class="bg-red-600 text-white px-3 py-1 rounded shadow-sm border border-red-700">
                <span class="text-sm font-bold tracking-wider">N° {{ packageData.tracking_number || packageNumber }}</span>
              </div>
            </div>

            <!-- Información de contacto con styling mejorado -->
            <div class="text-xs text-blue-700 mb-6 font-medium leading-relaxed">
              <p>📍 <strong>Of. Santa Cruz:</strong> Av. Doble Vía La Guardia 4to. Anillo • <strong>Cel.:</strong> 68921188</p>
              <p>📍 <strong>Of. Comarapa:</strong> Av. Comarapa • <strong>Cel.:</strong> 68921154</p>
              <p>📍 <strong>Of. San Isidro:</strong> <strong>Cel.:</strong> 71641780</p>
              <p>📍 <strong>Of. Los Negros:</strong> <strong>Cel.:</strong> 71641781</p>
            </div>

            <!-- Información del envío -->
            <div class="space-y-1 mb-4 text-sm">
              <!-- Remitente -->
              <div class="flex items-center">
                <span class="text-blue-800 font-bold w-24">Remitente:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10">{{ getSenderName(packageData.sender) }} (CI: {{ packageData.sender?.document_id }})</span>
                  <div class="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                </div>
              </div>

              <!-- Consignatario -->
              <div class="flex items-center mt-2">
                <span class="text-blue-800 font-bold w-24">Destinatario:</span>
                <div class="flex-1 relative">
                  <span class="bg-white pr-2 relative z-10">{{ getRecipientName(packageData.recipient) }} (CI: {{ packageData.recipient?.document_id }})</span>
                  <div class="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                </div>
              </div>

              <!-- Destino y Pago -->
              <div class="flex items-center mt-2 gap-4">
                <div class="flex items-center flex-1">
                  <span class="text-blue-800 font-bold w-24">Destino:</span>
                  <div class="flex-1 relative">
                    <span class="bg-white pr-2 relative z-10">{{ packageData.destination }}</span>
                    <div class="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                  </div>
                </div>
                <div class="flex items-center flex-1">
                  <span class="text-blue-800 font-bold w-12">Pago:</span>
                  <div class="flex-1 relative">
                    <span class="bg-white pr-2 relative z-10 truncate text-[11px]" :title="packageData.payment_status === 'paid_on_send' ? 'Pagado (Efectivo)' : 'Por cobrar'">
                      {{ packageData.payment_status === 'paid_on_send' ? 'Pagado' : 'Por cobrar' }}
                    </span>
                    <div class="absolute inset-x-0 bottom-0 border-b border-dotted border-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabla de detalles -->
            <div class="border-2 border-blue-800 rounded-sm mb-4 overflow-hidden">
              <div class="grid grid-cols-12 bg-blue-800 relative z-10">
                <div class="col-span-2 text-white p-1 text-center font-bold text-xs">CANT.</div>
                <div class="col-span-7 text-white p-1 text-center font-bold text-xs">DETALLE</div>
                <div class="col-span-3 text-white p-1 text-center font-bold text-xs">MONTO</div>
              </div>

              <!-- Contenido de la tabla -->
              <div class="bg-gray-50 text-sm">
                <!-- Items del paquete -->
                <div v-for="(item, index) in packageData.items" :key="index" class="grid grid-cols-12 border-b border-gray-300">
                  <div class="col-span-2 p-2 text-center">{{ item.quantity }}</div>
                  <div class="col-span-7 p-2 truncate">{{ item.description }}</div>
                  <div class="col-span-3 p-2 text-center">Bs. {{ (item.quantity * item.unit_price).toFixed(2) }}</div>
                </div>
                
                <!-- Líneas vacías para mantener forma -->
                <div v-for="n in Math.max(0, 3 - (packageData.items?.length || 0))" :key="'empty-' + n" class="grid grid-cols-12 border-b border-gray-200">
                  <div class="col-span-2 p-2">&nbsp;</div>
                  <div class="col-span-7 p-2">&nbsp;</div>
                  <div class="col-span-3 p-2">&nbsp;</div>
                </div>
              </div>

              <!-- Total -->
              <div class="grid grid-cols-12 bg-blue-50 border-t-2 border-blue-800">
                <div class="col-span-9 p-2 text-right font-bold text-sm text-blue-900">TOTAL:</div>
                <div class="col-span-3 p-2 text-center font-bold text-sm text-blue-900">Bs. {{ totalAmount.toFixed(2) }}</div>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs mb-2">
              <div class="w-2/3">
                <p class="text-gray-600 mb-1">Pasado los 30 días la empresa no se responsabiliza.</p>
                <div class="text-blue-700 font-medium leading-relaxed">
                  <p>Of. SCZ: 68921188 | Of. Comarapa: 68921154</p>
                </div>
              </div>
              
              <!-- Recibí conforme -->
              <div class="text-center w-1/3">
                <div class="border-t border-dotted border-gray-500 w-full mb-1"></div>
                <p class="text-blue-800 font-bold" style="font-size: 10px;">RECIBÍ CONFORME</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-end gap-2 border-t border-gray-200">
          <button
            type="button"
            @click="printReceipt"
            class="w-full sm:w-auto px-4 py-2 border border-blue-600 rounded text-sm font-semibold text-blue-600 bg-white hover:bg-blue-50 focus:outline-none"
          >
            Imprimir Recibo
          </button>
          <button
            type="button"
            @click="closeModal"
            class="w-full sm:w-auto px-4 py-2 border border-transparent rounded text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
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
import { usePersonData } from '~/composables/usePersonData'
import { usePackageStatus } from '~/composables/usePackageStatus'

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

const { getEffectiveName } = usePersonData()

// Funciones auxiliares para obtener nombres
const getSenderName = (sender) => {
  return getEffectiveName(sender)
}

const getRecipientName = (recipient) => {
  return getEffectiveName(recipient)
}

const { getStatusLabel } = usePackageStatus()
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
    return total + (item.quantity * item.unit_price)
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
        .gap-4 { gap: 1rem; }
        .space-x-2 > * + * { margin-left: 0.5rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .p-1 { padding: 0.25rem; }
        .p-2 { padding: 0.5rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mr-4 { margin-right: 1rem; }
        .mr-6 { margin-right: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        .-mt-1 { margin-top: -0.25rem; }
        .-mt-2 { margin-top: -0.5rem; }
        
        /* Colores y fondos */
        .bg-white { background-color: white; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-blue-800 { background-color: #1e40af; }
        .bg-gradient-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
        .bg-gradient-blue-header { background: linear-gradient(to right, #1e40af, #1d4ed8); }
        .bg-gradient-blue-light { background: linear-gradient(to right, #dbeafe, #eff6ff); }
        .bg-gradient-yellow { background: linear-gradient(to right, #fefce8, #fef3c7); }
        .bg-red-600 { background-color: #dc2626; }
        .text-white { color: white; }
        .text-gray-600 { color: #4b5563; }
        .text-blue-700 { color: #1d4ed8; }
        .text-blue-800 { color: #1e40af; }
        .text-blue-900 { color: #1e3a8a; }
        .text-yellow-800 { color: #92400e; }
        
        /* Bordes */
        .border { border-width: 1px; }
        .border-4 { border-width: 4px; }
        .border-2 { border-width: 2px; }
        .border-blue-800 { border-color: #1e40af; }
        .border-gray-600 { border-color: #4b5563; }
        .border-gray-300 { border-color: #d1d5db; }
        .border-gray-200 { border-color: #e5e7eb; }
        .border-yellow-500 { border-color: #eab308; }
        .border-l-4 { border-left-width: 4px; }
        .border-t { border-top-width: 1px; }
        .border-t-2 { border-top-width: 2px; }
        .border-t-4 { border-top-width: 4px; }
        .border-b { border-bottom-width: 1px; }
        .border-b-2 { border-bottom-width: 2px; }
        .border-dotted { border-style: dotted; }
        .border-gray-400 { border-color: #9ca3af; }
        .border-gray-500 { border-color: #6b7280; }
        .rounded { border-radius: 0.25rem; }
        .rounded-sm { border-radius: 0.125rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .rounded-t { border-top-left-radius: 0.25rem; border-top-right-radius: 0.25rem; }
        .rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
        
        /* Tipografía */
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-\\[10px\\] { font-size: 10px; }
        .text-\\[11px\\] { font-size: 11px; }
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
        .w-12 { width: 3rem; }
        .w-20 { width: 5rem; }
        .w-24 { width: 6rem; }
        .w-28 { width: 7rem; }
        .w-64 { width: 16rem; }
        .w-1\\/3 { width: 33.333333%; }
        .w-2\\/3 { width: 66.666667%; }
        .h-8 { height: 2rem; }
        .h-12 { height: 3rem; }
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
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
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
  // If no tracking number provided yet, generate a fallback
  if (!props.packageData.tracking_number) {
    packageNumber.value = 'TEMP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  }
})
</script> 