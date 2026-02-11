<template>
  <header class="bg-white shadow-sm w-full relative z-40">
    <div class="w-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <!-- Puedes reemplazar esto con un logo SVG o una imagen -->
            <NuxtLink to="/" class="text-xl font-bold text-gray-800">Trans Comarapa</NuxtLink>
          </div>
        </div>
        <nav class="hidden md:flex space-x-4">
          <ClientOnly>
            <!-- Admin Links -->
            <template v-if="authStore.userRole === 'admin'">
              <NuxtLink to="/dashboards/dashboard-admin" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Dashboard</NuxtLink>
              <NuxtLink to="/admin/users" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Usuarios</NuxtLink>
              <NuxtLink to="/admin/buses" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Buses</NuxtLink>
              <NuxtLink to="/admin/routes" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Rutas</NuxtLink>
            </template>
            
            <!-- Secretary Links -->
            <template v-if="authStore.userRole === 'secretary'">
              <NuxtLink to="/dashboards/dashboard-secretary" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Dashboard</NuxtLink>
              <NuxtLink to="/trips/manage" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Viajes</NuxtLink>
              <NuxtLink to="/bookings" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Boletos</NuxtLink>
              <NuxtLink to="/packages" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Packages</NuxtLink>
              <NuxtLink to="/clients" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Clientes</NuxtLink>
              <!-- <NuxtLink to="/reports/secretary" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" active-class="text-indigo-600 bg-indigo-50">Reportes</NuxtLink> -->
            </template>
          </ClientOnly>
        </nav>
        <div class="flex items-center">
          <button class="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span class="sr-only">View notifications</span>
            <!-- Heroicon name: outline/bell -->
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div class="ml-3 relative">
            <div>
              <button @click="isUserMenuOpen = !isUserMenuOpen" type="button" class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span class="sr-only">Open user menu</span>
                <img class="h-8 w-8 rounded-full" :src="userInfo?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'" alt="User profile">
              </button>
            </div>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div ref="userMenu" v-if="isUserMenuOpen" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
                <NuxtLink to="/profile" @click="isUserMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="user-menu-item-0">Perfil</NuxtLink>
                <a href="#" @click.prevent="handleLogout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="user-menu-item-1">Logout</a>
              </div>
            </transition>
          </div>
        </div>
        <!-- Mobile menu button -->
        <div class="-mr-2 flex md:hidden">
            <button type="button" @click="mobileMenuOpen = !mobileMenuOpen" class="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div v-if="mobileMenuOpen" class="md:hidden w-full" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <ClientOnly>
            <!-- Admin Links Mobile -->
            <template v-if="authStore.userRole === 'admin'">
              <NuxtLink to="/dashboards/dashboard-admin" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Dashboard</NuxtLink>
              <NuxtLink to="/admin/users" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Usuarios</NuxtLink>
              <NuxtLink to="/admin/buses" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Buses</NuxtLink>
              <NuxtLink to="/admin/routes" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Rutas</NuxtLink>
            </template>

            <!-- Secretary Links Mobile -->
            <template v-if="authStore.userRole === 'secretary'">
              <NuxtLink to="/dashboards/dashboard-secretary" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Dashboard</NuxtLink>
              <NuxtLink to="/trips/manage" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Viajes</NuxtLink>
              <NuxtLink to="/bookings" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Boletos</NuxtLink>
              <NuxtLink to="/packages" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Packages</NuxtLink>
              <NuxtLink to="/clients" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Clientes</NuxtLink>
              <NuxtLink to="/reports/secretary" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-600 bg-indigo-50">Reportes</NuxtLink>
            </template>
          </ClientOnly>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex items-center px-5">
                <div class="flex-shrink-0">
                    <img class="h-10 w-10 rounded-full" :src="userInfo?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'" alt="User profile">
                </div>
                <div class="ml-3">
                    <div class="text-base font-medium text-gray-800">{{ userName }}</div>
                    <div class="text-sm font-medium text-gray-500">{{ userInfo?.email || 'usuario@example.com' }}</div>
                </div>
                <button type="button" class="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span class="sr-only">View notifications</span>
                    <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </button>
            </div>
            <div class="mt-3 px-2 space-y-1">
                <NuxtLink to="/profile" @click="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">Perfil</NuxtLink>
                <a href="#" @click="handleLogout" class="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50">Logout</a>
            </div>
        </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { usePersonData } from '~/composables/usePersonData'

const authStore = useAuthStore()
const router = useRouter()
const { getEffectiveName } = usePersonData()

const mobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const userInfo = computed(() => authStore.user)
const userName = computed(() => getEffectiveName(authStore.user))

const handleLogout = async () => {
  await authStore.logout()
  isUserMenuOpen.value = false // Cierra el dropdown
  mobileMenuOpen.value = false // Cierra el menu mobil si estuviera abierto
  router.push('/') // Redirigir a la landing page
}

// Lógica para cerrar el dropdown si se hace clic fuera
const userMenu = ref(null) // Se necesitará una ref en el template para el div del dropdown

const handleClickOutside = (event) => {
  if (userMenu.value && !userMenu.value.contains(event.target)) {
    // Verifica también que no se haya hecho clic en el botón que abre el menú
    const userMenuButton = document.getElementById('user-menu-button');
    if (userMenuButton && !userMenuButton.contains(event.target)) {
        isUserMenuOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<style scoped>
/* Puedes agregar estilos específicos para el header aquí si es necesario */
</style> 