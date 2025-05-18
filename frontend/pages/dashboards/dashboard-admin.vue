<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard de Administrador</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Tarjeta de Gestión de Usuarios -->
        <div class="bg-indigo-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-indigo-700 mb-4">Gestión de Usuarios</h2>
          <p class="text-gray-600 mb-4">Administra usuarios, roles y permisos.</p>
          <NuxtLink to="/admin/users" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Administrar Usuarios
          </NuxtLink>
        </div>

        <!-- Tarjeta de Gestión de Viajes -->
        <div class="bg-blue-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-blue-700 mb-4">Gestión de Viajes</h2>
          <p class="text-gray-600 mb-4">Configura rutas, horarios y precios.</p>
          <NuxtLink to="/trips" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Ver Viajes
          </NuxtLink>
        </div>

        <!-- Tarjeta de Reportes -->
        <div class="bg-amber-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-amber-700 mb-4">Reportes y Estadísticas</h2>
          <p class="text-gray-600 mb-4">Accede a reportes detallados y estadísticas.</p>
          <button class="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Ver Reportes
          </button>
        </div>

        <!-- Tarjeta de Configuración -->
        <div class="bg-emerald-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-emerald-700 mb-4">Configuración del Sistema</h2>
          <p class="text-gray-600 mb-4">Configura parámetros generales del sistema.</p>
          <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Configuración
          </button>
        </div>

        <!-- Tarjeta de Vehículos -->
        <div class="bg-red-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-red-700 mb-4">Gestión de Vehículos</h2>
          <p class="text-gray-600 mb-4">Administra la flota de vehículos.</p>
          <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Ver Vehículos
          </button>
        </div>

        <!-- Tarjeta de Oficinas -->
        <div class="bg-purple-50 rounded-lg p-6 shadow-md">
          <h2 class="text-xl font-semibold text-purple-700 mb-4">Gestión de Oficinas</h2>
          <p class="text-gray-600 mb-4">Administra las oficinas y terminales.</p>
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Ver Oficinas
          </button>
        </div>
      </div>

      <!-- Información del usuario -->
      <div class="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Información de Usuario</h2>
        <p><span class="font-medium">Nombre:</span> {{ userInfo.firstname }} {{ userInfo.lastname }}</p>
        <p><span class="font-medium">Rol:</span> {{ userInfo.role }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { computed } from 'vue'

// Obtener información del usuario autenticado
const authStore = useAuthStore()
const userInfo = computed(() => authStore.user || {})

// Definir la metadata de la página
definePageMeta({
  // middleware: ['auth'], // Handled by auth.global.ts
  // layout: 'admin', // Removed to use default layout
  // Definir los roles que pueden acceder a esta página
  requiredRoles: ['admin']
})
</script>
