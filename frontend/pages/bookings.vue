<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
    <div class="w-full">
      <!-- Enhanced Header -->
      <div class="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Gestión de Boletos
            </h1>
            <p class="mt-2 text-gray-600">Administra los boletos de viaje de los pasajeros</p>
            <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Última actualización: {{ new Date().toLocaleString('es-BO') }}</span>
              <span>•</span>
              <span>{{ filteredTickets.length }} boletos total</span>
            </div>
          </div>
          <div class="mt-4 sm:mt-0">
            <div class="flex space-x-2">
              <button
                @click="toggleView"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg v-if="viewMode === 'cards'" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <svg v-else class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
                {{ viewMode === 'cards' ? 'Vista Tabla' : 'Vista Tarjetas' }}
              </button>
              <button
                @click="exportData"
                class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Confirmados Card -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm p-6 border border-blue-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-blue-600">Boletos Confirmados</p>
                  <p class="text-3xl font-bold text-blue-900">{{ stats.confirmed }}</p>
                  <p class="text-xs text-blue-600 mt-1">{{ getPercentage(stats.confirmed) }}% del total</p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-blue-800">{{ stats.confirmed > 99 ? '99+' : stats.confirmed }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pendientes Card -->
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-sm p-6 border border-yellow-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-yellow-500 rounded-xl shadow-lg">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-yellow-600">Boletos Pendientes</p>
                  <p class="text-3xl font-bold text-yellow-900">{{ stats.pending }}</p>
                  <p class="text-xs text-yellow-600 mt-1">{{ getPercentage(stats.pending) }}% del total</p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-yellow-800">{{ stats.pending > 99 ? '99+' : stats.pending }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancelados Card -->
        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-sm p-6 border border-red-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-red-500 rounded-xl shadow-lg">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-red-600">Boletos Cancelados</p>
                  <p class="text-3xl font-bold text-red-900">{{ stats.cancelled }}</p>
                  <p class="text-xs text-red-600 mt-1">{{ getPercentage(stats.cancelled) }}% del total</p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-red-800">{{ stats.cancelled > 99 ? '99+' : stats.cancelled }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ingresos Card -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm p-6 border border-green-200 hover:shadow-md transition-all duration-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-3">
                <div class="p-3 bg-green-500 rounded-xl shadow-lg">
                  <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-green-600">Total Ingresos</p>
                  <p class="text-3xl font-bold text-green-900">{{ formatCurrency(stats.totalRevenue) }}</p>
                  <p class="text-xs text-green-600 mt-1">Promedio: {{ formatCurrency(stats.totalRevenue / (stats.confirmed + stats.pending) || 0) }}</p>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span class="text-xs font-bold text-green-800">Bs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Actions Bar -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div class="flex flex-col gap-6">
          <!-- Primary Actions Row -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex flex-col sm:flex-row gap-4 flex-1">
              <!-- Enhanced Search -->
              <div class="relative flex-1 sm:max-w-sm">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar por ID, cliente, viaje..."
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors"
                />
                <svg class="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <div v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-3.5 cursor-pointer">
                  <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>

              <!-- Advanced Filters Toggle -->
              <button
                @click="showAdvancedFilters = !showAdvancedFilters"
                class="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                Filtros Avanzados
                <svg :class="['h-4 w-4 ml-2 transition-transform', showAdvancedFilters ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>

            <!-- Primary Action Button -->
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Boleto
            </button>
          </div>

          <!-- Advanced Filters (Collapsible) -->
          <div v-if="showAdvancedFilters" class="border-t border-gray-200 pt-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  v-model="statusFilter"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="completed">Completados</option>
                </select>
              </div>

              <!-- Date Range Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                <input
                  v-model="dateFromFilter"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  v-model="dateToFilter"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Payment Method Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                <select
                  v-model="paymentMethodFilter"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos los métodos</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="qr">QR</option>
                </select>
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div class="text-sm text-gray-500">
                {{ activeFiltersCount }} filtro(s) activo(s)
              </div>
              <div class="flex space-x-2">
                <button
                  @click="clearAllFilters"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpiar Filtros
                </button>
                <button
                  @click="applyFilters"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tickets Cards -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900">Lista de Boletos</h3>
          <p class="text-sm text-gray-500">
            {{ paginatedTickets.length }} de {{ filteredTickets.length }} boletos
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTickets.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay boletos</h3>
          <p class="mt-1 text-sm text-gray-500">Comienza creando un nuevo boleto para un pasajero.</p>
          <div class="mt-6">
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Crear Primer Boleto
            </button>
          </div>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boleto</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viaje</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asiento</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="ticket in paginatedTickets" :key="ticket.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="p-2 bg-indigo-100 rounded-lg mr-3">
                        <svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                        </svg>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">#{{ ticket.id }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(ticket.created_at) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ getClientName(ticket.client_id) }}</div>
                        <div class="text-sm text-gray-500">ID: {{ ticket.client_id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getTripInfo(ticket.trip_id) }}</div>
                    <div class="text-sm text-gray-500">Viaje #{{ ticket.trip_id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ ticket.seat_id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusBadgeClass(ticket.state)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusText(ticket.state) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ formatCurrency(ticket.price) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ ticket.payment_method || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDate(ticket.created_at) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        @click="editTicket(ticket)"
                        class="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        v-if="ticket.state !== 'cancelled'"
                        @click="cancelTicket(ticket.id)"
                        class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tickets Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="ticket in paginatedTickets"
            :key="ticket.id"
            class="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden group"
          >
            <!-- Card Header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="p-2 bg-indigo-100 rounded-lg">
                    <svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-900">Boleto #{{ ticket.id }}</h4>
                    <p class="text-xs text-gray-500">{{ formatDate(ticket.created_at) }}</p>
                  </div>
                </div>
                <span :class="getStatusBadgeClass(ticket.state)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(ticket.state) }}
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4 space-y-3">
              <!-- Cliente -->
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ getClientName(ticket.client_id) }}</p>
                  <p class="text-xs text-gray-500">Cliente ID: {{ ticket.client_id }}</p>
                </div>
              </div>

              <!-- Viaje -->
              <div class="flex items-center space-x-2">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <div class="flex-1">
                  <p class="text-sm text-gray-900">{{ getTripInfo(ticket.trip_id) }}</p>
                </div>
              </div>

              <!-- Asiento y Precio -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                  <span class="text-sm text-gray-600">Asiento {{ ticket.seat_id }}</span>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(ticket.price) }}</p>
                  <p class="text-xs text-gray-500">{{ ticket.payment_method || 'Sin método' }}</p>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex space-x-2">
                  <button
                    @click="editTicket(ticket)"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Editar
                  </button>
                  <button
                    v-if="ticket.state !== 'cancelled'"
                    @click="cancelTicket(ticket.id)"
                    class="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Cancelar
                  </button>
                </div>
                <div class="text-xs text-gray-400">
                  #{{ ticket.id }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="bg-white rounded-lg shadow px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredTickets.length) }}</span>
                de
                <span class="font-medium">{{ filteredTickets.length }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Anterior</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    page === currentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Siguiente</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Create/Edit Ticket Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
           @click.stop>
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ showCreateModal ? 'Crear Nuevo Boleto' : 'Editar Boleto' }}
                </h3>
                <p class="text-indigo-100 text-sm">
                  {{ showCreateModal ? 'Completa la información del boleto' : 'Modifica los datos del boleto' }}
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          
          <form @submit.prevent="submitTicketForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Viaje</label>
              <select v-model="ticketForm.trip_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar viaje</option>
                <option v-for="trip in availableTrips" :key="trip.id" :value="trip.id">
                  {{ trip.route.origin }} → {{ trip.route.destination }} - {{ formatDate(trip.trip_datetime) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Cliente</label>
              <select v-model="ticketForm.client_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar cliente</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.firstname }} {{ client.lastname }}
                </option>
              </select>
            </div>

            <div v-if="ticketForm.trip_id">
              <label class="block text-sm font-medium text-gray-700">Asiento</label>
              <select v-model="ticketForm.seat_id" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar asiento</option>
                <option v-for="seat in availableSeats" :key="seat.id" :value="seat.id">
                  Asiento {{ seat.seat_number }} ({{ seat.deck }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Estado</label>
              <select v-model="ticketForm.state" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="cancelled">Cancelado</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Precio</label>
              <input
                v-model.number="ticketForm.price"
                type="number"
                step="0.01"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Método de Pago</label>
              <select v-model="ticketForm.payment_method" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Seleccionar método</option>
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="qr">QR</option>
              </select>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
                <span v-else>
                  {{ showCreateModal ? '✨ Crear Boleto' : '📝 Actualizar Boleto' }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()

// Reactive data
const tickets = ref([])
const clients = ref([])
const availableTrips = ref([])
const availableSeats = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const dateFromFilter = ref('')
const dateToFilter = ref('')
const paymentMethodFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const isSubmitting = ref(false)

// UI State
const viewMode = ref('cards') // 'cards' or 'table'
const showAdvancedFilters = ref(false)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingTicket = ref(null)

// Form data
const ticketForm = ref({
  trip_id: '',
  client_id: '',
  seat_id: '',
  state: 'pending',
  price: 0,
  payment_method: '',
  operator_user_id: null
})

// Stats
const stats = ref({
  confirmed: 0,
  pending: 0,
  cancelled: 0,
  totalRevenue: 0
})

// API Configuration
const config = useRuntimeConfig()
const API_BASE = config.public.apiBaseUrl

// Computed properties
const filteredTickets = computed(() => {
  let filtered = tickets.value

  // Text search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(ticket =>
      ticket.id.toString().includes(query) ||
      getClientName(ticket.client_id).toLowerCase().includes(query) ||
      getTripInfo(ticket.trip_id).toLowerCase().includes(query) ||
      ticket.seat_id.toString().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(ticket => ticket.state === statusFilter.value)
  }

  // Date range filter
  if (dateFromFilter.value) {
    filtered = filtered.filter(ticket =>
      new Date(ticket.created_at) >= new Date(dateFromFilter.value)
    )
  }

  if (dateToFilter.value) {
    filtered = filtered.filter(ticket =>
      new Date(ticket.created_at) <= new Date(dateToFilter.value + 'T23:59:59')
    )
  }

  // Payment method filter
  if (paymentMethodFilter.value) {
    filtered = filtered.filter(ticket => ticket.payment_method === paymentMethodFilter.value)
  }

  return filtered
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (statusFilter.value) count++
  if (dateFromFilter.value) count++
  if (dateToFilter.value) count++
  if (paymentMethodFilter.value) count++
  return count
})

const totalPages = computed(() => Math.ceil(filteredTickets.value.length / pageSize.value))

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTickets.value.slice(start, end)
})

const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, currentPage.value - delta);
       i <= Math.min(totalPages.value - 1, currentPage.value + delta);
       i++) {
    range.push(i)
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value)
  } else {
    rangeWithDots.push(totalPages.value)
  }

  return rangeWithDots
})

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getClientName = (clientId) => {
  const client = clients.value.find(c => c.id === clientId)
  return client ? `${client.firstname} ${client.lastname}` : `Cliente #${clientId}`
}

