<template>
  <div class="min-h-screen bg-comarapa-white font-inter">
    <slot />
  </div>
</template>

<script setup>
// Layout limpio para la landing page - sin sidebar ni header de la app
</script>

<style>
/* Reset para la landing page */
.min-h-screen {
  min-height: 100vh;
}

/* Asegurar que el body tenga el fondo correcto en el landing */
body:has([data-landing-layout]) {
  background-color: white !important;
  overflow-x: hidden;
}
</style>


