<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <AdminHeader />

    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <footer class="bg-gray-100 text-center py-6 mt-auto">
      <p class="text-sm text-gray-600">@2024 Trans Comarapa</p>
    </footer>
  </div>
</template>

<script setup>
import AdminHeader from '~/components/AdminHeader.vue';
</script>

<style>
/* Estilos globales para mejorar la experiencia responsive */
html {
  scroll-behavior: smooth;
}

/* Ajustes para dispositivos móviles */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
