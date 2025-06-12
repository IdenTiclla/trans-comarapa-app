<template>
  <div class="min-h-screen flex flex-col bg-gray-100 w-full">
    <AdminHeader />

    <main class="flex-grow w-full">
      <slot />
    </main>

    <footer class="bg-gray-100 text-center py-6 mt-auto w-full">
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

/* Asegurar que el body use todo el ancho */
body {
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

/* Ajustes para dispositivos móviles */
@media (max-width: 640px) {
  body {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
