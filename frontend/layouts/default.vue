<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-blue-600 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold">Trans Comarapa</h1>
        <nav class="mt-2">
          <ul class="flex space-x-4">
            <li><NuxtLink to="/" class="hover:underline">Inicio</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:underline">Acerca de</NuxtLink></li>
            <li><NuxtLink to="/services" class="hover:underline">Servicios</NuxtLink></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="flex-grow container mx-auto p-4">
      <slot />
    </main>
    
    <footer class="bg-gray-800 text-white p-4">
      <div class="container mx-auto">
        <p>&copy; {{ new Date().getFullYear() }} Trans Comarapa. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>
