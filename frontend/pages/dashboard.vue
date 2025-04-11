<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-600 mt-1">Panel de {{ getRoleName }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-700">Bienvenid{{ authStore.user?.role === 'secretary' ? 'a' : 'o' }}, {{ authStore.fullName }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Dashboard content -->
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 class="text-2xl font-semibold mb-4">Panel de {{ getRoleName }}</h2>
            <p class="text-gray-600">Bienvenid{{ authStore.user?.role === 'secretary' ? 'a' : 'o' }} al sistema de gestión de Trans Comarapa.</p>

            <!-- Contenido específico para cada rol -->
            <div v-if="authStore.user?.role === 'secretary'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Boletos</h3>
                <p>Gestión de boletos y reservas</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver boletos
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Viajes</h3>
                <p>Consulta y gestión de viajes</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver viajes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Paquetes</h3>
                <p>Gestión de paquetes y envíos</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver paquetes
                </button>
              </div>
            </div>

            <!-- Contenido para administradores -->
            <div v-else-if="authStore.user?.role === 'admin'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Usuarios</h3>
                <p>Administración de usuarios del sistema</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Gestionar usuarios
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Reportes</h3>
                <p>Generación de reportes y estadísticas</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver reportes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Configuración</h3>
                <p>Configuración del sistema</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Configurar sistema
                </button>
              </div>
            </div>

            <!-- Contenido para conductores -->
            <div v-else-if="authStore.user?.role === 'driver'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis viajes</h3>
                <p>Viajes asignados y programados</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis viajes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Pasajeros</h3>
                <p>Lista de pasajeros por viaje</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver pasajeros
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y licencia</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>

            <!-- Contenido para asistentes -->
            <div v-else-if="authStore.user?.role === 'assistant'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis viajes</h3>
                <p>Viajes asignados y programados</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis viajes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Pasajeros</h3>
                <p>Atención a pasajeros</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver pasajeros
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Paquetes</h3>
                <p>Control de paquetes y envíos</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver paquetes
                </button>
              </div>
            </div>

            <!-- Contenido para clientes -->
            <div v-else-if="authStore.user?.role === 'client'" class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis boletos</h3>
                <p>Historial de boletos y reservas</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis boletos
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mis paquetes</h3>
                <p>Seguimiento de paquetes enviados y recibidos</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver mis paquetes
                </button>
              </div>

              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y preferencias</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>

            <!-- Contenido genérico para otros roles -->
            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-2">Mi perfil</h3>
                <p>Información personal y preferencias</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Ver perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

// Comprobar autenticación al montar el componente
onMounted(() => {
  // Si el usuario no está autenticado, redirigir a login
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})

// Obtener el nombre del rol para mostrar en el dashboard
const getRoleName = computed(() => {
  switch (authStore.user?.role) {
    case 'secretary':
      return 'Secretaria';
    case 'driver':
      return 'Conductor';
    case 'assistant':
      return 'Asistente';
    case 'admin':
      return 'Administrador';
    case 'client':
      return 'Cliente';
    default:
      return 'Usuario';
  }
})

// Función para manejar el cierre de sesión
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Definir la metadata de la página
definePageMeta({
  middleware: ['auth'] // Aplicar middleware de autenticación
})
</script>
