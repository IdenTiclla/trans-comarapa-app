<template>
  <div class="legend mt-6 sm:mt-8 mb-6 px-4 sm:px-6 md:px-8">
    <div class="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-3xl shadow-xl border border-gray-200">
      <h4 class="text-center text-lg font-bold text-gray-800 mb-6 flex items-center justify-center space-x-2">
        <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Leyenda de Estados</span>
      </h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-sm">✓</span>
          </div>
          <span class="text-sm font-bold text-gray-700">Disponible</span>
        </div>
        <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-sm">👆</span>
          </div>
          <span class="text-sm font-bold text-gray-700">Seleccionado</span>
        </div>
        <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-sm">⏳</span>
          </div>
          <span class="text-sm font-bold text-gray-700">Reservado</span>
        </div>
        <div class="flex flex-col items-center space-y-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div class="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-sm">🚫</span>
          </div>
          <span class="text-sm font-bold text-gray-700">Ocupado</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones suaves para elementos interactivos */
.legend div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Estilos para impresión */
@media print {
  .legend {
    display: none !important;
  }
}
</style>