<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with navigation -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <button @click="goBack" class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Volver a Encomiendas
            </button>
          </div>
          <div v-if="currentPackage" class="flex items-center space-x-4">
            <span :class="getStatusClass(currentPackage.status)" class="px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full">
              {{ getStatusText(currentPackage.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="packageStore.isLoading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-500">Cargando detalles de la encomienda...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="packageStore.error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
        <div class="flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-medium">Error al cargar la encomienda</h3>
            <p class="mt-2">{{ packageStore.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Package Not Found -->
    <div v-else-if="!currentPackage" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Encomienda no encontrada</h3>
        <p class="mt-2 text-gray-500">No se pudo encontrar la encomienda solicitada.</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Package Header -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Encomienda {{ currentPackage.tracking_number }}
            </h1>
            <p class="mt-2 text-lg text-gray-600">
              Registrada el {{ formatDate(currentPackage.created_at) }}
            </p>
          </div>
          <div class="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <AppButton variant="secondary" @click="editPackage(currentPackage.id)" class="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </AppButton>
            <AppButton variant="danger" @click="confirmDeletePackage(currentPackage.id)" :is-loading="packageStore.isLoading" class="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Main Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Sender and Recipient -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Remitente y Destinatario
              </h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Sender -->
                <div class="bg-blue-50 p-4 rounded-lg">
                  <h3 class="text-sm font-medium text-blue-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Remitente
                  </h3>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold text-gray-900">
                      {{ currentPackage.sender?.firstname && currentPackage.sender?.lastname 
                        ? `${currentPackage.sender.firstname} ${currentPackage.sender.lastname}` 
                        : currentPackage.sender_details?.name || 'N/A' }}
                    </p>
                    <p v-if="currentPackage.sender?.phone || currentPackage.sender_details?.phone" class="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ currentPackage.sender?.phone || currentPackage.sender_details?.phone }}
                    </p>
                    <p v-if="currentPackage.sender?.email" class="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ currentPackage.sender.email }}
                    </p>
                  </div>
                </div>

                <!-- Recipient -->
                <div class="bg-green-50 p-4 rounded-lg">
                  <h3 class="text-sm font-medium text-green-900 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Destinatario
                  </h3>
                  <div class="space-y-2">
                    <p class="text-sm font-semibold text-gray-900">
                      {{ currentPackage.recipient?.firstname && currentPackage.recipient?.lastname 
                        ? `${currentPackage.recipient.firstname} ${currentPackage.recipient.lastname}` 
                        : currentPackage.receiver_details?.name || 'N/A' }}
                    </p>
                    <p v-if="currentPackage.recipient?.phone || currentPackage.receiver_details?.phone" class="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ currentPackage.recipient?.phone || currentPackage.receiver_details?.phone }}
                    </p>
                    <p v-if="currentPackage.recipient?.email" class="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {{ currentPackage.recipient.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Package Items -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Items del Paquete
                <span class="ml-2 bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {{ currentPackage.total_items_count || 0 }} items
                </span>
              </h2>
            </div>
            <div class="p-6">
              <div v-if="currentPackage.items && currentPackage.items.length > 0" class="space-y-4">
                <div v-for="(item, index) in currentPackage.items" :key="item.id" 
                     class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          #{{ index + 1 }}
                        </span>
                        <h3 class="text-sm font-semibold text-gray-900">{{ item.description }}</h3>
                      </div>
                      <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          Cantidad: {{ item.quantity }}
                        </div>
                        <div class="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Precio unitario: Bs. {{ item.unit_price?.toFixed(2) || '0.00' }}
                        </div>
                      </div>
                    </div>
                    <div class="text-right ml-4">
                      <p class="text-lg font-bold text-gray-900">Bs. {{ item.total_price?.toFixed(2) || '0.00' }}</p>
                      <p class="text-xs text-gray-500">Subtotal</p>
                    </div>
                  </div>
                </div>
                
                <!-- Total -->
                <div class="border-t-2 border-gray-200 pt-4">
                  <div class="flex justify-between items-center">
                    <div class="text-lg font-semibold text-gray-900">
                      Total del Paquete
                    </div>
                    <div class="text-right">
                      <p class="text-2xl font-bold text-green-600">Bs. {{ currentPackage.total_amount?.toFixed(2) || '0.00' }}</p>
                      <p class="text-sm text-gray-500">{{ currentPackage.total_items_count || 0 }} items</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <p>No hay items registrados en este paquete</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Additional Info -->
        <div class="space-y-6">
          <!-- Package Summary -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resumen del Paquete
              </h2>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Peso Total:</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ currentPackage.total_weight ? currentPackage.total_weight + ' kg' : 'No especificado' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Valor Declarado:</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ currentPackage.total_declared_value ? 'Bs. ' + currentPackage.total_declared_value.toFixed(2) : 'No especificado' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Fecha de Registro:</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ formatDate(currentPackage.created_at) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Última Actualización:</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ formatDate(currentPackage.updated_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Trip Information -->
          <div v-if="currentPackage.trip" class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-4a2 2 0 00-2-2H8z" />
                </svg>
                Viaje Asociado
              </h2>
            </div>
            <div class="p-6 space-y-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-blue-900">ID del Viaje</span>
                  <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    #{{ currentPackage.trip.id }}
                  </span>
                </div>
                
                <div v-if="currentPackage.trip.route" class="space-y-3">
                  <div class="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Origen:</span>
                    <span class="ml-1 text-gray-700">
                      {{ currentPackage.trip.route.origin_location?.city || currentPackage.trip.route.origin_city || currentPackage.trip.route.origin }}
                    </span>
                  </div>
                  
                  <div class="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Destino:</span>
                    <span class="ml-1 text-gray-700">
                      {{ currentPackage.trip.route.destination_location?.city || currentPackage.trip.route.destination_city || currentPackage.trip.route.destination }}
                    </span>
                  </div>
                  
                  <div v-if="currentPackage.trip.departure_datetime || currentPackage.trip.departure_date" class="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium text-gray-900">Fecha de Salida:</span>
                    <span class="ml-1 text-gray-700">
                      {{ formatDate(currentPackage.trip.departure_datetime || currentPackage.trip.departure_date) }}
                    </span>
                  </div>
                  
                  <div v-if="currentPackage.trip.status" class="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium text-gray-900">Estado:</span>
                    <span :class="getTripStatusClass(currentPackage.trip.status)" class="ml-2 px-2 py-1 text-xs rounded-full">
                      {{ getTripStatusText(currentPackage.trip.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="currentPackage.notes" class="bg-white rounded-lg shadow-sm border border-gray-200">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Observaciones
              </h2>
            </div>
            <div class="p-6">
              <p class="text-sm text-gray-700 bg-yellow-50 p-4 rounded-lg">{{ currentPackage.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePackageStore } from '~/stores/packageStore';
import AppButton from '~/components/AppButton.vue';

const router = useRouter();
const route = useRoute();
const packageStore = usePackageStore();

const currentPackage = computed(() => packageStore.currentPackage);

onMounted(async () => {
  const packageId = route.params.id;
  if (packageId) {
    await packageStore.fetchPackageById(packageId);
  } else {
    packageStore.setError('ID de encomienda no proporcionado.');
  }
});

const goBack = () => {
  router.back();
};

const editPackage = (id) => {
  router.push(`/packages/${id}/edit`);
};

const confirmDeletePackage = async (id) => {
  if (window.confirm('¿Está seguro de que desea eliminar esta encomienda? Esta acción no se puede deshacer.')) {
    try {
      await packageStore.deleteExistingPackage(id);
      if (!packageStore.error) {
        router.push('/packages'); // Navigate to list after successful deletion
      }
    } catch (error) {
      // Error is handled by the store and displayed.
      console.error('Failed to delete package:', error);
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'Pendiente',
    in_transit: 'En Tránsito',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    registered: 'Registrado',
  };
  return texts[status] || 'Desconocido';
};

const getTripStatusClass = (status) => {
  const classes = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getTripStatusText = (status) => {
  const texts = {
    scheduled: 'Programado',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return texts[status] || 'Desconocido';
};

// Clear current package and error when component is unmounted
import { onUnmounted } from 'vue';
onUnmounted(() => {
  packageStore.clearCurrentPackage();
  packageStore.clearError();
});

definePageMeta({
  // middleware: ['auth'] // Ensure auth is handled globally or add role checks if needed
});
</script> 