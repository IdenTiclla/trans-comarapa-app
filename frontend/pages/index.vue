<template>
  <div>
    <!-- Esta página ya no debería ser accesible directamente -->
    <!-- El middleware redirigirá automáticamente -->
    <div class="text-center py-10">
      <p>Redirigiendo...</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Redirigiendo...',
});

// Esta página ahora solo sirve como fallback
// El middleware global se encarga de todas las redirecciones
</script>
