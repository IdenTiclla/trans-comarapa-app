<template>
  <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Overlay de fondo -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <!-- Centrar modal -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <!-- Modal -->
      <div 
        v-if="!showReceiptModal"
        class="inline-block align-bottom bg-gray-50 rounded-xl text-left shadow-2xl transform transition-all sm:my-4 sm:align-middle w-full sm:max-w-7xl"
        @click.stop
      >
        <!-- Encabezado del modal -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between border-b rounded-t-xl">
          <div class="flex items-center space-x-3">
            <div class="bg-white/10 p-1.5 rounded-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white leading-tight">Emisión de Encomienda</h3>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-white text-right">
              <div class="text-[10px] font-medium text-blue-200 uppercase tracking-wider">No. Seguimiento</div>
              <div class="text-lg font-bold tracking-wider leading-none">{{ packageNumber }}</div>
            </div>
            <button
              @click="closeModal"
              class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="px-5 py-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <form @submit.prevent="submitPackage" class="space-y-4">
            
            <!-- Información general y Distribución (Lugar, Destino, Fecha, Pago, Estado) -->
            <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <!-- Origen y Destino -->
                <FormInput
                  label="Origen *"
                  v-model="packageData.origin"
                  type="text"
                  placeholder="Ej: Comarapa"
                  required
                />
                <FormInput 
                  label="Destino *" 
                  v-model="packageData.destination" 
                  required 
                  placeholder="Ej: Santa Cruz" 
                />
                
                <!-- Pago -->
                <FormSelect
                  label="Estado del Pago *"
                  v-model="packageData.payment_status"
                  required
                  :options="[
                    { value: 'paid_on_send', label: 'Pagado al enviar' },
                    { value: 'collect_on_delivery', label: 'Por cobrar en destino' }
                  ]"
                />
                <FormSelect
                  v-if="packageData.payment_status === 'paid_on_send'"
                  label="Método *"
                  v-model="packageData.payment_method"
                  required
                  :options="[
                    { value: 'cash', label: '💵 Físico' },
                    { value: 'qr', label: '📱 QR/Transf.' }
                  ]"
                />
                <!-- Espaciador si el método de pago está oculto -->
                <div v-else class="hidden md:block"></div>
                
                <!-- Estado -->
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                  <div class="flex items-center h-[38px]">
                    <span v-if="tripId" class="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 w-full justify-center">
                      <span class="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                      Asignado
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-1.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 w-full justify-center">
                      <span class="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
                      En oficina
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <!-- Columna Izquierda: Actores (Remitente y Consignatario) -->
              <div class="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Tarjeta Remitente -->
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col">
                  <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                    <svg class="w-4 h-4 text-blue-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Remitente
                  </h4>
                  
                  <div class="grid grid-cols-2 gap-2 mb-4">
                    <label class="flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm"
                           :class="senderSearch.clientType.value === 'existing' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
                      <input type="radio" v-model="senderSearch.clientType.value" value="existing" class="sr-only">
                      Cliente Existente
                    </label>

                    <label class="flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm"
                           :class="senderSearch.clientType.value === 'new' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
                      <input type="radio" v-model="senderSearch.clientType.value" value="new" class="sr-only">
                      Cliente Nuevo
                    </label>
                  </div>

                  <!-- Remitente Existente -->
                  <div v-if="senderSearch.clientType.value === 'existing'" class="flex-1 flex flex-col relative w-full h-full min-h-[140px]">
                    <div class="mb-2">
                      <input
                        v-model="senderSearch.clientSearchQuery.value"
                        @input="senderSearch.searchClients"
                        type="text"
                        class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                        placeholder="Buscar por nombre, apellido o CI..."
                      />
                    </div>
                    
                    <div v-if="senderSearch.searchingClients.value" class="flex items-center justify-center py-4">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>

                    <div v-else-if="senderSearch.hasSearched.value && senderSearch.foundClients.value.length > 0 && !senderSearch.hasSelectedExistingClient.value" class="absolute z-10 w-full top-[42px] bg-white shadow-lg border border-gray-200 rounded-lg">
                      <div class="max-h-32 overflow-y-auto">
                        <div v-for="client in senderSearch.foundClients.value" :key="client.id" @click="senderSearch.selectExistingClient(client)"
                          class="p-2 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-all text-sm">
                          <div class="font-medium text-gray-900">{{ client.firstname }} {{ client.lastname }}</div>
                          <div class="text-xs text-gray-500">CI: {{ client.document_id }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-else-if="senderSearch.hasSearched.value && senderSearch.foundClients.value.length === 0 && !senderSearch.hasSelectedExistingClient.value" class="text-center py-2">
                      <p class="text-xs text-gray-500">No se encontraron clientes.</p>
                    </div>

                    <div v-if="senderSearch.hasSelectedExistingClient.value" class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-1 shadow-sm relative">
                      <button @click="senderSearch.clearExistingClientSelection" type="button" class="absolute top-2 right-2 text-blue-400 hover:text-blue-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                      <h5 class="font-semibold text-sm text-blue-900 leading-tight mb-1">{{ senderSearch.selectedExistingClient.value.firstname }} {{ senderSearch.selectedExistingClient.value.lastname }}</h5>
                      <p class="text-xs text-blue-700">CI: {{ senderSearch.selectedExistingClient.value.document_id }} <span v-if="senderSearch.selectedExistingClient.value.phone">• Cel: {{ senderSearch.selectedExistingClient.value.phone }}</span></p>
                    </div>
                  </div>

                  <!-- Remitente Nuevo -->
                  <div v-if="senderSearch.clientType.value === 'new'" class="grid grid-cols-2 gap-3 h-full min-h-[140px] items-start">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                      <input v-model="newSenderForm.firstname" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                        <input v-model="newSenderForm.lastname" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">CI/Doc *</label>
                        <input v-model="newSenderForm.document_id" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                        <input v-model="newSenderForm.phone" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5" />
                    </div>
                  </div>
                </div>

                <!-- Tarjeta Destinatario (Consignatario) -->
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-bold text-gray-900 flex items-center uppercase tracking-wide">
                      <svg class="w-4 h-4 text-green-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Consignatario
                    </h4>
                    <button v-if="hasSender && hasRecipient && getSenderDocument() !== getRecipientDocument()" type="button" @click="copySenderToRecipient" class="text-xs font-medium text-gray-500 hover:text-green-600 transition-colors uppercase tracking-wider flex items-center">
                       <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      MISMA PERSONA?
                    </button>
                  </div>

                  <div class="grid grid-cols-2 gap-2 mb-4">
                    <label class="flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm"
                           :class="recipientSearch.clientType.value === 'existing' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
                      <input type="radio" v-model="recipientSearch.clientType.value" value="existing" class="sr-only">
                      Cliente Existente
                    </label>

                    <label class="flex items-center justify-center py-2 px-3 border rounded-lg cursor-pointer transition-all text-sm"
                           :class="recipientSearch.clientType.value === 'new' ? 'border-green-500 bg-green-50 text-green-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
                      <input type="radio" v-model="recipientSearch.clientType.value" value="new" class="sr-only">
                      Cliente Nuevo
                    </label>
                  </div>

                  <!-- Destinatario Existente -->
                  <div v-if="recipientSearch.clientType.value === 'existing'" class="flex-1 flex flex-col relative w-full h-full min-h-[140px]">
                    <div class="mb-2">
                      <input
                        v-model="recipientSearch.clientSearchQuery.value"
                        @input="recipientSearch.searchClients"
                        type="text"
                        class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-2"
                        placeholder="Buscar por nombre, apellido o CI..."
                      />
                    </div>
                    
                    <div v-if="recipientSearch.searchingClients.value" class="flex items-center justify-center py-4">
                      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>

                    <div v-else-if="recipientSearch.hasSearched.value && recipientSearch.foundClients.value.length > 0 && !recipientSearch.hasSelectedExistingClient.value" class="absolute z-10 w-full top-[42px] bg-white shadow-lg border border-gray-200 rounded-lg">
                       <div class="max-h-32 overflow-y-auto">
                        <div v-for="client in recipientSearch.foundClients.value" :key="client.id" @click="recipientSearch.selectExistingClient(client)"
                          class="p-2 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-all text-sm">
                          <div class="font-medium text-gray-900">{{ client.firstname }} {{ client.lastname }}</div>
                          <div class="text-xs text-gray-500">CI: {{ client.document_id }}</div>
                        </div>
                      </div>
                    </div>

                    <div v-else-if="recipientSearch.hasSearched.value && recipientSearch.foundClients.value.length === 0 && !recipientSearch.hasSelectedExistingClient.value" class="text-center py-2">
                      <p class="text-xs text-gray-500">No se encontraron clientes.</p>
                    </div>

                    <div v-if="recipientSearch.hasSelectedExistingClient.value" class="bg-green-50 border border-green-200 rounded-lg p-3 mt-1 shadow-sm relative">
                      <button @click="recipientSearch.clearExistingClientSelection" type="button" class="absolute top-2 right-2 text-green-400 hover:text-green-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                      <h5 class="font-semibold text-sm text-green-900 leading-tight mb-1">{{ recipientSearch.selectedExistingClient.value.firstname }} {{ recipientSearch.selectedExistingClient.value.lastname }}</h5>
                      <p class="text-xs text-green-700">CI: {{ recipientSearch.selectedExistingClient.value.document_id }} <span v-if="recipientSearch.selectedExistingClient.value.phone">• Cel: {{ recipientSearch.selectedExistingClient.value.phone }}</span></p>
                    </div>
                  </div>

                  <!-- Destinatario Nuevo -->
                   <div v-if="recipientSearch.clientType.value === 'new'" class="grid grid-cols-2 gap-3 h-full min-h-[140px] items-start">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
                      <input v-model="newRecipientForm.firstname" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
                        <input v-model="newRecipientForm.lastname" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">CI/Doc *</label>
                        <input v-model="newRecipientForm.document_id" required class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5" />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                        <input v-model="newRecipientForm.phone" class="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 px-3 py-1.5" />
                    </div>
                  </div>
                </div>

                <div v-if="isSamePerson" class="bg-red-50 border border-red-200 rounded-lg p-3 col-span-1 md:col-span-2 flex items-center mb-2">
                  <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <p class="text-xs text-red-800 font-medium">El remitente y el destinatario no pueden ser la misma persona.</p>
                </div>

                <div class="col-span-1 md:col-span-2 text-xs flex mt-auto gap-4">
                  <div class="flex-1 bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-yellow-800 flex items-start">
                    <svg class="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
                    Aviso Legal: La empresa no se responsabiliza de mercancía que no coincida con el contenido declarado. Sin reclamo pasados los 30 días.
                  </div>
                  <div class="flex-1 bg-white rounded-lg p-3 border border-gray-200 flex items-center">
                    <label class="flex items-center cursor-pointer">
                      <input type="checkbox" v-model="packageData.received_confirmation" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                      <span class="ml-2 text-xs font-medium text-gray-900 leading-tight">El cliente declara que el contenido es lícito y RECIBE CONFORME su comprobante.</span>
                    </label>
                  </div>
                </div>

              </div>

              <!-- Columna Derecha: Tabla de Artículos -->
              <div class="lg:col-span-4 space-y-4">
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-full">
                  <h4 class="text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                     <svg class="w-4 h-4 text-indigo-600 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    Detalle Artículos
                  </h4>

                  <div class="border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col max-h-[220px]">
                    <div class="overflow-y-auto w-full">
                      <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Cant.</th>
                            <th class="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Detalle</th>
                            <th class="px-2 py-2 text-right text-[10px] font-medium text-gray-500 uppercase">Total (Bs)</th>
                            <th class="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                          <tr v-for="(item, index) in packageData.items" :key="index" class="group">
                            <td class="px-2 py-1.5 align-top">
                              <input type="number" v-model.number="item.quantity" min="1" class="w-12 px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-center">
                            </td>
                            <td class="px-2 py-1.5 align-top w-full">
                              <input type="text" v-model="item.description" placeholder="Ej: Ropa" class="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                            </td>
                            <td class="px-2 py-1.5 align-top">
                              <input type="number" v-model.number="item.unit_price" min="0" step="0.5" class="w-16 px-2 py-1 text-sm bg-white border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-right">
                            </td>
                            <td class="px-2 py-1.5 text-right align-middle">
                              <button v-if="packageData.items.length > 1" @click="removeItem(index)" type="button" class="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded p-1 transition-colors opacity-0 group-hover:opacity-100">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <button @click="addItem" type="button" class="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors w-full text-center py-2 bg-blue-50 hover:bg-blue-100 rounded-lg">
                    + Añadir Ítem
                  </button>

                  <div class="mt-auto pt-4 border-t border-gray-100">
                    <div class="bg-blue-50 p-3 rounded-lg flex justify-between items-center border border-blue-100">
                      <span class="text-sm text-gray-600 font-medium">Total a Pagar</span>
                      <span class="text-lg font-bold text-blue-900">Bs. {{ totalAmount.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer con Error y Botones -->
            <div class="pt-4 border-t border-gray-200 mt-2 flex flex-col md:flex-row md:justify-between items-center gap-4">
              <div v-if="formErrorMessage" class="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200 text-sm flex-1 text-left w-full">
                {{ formErrorMessage }}
              </div>
              <div v-else class="flex-1"></div>
              
              <div class="flex space-x-3 w-full md:w-auto">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 md:flex-none px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  :disabled="isSubmitting || !isFormValid"
                  class="flex-1 md:flex-none px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{{ isSubmitting ? 'Procesando...' : 'Confirmar Encomienda' }}</span>
                </button>
              </div>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal del recibo -->
  <PackageReceiptModal
    :show-modal="showReceiptModal"
    :package-data="registeredPackageData"
    @close="closeReceiptModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePackageStore } from '~/stores/packageStore'
import apiFetch from '~/utils/api'

import PackageReceiptModal from './PackageReceiptModal.vue'
import FormInput from '~/components/forms/FormInput.vue'
import FormSelect from '~/components/forms/FormSelect.vue'
import { useClientSearch } from '~/composables/useClientSearch'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
  tripId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['close', 'package-registered'])

// Stores
const authStore = useAuthStore()
const packageStore = usePackageStore()

// Composables independientes de búsqueda de clientes
const senderSearch = useClientSearch()
const recipientSearch = useClientSearch()

// Por defecto, inicializar ambos en 'existing' para priorizar la búsqueda rápida
onMounted(() => {
  senderSearch.clientType.value = 'existing'
  recipientSearch.clientType.value = 'existing'
})

// Estados reactivos
const isSubmitting = ref(false)
const formErrorMessage = ref('')

// Número de paquete (tracking number)
const packageNumber = ref('000000')

// Formularios para nuevos clientes locales
const newSenderForm = ref({ firstname: '', lastname: '', document_id: '', phone: '' })
const newRecipientForm = ref({ firstname: '', lastname: '', document_id: '', phone: '' })

// Fecha actual
const now = new Date()
const currentDay = ref(now.getDate().toString().padStart(2, '0'))
const currentMonth = ref((now.getMonth() + 1).toString().padStart(2, '0'))
const currentYear = ref(now.getFullYear().toString())

// Datos del paquete principal
const packageData = ref({
  tracking_number: '',
  origin: '',
  destination: '',
  total_weight: 0,
  total_declared_value: 0,
  notes: '',
  items: [
    { quantity: 1, description: '', unit_price: 0 }
  ],
  payment_status: 'paid_on_send',
  payment_method: 'cash',
  received_confirmation: false
})

// Computed properties
const totalAmount = computed(() => {
  return packageData.value.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0)
})

const totalItemsCount = computed(() => {
  return packageData.value.items.reduce((total, item) => total + item.quantity, 0)
})

const getSenderDocument = () => {
  return senderSearch.clientType.value === 'existing' 
    ? senderSearch.selectedExistingClient.value?.document_id 
    : newSenderForm.value.document_id
}

const getRecipientDocument = () => {
  return recipientSearch.clientType.value === 'existing' 
    ? recipientSearch.selectedExistingClient.value?.document_id 
    : newRecipientForm.value.document_id
}

const isSamePerson = computed(() => {
  const sDoc = getSenderDocument()
  const rDoc = getRecipientDocument()
  return sDoc && rDoc && sDoc.trim() === rDoc.trim()
})

const hasSender = computed(() => {
  if (senderSearch.clientType.value === 'existing') {
    return !!senderSearch.selectedExistingClient.value
  } else {
    const f = newSenderForm.value
    return f.firstname.trim() !== '' && f.lastname.trim() !== '' && f.document_id.trim() !== ''
  }
})

const hasRecipient = computed(() => {
  if (recipientSearch.clientType.value === 'existing') {
    return !!recipientSearch.selectedExistingClient.value
  } else {
    const f = newRecipientForm.value
    return f.firstname.trim() !== '' && f.lastname.trim() !== '' && f.document_id.trim() !== ''
  }
})

const isFormValid = computed(() => {
  const basicValidation = 
    hasSender.value && 
    hasRecipient.value && 
    packageData.value.destination.trim() !== '' &&
    packageData.value.origin.trim() !== '' &&
    packageData.value.items.length > 0 &&
    packageData.value.items.every(item => item.description.trim() !== '' && item.quantity > 0 && item.unit_price >= 0) &&
    packageData.value.received_confirmation

  return basicValidation && !isSamePerson.value
})

// Estados para el recibo
const showReceiptModal = ref(false)
const registeredPackageData = ref({})

// Métodos
const closeModal = () => {
  emit('close')
}

const addItem = () => {
  packageData.value.items.push({ quantity: 1, description: '', unit_price: 0 })
}

const removeItem = (index) => {
  if (packageData.value.items.length > 1) {
    packageData.value.items.splice(index, 1)
  }
}

const copySenderToRecipient = () => {
  if (!senderSearch.selectedExistingClient.value && !newSenderForm.value.document_id) return
  
  if (senderSearch.clientType.value === 'existing') {
    recipientSearch.clientType.value = 'existing'
    recipientSearch.hasSearched.value = true
    recipientSearch.foundClients.value = [senderSearch.selectedExistingClient.value]
    recipientSearch.selectExistingClient(senderSearch.selectedExistingClient.value)
  } else {
    recipientSearch.clientType.value = 'new'
    newRecipientForm.value = { ...newSenderForm.value }
  }
}

const submitPackage = async () => {
  formErrorMessage.value = ''
  if (!isFormValid.value) {
    if (!hasSender.value) formErrorMessage.value = 'Complete la información del remitente.'
    else if (!hasRecipient.value) formErrorMessage.value = 'Complete la información del destinatario.'
    else if (!packageData.value.received_confirmation) formErrorMessage.value = 'Debe marcar la casilla de validación.'
    else formErrorMessage.value = 'Complete los datos requeridos.'
    return
  }
  
  if (isSamePerson.value) {
    formErrorMessage.value = 'El remitente y el destinatario no pueden ser la misma persona.'
    return
  }

  isSubmitting.value = true
  try {
    // 1. Resolver Remitente
    const senderPayload = senderSearch.clientType.value === 'existing' 
                          ? senderSearch.selectedExistingClient.value 
                          : newSenderForm.value
    const finalSender = await senderSearch.getOrCreateClient(senderPayload)

    // 2. Resolver Destinatario 
    const recipientPayload = recipientSearch.clientType.value === 'existing'
                             ? recipientSearch.selectedExistingClient.value
                             : newRecipientForm.value
    const finalRecipient = await recipientSearch.getOrCreateClient(recipientPayload)

    // Validar en el caso de que la validación visual fallara
    if (finalSender.id === finalRecipient.id) {
      throw new Error('El remitente y el destinatario no pueden ser el mismo registro en la base de datos.')
    }

    if (!authStore.user || !authStore.user.id) {
      throw new Error('Debe iniciar sesión para registrar paquetes.')
    }
    
    // Obtener secretary_id
    let secretaryId = null
    try {
      const secretaryResponse = await apiFetch(`/secretaries/by-user/${authStore.user.id}`, { method: 'GET' })
      secretaryId = secretaryResponse.id
    } catch (error) {
      throw new Error('No se pudo verificar su rol de secretario o no tiene los permisos suficientes.')
    }

    // Payload de encomienda
    const packagePayload = {
      tracking_number: packageData.value.tracking_number,
      total_weight: packageData.value.total_weight || null,
      total_declared_value: packageData.value.total_declared_value || null,
      notes: packageData.value.notes || null,
      status: props.tripId ? 'assigned_to_trip' : 'registered_at_office',
      sender_id: finalSender.id,
      recipient_id: finalRecipient.id,
      secretary_id: secretaryId,
      trip_id: props.tripId ? Number(props.tripId) : null,
      payment_status: packageData.value.payment_status,
      payment_method: packageData.value.payment_status === 'paid_on_send' ? packageData.value.payment_method : null,
      items: packageData.value.items.map(item => ({
        quantity: item.quantity,
        description: item.description,
        unit_price: item.unit_price
      }))
    }

    const response = await packageStore.createNewPackage(packagePayload)

    if (response) {
      registeredPackageData.value = {
        id: response.id,
        tracking_number: response.tracking_number,
        origin: packageData.value.origin,
        destination: packageData.value.destination,
        sender: {
          firstname: finalSender.firstname,
          lastname: finalSender.lastname,
          document_id: finalSender.document_id,
          phone: finalSender.phone
        },
        recipient: {
          firstname: finalRecipient.firstname,
          lastname: finalRecipient.lastname,
          document_id: finalRecipient.document_id,
          phone: finalRecipient.phone
        },
        items: response.items || packageData.value.items,
        total_amount: response.total_amount || totalAmount.value,
        total_items_count: response.total_items_count || totalItemsCount.value,
        created_at: response.created_at || new Date().toISOString()
      }

      showReceiptModal.value = true
      emit('package-registered', response)
      
      resetForm()
    }
  } catch (error) {
    console.error('Error registrando encomienda:', error)
    formErrorMessage.value = error.message || error.data?.detail || 'Hubo un error al registrar la encomienda.'
  } finally {
    isSubmitting.value = false
  }
}

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${timestamp}${random}`
}

const resetForm = () => {
  const trackingNumber = generateTrackingNumber()
  
  senderSearch.resetClientSearch()
  recipientSearch.resetClientSearch()
  
  newSenderForm.value = { firstname: '', lastname: '', document_id: '', phone: '' }
  newRecipientForm.value = { firstname: '', lastname: '', document_id: '', phone: '' }
  formErrorMessage.value = ''

  packageData.value = {
    tracking_number: trackingNumber,
    origin: '',
    destination: '',
    total_weight: 0,
    total_declared_value: 0,
    notes: '',
    items: [{ quantity: 1, description: '', unit_price: 0 }],
    payment_status: 'paid_on_send',
    payment_method: 'cash',
    received_confirmation: false
  }
  packageNumber.value = trackingNumber
}

const closeReceiptModal = () => {
  showReceiptModal.value = false
  registeredPackageData.value = {}
  emit('close')
}

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    if (!packageData.value.origin) {
         packageData.value.origin = 'Comarapa' // Default fallback, should probably come from user branch 
    }
  } else {
    resetForm()
  }
})

// Inicializar form on mounted
onMounted(() => {
  const trackingNumber = generateTrackingNumber()
  packageNumber.value = trackingNumber
  packageData.value.tracking_number = trackingNumber
})
</script>