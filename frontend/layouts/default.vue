<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />

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
