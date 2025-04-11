<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">Bienvenido a Trans Comarapa</h1>
    <p class="mb-4">
      Somos una empresa de transporte comprometida con brindar el mejor servicio a nuestros clientes.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Transporte Seguro</h2>
        <p>Contamos con una flota moderna y conductores profesionales para garantizar su seguridad.</p>
        <div class="mt-4">
          <AppButton @click="showAlert('Transporte Seguro')">Más información</AppButton>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Puntualidad</h2>
        <p>Nos comprometemos a cumplir con los horarios establecidos para su comodidad.</p>
        <div class="mt-4">
          <AppButton variant="secondary" @click="showAlert('Puntualidad')">Más información</AppButton>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Cobertura</h2>
        <p>Llegamos a múltiples destinos para satisfacer sus necesidades de transporte.</p>
        <div class="mt-4">
          <AppButton variant="success" @click="showAlert('Cobertura')">Más información</AppButton>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <h2 class="text-2xl font-bold mb-4">¿Listo para viajar con nosotros?</h2>
      <AppButton variant="primary" class="mr-2" @click="navigateTo('/services')">Ver servicios</AppButton>
      <AppButton variant="secondary" class="mr-2" @click="navigateTo('/about')">Conocer más</AppButton>
      <AppButton v-if="!authStore.isAuthenticated" variant="success" @click="navigateTo('/login')">Iniciar sesión</AppButton>
      <AppButton v-else variant="success" @click="navigateTo('/dashboard')">Ir al Dashboard</AppButton>
    </div>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app'
import { useAuthStore } from '~/stores/auth'
import { onMounted } from 'vue'

definePageMeta({
  title: 'Inicio'
})

const appStore = useAppStore()
const authStore = useAuthStore()

// Inicializar el estado de autenticación al montar el componente
onMounted(() => {
  if (typeof window !== 'undefined') {
    authStore.initAuth()
  }
})

function showAlert(feature) {
  alert(`Has hecho clic en ${feature}. Pronto tendremos más información disponible.`)
}
</script>
