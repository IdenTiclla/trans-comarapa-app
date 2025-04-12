<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Logo y nombre de la empresa en la parte superior -->
    <div class="bg-white shadow-sm py-4">
      <div class="container mx-auto px-4 flex items-center justify-center">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          <span class="text-xl font-bold text-gray-800">Trans Comarapa</span>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="flex-grow flex items-center justify-center">
      <slot />
    </div>

    <!-- Footer simple -->
    <footer class="py-4 text-center text-gray-600 text-sm">
      &copy; {{ new Date().getFullYear() }} Trans Comarapa. Todos los derechos reservados.
    </footer>
  </div>
</template>
