<template>
  <div class="legend px-4 sm:px-6 md:px-8 py-3">
    <div class="flex items-center justify-center flex-wrap gap-3 sm:gap-5">
      <div class="flex items-center gap-1.5">
        <div class="w-4 h-4 rounded-md bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-300 shadow-sm"></div>
        <span class="text-xs font-semibold text-gray-600">Disponible</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-4 h-4 rounded-md bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-400 shadow-sm"></div>
        <span class="text-xs font-semibold text-gray-600">Seleccionado</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-4 h-4 rounded-md bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-orange-300 shadow-sm"></div>
        <span class="text-xs font-semibold text-gray-600">Reservado</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-4 h-4 rounded-md bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 shadow-sm"></div>
        <span class="text-xs font-semibold text-gray-600">Ocupado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para impresión */
@media print {
  .legend {
    display: none !important;
  }
}
</style>