const getTripInfo = (tripId) => {
  const trip = availableTrips.value.find(t => t.id === tripId)
  if (trip && trip.route) {
    return `${trip.route.origin} → ${trip.route.destination}`
  }
  return `Viaje #${tripId}`
}

const getPercentage = (count) => {
  const total = tickets.value.length
  return total > 0 ? Math.round((count / total) * 100) : 0
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'cards' ? 'table' : 'cards'
}

const clearAllFilters = () => {
  statusFilter.value = ''
  dateFromFilter.value = ''
  dateToFilter.value = ''
  paymentMethodFilter.value = ''
  searchQuery.value = ''
}

const applyFilters = () => {
  currentPage.value = 1
  // Filters are applied automatically through computed properties
}

const exportData = () => {
  const dataToExport = filteredTickets.value.map(ticket => ({
    ID: ticket.id,
    Cliente: getClientName(ticket.client_id),
    Viaje: getTripInfo(ticket.trip_id),
    Asiento: ticket.seat_id,
    Estado: getStatusText(ticket.state),
    Precio: ticket.price,
    'Método de Pago': ticket.payment_method || 'N/A',
    'Fecha de Creación': formatDate(ticket.created_at)
  }))

  const csv = [
    Object.keys(dataToExport[0]).join(','),
    ...dataToExport.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `boletos_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// API functions
const fetchTickets = async () => {
  try {
    isLoading.value = true
    const token = authStore.token
    
    const response = await $fetch(`${API_BASE}/tickets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: {
        skip: 0,
        limit: 10000
      }
    })

    tickets.value = response || []
    calculateStats()
  } catch (error) {
    console.error('Error fetching tickets:', error)
    tickets.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchClients = async () => {
  try {
    const token = authStore.token
    const response = await $fetch(`${API_BASE}/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    clients.value = response || []
  } catch (error) {
    console.error('Error fetching clients:', error)
  }
}

const fetchTrips = async () => {
  try {
    const token = authStore.token
    const response = await $fetch(`${API_BASE}/trips`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      query: {
        upcoming: true
      }
    })
    availableTrips.value = response.trips || []
  } catch (error) {
    console.error('Error fetching trips:', error)
  }
}

const fetchAvailableSeats = async (tripId) => {
  if (!tripId) {
    availableSeats.value = []
    return
  }

  try {
    const token = authStore.token
    
    const tripResponse = await $fetch(`${API_BASE}/trips/${tripId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!tripResponse.bus_id) {
      availableSeats.value = []
      return
    }
    
    const seatsResponse = await $fetch(`${API_BASE}/seats/bus/${tripResponse.bus_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const availableSeatsResponse = await $fetch(`${API_BASE}/trips/${tripId}/available-seats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    availableSeats.value = seatsResponse.filter(seat => 
      availableSeatsResponse.available_seat_numbers.includes(seat.seat_number)
    )
    
  } catch (error) {
    console.error('Error fetching available seats:', error)
    availableSeats.value = []
  }
}

const calculateStats = () => {
  stats.value = {
    confirmed: tickets.value.filter(t => t.state === 'confirmed').length,
    pending: tickets.value.filter(t => t.state === 'pending').length,
    cancelled: tickets.value.filter(t => t.state === 'cancelled').length,
    totalRevenue: tickets.value
      .filter(t => t.state === 'confirmed' || t.state === 'completed')
      .reduce((sum, ticket) => sum + (ticket.price || 0), 0)
  }
}

const resetForm = () => {
  ticketForm.value = {
    trip_id: '',
    client_id: '',
    seat_id: '',
    state: 'pending',
    price: 0,
    payment_method: '',
    operator_user_id: authStore.user?.id
  }
  availableSeats.value = []
}

const submitTicketForm = async () => {
  try {
    isSubmitting.value = true
    const token = authStore.token
    
    if (showCreateModal.value) {
      await $fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          ...ticketForm.value,
          operator_user_id: authStore.user?.id
        }
      })
    } else if (showEditModal.value && editingTicket.value) {
      await $fetch(`${API_BASE}/tickets/${editingTicket.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: ticketForm.value
      })
    }

    closeModal()
    await fetchTickets()
  } catch (error) {
    console.error('Error submitting ticket:', error)
  } finally {
    isSubmitting.value = false
  }
}

const editTicket = (ticket) => {
  editingTicket.value = ticket
  ticketForm.value = { ...ticket }
  showEditModal.value = true
  
  if (ticket.trip_id) {
    fetchAvailableSeats(ticket.trip_id)
  }
}

const cancelTicket = async (ticketId) => {
  if (!confirm('¿Estás seguro de que quieres cancelar este boleto?')) {
    return
  }

  try {
    const token = authStore.token
    await $fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        state: 'cancelled'
      }
    })

    await fetchTickets()
  } catch (error) {
    console.error('Error cancelling ticket:', error)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingTicket.value = null
  resetForm()
}

// Pagination
const goToPage = (page) => {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Reset to first page when search or filter changes
watch([searchQuery, statusFilter, dateFromFilter, dateToFilter, paymentMethodFilter], () => {
  currentPage.value = 1
})

// Auto-fill price when trip is selected
watch(() => ticketForm.value.trip_id, (newTripId) => {
  if (newTripId) {
    fetchAvailableSeats(newTripId)
    
    const selectedTrip = availableTrips.value.find(t => t.id == newTripId)
    if (selectedTrip && selectedTrip.route && selectedTrip.route.price) {
      ticketForm.value.price = selectedTrip.route.price
    }
  } else {
    availableSeats.value = []
  }
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchTickets(),
    fetchClients(),
    fetchTrips()
  ])
})
</script> 