<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { onMounted } from 'vue'

const authStore = useAuthStore()

// Inicializar el store de autenticación al cargar la aplicación
onMounted(() => {
  authStore.init()
})
</script>

<style>
/* Asegurar que cuando se usa el layout de login, se resetee todo */
body:has(.nuxt-login-page) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  height: 100vh !important;
}

body:has(.nuxt-login-page) #__nuxt > * {
  position: relative !important;
  z-index: 1 !important;
}

/* Resetear cualquier estilo de transición que pueda causar problemas */
* {
  transition: none !important;
  animation: none !important;
}

.nuxt-login-page * {
  transition: none !important;
  animation: none !important;
}
</style>
