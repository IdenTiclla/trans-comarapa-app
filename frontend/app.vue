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
