export default defineNuxtPlugin({
  name: 'auth-plugin',
  setup(nuxtApp) {
    // Esperar a que la aplicación esté montada para asegurarnos de que Pinia esté disponible
    nuxtApp.hook('app:mounted', () => {
      // Solo inicializar en el cliente
      if (process.client) {
        // Importar dinámicamente para evitar problemas de inicialización
        import('~/stores/auth').then(({ useAuthStore }) => {
          const authStore = useAuthStore()
          authStore.init()
        })
      }
    })
  }
})
