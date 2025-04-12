<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppNavbar />

    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white py-6 mt-8">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <div class="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 11V6.5m0 4.5v4.5m0-4.5h8m-8 0a4 4 0 110-8h8a4 4 0 110 8m-8 0a4 4 0 100 8h8a4 4 0 100-8" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
              <span class="text-lg font-bold">Trans Comarapa</span>
            </div>
            <p class="text-sm text-gray-400">&copy; {{ new Date().getFullYear() }} Todos los derechos reservados.</p>
          </div>

          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
            <a href="#" class="text-gray-300 hover:text-white transition-colors">Términos y condiciones</a>
            <a href="#" class="text-gray-300 hover:text-white transition-colors">Política de privacidad</a>
            <a href="#" class="text-gray-300 hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

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
